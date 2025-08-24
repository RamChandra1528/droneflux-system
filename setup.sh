#!/bin/bash

echo "Setting up DroneFlux System..."
echo

echo "Step 1: Creating environment files..."
cd Backend
if [ ! -f .env ]; then
    cp .env.example .env
    echo "Backend .env file created. Please edit with your MongoDB URI and secrets."
else
    echo "Backend .env file already exists."
fi

cd ../Frontend
if [ ! -f .env ]; then
    cp .env.example .env
    echo "Frontend .env file created."
else
    echo "Frontend .env file already exists."
fi

cd ..

echo
echo "Step 2: Installing Backend dependencies..."
cd Backend
npm install

echo
echo "Step 3: Installing Frontend dependencies..."
cd ../Frontend
npm install

echo
echo "Step 4: Setting up database (requires MongoDB running)..."
cd ../Backend
echo "Running database seeder..."
npm run seed

echo
echo "Setup complete!"
echo
echo "To start the application:"
echo "1. Start MongoDB service"
echo "2. Run 'npm run dev' in Backend folder"
echo "3. Run 'npm run dev' in Frontend folder"
echo
