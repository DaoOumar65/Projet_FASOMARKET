@echo off
echo === DIAGNOSTIC FASOMARKET ===
echo.

echo 1. Test de la base de donnees...
php artisan migrate:status

echo.
echo 2. Test de connexion utilisateur...
curl -H "Authorization: Bearer 5|pDY11gGE0cyh3eBYcgnVz52GyaA0xwhgX1hPWGQt0a67296d" http://localhost:8000/api/profil

echo.
echo 3. Test des commandes vendeur (version simplifiee)...
curl -H "Authorization: Bearer 5|pDY11gGE0cyh3eBYcgnVz52GyaA0xwhgX1hPWGQt0a67296d" http://localhost:8000/api/commandes-vendeur

pause