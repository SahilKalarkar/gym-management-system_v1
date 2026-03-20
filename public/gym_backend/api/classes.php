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
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch(PDOException $e) {
    die(json_encode(['success' => false, 'message' => 'Connection failed']));
}

$action = $_GET['action'] ?? 'get';
$input = json_decode(file_get_contents('php://input'), true);

switch($action) {
    case 'get':
        getClasses($pdo);
        break;
    case 'add':
        addClass($pdo, $input);
        break;
    case 'update':
        updateClass($pdo, $input, $_GET['id']);
        break;
    case 'delete':
        deleteClass($pdo, $_GET['id']);
        break;
    case 'trainers':  // 🔥 NEW: Get active trainers for dropdown
        getActiveTrainers($pdo);
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
}

function getClasses($pdo) {
    // 🔥 JOIN with trainers table
    $stmt = $pdo->query("
        SELECT c.*, t.name as trainer_name 
        FROM classes c 
        LEFT JOIN trainers t ON c.trainer_id = t.id 
        ORDER BY c.day, c.start_time
    ");
    $classes = $stmt->fetchAll();
    echo json_encode(['success' => true, 'data' => $classes]);
}

function getActiveTrainers($pdo) {
    $stmt = $pdo->query("SELECT id, name FROM trainers WHERE status = 'active' ORDER BY name");
    $trainers = $stmt->fetchAll();
    echo json_encode(['success' => true, 'data' => $trainers]);
}

function addClass($pdo, $data) {
    try {
        $stmt = $pdo->prepare("
            INSERT INTO classes (title, trainer_id, trainer_name, type, day, start_time, end_time, location, capacity, current_enrolled, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $data['title'], 
            $data['trainer_id'], 
            $data['trainer_name'],
            $data['type'], $data['day'],
            $data['start_time'], $data['end_time'], $data['location'],
            $data['capacity'], $data['current_enrolled'], $data['status']
        ]);
        echo json_encode(['success' => true, 'message' => 'Class added']);
    } catch(PDOException $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

function updateClass($pdo, $data, $id) {
    try {
        $stmt = $pdo->prepare("
            UPDATE classes 
            SET title=?, trainer_id=?, trainer_name=?, type=?, day=?, start_time=?, end_time=?, location=?, capacity=?, current_enrolled=?, status=? 
            WHERE id=?
        ");
        $stmt->execute([
            $data['title'], 
            $data['trainer_id'], 
            $data['trainer_name'],
            $data['type'], $data['day'],
            $data['start_time'], $data['end_time'], $data['location'],
            $data['capacity'], $data['current_enrolled'], $data['status'], 
            $id
        ]);
        echo json_encode(['success' => true, 'message' => 'Class updated']);
    } catch(PDOException $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

function deleteClass($pdo, $id) {
    try {
        $stmt = $pdo->prepare("DELETE FROM classes WHERE id=?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true, 'message' => 'Class deleted']);
    } catch(PDOException $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}
?>
