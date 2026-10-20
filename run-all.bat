@echo off
title Launch Expense Tracker Full Stack
echo ========================================================
echo   Launching Expense Tracker Full Stack Web Application
echo ========================================================
echo.
echo 1. Starting Spring Boot Backend (Port 8080)...
start "Expense Tracker Backend (Port 8080)" cmd /k "%~dp0run-backend.bat"

REM Brief pause to let backend initialization commence
timeout /t 3 /nobreak >nul

echo.
echo 2. Starting React Vite Frontend (Port 5173)...
start "Expense Tracker Frontend (Port 5173)" cmd /k "%~dp0run-frontend.bat"

echo.
echo ========================================================
echo  Both services launched successfully!
echo.
echo  - Frontend: http://localhost:5173
echo  - Backend API: http://localhost:8080/api
echo.
echo  Keep both terminal windows open while using the app.
echo ========================================================
timeout /t 2 /nobreak >nul
start http://localhost:5173
