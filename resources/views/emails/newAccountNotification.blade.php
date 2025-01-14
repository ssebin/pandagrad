<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f9f9f9;
        }
        .container {
            width: 90%;
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            overflow: hidden;
        }
        .header {
            text-align: center; 
            padding: 0;
        }

        .header-image {
            max-width: 100%;
            height: auto;
        }
        .content {
            padding: 20px;
        }
        .content p {
            margin: 10px 0;
            font-size: 1.1em;
        }
        .faculty-logo {
            display: block;
            margin-top: 20px;
            margin-left: 0; /* Aligns to the left */
            max-width: 150px;
        }
        .footer {
            text-align: center;
            padding: 10px 0;
            font-size: 0.9em;
            color: #666;
        }
        .footer a {
            color: #007bff;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://i.imgur.com/RHkMHsY.png" alt="Welcome to PandaGrad Header" class="header-image">
        </div>
        <div class="content">
            <p>Hello,</p>
            <br>
            <p>Your new {{ ucfirst($role) }} account has been created at PandaGrad.</p>
            <p>PandaGrad is a platform for FSKTM postgraduate students to manage their postgraduate journey.</p>
            <br>
            <p>Please use Google SSO to log in to <a href="https://pandagrad.vercel.app" target="_blank">pandagrad.vercel.app</a> with your email:</p>
            <p><strong>{{ $email }}</strong></p>
            <br>
            <p>If you have any questions, feel free to contact us at <a href="mailto:support@pandagrad.com">support@pandagrad.com</a>.</p>
            <br>
            <p>Best regards,</p>
            <p><strong>FSKTM PG Office, UM</strong></p>
            <img src="https://i.imgur.com/XjB9DJE.png" alt="FSKTM Logo" class="faculty-logo">
        </div>
        <div class="footer">
            <p>&copy; {{ date('Y') }} PandaGrad. All rights reserved.</p>
        </div>
    </div>
</body>
</html>