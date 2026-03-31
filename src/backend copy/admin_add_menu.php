<?php
// admin_add_menu.php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include "db.php";

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['name']) || !isset($data['price']) || !isset($data['category'])) {
    echo json_encode(["success" => false, "message" => "Missing required fields."]);
    exit();
}

$name = $conn->real_escape_string($data['name']);
$category = $conn->real_escape_string($data['category']);
$price = (float)$data['price'];
$description = $conn->real_escape_string($data['description'] ?? '');

$query = "INSERT INTO menu_items (name, category, price, description) VALUES ('$name', '$category', $price, '$description')";

if ($conn->query($query)) {
    echo json_encode(["success" => true, "message" => "Item added successfully"]);
} else {
    echo json_encode(["success" => false, "message" => "Database error: " . $conn->error]);
}

$conn->close();
?>