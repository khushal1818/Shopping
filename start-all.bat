@echo off
echo ===================================================
echo Starting Vistora E-Commerce (Backend + Frontend)
echo ===================================================

echo [1/2] Starting Vistora Auth & API Backend on port 5000...
start "Vistora Backend (Port 5000)" cmd /k "cd /d %~dp0backend && node server.js"

timeout /t 2 /nobreak > nul

echo [2/2] Starting Vistora Frontend on port 5173...
start "Vistora Frontend (Port 5173)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo Both servers started!
echo Frontend: http://localhost:5173
echo Backend API: http://localhost:5000/api
echo ===================================================
