<?php

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method.']);
    exit;
}

$postData = json_decode(file_get_contents('php://input'), true);

$token = $postData['recaptchaToken'] ?? null;
$name = $postData['name'] ?? null;
$org = $postData['organization'] ?? null;
$email = $postData['email'] ?? null;
$interests = $postData['interests'] ?? [];

if (!$token || !$name || !$org || !$email) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Missing required form data or reCAPTCHA token.']);
    exit;
}

$secretKey = '6Lel-morAAAAAIqnak6aYptE_jN9gyfunay0Aj9l';

$url = 'https://www.google.com/recaptcha/api/siteverify';
$data = [
    'secret'   => $secretKey,
    'response' => $token,
    'remoteip' => $_SERVER['REMOTE_ADDR']
];

$options = [
    'http' => [
        'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
        'method'  => 'POST',
        'content' => http_build_query($data),
    ],
];

$context = stream_context_create($options);
$response = file_get_contents($url, false, $context);
$responseData = json_decode($response, true);

if ($responseData && $responseData['success'] && $responseData['score'] >= 0.5) {
    $to = 'thrive-form@shadee.care'; 
    $subject = 'New Partnership Inquiry from ' . htmlspecialchars($name);
    
    // --- KEY CHANGE: Map values to full text and format as a clean list ---
    $interestMapping = [
        'outreach' => 'Outreach Partnership',
        'parents'  => 'Parents Roundtable',
        'madoka'   => 'Mind Madoka Game',
        'support'  => 'Peer Support for Young Workers',
        'other'    => 'Other Areas'
    ];

    $formattedInterests = [];
    foreach ($interests as $interestKey) {
        if (isset($interestMapping[$interestKey])) {
            $formattedInterests[] = "- " . $interestMapping[$interestKey];
        }
    }

    // Build the email message body
    $message = "You have received a new form submission:\n\n";
    $message .= "Name: " . htmlspecialchars($name) . "\n";
    $message .= "Organization: " . htmlspecialchars($org) . "\n";
    $message .= "Email: " . htmlspecialchars($email) . "\n\n";
    $message .= "Areas of Interest:\n" . implode("\n", $formattedInterests);

    $headers = 'From: thrive-form@shadee.care' . "\r\n" .
               'Reply-To: ' . htmlspecialchars($email) . "\r\n" .
               'X-Mailer: PHP/' . phpversion();

    if (mail($to, $subject, $message, $headers)) {
        http_response_code(200);
        echo json_encode([
            'status' => 'success', 
            'message' => 'Thank you! Your message has been sent successfully.'
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            'status' => 'error', 
            'message' => 'There was a problem sending your message. Please try again later.'
        ]);
    }

} else {
    http_response_code(400);
    echo json_encode([
        'status' => 'error', 
        'message' => 'reCAPTCHA verification failed. Please try again.',
        'details' => $responseData['error-codes'] ?? 'Low score'
    ]);
}

?>