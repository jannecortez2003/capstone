<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include "db.php";

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['email']) || !isset($data['password'])) {
    echo json_encode(["success" => false, "message" => "Missing credentials"]);
    exit();
}

$input = $data["email"]; // This could be Email OR Username (Name)
$password = $data["password"];

// 1. Fetch user by Email OR Username
// We bind the $input variable twice: once for email, once for username
$stmt = $conn->prepare("SELECT * FROM users WHERE email = ? OR username = ? LIMIT 1");
$stmt->bind_param("ss", $input, $input);
$stmt->execute();
$result = $stmt->get_result();

if (!$result || $result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "No user found with that email or name"]);
    exit();
}

$user = $result->fetch_assoc();

// 2. Verify Password
// Note: This only works for NEW users created with the secure register.php.
// OLD users from your SQL dump have plain text passwords and will fail here.
if (password_verify($password, $user["password"])) {
    echo json_encode([
        "success" => true,
        "message" => "Login successful",
        "user" => [
            "id" => $user["id"],
            "fullName" => $user["username"],
            "email" => $user["email"],
            "verified" => (bool)($user["is_verified"] ?? 0)
        ]
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Invalid password"
    ]);
}

$stmt->close();
$conn->close();
?>