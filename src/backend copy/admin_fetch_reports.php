<?php
// admin_fetch_reports.php
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

if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Database connection failed."]);
    exit();
}

// 1. Calculate Total Revenue from all payments
$rev_query = "SELECT SUM(amount_paid) as total_revenue FROM payments";
$rev_result = $conn->query($rev_query);
$total_revenue = $rev_result->fetch_assoc()['total_revenue'] ?? 0;

// 2. Calculate Package Performance (Distribution)
$pkg_query = "SELECT package_type, COUNT(*) as count FROM appointments GROUP BY package_type";
$pkg_result = $conn->query($pkg_query);
$packages = [];
$total_bookings = 0;

while ($row = $pkg_result->fetch_assoc()) {
    $packages[] = $row;
    $total_bookings += $row['count'];
}

// 3. Static Placeholder for Expenses (Update this if you add an expenses table later)
$total_expenses = 0.3 * $total_revenue; // Example: estimated 30% overhead
$projected_profit = $total_revenue - $total_expenses;

echo json_encode([
    "success" => true,
    "summary" => [
        "revenue" => (float)$total_revenue,
        "expenses" => (float)$total_expenses,
        "profit" => (float)$projected_profit,
        "total_bookings" => $total_bookings
    ],
    "packages" => $packages
]);

$conn->close();
?>