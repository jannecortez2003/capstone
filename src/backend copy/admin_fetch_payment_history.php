<?php
// src/backend copy/admin_fetch_payment_history.php
$allowed_origins = ["http://localhost:5173", "http://localhost:5174"];
if (isset($_SERVER['HTTP_ORIGIN']) && in_array($_SERVER['HTTP_ORIGIN'], $allowed_origins)) {
    header("Access-Control-Allow-Origin: " . $_SERVER['HTTP_ORIGIN']);
}
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include "db.php";

if (!isset($_GET['appointmentId'])) {
    echo json_encode(["success" => false, "message" => "Appointment ID is missing.", "history" => []]);
    exit();
}

$id = (int)$_GET['appointmentId'];

$query = "SELECT amount_paid, payment_type, transaction_date FROM payments WHERE appointment_id = $id ORDER BY transaction_date DESC";
$result = $conn->query($query);

$history = [];
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $history[] = $row;
    }
}

echo json_encode(["success" => true, "history" => $history]);
$conn->close();
?>