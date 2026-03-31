<?php
// src/backend copy/fetch_user_transactions.php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

include "db.php";

$user_id = $_GET['user_id'] ?? null;

if (!$user_id) {
    echo json_encode(["success" => false, "message" => "User ID required"]);
    exit();
}

// 1. Fetch Payments (Linked to Appointments to ensure they belong to this user)
$query = "SELECT p.id, p.amount_paid, p.payment_date, p.payment_method, p.status, a.event_type, a.preferred_date 
          FROM payments p
          JOIN appointments a ON p.booking_id = a.id
          WHERE a.user_id = ?
          ORDER BY p.payment_date DESC";

$stmt = $conn->prepare($query);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$transactions = [];
$total_spent = 0;

while ($row = $result->fetch_assoc()) {
    $row['amount_paid'] = (float)$row['amount_paid'];
    $total_spent += $row['amount_paid'];
    $transactions[] = $row;
}

// 2. Fetch Booking Stats
$statsQuery = "SELECT 
                COUNT(*) as total_bookings,
                SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'Confirmed' THEN 1 ELSE 0 END) as confirmed,
                SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed
               FROM appointments WHERE user_id = ?";
$stmtStats = $conn->prepare($statsQuery);
$stmtStats->bind_param("i", $user_id);
$stmtStats->execute();
$statsResult = $stmtStats->get_result()->fetch_assoc();

echo json_encode([
    "success" => true,
    "transactions" => $transactions,
    "stats" => [
        "total_bookings" => $statsResult['total_bookings'] ?? 0,
        "pending" => $statsResult['pending'] ?? 0,
        "confirmed" => $statsResult['confirmed'] ?? 0,
        "completed" => $statsResult['completed'] ?? 0,
        "total_spent" => $total_spent
    ]
]);

$stmt->close();
$conn->close();
?>