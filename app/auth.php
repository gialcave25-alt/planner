<?php
// app/auth.php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require "db.php";

if (!isset($_SESSION["user_id"])) {
    // Si la petición viene de la carpeta API, respondemos con error JSON en lugar de redirección
    if (strpos($_SERVER['REQUEST_URI'], '/api/') !== false) {
        http_response_code(401);
        echo json_encode(["error" => "Sesión no iniciada"]);
        exit;
    }
    header("Location: index.php"); 
    exit;
}