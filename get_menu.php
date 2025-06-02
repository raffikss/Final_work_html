<?php
require_once 'database.php';

// Set JSON header
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$db = new Database();
$conn = $db->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            handleGet($conn);
            break;
        case 'POST':
            handlePost($conn);
            break;
        case 'PUT':
            handlePut($conn);
            break;
        case 'DELETE':
            handleDelete($conn);
            break;
        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Method not allowed']);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}

function handleGet($conn) {
    if (isset($_GET['id'])) {
        $id = $_GET['id'];
        $query = "SELECT * FROM menu WHERE id = :id";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        
        $item = $stmt->fetch();
        if ($item) {
            echo json_encode($item);
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Item not found']);
        }
    } else {
        $query = "SELECT * FROM menu ORDER BY food_type, name";
        $stmt = $conn->prepare($query);
        $stmt->execute();
        
        $menu = [];
        while ($row = $stmt->fetch()) {
            $menu[] = $row;
        }
        
        echo json_encode($menu);
    }
}

function handlePost($conn) {


    $name = $_POST['name'] ?? '';
    $description = $_POST['description'] ?? '';
    $price = $_POST['price'] ?? 0;
    $food_type = $_POST['food_type'] ?? '';
    
    $id = generateId($name);
    
    if (empty($name) || empty($description) || $price <= 0 || empty($food_type)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'All fields are required']);
        return;
    }
    

    $checkQuery = "SELECT id FROM menu WHERE id = :id";
    $checkStmt = $conn->prepare($checkQuery);
    $checkStmt->bindParam(':id', $id);
    $checkStmt->execute();
    
    if ($checkStmt->fetch()) {
        http_response_code(409);
        echo json_encode(['success' => false, 'message' => 'Item with this name already exists']);
        return;
    }
    
    // Insert new item
    $query = "INSERT INTO menu (id, name, description, price, food_type) VALUES (:id, :name, :description, :price, :food_type)";
    $stmt = $conn->prepare($query);
    
    $stmt->bindParam(':id', $id);
    $stmt->bindParam(':name', $name);
    $stmt->bindParam(':description', $description);
    $stmt->bindParam(':price', $price);
    $stmt->bindParam(':food_type', $food_type);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Item added successfully', 'id' => $id]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to add item']);
    }
}

function handlePut($conn) {

    parse_str(file_get_contents("php://input"), $putData);
    
    $id = $putData['id'] ?? '';
    $name = $putData['name'] ?? '';
    $description = $putData['description'] ?? '';
    $price = $putData['price'] ?? 0;
    $food_type = $putData['food_type'] ?? '';
    
    if (empty($id) || empty($name) || empty($description) || $price <= 0 || empty($food_type)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'All fields are required']);
        return;
    }
    
    $checkQuery = "SELECT id FROM menu WHERE id = :id";
    $checkStmt = $conn->prepare($checkQuery);
    $checkStmt->bindParam(':id', $id);
    $checkStmt->execute();
    
    if (!$checkStmt->fetch()) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Item not found']);
        return;
    }
    
    $query = "UPDATE menu SET name = :name, description = :description, price = :price, food_type = :food_type WHERE id = :id";
    $stmt = $conn->prepare($query);
    
    $stmt->bindParam(':id', $id);
    $stmt->bindParam(':name', $name);
    $stmt->bindParam(':description', $description);
    $stmt->bindParam(':price', $price);
    $stmt->bindParam(':food_type', $food_type);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Item updated successfully']);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to update item']);
    }
}

function handleDelete($conn) {


    $id = $_GET['id'] ?? '';
    
    if (empty($id)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Item ID is required']);
        return;
    }
    

    $checkQuery = "SELECT id FROM menu WHERE id = :id";
    $checkStmt = $conn->prepare($checkQuery);
    $checkStmt->bindParam(':id', $id);
    $checkStmt->execute();
    
    if (!$checkStmt->fetch()) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Item not found']);
        return;
    }
    

    $query = "DELETE FROM menu WHERE id = :id";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':id', $id);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Item deleted successfully']);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to delete item']);
    }
}

function generateId($name) {
    $id = strtolower($name);
    $id = preg_replace('/[^a-z0-9\s-]/', '', $id);
    $id = preg_replace('/[\s-]+/', '-', $id);
    $id = trim($id, '-');
    
    return $id;
}
?>