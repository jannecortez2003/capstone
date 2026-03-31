<?php
// src/backend copy/admin_fetch_inventory.php
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

include "db.php";

$query = "SELECT * FROM inventory ORDER BY name ASC";
$result = $conn->query($query);

$inventory = [];

if ($result) {
    while ($row = $result->fetch_assoc()) {
        $inventory[] = $row;
    }
    echo json_encode(["success" => true, "inventory" => $inventory]);
} else {
    // If the table doesn't exist or query fails
    echo json_encode(["success" => false, "inventory" => [], "message" => $conn->error]);
}

$conn->close();
?>