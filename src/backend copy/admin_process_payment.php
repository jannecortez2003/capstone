<?php
// src/backend copy/admin_process_payment.php
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

$data = json_decode(file_get_contents("php://input"), true);

if (!$data || !isset($data['appointmentId']) || !isset($data['amount'])) {
    echo json_encode(["success" => false, "message" => "Invalid payment data received."]);
    exit();
}

$appointment_id = $data['appointmentId'];
$amount = (float)$data['amount'];
$type = $data['paymentType']; // 'Downpayment' or 'Full Payment'
$remarks = $conn->real_escape_string($data['remarks']);

$conn->begin_transaction();

try {
    $stmt1 = $conn->prepare("INSERT INTO payments (appointment_id, amount_paid, payment_type, remarks) VALUES (?, ?, ?, ?)");
    $stmt1->bind_param("idss", $appointment_id, $amount, $type, $remarks);
    $stmt1->execute();
    
    $conn->commit();
    echo json_encode(["success" => true, "message" => "Payment recorded successfully"]);
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>