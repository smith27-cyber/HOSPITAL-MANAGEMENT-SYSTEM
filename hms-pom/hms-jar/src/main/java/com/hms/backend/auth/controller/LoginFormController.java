package com.hms.backend.auth.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
@RequestMapping("/api")
public class LoginFormController {

    @GetMapping("/")
    @ResponseBody
    public String loginForm() {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <title>HMS API Login</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        height: 100vh;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                    }
                    .container {
                        background: white;
                        padding: 40px;
                        border-radius: 10px;
                        box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                        width: 100%;
                        max-width: 400px;
                    }
                    h1 {
                        text-align: center;
                        margin-bottom: 30px;
                        color: #333;
                        font-size: 24px;
                    }
                    .form-group {
                        margin-bottom: 20px;
                    }
                    label {
                        display: block;
                        margin-bottom: 8px;
                        color: #555;
                        font-weight: 500;
                    }
                    input {
                        width: 100%;
                        padding: 12px;
                        border: 1px solid #ddd;
                        border-radius: 5px;
                        font-size: 14px;
                        transition: border-color 0.3s;
                    }
                    input:focus {
                        outline: none;
                        border-color: #667eea;
                        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
                    }
                    button {
                        width: 100%;
                        padding: 12px;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        border: none;
                        border-radius: 5px;
                        font-size: 14px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: transform 0.2s;
                    }
                    button:hover {
                        transform: translateY(-2px);
                    }
                    button:active {
                        transform: translateY(0);
                    }
                    .result {
                        margin-top: 20px;
                        padding: 15px;
                        border-radius: 5px;
                        display: none;
                    }
                    .result.success {
                        background: #d4edda;
                        border: 1px solid #c3e6cb;
                        color: #155724;
                    }
                    .result.error {
                        background: #f8d7da;
                        border: 1px solid #f5c6cb;
                        color: #721c24;
                    }
                    .token-box {
                        background: #f5f5f5;
                        padding: 10px;
                        border-radius: 5px;
                        margin-top: 10px;
                        word-break: break-all;
                        font-family: monospace;
                        font-size: 12px;
                        max-height: 150px;
                        overflow-y: auto;
                    }
                    .copy-btn {
                        margin-top: 10px;
                        padding: 8px 15px;
                        font-size: 12px;
                        background: #667eea;
                    }
                    .info {
                        background: #e7f3ff;
                        border: 1px solid #b3d9ff;
                        color: #004085;
                        padding: 12px;
                        border-radius: 5px;
                        margin-bottom: 20px;
                        font-size: 13px;
                        line-height: 1.5;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>HMS API Login</h1>

                    <div class="info">
                        Test credentials:<br/>
                        <strong>Username:</strong> test_manager<br/>
                        <strong>Password:</strong> password123
                    </div>

                    <form id="loginForm">
                        <div class="form-group">
                            <label for="username">Username</label>
                            <input type="text" id="username" name="username" value="test_manager" required/>
                        </div>
                        <div class="form-group">
                            <label for="password">Password</label>
                            <input type="password" id="password" name="password" value="password123" required/>
                        </div>
                        <button type="submit">Login</button>
                    </form>

                    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
                        <p style="text-align: center; color: #999; font-size: 12px; margin-bottom: 12px;">Quick Login (localhost only)</p>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                            <button type="button" id="demoBtn" style="background: #17a2b8; padding: 10px;">
                                👤 Demo User
                            </button>
                            <button type="button" id="thorBtn" style="background: #dc3545; padding: 10px;">
                                ⚡ Thor (Admin)
                            </button>
                        </div>
                    </div>

                    <div id="result" class="result"></div>
                </div>

                <script>
                    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

                    // Demo user quick login
                    document.getElementById('demoBtn').addEventListener('click', () => {
                        if (!isLocalhost) {
                            alert('Quick login is only available on localhost');
                            return;
                        }
                        document.getElementById('username').value = 'test_manager';
                        document.getElementById('password').value = 'password123';
                        document.getElementById('loginForm').dispatchEvent(new Event('submit'));
                    });

                    // Thor superuser quick login
                    document.getElementById('thorBtn').addEventListener('click', () => {
                        if (!isLocalhost) {
                            alert('Quick login is only available on localhost');
                            return;
                        }
                        document.getElementById('username').value = 'thor';
                        document.getElementById('password').value = 'password123';
                        document.getElementById('loginForm').dispatchEvent(new Event('submit'));
                    });

                    // Main login form handler
                    document.getElementById('loginForm').addEventListener('submit', async (e) => {
                        e.preventDefault();

                        const username = document.getElementById('username').value;
                        const password = document.getElementById('password').value;
                        const resultDiv = document.getElementById('result');

                        try {
                            const response = await fetch('/api/auth/login', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({ username, password })
                            });

                            if (!response.ok) {
                                throw new Error(`Login failed with status ${response.status}`);
                            }

                            const data = await response.json();

                            resultDiv.className = 'result success';
                            resultDiv.innerHTML = `
                                <strong>✓ Login Successful!</strong>
                                <p style="font-size: 13px; margin-bottom: 10px;">User: <strong>${username}</strong></p>
                                <p>Your JWT token:</p>
                                <div class="token-box">${data.token}</div>
                                <button type="button" class="copy-btn" onclick="copyToken()">Copy Token</button>
                                <p style="margin-top: 10px; font-size: 12px;">Use this token in the Authorization header: <code>Bearer {token}</code></p>
                            `;
                            resultDiv.style.display = 'block';

                            window.jwtToken = data.token;
                        } catch (error) {
                            resultDiv.className = 'result error';
                            resultDiv.innerHTML = `<strong>✗ Login Failed</strong><p>${error.message}</p>`;
                            resultDiv.style.display = 'block';
                        }
                    });

                    function copyToken() {
                        const token = window.jwtToken;
                        navigator.clipboard.writeText(token).then(() => {
                            alert('Token copied to clipboard!');
                        });
                    }

                    // Disable quick buttons if not localhost
                    if (!isLocalhost) {
                        document.getElementById('demoBtn').disabled = true;
                        document.getElementById('thorBtn').disabled = true;
                        document.getElementById('demoBtn').style.opacity = '0.5';
                        document.getElementById('thorBtn').style.opacity = '0.5';
                    }
                </script>
            </body>
            </html>
            """;
    }
}
