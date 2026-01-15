<?php
// Usamos la misma lógica de sesión que en el resto de la app
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Ajustamos la ruta según tu estructura de carpetas
require "../app/db.php";

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
        // Asegúrate de que la ruta a dashboard.php sea correcta
        header("Location: dashboard.php"); 
        exit;
    } else {
        $error = "Credenciales incorrectas";
    }
}
?>

<?php if (isset($error)): ?>
    <p style="color: red;"><?php echo $error; ?></p>
<?php endif; ?>

<form method="POST">
    <input type="email" name="email" placeholder="Email" required><br><br>
    <input type="password" name="password" placeholder="Contraseña" required><br><br>
    <button type="submit">Entrar</button>
</form>