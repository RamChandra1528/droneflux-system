@echo off
echo ====================================
echo Starting DroneFlux System...
echo ====================================
echo.

echo Checking environment file...
if not exist Backend\.env (
    echo Creating .env file from template...
    copy Backend\.env.example Backend\.env
    echo.
    echo IMPORTANT: Please edit Backend\.env with your configuration
    echo Press any key to continue after editing .env file...
    pause
)

echo 1. Starting Backend Server...
cd Backend
start "DroneFlux Backend" cmd /k "npm run dev"
timeout /t 5 >nul

echo 2. Creating Admin User...
node scripts/createAdminUser.js
cd ..

echo 3. Starting Frontend...
cd Frontend
start "DroneFlux Frontend" cmd /k "npm run dev"
cd ..

echo.
echo ====================================
echo DroneFlux System Started Successfully!
echo ====================================
echo.
echo Access URLs:
echo Frontend: http://localhost:8081
echo Backend API: http://localhost:5000
echo.
echo Default Admin Login:
echo Email: admin@droneflux.com
echo Password: admin123
echo.
echo Press any key to exit...
pause
echo Navigate to: http://localhost:8081/login
echo Select "Admin" tab and login
echo Then go to /users for user management
echo.
pause
