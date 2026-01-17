<?php
// Usamos la misma lógica de sesión que en el resto de la app
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Ajustamos la ruta según tu estructura de carpetas
require_once 'app/db.php';

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $email = $_POST["email"] ?? "";
    $password = $_POST["password"] ?? "";

    // Buscamos al usuario
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    // Verificamos contraseña y asignamos sesión
    if ($user && password_verify($password, $user["password"])) {
        $_SESSION["user_id"] = $user["id"];
        header("Location: dashboard.php"); 
        exit;
    } else {
        $error = "Credenciales incorrectas";
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Planner Pro</title>
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>

<div class="login-container">
    <div class="login-card">
        <h1>Planner Pro</h1>
        <p>Inicia sesión para organizar tu día</p>

        <?php if (isset($error)): ?>
            <p class="error"><?php echo $error; ?></p>
        <?php endif; ?>

        <form method="POST">
            <input type="email" name="email" placeholder="Correo electrónico" required>
            <input type="password" name="password" placeholder="Contraseña" required>
            <button type="submit">Entrar</button>
        </form>

        <div style="margin-top: 20px; font-size: 0.9rem;">
            ¿No tienes cuenta? <a href="register.php" style="color: #4CAF50; text-decoration: none; font-weight: bold;">Regístrate</a>
        </div>
    </div>
</div>

</body>
</html>