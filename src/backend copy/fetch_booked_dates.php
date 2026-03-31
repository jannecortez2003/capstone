<?php
// fetch_booked_dates.php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

include "db.php"; 

$query = "SELECT preferred_date FROM appointments WHERE status != 'Cancelled'";
$result = $conn->query($query);

$bookedDates = [];
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $bookedDates[] = $row['preferred_date'];
    }
}

echo json_encode(["success" => true, "bookedDates" => $bookedDates]);
$conn->close();
?>