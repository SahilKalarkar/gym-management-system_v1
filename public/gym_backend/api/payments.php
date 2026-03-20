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
        getPayments($pdo);
        break;
    case 'add':
        addPayment($pdo, $input);
        break;
    case 'update':
        updatePayment($pdo, $input, $_GET['id']);
        break;
    case 'delete':
        deletePayment($pdo, $_GET['id']);
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
}

function getPayments($pdo) {
    $stmt = $pdo->query("SELECT * FROM payments ORDER BY payment_date DESC, created_at DESC");
    $payments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['success' => true, 'data' => $payments]);
}


function addPayment($pdo, $data) {
    try {
        // ✅ Use member_id directly (MEM001 format)
        $paymentId = $data['payment_id'] ?? 'PAY' . time();
        $memberId = $data['member_id'] ?? '';           // ✅ Direct from frontend
        $memberName = $data['member_name'] ?? '';       // ✅ Direct from frontend (optional)
        $amount = floatval($data['amount'] ?? 0);
        $membershipType = $data['membership_type'] ?? 'Basic';
        $method = $data['method'] ?? 'UPI';
        $status = $data['status'] ?? 'pending';
        $paymentDate = $data['payment_date'] ?? date('Y-m-d');
        $dueDate = $data['due_date'] ?? date('Y-m-d', strtotime('+30 days'));

        $stmt = $pdo->prepare("INSERT INTO payments (payment_id, member_id, member_name, amount, membership_type, method, status, payment_date, due_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $paymentId, $memberId, $memberName, $amount, $membershipType, 
            $method, $status, $paymentDate, $dueDate
        ]);
        echo json_encode(['success' => true, 'message' => 'Payment added']);
    } catch(PDOException $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

function updatePayment($pdo, $data, $id) {
    try {
        // ✅ Use member_id directly
        $paymentId = $data['payment_id'] ?? '';
        $memberId = $data['member_id'] ?? '';           // ✅ Direct from frontend
        $memberName = $data['member_name'] ?? '';       // ✅ Direct from frontend
        $amount = floatval($data['amount'] ?? 0);
        $membershipType = $data['membership_type'] ?? 'Basic';
        $method = $data['method'] ?? 'UPI';
        $status = $data['status'] ?? 'pending';
        $paymentDate = $data['payment_date'] ?? date('Y-m-d');
        $dueDate = $data['due_date'] ?? date('Y-m-d');

        $stmt = $pdo->prepare("UPDATE payments SET payment_id=?, member_id=?, member_name=?, amount=?, membership_type=?, method=?, status=?, payment_date=?, due_date=? WHERE id=?");
        $stmt->execute([
            $paymentId, $memberId, $memberName, $amount, $membershipType, 
            $method, $status, $paymentDate, $dueDate, $id
        ]);
        echo json_encode(['success' => true, 'message' => 'Payment updated']);
    } catch(PDOException $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}


function deletePayment($pdo, $id) {
    try {
        $stmt = $pdo->prepare("DELETE FROM payments WHERE id=?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true, 'message' => 'Payment deleted']);
    } catch(PDOException $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}
?>
