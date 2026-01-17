<?php
// Iniciamos sesión para poder acceder a $_SESSION['user_id']
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

header("Content-Type: application/json");
require "../app/db.php"; 
require "../app/auth.php";

// Obtenemos el ID de la sesión
$user_id = $_SESSION['user_id'] ?? null;

// Si no hay sesión, devolvemos error 401
if (!$user_id) {
    http_response_code(401);
    echo json_encode(['error' => 'No autorizado. Por favor, inicia sesión.']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

switch ($method) {
    case 'GET':
        // Filtrar estrictamente por el usuario logueado
        $stmt = $pdo->prepare("SELECT * FROM tasks WHERE user_id = :user_id ORDER BY task_date ASC, task_time ASC");
        $stmt->execute([':user_id' => $user_id]);
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;

    case 'POST':
        // Limpiamos el texto para evitar scripts maliciosos (XSS)
        $title = htmlspecialchars($input['title'] ?? '', ENT_QUOTES, 'UTF-8');
        
        $sql = "INSERT INTO tasks (user_id, title, task_date, task_time, priority, category, completed) 
                VALUES (:user_id, :title, :task_date, :task_time, :priority, :category, 0)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':user_id'   => $user_id, 
            ':title'     => $title, // Usamos la variable limpia
            ':task_date' => $input['task_date'],
            ':task_time' => $input['task_time'] ?? '09:00',
            ':priority'  => $input['priority'],
            ':category'  => $input['category'] ?? ''
        ]);
        echo json_encode(['status' => 'success', 'id' => $pdo->lastInsertId()]);
        break;

    case 'PUT':
        // Seguridad extra: Solo actualizar si la tarea pertenece al usuario (opcional pero recomendado)
        $sql = "UPDATE tasks SET completed = :completed WHERE id = :id AND user_id = :user_id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':completed' => $input['completed'],
            ':id'        => $input['id'],
            ':user_id'   => $user_id
        ]);
        echo json_encode(['status' => 'updated']);
        break;

    case 'DELETE':
        $sql = "DELETE FROM tasks WHERE id = :id AND user_id = :user_id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':id'      => $input['id'],
            ':user_id' => $user_id
        ]);
        echo json_encode(['status' => 'deleted']);
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Método no permitido']);
        break;
}