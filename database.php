<?php 

class Database {
    private $host = 'localhost';
    private $db_name = 'kebab_place';
    private $username = 'root';     
    private $password = '';         
    private $conn;

    public function getConnection() {
        $this->conn = null;
        
        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name,
                $this->username,
                $this->password
            );
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        } catch(PDOException $exception) {
            echo "Connection error: " . $exception->getMessage();
        }
        
        return $this->conn;
    }
}

function startSecureSession() {
    if (session_status() == PHP_SESSION_NONE) {
        session_start();
    }
}


function isLoggedIn() {
    startSecureSession();
    return isset($_SESSION['user_id']) && isset($_SESSION['username']);
}


function isAdmin() {
    startSecureSession();
    return isLoggedIn() && isset($_SESSION['role']) && $_SESSION['role'] === 'admin';
}


function isStaff() {
    startSecureSession();
    return isLoggedIn() && isset($_SESSION['role']) && $_SESSION['role'] === 'staff';
}


function hasElevatedPrivileges() {
    startSecureSession();
    return isAdmin() || isStaff();
}

function isCustomer() {
    startSecureSession();
    return isLoggedIn() && isset($_SESSION['role']) && $_SESSION['role'] === 'customer';
}


function getUserRole() {
    startSecureSession();
    return $_SESSION['role'] ?? null;
}


function hasRole($role) {
    startSecureSession();
    return isLoggedIn() && isset($_SESSION['role']) && $_SESSION['role'] === $role;
}


function hasAnyRole($roles) {
    startSecureSession();
    if (!isLoggedIn() || !isset($_SESSION['role'])) {
        return false;
    }
    return in_array($_SESSION['role'], $roles);
}


function getCurrentUser() {
    startSecureSession();
    if (isLoggedIn()) {
        return [
            'id' => $_SESSION['user_id'],
            'username' => $_SESSION['username'],
            'email' => $_SESSION['email'] ?? '',
            'role' => $_SESSION['role'] ?? 'customer'
        ];
    }
    return null;
}


function requireRole($role, $redirectUrl = 'login.php') {
    if (!hasRole($role)) {
        if (!isLoggedIn()) {
            header("Location: $redirectUrl");
        } else {
            http_response_code(403);
            die("Access denied. Required role: $role");
        }
        exit();
    }
}


function requireAdmin($redirectUrl = 'login.php') {
    requireRole('admin', $redirectUrl);
}


function requireStaff($redirectUrl = 'login.php') {
    requireRole('staff', $redirectUrl);
}


function requireElevatedPrivileges($redirectUrl = 'login.php') {
    if (!hasElevatedPrivileges()) {
        if (!isLoggedIn()) {
            header("Location: $redirectUrl");
        } else {
            http_response_code(403);
            die("Access denied. Admin or staff privileges required.");
        }
        exit();
    }
}

?>