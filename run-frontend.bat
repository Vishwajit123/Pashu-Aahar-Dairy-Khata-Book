@echo off
setlocal enabledelayedexpansion
title Expense Tracker - React Frontend (Port 5173)
echo ========================================================
echo   Expense Tracker React Frontend (Vite)
echo   Access via: http://localhost:5173
echo ========================================================
echo.

cd /d "%~dp0frontend"

REM Ensure Node.js is in PATH
set "PATH=C:\Program Files\nodejs;%PATH%"

REM Check if Port 5173 is already held by a previous process
for /f "tokens=5" %%P in ('netstat -a -n -o ^| findstr /r ":5173 .*LISTENING"') do (
    if not "%%P"=="" (
        echo [INFO] Detected existing process on port 5173 [PID: %%P].
        echo Terminating previous process to ensure fresh startup...
        taskkill /F /PID %%P >nul 2>nul
        timeout /t 1 /nobreak >nul
    )
)

echo [INFO] Starting Vite development server on port 5173...
echo.

if exist "node_modules" (
    call npm run dev
) else (
    echo [INFO] Installing frontend dependencies...
    call npm install
    call npm run dev
)

if %ERRORLEVEL% neq 0 (
    echo.
    echo ========================================================
    echo [ERROR] Frontend server stopped unexpectedly.
    echo ========================================================
    pause
)
