<?php
// admin_update_inventory.php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include "db.php";

// ⬅️ CRITICAL FIX: Check if the connection failed immediately
if ($conn->connect_error) {
    echo json_encode([
        "success" => false, 
        "message" => "Database connection failed: " . $conn->connect_error
    ]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    echo json_encode(["success" => false, "message" => "Invalid request data or malformed JSON."]);
    exit();
}

$name = $conn->real_escape_string($data['name']);
$quantity = (int)$data['quantity'];
$unit = $conn->real_escape_string($data['unit']);
// Use NULL coalescing operator to safely check for 'id'
$id = $data['id'] ?? null; 

// The rest of the logic remains the same (using prepared statements is good practice)

if ($id) {
    // --- UPDATE Operation (Edit) ---
    $stmt = $conn->prepare("UPDATE inventory SET name=?, quantity=?, unit=? WHERE id=?");
    $stmt->bind_param("sisi", $name, $quantity, $unit, $id);
    $action = "updated";
} else {
    // --- CREATE Operation (Add) ---
    $stmt = $conn->prepare("INSERT INTO inventory (name, quantity, unit) VALUES (?, ?, ?)");
    $stmt->bind_param("sis", $name, $quantity, $unit);
    $action = "added";
}

if ($stmt->execute()) {
    echo json_encode([
        "success" => true,
        "message" => "Item '{$name}' successfully {$action}."
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Database error during save: " . $stmt->error
    ]);
}

$stmt->close();
$conn->close();
?>