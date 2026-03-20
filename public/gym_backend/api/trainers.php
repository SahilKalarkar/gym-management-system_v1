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

switch($action) {
    case 'get':
        $search = $_GET['search'] ?? '';
        $status = $_GET['status'] ?? '';
        
        $sql = "SELECT * FROM trainers WHERE 1=1";
        $params = [];
        
        if ($search) {
            $sql .= " AND (name LIKE ? OR specialty LIKE ? OR phone LIKE ?)";
            $params[] = "%$search%";
            $params[] = "%$search%";
            $params[] = "%$search%";
        }
        
        if ($status) {
            $sql .= " AND status = ?";
            $params[] = $status;
        }
        
        $sql .= " ORDER BY name ASC";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        echo json_encode(['success' => true, 'data' => $stmt->fetchAll()]);
        break;
        
    case 'create':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $input = json_decode(file_get_contents('php://input'), true);
            
            $stmt = $pdo->prepare("INSERT INTO trainers (name, specialty, phone, email, image, status) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $input['name'],
                $input['specialty'],
                $input['phone'],
                $input['email'] ?? null,
                $input['image'] ?? '/images/default-trainer.png',
                $input['status'] ?? 'active'
            ]);
            
            echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
        }
        break;
        
    case 'update':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $input = json_decode(file_get_contents('php://input'), true);
            
            $stmt = $pdo->prepare("UPDATE trainers SET name=?, specialty=?, phone=?, email=?, image=?, status=? WHERE id=?");
            $stmt->execute([
                $input['name'],
                $input['specialty'],
                $input['phone'],
                $input['email'] ?? null,
                $input['image'] ?? '/images/default-trainer.png',
                $input['status'],
                $input['id']
            ]);
            
            echo json_encode(['success' => true, 'message' => 'Trainer updated']);
        }
        break;
        
    case 'delete':
        $id = $_GET['id'] ?? 0;
        $stmt = $pdo->prepare("DELETE FROM trainers WHERE id=?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true, 'message' => 'Trainer deleted']);
        break;
        
    case 'stats':
        $stats = [
            'total' => $pdo->query("SELECT COUNT(*) FROM trainers")->fetchColumn(),
            'active' => $pdo->query("SELECT COUNT(*) FROM trainers WHERE status='active'")->fetchColumn(),
            'inactive' => $pdo->query("SELECT COUNT(*) FROM trainers WHERE status='inactive'")->fetchColumn()
        ];
        echo json_encode(['success' => true, 'data' => $stats]);
        break;
        
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
}
?>
