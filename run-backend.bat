@echo off
setlocal enabledelayedexpansion
title Expense Tracker - Spring Boot Backend (Port 8080)
echo ========================================================
echo   Expense Tracker Backend Server (Spring Boot)
echo ========================================================
echo.

cd /d "%~dp0"

REM 1. Verify Java is installed
where java >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Java is not found in your system PATH!
    echo Please install Java 17 or Java 21 to run the backend.
    pause
    exit /b 1
)

REM 2. Check if Port 8080 is already held by a previous process
for /f "tokens=5" %%P in ('netstat -a -n -o ^| findstr /r ":8080 .*LISTENING"') do (
    if not "%%P"=="" (
        echo [INFO] Detected existing process on port 8080 [PID: %%P].
        echo Terminating previous process to ensure fresh startup...
        taskkill /F /PID %%P >nul 2>nul
        timeout /t 1 /nobreak >nul
    )
)

REM 3. Resolve Maven executable (wrapper, PATH, or IntelliJ bundled)
set "MVN_EXEC="

if exist "%~dp0backend\mvnw.cmd" (
    set "MVN_EXEC=%~dp0backend\mvnw.cmd"
) else if exist "%~dp0mvnw.cmd" (
    set "MVN_EXEC=%~dp0mvnw.cmd"
)

if not defined MVN_EXEC (
    where mvn >nul 2>nul
    if !ERRORLEVEL! equ 0 set "MVN_EXEC=mvn"
)

if not defined MVN_EXEC (
    if exist "C:\Program Files\JetBrains\IntelliJ IDEA 2026.2.1\plugins\maven-plugin\lib\maven3\bin\mvn.cmd" (
        set "MVN_EXEC=C:\Program Files\JetBrains\IntelliJ IDEA 2026.2.1\plugins\maven-plugin\lib\maven3\bin\mvn.cmd"
    )
)

if not defined MVN_EXEC set "MVN_EXEC=mvn"

echo [OK] Using Maven: "%MVN_EXEC%"
echo [INFO] Launching Spring Boot on http://localhost:8080 ...
echo.

cd /d "%~dp0backend"
call "%MVN_EXEC%" spring-boot:run

if %ERRORLEVEL% neq 0 (
    echo.
    echo ========================================================
    echo [ERROR] Spring Boot backend stopped unexpectedly.
    echo Check the error message above for details.
    echo ========================================================
    pause
)
