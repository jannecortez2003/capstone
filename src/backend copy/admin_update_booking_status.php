<?php
// src/backend copy/admin_update_booking_status.php

// 1. Dynamic CORS to fix the Port 5174/5173 issue
$allowed_origins = ["http://localhost:5173", "http://localhost:5174"];
if (isset($_SERVER['HTTP_ORIGIN']) && in_array($_SERVER['HTTP_ORIGIN'], $allowed_origins)) {
    header("Access-Control-Allow-Origin: " . $_SERVER['HTTP_ORIGIN']);
}
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include "db.php"; 

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['bookingId']) || !isset($data['status'])) {
    echo json_encode(["success" => false, "message" => "Missing booking ID or status."]);
    exit();
}

$booking_id = (int)$data['bookingId'];
$status = $conn->real_escape_string($data['status']);

// FIX 2: Automatically update the Database to accept 'Completed'
// This prevents the database from rejecting the new status!
$conn->query("ALTER TABLE appointments MODIFY COLUMN status ENUM('Pending', 'Confirmed', 'Cancelled', 'Completed') NOT NULL DEFAULT 'Pending'");

// FIX 3: Preserve your total_cost logic
if ($status === 'Confirmed') {
    $stmt = $conn->prepare("UPDATE appointments SET status = ?, total_cost = COALESCE(total_cost, 30000.00) WHERE id = ?");
    $stmt->bind_param("si", $status, $booking_id);
} else {
    $stmt = $conn->prepare("UPDATE appointments SET status = ? WHERE id = ?");
    $stmt->bind_param("si", $status, $booking_id);
}

if ($stmt->execute()) {
    echo json_encode([
        "success" => true,
        "message" => "Booking #{$booking_id} status successfully updated to {$status}."
    ]);
} else {
    echo json_encode(["success" => false, "message" => "Error: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>