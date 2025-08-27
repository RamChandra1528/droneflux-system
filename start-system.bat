@echo off
echo Starting DroneFlux System...
echo.

echo 1. Starting Backend Server...
cd Backend
start "Backend Server" cmd /k "npm start"
timeout /t 3 >nul

echo 2. Creating Admin User...
timeout /t 5 >nul
node scripts/createAdminUser.js

echo.
echo System started successfully!
echo.
echo Login Credentials:
echo Email: admin@droneflux.com
echo Password: admin123
echo.
echo Navigate to: http://localhost:8081/login
echo Select "Admin" tab and login
echo Then go to /users for user management
echo.
pause
