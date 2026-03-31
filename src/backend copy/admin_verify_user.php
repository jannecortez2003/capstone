<?php
// admin_verify_user.php
// ⬅️ FIX: Changed origin to the correct client port (5174)
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include "db.php";

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['requestId']) || !isset($data['userId']) || !isset($data['action'])) {
    echo json_encode(["success" => false, "message" => "Missing data for action."]);
    exit();
}

$request_id = (int)$data['requestId'];
$user_id = (int)$data['userId'];
$action = $conn->real_escape_string($data['action']); // 'Verified' or 'Rejected'
$is_verified = ($action === 'Verified') ? 1 : 0;

$conn->begin_transaction();
try {
    // 1. Update the verification_requests table
    $stmt1 = $conn->prepare("UPDATE verification_requests SET status = ? WHERE id = ? AND user_id = ?");
    $stmt1->bind_param("sii", $action, $request_id, $user_id);
    $stmt1->execute();
    
    if ($stmt1->affected_rows === 0) {
        throw new Exception("Request ID not found or already processed.");
    }
    $stmt1->close();

    // 2. Update the main users table (Crucial step for verification status)
    if ($action === 'Verified') {
        $stmt2 = $conn->prepare("UPDATE users SET is_verified = ? WHERE id = ?");
        $stmt2->bind_param("ii", $is_verified, $user_id);
        $stmt2->execute();
        $stmt2->close();
    }
    // If rejected, we don't change the user status, just the request status

    $conn->commit();
    echo json_encode(["success" => true, "message" => "Verification request successfully set to " . $action]);

} catch (Exception $e) {
    $conn->rollback();
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Transaction failed: " . $e->getMessage()]);
}

$conn->close();
?>