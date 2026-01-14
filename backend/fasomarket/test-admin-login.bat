@echo off
echo Testing admin login...

curl -X POST http://localhost:8081/api/auth/connexion ^
  -H "Content-Type: application/json" ^
  -d "{\"telephone\":\"+22670000000\",\"motDePasse\":\"admin123\"}"

echo.
echo.
pause