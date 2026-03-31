<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include "db.php"; // Use your existing db connection file

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['name']) || !isset($data['email']) || !isset($data['password'])) {
    echo json_encode(["success" => false, "message" => "Missing required fields"]);
    exit();
}

$username = $data["name"];
$email = $data["email"];
$password = $data["password"];

// 1. Check if email exists (Using Prepared Statement)
$checkStmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
$checkStmt->bind_param("s", $email);
$checkStmt->execute();
$checkResult = $checkStmt->get_result();

if ($checkResult->num_rows > 0) {
    echo json_encode(["success" => false, "message" => "Email already registered"]);
    exit();
}
$checkStmt->close();

// 2. Hash the password (SECURITY FIX)
$hashed_password = password_hash($password, PASSWORD_DEFAULT);

// 3. Insert new user (Using Prepared Statement)
$insertStmt = $conn->prepare("INSERT INTO users (username, email, password, is_verified) VALUES (?, ?, ?, 0)");
$insertStmt->bind_param("sss", $username, $email, $hashed_password);

if ($insertStmt->execute()) {
    echo json_encode([
        "success" => true,
        "message" => "User registered successfully",
        "user" => [
            "id" => $conn->insert_id,
            "fullName" => $username, 
            "email" => $email,
            "verified" => false 
        ]
    ]);
} else {
    echo json_encode(["success" => false, "message" => "Registration failed: " . $conn->error]);
}

$insertStmt->close();
$conn->close();
?>