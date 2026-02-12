<?php
/**
 * BACKEND PADEL PRO V2 - Lógica Privada/Pública y Ranking
 */

// 1. HEADERS Y CONFIGURACIÓN
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

$DB_FILE = __DIR__ . '/padel_pro_v2.db';
$db = new SQLite3($DB_FILE);
$db->enableExceptions(true);

// 2. HELPERS
function jsonResponse($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data);
    exit;
}

function getBody() {
    return json_decode(file_get_contents('php://input'), true) ?? [];
}

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? null;

try {

    // --- 3. INSTALACIÓN (ESTRUCTURA DE DATOS ACTUALIZADA) ---
    if ($method === 'GET' && $action === 'install') {
        
        // Usuarios: Login y Ranking
        $db->exec("CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            nivel REAL DEFAULT 1.0, -- Ranking (1.0 a 7.0)
            victorias INTEGER DEFAULT 0,
            derrotas INTEGER DEFAULT 0,
            foto TEXT
        )");

        // Pistas
        $db->exec("CREATE TABLE IF NOT EXISTS pistas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            tipo TEXT,
            foto_url TEXT
        )");

        // Reservas: Soporte Privado/Público
        $db->exec("CREATE TABLE IF NOT EXISTS reservas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            pista_id INTEGER NOT NULL,
            creador_id INTEGER NOT NULL,
            fecha TEXT NOT NULL, -- YYYY-MM-DD
            hora TEXT NOT NULL,
            tipo TEXT DEFAULT 'public', -- 'public' o 'private'
            codigo_acceso TEXT, -- Solo si es privada
            estado TEXT DEFAULT 'abierta', -- 'abierta', 'cerrada', 'finalizada'
            resultado TEXT -- Ej: '6-4 6-2'
        )");

        // Participantes
        $db->exec("CREATE TABLE IF NOT EXISTS participantes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            reserva_id INTEGER NOT NULL,
            usuario_id INTEGER NOT NULL,
            equipo TEXT -- 'A' o 'B'
        )");

        // Obtener Ranking Global
        if ($method === 'GET' && $action === 'ranking') {
            // Ordenamos por Nivel (desc) y luego por Victorias (desc)
            $res = $db->query("SELECT id, nombre, nivel, victorias, derrotas, foto FROM usuarios ORDER BY nivel DESC, victorias DESC LIMIT 50");
            $users = [];
            while($row = $res->fetchArray(SQLITE3_ASSOC)) $users[] = $row;
            jsonResponse($users);
        }

        // Datos semilla de Pistas
        $count = $db->querySingle("SELECT COUNT(*) FROM pistas");
        if ($count == 0) {
            $db->exec("INSERT INTO pistas (nombre, tipo, foto_url) VALUES 
                ('Central World Padel', 'Panorámica', 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8'),
                ('Pista Cristal 1', 'Cristal', 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea'),
                ('Pista Muro Clásica', 'Muro', 'https://images.unsplash.com/photo-1599423300746-b62533397364')");
        }

        jsonResponse(["msg" => "Base de datos V2 instalada correctamente."]);
    }

    // --- 4. USUARIOS Y AUTH ---
    
    if ($method === 'POST' && $action === 'register') {
        $data = getBody();
        if(empty($data['email']) || empty($data['password'])) jsonResponse(["error"=>"Faltan datos"], 400);

        $stmt = $db->prepare("INSERT INTO usuarios (nombre, email, password, nivel, foto) VALUES (:n, :e, :p, :l, :f)");
        $stmt->bindValue(':n', $data['nombre']);
        $stmt->bindValue(':e', $data['email']);
        $stmt->bindValue(':p', password_hash($data['password'], PASSWORD_DEFAULT));
        $stmt->bindValue(':l', $data['nivel'] ?? 2.5); // Nivel inicial por defecto
        $stmt->bindValue(':f', $data['foto'] ?? '');
        $stmt->execute();

        jsonResponse(["status" => "ok", "id" => $db->lastInsertRowID()]);
    }

    if ($method === 'POST' && $action === 'login') {
        $data = getBody();
        $stmt = $db->prepare("SELECT * FROM usuarios WHERE email = :e");
        $stmt->bindValue(':e', $data['email']);
        $res = $stmt->execute();
        $user = $res->fetchArray(SQLITE3_ASSOC);

        if ($user && password_verify($data['password'], $user['password'])) {
            unset($user['password']); // Seguridad
            jsonResponse(["status" => "ok", "user" => $user]);
        } else {
            jsonResponse(["error" => "Credenciales inválidas"], 401);
        }
    }

    // --- 5. LOGICA DE PADEL (RESERVAS) ---

    // Obtener Pistas
    if ($method === 'GET' && $action === 'pistas') {
        $res = $db->query("SELECT * FROM pistas");
        $items = [];
        while($row = $res->fetchArray(SQLITE3_ASSOC)) $items[] = $row;
        jsonResponse($items);
    }

    // Obtener Reservas (con info de ranking)
    if ($method === 'GET' && $action === 'reservas') {
        $fecha = $_GET['fecha'] ?? date('Y-m-d');

        // 1. Sacamos las partidas básicas
        $stmt = $db->prepare("SELECT r.*, p.nombre as pista_nombre 
                              FROM reservas r 
                              JOIN pistas p ON r.pista_id = p.id 
                              WHERE r.fecha = :f");
        $stmt->bindValue(':f', $fecha);
        $res = $stmt->execute();

        $reservas = [];
        while($row = $res->fetchArray(SQLITE3_ASSOC)) {
            $row['jugadores'] = []; 
            $reservas[$row['id']] = $row;
        }

        // 2. Rellenamos jugadores con su NOMBRE y NIVEL (Ranking)
        if (!empty($reservas)) {
            $ids = implode(',', array_keys($reservas));
            // IMPORTANTE: Aquí seleccionamos el nivel para mostrarlo en el frontend
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

    // Crear Reserva (Pública o Privada)
    if ($method === 'POST' && $action === 'reservar') {
        $data = getBody();
        
        // Validación básica de horario
        $stmtCheck = $db->prepare("SELECT id FROM reservas WHERE pista_id=:p AND fecha=:f AND hora=:h");
        $stmtCheck->bindValue(':p', $data['pista_id']);
        $stmtCheck->bindValue(':f', $data['fecha']);
        $stmtCheck->bindValue(':h', $data['hora']);
        if ($stmtCheck->execute()->fetchArray()) jsonResponse(["error" => "Pista ocupada"], 409);

        // Insertar Reserva
        $stmt = $db->prepare("INSERT INTO reservas (pista_id, creador_id, fecha, hora, tipo, codigo_acceso) VALUES (:p, :c, :f, :h, :t, :cod)");
        $stmt->bindValue(':p', $data['pista_id']);
        $stmt->bindValue(':c', $data['creador_id']);
        $stmt->bindValue(':f', $data['fecha']);
        $stmt->bindValue(':h', $data['hora']);
        $stmt->bindValue(':t', $data['tipo']); // 'public' o 'private'
        // Si es privada, guardamos el código enviado, si no, null
        $stmt->bindValue(':cod', ($data['tipo'] === 'private') ? $data['codigo'] : null);
        $stmt->execute();

        $reserva_id = $db->lastInsertRowID();

        // Añadir al creador automáticamente como jugador
        $db->exec("INSERT INTO participantes (reserva_id, usuario_id, equipo) VALUES ($reserva_id, {$data['creador_id']}, 'A')");

        jsonResponse(["status" => "ok", "id" => $reserva_id]);
    }

    // Unirse a Partida (Validación de Código Privado)
    if ($method === 'POST' && $action === 'unirse') {
        $data = getBody();
        $reservaId = intval($data['reserva_id']);
        $usuarioId = intval($data['usuario_id']);
        $codigoInput = $data['codigo'] ?? '';

        // 1. Obtener info de la reserva
        $reserva = $db->querySingle("SELECT * FROM reservas WHERE id = $reservaId", true);
        if (!$reserva) jsonResponse(["error" => "Partida no encontrada"], 404);

        // 2. VALIDACIÓN PRIVADA
        if ($reserva['tipo'] === 'private') {
            // Comparamos el código (Mayúsculas para evitar errores)
            if (strtoupper($reserva['codigo_acceso']) !== strtoupper($codigoInput)) {
                jsonResponse(["error" => "Código de acceso incorrecto"], 403);
            }
        }

        // 3. Verificar plazas (Máx 4)
        $numJugadores = $db->querySingle("SELECT COUNT(*) FROM participantes WHERE reserva_id = $reservaId");
        if ($numJugadores >= 4) jsonResponse(["error" => "Partida completa"], 409);

        // 4. Verificar si ya está dentro
        $yaEsta = $db->querySingle("SELECT id FROM participantes WHERE reserva_id = $reservaId AND usuario_id = $usuarioId");
        if ($yaEsta) jsonResponse(["error" => "Ya estás inscrito"], 400);

        // 5. Insertar
        $equipo = ($numJugadores < 2) ? 'A' : 'B'; // Lógica simple de equipos
        $db->exec("INSERT INTO participantes (reserva_id, usuario_id, equipo) VALUES ($reservaId, $usuarioId, '$equipo')");
        
        // Si se llena, cerramos la partida
        if ($numJugadores + 1 == 4) {
            $db->exec("UPDATE reservas SET estado = 'cerrada' WHERE id = $reservaId");
        }

        jsonResponse(["status" => "ok", "msg" => "Te has unido correctamente"]);
    }

    // --- 6. GESTIÓN DE RANKING (RESULTADOS) ---
    if ($method === 'POST' && $action === 'finalizar_partida') {
        $data = getBody();
        $reservaId = intval($data['reserva_id']);
        $equipoGanador = $data['ganador']; // 'A' o 'B'

        // Marcar finalizada
        $db->exec("UPDATE reservas SET estado = 'finalizada', resultado = '{$data['marcador']}' WHERE id = $reservaId");

        // Obtener jugadores para actualizar stats
        $res = $db->query("SELECT usuario_id, equipo FROM participantes WHERE reserva_id = $reservaId");
        while ($jug = $res->fetchArray(SQLITE3_ASSOC)) {
            if ($jug['equipo'] === $equipoGanador) {
                // Ganador: Sube nivel (+0.1) y suma victoria
                $db->exec("UPDATE usuarios SET victorias = victorias + 1, nivel = nivel + 0.1 WHERE id = {$jug['usuario_id']}");
            } else {
                // Perdedor: Baja nivel (-0.05, mínimo 1.0) y suma derrota
                $db->exec("UPDATE usuarios SET derrotas = derrotas + 1, nivel = MAX(1.0, nivel - 0.05) WHERE id = {$jug['usuario_id']}");
            }
        }

        jsonResponse(["status" => "ok", "msg" => "Ranking actualizado"]);
    }

} catch (Exception $e) {
    jsonResponse(["error" => $e->getMessage()], 500);
}
?>