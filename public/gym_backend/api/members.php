<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

$host = 'localhost';
$dbname = 'gym_db';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    die(json_encode(['success' => false, 'message' => 'Connection failed: ' . $e->getMessage()]));
}

$action = $_GET['action'] ?? 'get';
$input = json_decode(file_get_contents('php://input'), true);

switch($action) {
    case 'get':
        getMembers($pdo);
        break;
    case 'add':
        addMember($pdo, $input);
        break;
    case 'update':
        updateMember($pdo, $input, $_GET['id']);
        break;
    case 'delete':
        deleteMember($pdo, $_GET['id']);
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
}

function getMembers($pdo) {
    // 🔥 INCLUDE member_id in SELECT
    $stmt = $pdo->query("SELECT id, member_id, name, email, phone, membership_type, status, join_date FROM members ORDER BY created_at DESC");
    $members = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['success' => true, 'data' => $members]);
}

function addMember($pdo, $data) {
    try {
        // 🔥 AUTO-GENERATE member_id if not provided
        $memberId = $data['member_id'] ?? 'MEM' . time();
        
        $stmt = $pdo->prepare("INSERT INTO members (member_id, name, email, phone, membership_type, status, join_date) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $memberId,
            $data['name'],
            $data['email'],
            $data['phone'],
            $data['membership_type'],
            $data['status'],
            $data['join_date']
        ]);
        echo json_encode(['success' => true, 'message' => 'Member added']);
    } catch(PDOException $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

function updateMember($pdo, $data, $id) {
    try {
        $stmt = $pdo->prepare("UPDATE members SET member_id=?, name=?, email=?, phone=?, membership_type=?, status=?, join_date=? WHERE id=?");
        $stmt->execute([
            $data['member_id'] ?? 'MEM' . time(),
            $data['name'],
            $data['email'],
            $data['phone'],
            $data['membership_type'],
            $data['status'],
            $data['join_date'],
            $id
        ]);
        echo json_encode(['success' => true, 'message' => 'Member updated']);
    } catch(PDOException $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

function deleteMember($pdo, $id) {
    try {
        $stmt = $pdo->prepare("DELETE FROM members WHERE id=?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true, 'message' => 'Member deleted']);
    } catch(PDOException $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}
?>
