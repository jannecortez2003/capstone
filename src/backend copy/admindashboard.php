<?php
header("Access-Control-Allow-Origin: http://localhost:5173"); // your React dev server
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
session_start();
if (!isset($_SESSION['admin_id'])) {
    header('Location: adminlogin.php');
    exit;
}
?>
<!doctype html>
<html>
<head><title>Admin Dashboard</title></head>
<body>
<h2>Admin Dashboard - <?php echo htmlspecialchars($_SESSION['admin_username']); ?></h2>
<ul>
    <li><a href="appointments/list.php">Manage Appointments</a></li>
    <li><a href="inventory/list.php">Manage Inventory</a></li>
    <li><a href="logout.php">Logout</a></li>
</ul>
</body>
</html>
