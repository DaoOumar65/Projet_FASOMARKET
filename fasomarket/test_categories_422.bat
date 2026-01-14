@echo off
echo Test creation categorie avec donnees valides...

echo.
echo 1. Test avec token admin (si disponible)...
curl -X POST http://localhost:8000/api/categories ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer 5|pDY11gGE0cyh3eBYcgnVz52GyaA0xwhgX1hPWGQt0a67296d" ^
  -d "{\"nom\":\"Electronique\",\"description\":\"Produits electroniques\"}"

echo.
echo 2. Test avec donnees minimales...
curl -X POST http://localhost:8000/api/categories ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer 5|pDY11gGE0cyh3eBYcgnVz52GyaA0xwhgX1hPWGQt0a67296d" ^
  -d "{\"nom\":\"Test\"}"

echo.
echo 3. Verification du profil utilisateur...
curl -H "Authorization: Bearer 5|pDY11gGE0cyh3eBYcgnVz52GyaA0xwhgX1hPWGQt0a67296d" ^
  http://localhost:8000/api/profil

pause