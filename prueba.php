<?php
// rellenar_ranking.php
// Este script rellena la base de datos con jugadores PRO para probar el ranking

$DB_FILE = __DIR__ . '/padel_pro_v2.db';
$db = new SQLite3($DB_FILE);

// Lista de jugadores falsos con puntuaciones variadas para generar el podio
$jugadores = [
    ['nombre' => 'Ale Galán',       'nivel' => 7.0, 'victorias' => 150, 'derrotas' => 5],  // Top 1
    ['nombre' => 'Ari Sánchez',     'nivel' => 6.9, 'victorias' => 142, 'derrotas' => 8],  // Top 2
    ['nombre' => 'Agustín Tapia',   'nivel' => 6.8, 'victorias' => 135, 'derrotas' => 10], // Top 3
    ['nombre' => 'Paquito Navarro', 'nivel' => 6.5, 'victorias' => 98,  'derrotas' => 25],
    ['nombre' => 'Marta Ortega',    'nivel' => 6.2, 'victorias' => 85,  'derrotas' => 30],
    ['nombre' => 'Fernando Belasteguín', 'nivel' => 6.0, 'victorias' => 300, 'derrotas' => 100], // Leyenda
    ['nombre' => 'Usuario Nuevo',   'nivel' => 1.0, 'victorias' => 0,   'derrotas' => 0]
];

echo "<h2>Generando Ranking...</h2>";

foreach ($jugadores as $j) {
    $email = strtolower(str_replace(' ', '.', $j['nombre'])) . "@test.com";
    // Contraseña por defecto: 123456
    $pass = password_hash('123456', PASSWORD_DEFAULT); 
    
    // Intentamos insertar. Si el email ya existe, no pasa nada (gracias al try/catch implícito o la restricción UNIQUE)
    $sql = "INSERT INTO usuarios (nombre, email, password, nivel, victorias, derrotas) 
            VALUES ('{$j['nombre']}', '$email', '$pass', {$j['nivel']}, {$j['victorias']}, {$j['derrotas']})";
    
    // Usamos @ para suprimir errores si el usuario ya existe
    if (@$db->exec($sql)) {
        echo "✅ Creado: {$j['nombre']} (Nivel {$j['nivel']})<br>";
    } else {
        echo "⚠️ Ya existe: {$j['nombre']}<br>";
    }
}

echo "<br><a href='ranking.html'>Ver Ranking Ahora</a>";
?>