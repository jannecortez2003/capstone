<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");
include "db.php";
$data = json_decode(file_get_contents("php://input"), true);
$id = (int)$data['id'];
$conn->query("DELETE FROM staff WHERE id = $id");
echo json_encode(["success" => true]);
?>