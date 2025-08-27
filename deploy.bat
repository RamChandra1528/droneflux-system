@echo off
echo ====================================
echo DroneFlux Production Deployment
echo ====================================

echo.
echo Installing Vercel CLI...
npm install -g vercel

echo.
echo ====================================
echo Deploying Backend to Vercel...
echo ====================================
cd Backend
echo Current directory: %cd%
vercel --prod
cd ..

echo.
echo ====================================
echo Deploying Frontend to Vercel...
echo ====================================
cd Frontend
echo Current directory: %cd%
vercel --prod
cd ..

echo.
echo ====================================
echo Deployment Complete!
echo ====================================
echo.
echo Next steps:
echo 1. Set environment variables in Vercel dashboard
echo 2. Configure MongoDB Atlas connection
echo 3. Set up Google OAuth credentials
echo 4. Test your deployed applications
echo.
echo Check PRODUCTION-DEPLOYMENT.md for detailed instructions
echo ====================================

pause
