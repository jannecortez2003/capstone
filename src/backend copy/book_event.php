<?php
// book_event.php
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

// ⬅️ CRITICAL FIX: Check if the connection failed immediately
if ($conn->connect_error) {
    echo json_encode([
        "success" => false, 
        "message" => "Database connection failed. Please check server settings."
    ]);
    exit();
}
// ------------------------------------

$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    echo json_encode(["success" => false, "message" => "Invalid request data."]);
    exit();
}

// Basic input validation
if (empty($data['userId']) || empty($data['eventType']) || empty($data['packageType']) || empty($data['preferredDate']) || empty($data['guestCount']) || empty($data['selectedDishes'])) {
    echo json_encode(["success" => false, "message" => "All fields (including selected dishes) are required."]);
    exit();
}

$user_id = $conn->real_escape_string($data['userId']);
$event_type = $conn->real_escape_string($data['eventType']);
$package_type = $conn->real_escape_string($data['packageType']);
$preferred_date = $conn->real_escape_string($data['preferredDate']); // Date string from frontend
$guest_count = (int)$data['guestCount']; // Integer
$selected_dishes = $conn->real_escape_string($data['selectedDishes']); 

// --- Inventory Calculation and Deduction Logic (Unchanged) ---
$inventory_needs_per_guest = [
    'Chairs' => 1, 'Plate' => 1, 'Utensils - Spoon' => 1, 'Utensils - Fork' => 1,
];
$inventory_needs_per_event = [
    'Lights (assorted)' => 1, 
];
$inventory_needs_ratio = [
    'Table (10 seater)' => 10, 
];

$required_inventory = [];
$deduction_success = true; 

foreach ($inventory_needs_per_guest as $item_name => $items_per_guest) {
    $quantity_needed = $items_per_guest * $guest_count; 
    if ($quantity_needed > 0) {
        $required_inventory[] = "$item_name: $quantity_needed";
    }
}
foreach ($inventory_needs_ratio as $item_name => $guest_ratio) {
    $quantity_needed = (int)ceil($guest_count / $guest_ratio); 
    if ($quantity_needed > 0) {
        $required_inventory[] = "$item_name: $quantity_needed";
    }
}
foreach ($inventory_needs_per_event as $item_name => $quantity_needed) {
    $required_inventory[] = "$item_name: $quantity_needed";
}

$required_inventory_str = implode('; ', $required_inventory);
// -----------------------------------------------------

// Insert into appointments table
$stmt = $conn->prepare("INSERT INTO appointments (user_id, event_type, package_type, preferred_date, guest_count, selected_dishes, required_inventory) VALUES (?, ?, ?, ?, ?, ?, ?)");

// ⬅️ CRITICAL FIX APPLIED: Changed type string from 'ississs' to 'isssiss'
// The parameters are: INT, STR, STR, STR(Date), INT, STR, STR
$stmt->bind_param("isssiss", $user_id, $event_type, $package_type, $preferred_date, $guest_count, $selected_dishes, $required_inventory_str);

if ($stmt->execute() && $deduction_success) {
    echo json_encode([
        "success" => true,
        "message" => "Event booking successful. Inventory requirement recorded. We will contact you shortly!",
        "booking_id" => $conn->insert_id
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Database error or Inventory check failed: " . $stmt->error
    ]);
}

$stmt->close();
$conn->close();
?>