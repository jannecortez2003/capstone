<?php
// src/backend copy/admin_fetch_dashboard_stats.php
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

// FIX: Added the missing database connection here!
include "db.php";

if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Database connection failed"]);
    exit();
}

// 1. Count Total Bookings
$bookingsQuery = "SELECT COUNT(*) as count FROM appointments";
$bookingsResult = $conn->query($bookingsQuery);
$bookingsCount = $bookingsResult ? $bookingsResult->fetch_assoc()['count'] : 0;

// 2. Calculate Total Revenue (Sum of all payments)
$revenueQuery = "SELECT SUM(amount_paid) as total FROM payments";
$revenueResult = $conn->query($revenueQuery);
$revenueRow = $revenueResult ? $revenueResult->fetch_assoc() : null;
$totalRevenue = ($revenueRow && $revenueRow['total']) ? $revenueRow['total'] : 0;

// 3. Count Menu Items
$menuQuery = "SELECT COUNT(*) as count FROM menu_items";
$menuResult = $conn->query($menuQuery);
$menuCount = $menuResult ? $menuResult->fetch_assoc()['count'] : 0;

// 4. Count Registered Customers
// This matches your database structure for verified users
$userQuery = "SELECT COUNT(*) as count FROM users WHERE is_verified = 1"; 
$userResult = $conn->query($userQuery);
$userCount = $userResult ? $userResult->fetch_assoc()['count'] : 0;

// 5. Get Upcoming Events (Next 5) for the list/calendar view
$eventsQuery = "SELECT id, event_type, preferred_date, status FROM appointments 
                WHERE preferred_date >= CURDATE() 
                ORDER BY preferred_date ASC LIMIT 5";
$eventsResult = $conn->query($eventsQuery);
$upcomingEvents = [];
if ($eventsResult) {
    while($row = $eventsResult->fetch_assoc()) {
        $upcomingEvents[] = $row;
    }
}

// Send everything back to React
echo json_encode([
    "success" => true,
    "stats" => [
        "bookings" => (int)$bookingsCount,
        "revenue" => (float)$totalRevenue,
        "menuItems" => (int)$menuCount,
        "customers" => (int)$userCount
    ],
    "upcomingEvents" => $upcomingEvents
]);

$conn->close();
?>