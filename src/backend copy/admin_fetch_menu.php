<?php
// src/backend copy/admin_fetch_menu.php
$allowed_origins = ["http://localhost:5173", "http://localhost:5174"];
if (isset($_SERVER['HTTP_ORIGIN']) && in_array($_SERVER['HTTP_ORIGIN'], $allowed_origins)) {
    header("Access-Control-Allow-Origin: " . $_SERVER['HTTP_ORIGIN']);
}
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
// Handle Preflight Request (Browser Check)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    include "db.php";
    http_response_code(200);
    exit();
}

include "db.php";
header("Content-Type: application/json; charset=UTF-8");

$query = "SELECT * FROM menu_items ORDER BY category ASC, name ASC";
$result = $conn->query($query);

$items = [];
if ($result) {
    while ($row = $result->fetch_assoc()) {
        // Ensure ID is an integer and Price is a float for React
        $row['id'] = (int)$row['id'];
        $row['price'] = (float)$row['price'];
        $items[] = $row;
    }
}

echo json_encode(["success" => true, "items" => $items]);
$conn->close();
?>