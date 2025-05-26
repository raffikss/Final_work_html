<?php
require_once 'database.php';

header('Content-Type: application/json');

$database = new Database();
$db = $database->getConnection();

if (!$db) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed']);
    exit;
}

$action = $_POST['action'] ?? '';

switch ($action) {
    case 'place_order':
        handlePlaceOrder($db);
        break;
    case 'get_user_orders':
        handleGetUserOrders($db);
        break;
    case 'get_all_orders':
        handleGetAllOrders($db);
        break;
    case 'update_order_status':
        handleUpdateOrderStatus($db);
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
}

function handlePlaceOrder($db) {
    startSecureSession();
    
    $items = $_POST['items'] ?? '';
    $total = floatval($_POST['total'] ?? 0);
    $phone = trim($_POST['phone'] ?? '');
    $name = trim($_POST['name'] ?? '');
    $payment_method = $_POST['payment_method'] ?? '';
    $card_number = $_POST['card_number'] ?? '';
    
    // Validation
    if (empty($items) || $total <= 0 || empty($phone) || empty($name)) {
        echo json_encode(['success' => false, 'message' => 'All fields are required']);
        return;
    }
    
    if (empty($card_number) || strlen($card_number) < 16) {
        echo json_encode(['success' => false, 'message' => 'Valid card number is required']);
        return;
    }
    
    try {
        $user_id = isLoggedIn() ? $_SESSION['user_id'] : null;
        $card_last_four = substr($card_number, -4);
        
        $query = "INSERT INTO orders (user_id, guest_phone, guest_name, items, total_amount, status, payment_method, card_last_four) 
                  VALUES (:user_id, :phone, :name, :items, :total, 'pending', :payment_method, :card_last_four)";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':user_id', $user_id);
        $stmt->bindParam(':phone', $phone);
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':items', $items);
        $stmt->bindParam(':total', $total);
        $stmt->bindParam(':payment_method', $payment_method);
        $stmt->bindParam(':card_last_four', $card_last_four);
        
        if ($stmt->execute()) {
            $order_id = $db->lastInsertId();
            echo json_encode([
                'success' => true, 
                'message' => 'Order placed successfully!',
                'order_id' => $order_id
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to place order']);
        }
        
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
}

function handleGetUserOrders($db) {
    startSecureSession();
    
    if (!isLoggedIn()) {
        echo json_encode(['success' => false, 'message' => 'Not logged in']);
        return;
    }
    
    try {
        $query = "SELECT id, items, total_amount, status, created_at, payment_method, card_last_four 
                  FROM orders WHERE user_id = :user_id ORDER BY created_at DESC";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':user_id', $_SESSION['user_id']);
        $stmt->execute();
        
        $orders = $stmt->fetchAll();
        
        // Parse JSON items for each order
        foreach ($orders as &$order) {
            $order['items'] = json_decode($order['items'], true);
        }
        
        echo json_encode(['success' => true, 'orders' => $orders]);
        
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
}

function handleGetAllOrders($db) {
    startSecureSession();
    
    if (!hasElevatedPrivileges()) {
        echo json_encode(['success' => false, 'message' => 'Access denied']);
        return;
    }
    
    try {
        $query = "SELECT o.id, o.guest_name, o.guest_phone, o.items, o.total_amount, o.status, 
                         o.created_at, o.payment_method, o.card_last_four, u.username
                  FROM orders o 
                  LEFT JOIN users u ON o.user_id = u.id 
                  ORDER BY o.created_at DESC";
        
        $stmt = $db->prepare($query);
        $stmt->execute();
        
        $orders = $stmt->fetchAll();
        
        // Parse JSON items for each order
        foreach ($orders as &$order) {
            $order['items'] = json_decode($order['items'], true);
            $order['customer_name'] = $order['username'] ?? $order['guest_name'];
        }
        
        echo json_encode(['success' => true, 'orders' => $orders]);
        
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
}

function handleUpdateOrderStatus($db) {
    startSecureSession();
    
    if (!hasElevatedPrivileges()) {
        echo json_encode(['success' => false, 'message' => 'Access denied']);
        return;
    }
    
    $order_id = intval($_POST['order_id'] ?? 0);
    $status = $_POST['status'] ?? '';
    
    $valid_statuses = ['pending', 'in_progress', 'completed', 'cancelled'];
    if (!in_array($status, $valid_statuses)) {
        echo json_encode(['success' => false, 'message' => 'Invalid status']);
        return;
    }
    
    try {
        $query = "UPDATE orders SET status = :status WHERE id = :order_id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':status', $status);
        $stmt->bindParam(':order_id', $order_id);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Order status updated']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to update status']);
        }
        
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
}
?>