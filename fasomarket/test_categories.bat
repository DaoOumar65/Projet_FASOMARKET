@echo off
echo Test de creation de categories...

REM Creer un admin
echo Creation d'un utilisateur admin...
php create_admin.php

echo.
echo Test avec le token admin...
curl -X POST http://localhost:8000/api/categories ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer REMPLACER_PAR_LE_TOKEN_ADMIN" ^
  -d "{\"nom\":\"Test Categorie\",\"description\":\"Categorie de test\"}"

pause