@echo off
echo === TEST DIAGNOSTIC CATEGORIES ===

echo.
echo Test de la route de diagnostic...
curl -X POST http://localhost:8000/api/test-categories ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer 5|pDY11gGE0cyh3eBYcgnVz52GyaA0xwhgX1hPWGQt0a67296d" ^
  -d "{\"nom\":\"Test Categorie\",\"description\":\"Description test\"}"

echo.
echo.
echo Test creation categorie reelle...
curl -X POST http://localhost:8000/api/categories ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer 5|pDY11gGE0cyh3eBYcgnVz52GyaA0xwhgX1hPWGQt0a67296d" ^
  -d "{\"nom\":\"Electronique\"}"

pause