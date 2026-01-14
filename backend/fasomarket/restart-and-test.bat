@echo off
echo Redemarrage de l'application FasoMarket...

REM Arreter l'application si elle tourne
taskkill /f /im java.exe 2>nul

REM Attendre un peu
timeout /t 3 /nobreak >nul

REM Redemarrer l'application
echo Demarrage de l'application...
start /b mvn spring-boot:run

REM Attendre que l'application demarre
echo Attente du demarrage (30 secondes)...
timeout /t 30 /nobreak >nul

REM Tester les endpoints admin
echo Test des endpoints admin...
curl -X GET "http://localhost:8081/api/admin/dashboard" -H "X-User-Id: 123e4567-e89b-12d3-a456-426614174000"
echo.
curl -X GET "http://localhost:8081/api/admin/utilisateurs" -H "X-User-Id: 123e4567-e89b-12d3-a456-426614174000"
echo.

echo Tests termines!
pause