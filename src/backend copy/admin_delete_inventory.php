<?php
// admin_delete_inventory.php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include "db.php"; 

// ⬅️ CRITICAL FIX: Check database connection immediately
if ($conn->connect_error) {
    echo json_encode([
        "success" => false, 
        "message" => "Database connection failed: " . $conn->connect_error
    ]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['id'])) {
    echo json_encode(["success" => false, "message" => "Missing item ID for deletion."]);
    exit();
}

$id = (int)$data['id'];

// --- DELETE Operation ---
$stmt = $conn->prepare("DELETE FROM inventory WHERE id = ?");
$stmt->bind_param("i", $id);

if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        echo json_encode([
            "success" => true,
            "message" => "Item successfully deleted from inventory."
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Item not found or already deleted."
        ]);
    }
} else {
    echo json_encode([
        "success" => false,
        "message" => "Database error during deletion: " . $stmt->error
    ]);
}

$stmt->close();
$conn->close();
?>