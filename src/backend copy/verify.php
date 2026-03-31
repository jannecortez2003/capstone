<?php
// verify.php
// ⬅️ CRITICAL FIX: Strict error suppression to ensure only JSON is output
error_reporting(0); 
ini_set('display_errors', 0);

// CORS is already set to 5174 here, but ensuring it's correct
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ⬅️ Use require_once for stability
require_once "db.php"; 

// Check connection explicitly (to prevent crashes if db is down)
if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Database connection failed: " . $conn->connect_error]);
    exit();
}

$upload_dir = 'uploads/';
if (!is_dir($upload_dir)) {
    if (!@mkdir($upload_dir, 0777, true)) {
         echo json_encode(["success" => false, "message" => "Failed to create upload directory."]);
         exit();
    }
}

// 1. Handle File Upload
$image_path = null;
if (isset($_FILES['idImage']) && $_FILES['idImage']['error'] == 0) {
    $file_info = $_FILES['idImage'];
    $file_ext = pathinfo($file_info['name'], PATHINFO_EXTENSION);
    $new_file_name = uniqid('id_') . '.' . $file_ext;
    $target_file = $upload_dir . $new_file_name;

    if (!move_uploaded_file($file_info['tmp_name'], $target_file)) {
        echo json_encode(["success" => false, "message" => "Failed to move uploaded file."]);
        exit();
    }
    $image_path = $target_file;
} else {
    echo json_encode(["success" => false, "message" => "ID image file is required or upload failed."]);
    exit();
}

// 2. Handle Form Data (using $_POST for multipart/form-data)
$required_fields = ['userId', 'idType', 'idNumber', 'lastName', 'firstName', 'address', 'phone', 'email'];

foreach ($required_fields as $field) {
    if (!isset($_POST[$field]) || trim($_POST[$field]) === '') {
        echo json_encode(["success" => false, "message" => "Missing or empty required field: " . $field]);
        if ($image_path && file_exists($image_path)) {
             unlink($image_path); // Cleanup the file if form data is bad
        }
        exit();
    }
}

$user_id = $conn->real_escape_string($_POST['userId']);
$id_type = $conn->real_escape_string($_POST['idType']);
$id_number = $conn->real_escape_string($_POST['idNumber']);
$last_name = $conn->real_escape_string($_POST['lastName']);
$first_name = $conn->real_escape_string($_POST['firstName']);
$middle_name = $conn->real_escape_string($_POST['middleName'] ?? ''); 
$address = $conn->real_escape_string($_POST['address']);
$phone = $conn->real_escape_string($_POST['phone']);
$email = $conn->real_escape_string($_POST['email']);

// 3. Insert into Database
// ⬅️ CRITICAL FIX: Changed from INSERT to INSERT...ON DUPLICATE KEY UPDATE 
// to prevent the 500 Duplicate entry error. It updates the existing request instead of crashing.
$sql = "INSERT INTO verification_requests 
        (user_id, id_type, id_number, last_name, first_name, middle_name, address, phone, email, id_image_path, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')
        ON DUPLICATE KEY UPDATE
        id_type = VALUES(id_type),
        id_number = VALUES(id_number),
        last_name = VALUES(last_name),
        first_name = VALUES(first_name),
        middle_name = VALUES(middle_name),
        address = VALUES(address),
        phone = VALUES(phone),
        email = VALUES(email),
        id_image_path = VALUES(id_image_path),
        status = 'Pending'"; // Reset status to Pending for new review

$stmt = $conn->prepare($sql);
$stmt->bind_param("isssssssss", $user_id, $id_type, $id_number, $last_name, $first_name, $middle_name, $address, $phone, $email, $image_path);

if ($stmt->execute()) {
    echo json_encode([
        "success" => true,
        // Check affected_rows to customize message (2 rows affected means it was an UPDATE)
        "message" => "Verification request submitted successfully. Your request has been " . ($stmt->affected_rows > 1 ? "updated." : "submitted.")
    ]);
} else {
    if ($image_path && file_exists($image_path)) {
         unlink($image_path);
    }
    // Only handle generic database error here, as duplicate key is now handled by ON DUPLICATE
    echo json_encode(["success" => false, "message" => "Database error: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>