<?php
// src/backend copy/admin_add_inventory.php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include "db.php";

$data = json_decode(file_get_contents("php://input"), true);

// 1. Validate Input
if (!isset($data['name']) || !isset($data['quantity']) || !isset($data['unit'])) {
    echo json_encode(["success" => false, "message" => "Missing required fields"]);
    exit();
}

$name = $data['name'];
$quantity = (int)$data['quantity'];
$unit = $data['unit'];

// 2. Insert into Database
$stmt = $conn->prepare("INSERT INTO inventory (name, quantity, unit) VALUES (?, ?, ?)");
$stmt->bind_param("sis", $name, $quantity, $unit);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Item added successfully"]);
} else {
    echo json_encode(["success" => false, "message" => "Database Error: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>