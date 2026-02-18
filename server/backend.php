<?php
/**
 * BACKEND PADEL PRO V2 - Estructura Router con Switch
 * Compatible con PHP 5.x (5.4 / 5.5 / 5.6)
 */

// --- 1. CONFIGURACIÓN Y HEADERS ---
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// --- 2. INICIALIZACIÓN ---
$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : null;

try {
    $DB_FILE = __DIR__ . '/padel_pro_v2.db';
    $db = new SQLite3($DB_FILE);
    $db->enableExceptions(true);
} catch (Exception $e) {
    jsonResponse(array("error" => "Error de conexión a la BD: " . $e->getMessage()), 500);
}
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// --- 3. ENRUTADOR PRINCIPAL (SWITCH) ---
switch($method) {   
    case "GET":
        handle_get($action, $db);
        break;

    case "POST":
        handle_post($action, $db);
        break;

    case "OPTIONS":
        // CORS preflight, entra siempre y sale limpiamente
        exit(0);
        break;

    default:
        jsonResponse(array("error" => "Método HTTP no soportado"), 405);
        break;
}

// --- 4. MANEJADORES DE MÉTODOS ---

function handle_get($action, $db) {
    switch($action) {
        case 'install':
            install_db($db);
            break;
        case 'ranking':
            get_ranking($db);
            break;
        case 'pistas':
            get_pistas($db);
            break;
        case 'reservas':
            get_reservas($db);
            break;
        default:
            jsonResponse(array("error" => "Acción GET no encontrada o no especificada"), 404);
            break;
    }
}

function handle_post($action, $db) {
    $data = getBody();
    switch($action) {
        case 'register':
            register_user($data, $db);
            break;
        case 'login':
            login_user($data, $db);
            break;
        case 'reservar':
            create_reserva($data, $db);
            break;
        case 'unirse':
            join_partida($data, $db);
            break;
        case 'abandonar': 
            leave_partida($data, $db);
            break;
        case 'finalizar_partida':
            finish_partida($data, $db);
            break;
        default:
            jsonResponse(array("error" => "Acción POST no encontrada o no especificada"), 404);
            break;
    }
}

// --- 5. FUNCIONES DE LÓGICA (CONTROLADORES) ---

// [GET] Instalar Base de Datos
function install_db($db) {
    $db->exec("CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        nivel REAL DEFAULT 1.0,
        victorias INTEGER DEFAULT 0,
        derrotas INTEGER DEFAULT 0,
        foto TEXT
    )");

    $db->exec("CREATE TABLE IF NOT EXISTS pistas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        tipo TEXT,
        foto_url TEXT
    )");

    $db->exec("CREATE TABLE IF NOT EXISTS reservas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pista_id INTEGER NOT NULL,
        creador_id INTEGER NOT NULL,
        fecha TEXT NOT NULL,
        hora TEXT NOT NULL,
        tipo TEXT DEFAULT 'public',
        codigo_acceso TEXT,
        estado TEXT DEFAULT 'abierta',
        resultado TEXT
    )");

    $db->exec("CREATE TABLE IF NOT EXISTS participantes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reserva_id INTEGER NOT NULL,
        usuario_id INTEGER NOT NULL,
        equipo TEXT
    )");

    $count = $db->querySingle("SELECT COUNT(*) FROM pistas");
    if ($count == 0) {
        $db->exec("INSERT INTO pistas (nombre, tipo, foto_url) VALUES 
            ('Central World Padel', 'Panorámica', 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8'),
            ('Pista Cristal 1', 'Cristal', 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea'),
            ('Pista Muro Clásica', 'Muro', 'https://images.unsplash.com/photo-1599423300746-b62533397364')");
    }

    jsonResponse(array("msg" => "Base de datos V2 instalada correctamente."));
}

// [GET] Obtener Ranking
function get_ranking($db) {
    $res = $db->query("SELECT id, nombre, nivel, victorias, derrotas, foto FROM usuarios ORDER BY nivel DESC, victorias DESC LIMIT 50");
    $users = array();
    while($row = $res->fetchArray(SQLITE3_ASSOC)) {
        $users[] = $row;
    }
    jsonResponse($users);
}

// [GET] Obtener Pistas
function get_pistas($db) {
    $res = $db->query("SELECT * FROM pistas");
    $items = array();
    while($row = $res->fetchArray(SQLITE3_ASSOC)) {
        $items[] = $row;
    }
    jsonResponse($items);
}

// [GET] Obtener Reservas y sus jugadores
function get_reservas($db) {
    $fecha = isset($_GET['fecha']) ? $_GET['fecha'] : date('Y-m-d');

    $stmt = $db->prepare("SELECT r.*, p.nombre as pista_nombre 
                          FROM reservas r 
                          JOIN pistas p ON r.pista_id = p.id 
                          WHERE r.fecha = :f");
    $stmt->bindValue(':f', $fecha);
    $res = $stmt->execute();

    $reservas = array();
    while($row = $res->fetchArray(SQLITE3_ASSOC)) {
        $row['jugadores'] = array(); 
        $reservas[$row['id']] = $row;
    }

    if (!empty($reservas)) {
        $ids = implode(',', array_keys($reservas));
        $sqlJugadores = "SELECT part.*, u.nombre, u.nivel, u.foto 
                         FROM participantes part
                         JOIN usuarios u ON part.usuario_id = u.id
                         WHERE part.reserva_id IN ($ids)";
        
        $resJug = $db->query($sqlJugadores);
        while($jug = $resJug->fetchArray(SQLITE3_ASSOC)) {
            $reservas[$jug['reserva_id']]['jugadores'][] = $jug;
        }
    }

    jsonResponse(array_values($reservas));
}

// [POST] Registro de Usuario
function register_user($data, $db) {
    if(empty($data['email']) || empty($data['password'])) {
        jsonResponse(array("error"=>"Faltan datos requeridos"), 400);
    }

    try {
        $stmt = $db->prepare("INSERT INTO usuarios (nombre, email, password, nivel, foto) VALUES (:n, :e, :p, :l, :f)");
        $stmt->bindValue(':n', $data['nombre']);
        $stmt->bindValue(':e', $data['email']);
        // Requiere PHP 5.5+
        $stmt->bindValue(':p', password_hash($data['password'], PASSWORD_DEFAULT)); 
        $stmt->bindValue(':l', isset($data['nivel']) ? $data['nivel'] : 2.5);
        $stmt->bindValue(':f', isset($data['foto']) ? $data['foto'] : '');
        $stmt->execute();

        jsonResponse(array("status" => "ok", "id" => $db->lastInsertRowID()));
    } catch (Exception $e) {
        jsonResponse(array("error" => "El email ya existe o hubo un error"), 409);
    }
}

// [POST] Login de Usuario
function login_user($data, $db) {
    if(empty($data['email']) || empty($data['password'])) {
        jsonResponse(array("error"=>"Faltan datos"), 400);
    }

    $stmt = $db->prepare("SELECT * FROM usuarios WHERE email = :e");
    $stmt->bindValue(':e', $data['email']);
    $res = $stmt->execute();
    $user = $res->fetchArray(SQLITE3_ASSOC);

    // Requiere PHP 5.5+
    if ($user && password_verify($data['password'], $user['password'])) {
        unset($user['password']); // No enviar la contraseña al frontend
        jsonResponse(array("status" => "ok", "user" => $user));
    } else {
        jsonResponse(array("error" => "Credenciales inválidas"), 401);
    }
}

// [POST] Crear una Reserva
function create_reserva($data, $db) {
    // Validar solapamiento
    $stmtCheck = $db->prepare("SELECT id FROM reservas WHERE pista_id=:p AND fecha=:f AND hora=:h");
    $stmtCheck->bindValue(':p', $data['pista_id']);
    $stmtCheck->bindValue(':f', $data['fecha']);
    $stmtCheck->bindValue(':h', $data['hora']);
    if ($stmtCheck->execute()->fetchArray()) {
        jsonResponse(array("error" => "Pista ocupada en ese horario"), 409);
    }

    $stmt = $db->prepare("INSERT INTO reservas (pista_id, creador_id, fecha, hora, tipo, codigo_acceso) VALUES (:p, :c, :f, :h, :t, :cod)");
    $stmt->bindValue(':p', $data['pista_id']);
    $stmt->bindValue(':c', $data['creador_id']);
    $stmt->bindValue(':f', $data['fecha']);
    $stmt->bindValue(':h', $data['hora']);
    $stmt->bindValue(':t', isset($data['tipo']) ? $data['tipo'] : 'public');
    
    $cod = (isset($data['tipo']) && $data['tipo'] === 'private' && isset($data['codigo'])) ? $data['codigo'] : null;
    $stmt->bindValue(':cod', $cod);
    $stmt->execute();

    $reserva_id = $db->lastInsertRowID();

    // El creador se une automáticamente a su partida
    $db->exec("INSERT INTO participantes (reserva_id, usuario_id, equipo) VALUES ($reserva_id, ".(int)$data['creador_id'].", 'A')");

    jsonResponse(array("status" => "ok", "id" => $reserva_id));
}

// [POST] Unirse a una Partida
function join_partida($data, $db) {
    if(empty($data['reserva_id']) || empty($data['usuario_id'])) {
        jsonResponse(array("error" => "Faltan datos"), 400);
    }

    $reservaId = (int)$data['reserva_id'];
    $usuarioId = (int)$data['usuario_id'];
    $codigoInput = isset($data['codigo']) ? $data['codigo'] : '';

    $reserva = $db->querySingle("SELECT * FROM reservas WHERE id = $reservaId", true);
    if (!$reserva) jsonResponse(array("error" => "Partida no encontrada"), 404);

    // Validación si es privada
    if ($reserva['tipo'] === 'private') {
        if (strtoupper($reserva['codigo_acceso']) !== strtoupper($codigoInput)) {
            jsonResponse(array("error" => "Código de acceso incorrecto"), 403);
        }
    }

    // Comprobar cupo
    $numJugadores = $db->querySingle("SELECT COUNT(*) FROM participantes WHERE reserva_id = $reservaId");
    if ($numJugadores >= 4) jsonResponse(array("error" => "Partida completa"), 409);

    // Comprobar si ya está dentro
    $yaEsta = $db->querySingle("SELECT id FROM participantes WHERE reserva_id = $reservaId AND usuario_id = $usuarioId");
    if ($yaEsta) jsonResponse(array("error" => "Ya estás inscrito en esta partida"), 400);

    // Asignar equipo
    $equipo = ($numJugadores < 2) ? 'A' : 'B';
    $db->exec("INSERT INTO participantes (reserva_id, usuario_id, equipo) VALUES ($reservaId, $usuarioId, '$equipo')");
    
    // Cerrar si se llenó
    if ($numJugadores + 1 == 4) {
        $db->exec("UPDATE reservas SET estado = 'cerrada' WHERE id = $reservaId");
    }

    jsonResponse(array("status" => "ok", "msg" => "Te has unido correctamente"));
}

// [POST] Finalizar Partida y Actualizar Ranking
function finish_partida($data, $db) {
    if(empty($data['reserva_id']) || empty($data['ganador']) || empty($data['marcador'])) {
        jsonResponse(array("error" => "Faltan datos"), 400);
    }

    $reservaId = (int)$data['reserva_id'];
    $equipoGanador = $data['ganador'];
    
    // Escapar marcador para evitar inyección simple (SQLite3::escapeString)
    $marcador = $db->escapeString($data['marcador']);

    $db->exec("UPDATE reservas SET estado = 'finalizada', resultado = '$marcador' WHERE id = $reservaId");

    $res = $db->query("SELECT usuario_id, equipo FROM participantes WHERE reserva_id = $reservaId");
    while ($jug = $res->fetchArray(SQLITE3_ASSOC)) {
        $uId = (int)$jug['usuario_id'];
        if ($jug['equipo'] === $equipoGanador) {
            $db->exec("UPDATE usuarios SET victorias = victorias + 1, nivel = nivel + 0.1 WHERE id = $uId");
        } else {
            // MAX existe en SQLite, evita que el nivel baje de 1.0
            $db->exec("UPDATE usuarios SET derrotas = derrotas + 1, nivel = MAX(1.0, nivel - 0.05) WHERE id = $uId");
        }
    }

    jsonResponse(array("status" => "ok", "msg" => "Ranking actualizado"));
}

/* [POST] Abandonar una Partida */
function leave_partida($data, $db) {
    if(empty($data['reserva_id']) || empty($data['usuario_id'])) {
        jsonResponse(array("error" => "Faltan datos"), 400);
    }

    $reservaId = (int)$data['reserva_id'];
    $usuarioId = (int)$data['usuario_id'];

    // 1. Borrar al participante de la tabla participantes
    $stmt = $db->prepare("DELETE FROM participantes WHERE reserva_id = :r AND usuario_id = :u");
    $stmt->bindValue(':r', $reservaId);
    $stmt->bindValue(':u', $usuarioId);
    $stmt->execute();

    if ($db->changes() > 0) {
        // 2. Comprobar cuántos jugadores quedan ahora en esa reserva
        $quedanJugadores = $db->querySingle("SELECT COUNT(*) FROM participantes WHERE reserva_id = $reservaId");

        if ($quedanJugadores == 0) {
            // 3. SI NO QUEDA NADIE: Borramos la reserva para que la pista aparezca como "RESERVAR" (vacia)
            $db->exec("DELETE FROM reservas WHERE id = $reservaId");
            jsonResponse(array("status" => "ok", "msg" => "Partida cancelada y eliminada por falta de jugadores"));
        } else {
            // 4. SI QUEDAN JUGADORES: Solo nos aseguramos de que el estado vuelva a ser 'abierta' por si estaba llena
            $db->exec("UPDATE reservas SET estado = 'abierta' WHERE id = $reservaId AND estado = 'cerrada'");
            jsonResponse(array("status" => "ok", "msg" => "Has abandonado la partida, pero la reserva sigue activa"));
        }
    } else {
        jsonResponse(array("error" => "No estabas inscrito en esta partida"), 404);
    }
}

// --- 6. HELPERS GLOBALES ---

function jsonResponse($data, $code = 200) {
    if (function_exists('http_response_code')) {
        http_response_code($code);
    } else {
        header("HTTP/1.1 $code");
    }
    echo json_encode($data);
    exit;
}

function getBody() {
    $input = json_decode(file_get_contents('php://input'), true);
    return $input ? $input : array();
}
?>