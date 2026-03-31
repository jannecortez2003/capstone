<?php
// src/backend copy/admin_fetch_bookings.php
$allowed_origins = ["http://localhost:5173", "http://localhost:5174"];
if (isset($_SERVER['HTTP_ORIGIN']) && in_array($_SERVER['HTTP_ORIGIN'], $allowed_origins)) {
    header("Access-Control-Allow-Origin: " . $_SERVER['HTTP_ORIGIN']);
}
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include "db.php";

// FIX: We added a JOIN to the payments table and math to calculate the total paid and balance
$query = "SELECT 
            a.*, 
            u.username as customer_name, 
            u.email as customer_email,
            COALESCE(SUM(p.amount_paid), 0) as amount_paid,
            (a.total_cost - COALESCE(SUM(p.amount_paid), 0)) as balance
          FROM appointments a
          LEFT JOIN users u ON a.user_id = u.id 
          LEFT JOIN payments p ON a.id = p.appointment_id
          GROUP BY a.id
          ORDER BY a.created_at DESC";

$result = $conn->query($query);

$bookings = [];
if ($result) {
    while ($row = $result->fetch_assoc()) {
        if (!isset($row['customer_name']) || $row['customer_name'] === null) {
             $row['customer_name'] = "Unknown User (ID: " . $row['user_id'] . ")";
        }
        if (!isset($row['customer_email']) || $row['customer_email'] === null) {
            $row['customer_email'] = "N/A";
        }
        
        // Format numbers for React
        $row['total_cost'] = (float)$row['total_cost'];
        $row['amount_paid'] = (float)$row['amount_paid'];
        $row['balance'] = (float)$row['balance'];
        
        $bookings[] = $row;
    }
    echo json_encode(["success" => true, "bookings" => $bookings]);
} else {
    echo json_encode(["success" => false, "message" => "Database error: " . $conn->error]);
}

$conn->close();
?>