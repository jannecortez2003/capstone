<?php
// src/backend copy/db.php

// 1. Dynamic CORS: Allow both common React ports (5173 & 5174)
$allowed_origins = ['http://localhost:5173', 'http://localhost:5174'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    header("Access-Control-Allow-Origin: http://localhost:5173"); // Default fallback
}

header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// 2. Database Config
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "caterhub_db";

// 3. Connect
$conn = new mysqli($servername, $username, $password, $dbname);

// 4. Handle Connection Error Gracefully
if ($conn->connect_error) {
    die(json_encode([
        "success" => false, 
        "message" => "Database connection failed: " . $conn->connect_error
    ]));
}
?>