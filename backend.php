<?php
// backend.php - Versión Robusta con Diagnóstico

// 1. CORS y Cabeceras
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// Manejo de pre-vuelo (OPTIONS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

// 2. DIAGNÓSTICO: Si se llama con ?check=1
if (isset($_GET['check'])) {
    $diagnostico = [
        "php_version" => phpversion(),
        "sqlite_extension" => extension_loaded('sqlite3'),
        "folder_writable" => is_writable(__DIR__),
        "db_file_writable" => file_exists(__DIR__ . '/padel_db.db') ? is_writable(__DIR__ . '/padel_db.db') : "No existe aun",
        "current_folder" => __DIR__
    ];
    echo json_encode($diagnostico);
    exit;
}

// 3. Conexión a BD
$DB_NAME = 'padel_db.db';
$db_path = __DIR__ . '/' . $DB_NAME;

try {
    $db = new SQLite3($db_path, SQLITE3_OPEN_CREATE | SQLITE3_OPEN_READWRITE);
    $db->enableExceptions(true);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Error critico DB", "details" => $e->getMessage()]);
    exit;
}

// 4. Procesar Petición
$input = json_decode(file_get_contents('php://input'), true);
$method = $_SERVER['REQUEST_METHOD'];
$table = $_GET['table'] ?? null;
$action = $_GET['action'] ?? null;

if ($method === 'POST') {

    // CASO C: Actualizar (UPDATE) - Añadir esto debajo del INSERT
    if ($action === 'update' && $table) {
        $id = $_GET['id'] ?? null;
        if (!$id) { echo json_encode(["error" => "Falta ID"]); exit; }
        
        $sets = [];
        foreach ($input as $key => $val) {
            // Evitamos actualizar el ID
            if ($key !== 'id') {
                $safeVal = $db->escapeString($val);
                $sets[] = "$key = '$safeVal'";
            }
        }
        
        $sql = "UPDATE $table SET " . implode(", ", $sets) . " WHERE id = $id";
        
        try {
            $db->exec($sql);
            echo json_encode(["status" => "ok", "msg" => "Registro actualizado"]);
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(["error" => $e->getMessage()]);
        }
        exit;
    }

    // CREAR TABLA
    
    if ($action === 'create_table' && $table) {
        if (!$input) {
            echo json_encode(["error" => "JSON invalido o vacio"]); exit;
        }
        $columns = [];
        foreach ($input as $col => $type) {
            $columns[] = "$col $type";
        }
        $sql = "CREATE TABLE IF NOT EXISTS $table (" . implode(", ", $columns) . ")";
        try {
            $db->exec($sql);
            echo json_encode(["status" => "ok", "msg" => "Tabla $table creada"]);
        } catch (Exception $e) {
            http_response_code(400); // Bad Request
            echo json_encode(["error" => $e->getMessage()]);
        }
        exit;
    }

    // INSERTAR DATOS
    if ($table && !$action) {
        $keys = array_keys($input);
        // Sanitización básica
        $values = array_map(function($val) use ($db) {
            return "'" . $db->escapeString($val) . "'";
        }, array_values($input));

        $sql = "INSERT INTO $table (" . implode(", ", $keys) . ") VALUES (" . implode(", ", $values) . ")";
        try {
            $db->exec($sql);
            echo json_encode(["status" => "ok", "id" => $db->lastInsertRowID()]);
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(["error" => $e->getMessage()]);
        }
        exit;
    }
}

// GET (Leer datos)
if ($method === 'GET' && $table) {
    $sql = "SELECT * FROM $table";
    $result = $db->query($sql);
    $data = [];
    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        $data[] = $row;
    }
    echo json_encode(["items" => $data]);
    exit;
}

// Si llegamos aquí, no coincidió ninguna ruta
echo json_encode(["msg" => "Servidor Backend PHP funcionando. Esperando comandos."]);
?>