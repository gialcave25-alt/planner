<?php
// app/db.php

// 1. Detección automática de entorno (Local vs Hostinger)
if ($_SERVER['SERVER_NAME'] === 'localhost' || $_SERVER['SERVER_ADDR'] === '127.0.0.1') {
    // Configuración para XAMPP (Local)
    $host = "localhost";
    $db   = "planner_db";
    $user = "root";
    $pass = ""; 
} else {
    // Configuración para HOSTINGER
    // RECUERDA: Cambia estos valores cuando crees la DB en tu panel de Hostinger
    $host = "localhost"; 
    $db   = "u330678156_planner_db"; // Ejemplo de nombre en Hostinger
    $user = "u330678156_giovannycastro";   // Ejemplo de usuario en Hostinger
    $pass = "Valeria12092006.";
}

try {
    // 2. Conexión usando el set de caracteres utf8mb4 (soporta emojis y tildes mejor)
    $pdo = new PDO(
        "mysql:host=$host;dbname=$db;charset=utf8mb4",
        $user,
        $pass
    );
    
    // 3. Configuración de errores y modo de obtención de datos
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

} catch (PDOException $e) {
    // En producción (Hostinger), es mejor no mostrar el error detallado al usuario
    error_log("Error de conexión: " . $e->getMessage());
    die("Lo sentimos, hay un problema temporal con la base de datos.");
}