@echo off
echo 🚁 DroneFlux - Complete E-Commerce Drone Delivery System
echo ======================================================
echo.

echo 📦 Installing Backend Dependencies...
cd Backend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)

echo.
echo 📦 Installing Frontend Dependencies...
cd ..\Frontend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install frontend dependencies
    pause
    exit /b 1
)

echo.
echo ✅ Dependencies installed successfully!
echo.
echo 🚀 Next Steps:
echo 1. Make sure MongoDB is running
echo 2. Copy .env.example to .env in both Backend and Frontend folders
echo 3. Configure your environment variables
echo 4. Start the backend: cd Backend && npm run dev
echo 5. Start the frontend: cd Frontend && npm run dev
echo.
echo 🌐 Access your application at:
echo    Frontend: http://localhost:5173
echo    Backend:  http://localhost:5000
echo.
echo 📚 For detailed setup instructions, see README.md
echo.
pause
