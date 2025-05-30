<?php
require_once 'Database.php';

$db = new Database();
$conn = $db->getConnection();

$query = "SELECT * FROM menu";
$stmt = $conn->prepare($query);
$stmt->execute();

$menu = [];

while ($row = $stmt->fetch()) {
    $menu[] = $row;
}

header('Content-Type: application/json');
echo json_encode($menu);
?>