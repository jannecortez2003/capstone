<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");
include "db.php";

$data = json_decode(file_get_contents("php://input"), true);
$id = $data['id'] ?? null;
$name = $conn->real_escape_string($data['name']);
$role = $conn->real_escape_string($data['role']);
$email = $conn->real_escape_string($data['email']);
$phone = $conn->real_escape_string($data['phone']);
$status = $conn->real_escape_string($data['status'] ?? 'Active');

if ($id) {
    $stmt = $conn->prepare("UPDATE staff SET name=?, role=?, email=?, phone=?, status=? WHERE id=?");
    $stmt->bind_param("sssssi", $name, $role, $email, $phone, $status, $id);
} else {
    $stmt = $conn->prepare("INSERT INTO staff (name, role, email, phone, status) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("sssss", $name, $role, $email, $phone, $status);
}

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Staff records updated."]);
} else {
    echo json_encode(["success" => false, "message" => "Error: " . $stmt->error]);
}
?>