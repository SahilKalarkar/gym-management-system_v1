<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT');
header('Access-Control-Allow-Headers: Content-Type');

$host = 'localhost';
$dbname = 'gym_db';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC); // 🔥 ADDED
} catch(PDOException $e) {
    die(json_encode(['success' => false, 'message' => 'Connection failed']));
}

$action = $_GET['action'] ?? 'get';

if ($action === 'get') {
    $stmt = $pdo->query("SELECT * FROM settings WHERE id = 1");
    $settings = $stmt->fetch(PDO::FETCH_ASSOC) ?: [];
    
    // 🔥 CONVERT TO BOOLEAN: Store as 1/0 in DB, return as boolean
    $settings['site_status'] = !empty($settings['site_status']) && $settings['site_status'] !== 'false';
    
    echo json_encode(['success' => true, 'data' => $settings]);
}

if ($action === 'update' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    // 🔥 PHP CONVERTS BOOLEAN TO STRING "1"/"0" for DB
    $siteStatus = isset($input['site_status']) && $input['site_status'] ? '1' : '0';
    
    $stmt = $pdo->prepare("
        INSERT INTO settings (id, site_status, maintenance_message, maintenance_start, maintenance_end, email_notifications, sms_notifications, backup_enabled) 
        VALUES (1, ?, ?, ?, ?, ?, ?, ?) 
        ON DUPLICATE KEY UPDATE 
        site_status=VALUES(site_status), 
        maintenance_message=VALUES(maintenance_message),
        maintenance_start=VALUES(maintenance_start),
        maintenance_end=VALUES(maintenance_end),
        email_notifications=VALUES(email_notifications),
        sms_notifications=VALUES(sms_notifications),
        backup_enabled=VALUES(backup_enabled)
    ");
    
    $stmt->execute([
        $siteStatus,  // 🔥 "1" or "0"
        $input['maintenance_message'] ?? 'Site is under maintenance',
        $input['maintenance_start'] ?? null,
        $input['maintenance_end'] ?? null,
        $input['email_notifications'] ?? '0',
        $input['sms_notifications'] ?? '0',
        $input['backup_enabled'] ?? '0'
    ]);
    
    echo json_encode(['success' => true, 'message' => 'Settings updated']);
}

?>
