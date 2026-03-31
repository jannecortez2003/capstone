<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");
include "db.php";

$query = "SELECT * FROM staff ORDER BY name ASC";
$result = $conn->query($query);

$staff = [];
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $staff[] = $row;
    }
}
echo json_encode(["success" => true, "staff" => $staff]);
$conn->close();
?>