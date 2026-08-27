<?php
// Set headers for JSON response
header('Content-Type: application/json');

// 1. Secure Environment Variable Parser (Native PHP)
$envFile = __DIR__ . '/../.env';
if (file_exists($envFile)) {
    $envVariables = parse_ini_file($envFile);
    foreach ($envVariables as $key => $value) {
        putenv("$key=$value");
    }
}

// 2. Spam Protection: Honeypot Check
if (!empty($_POST['_honey'])) {
    // Silently discard spam but return success to fool the bot
    echo json_encode(['success' => true, 'message' => 'Message received.']);
    exit;
}

// 3. Sanitize and Extract Inputs
$name = filter_input(INPUT_POST, 'name', FILTER_SANITIZE_STRING);
$email = filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL);
$projectType = filter_input(INPUT_POST, 'projectType', FILTER_SANITIZE_STRING);
$message = filter_input(INPUT_POST, 'message', FILTER_SANITIZE_STRING);
$ipAddress = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';

// 4. Validate Inputs
if (!$name || !$email || !$projectType || !$message) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'All required fields must be filled.']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid email address format.']);
    exit;
}

// 5. Database Processing & Rate Limiting
try {
    $pdo = new PDO(
        "mysql:host=" . getenv('DB_HOST') . ";dbname=" . getenv('DB_NAME') . ";charset=utf8mb4",
        getenv('DB_USER'),
        getenv('DB_PASS'),
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );

    // Rate Limiting: Max 3 requests per IP per hour
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM enquiries WHERE ip_address = ? AND created_at > (NOW() - INTERVAL 1 HOUR)");
    $stmt->execute([$ipAddress]);
    $requestCount = $stmt->fetchColumn();

    if ($requestCount >= 3) {
        http_response_code(429);
        echo json_encode(['success' => false, 'message' => 'Too many requests. Please try again later.']);
        exit;
    }

    // Store the enquiry securely
    $stmt = $pdo->prepare("INSERT INTO enquiries (name, email, project_type, message, ip_address) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$name, $email, $projectType, $message, $ipAddress]);

    // 6. Dispatch Notification Email
    $adminEmail = getenv('ADMIN_EMAIL');
    $subject = "New FalahCode Website Enquiry: $projectType";
    $emailBody = "Name: $name\nEmail: $email\nProject Type: $projectType\n\nMessage:\n$message";
    
    // Using a generic no-reply to avoid sender verification issues on standard hosting
    $headers = "From: no-reply@" . $_SERVER['HTTP_HOST'] . "\r\n";
    $headers .= "Reply-To: $email\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion();

    mail($adminEmail, $subject, $emailBody, $headers);

    // 7. Return Success
    echo json_encode(['success' => true, 'message' => 'Enquiry saved and email dispatched.']);

} catch (PDOException $e) {
    // Return generic error to frontend, avoid leaking SQL errors
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'A server error occurred. Please try again later.']);
}
?>