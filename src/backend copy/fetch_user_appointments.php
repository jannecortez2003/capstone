<?php
// src/backend copy/fetch_user_appointments.php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include "db.php";

if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Database connection failed."]);
    exit();
}

// ✅ FIX: Get user_id from URL query parameters (GET request)
$user_id = $_GET['user_id'] ?? null;

if (!$user_id) {
    echo json_encode(["success" => false, "message" => "User ID is required."]);
    exit();
}

// Fetch Appointments
$stmt = $conn->prepare("
    SELECT 
        id, 
        event_type, 
        package_type, 
        preferred_date, 
        guest_count,
        status,
        total_cost
    FROM 
        appointments
    WHERE 
        user_id = ?
    ORDER BY 
        created_at DESC
");

$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$appointments = [];
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $appointments[] = $row;
    }
    echo json_encode([
        "success" => true,
        "appointments" => $appointments
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Error fetching appointments: " . $stmt->error
    ]);
}

$stmt->close();
$conn->close();
?>