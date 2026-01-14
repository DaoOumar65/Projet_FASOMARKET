@echo off
setlocal enabledelayedexpansion
set BASE_URL=http://localhost:8000/api
set TOKEN=

echo ========================================
echo    FASOMARKET API - TEST COMPLET
echo ========================================
echo.

echo 1. TEST ROUTES PUBLIQUES
echo ========================
echo.

echo Boutiques publiques:
curl -s -w "Status: %%{http_code}\n" -X GET "%BASE_URL%/boutiques-publiques"
echo.

echo Produits publics:
curl -s -w "Status: %%{http_code}\n" -X GET "%BASE_URL%/produits-publics"
echo.

echo Categories:
curl -s -w "Status: %%{http_code}\n" -X GET "%BASE_URL%/categories"
echo.

echo 2. TEST AUTHENTIFICATION
echo =========================
echo.

echo Inscription client:
curl -s -w "Status: %%{http_code}\n" -X POST "%BASE_URL%/inscription-client" ^
  -H "Content-Type: application/json" ^
  -d "{\"nom\":\"TestClient\",\"prenom\":\"API\",\"telephone\":\"+22670999001\"}"
echo.

echo Connexion client:
curl -s -w "Status: %%{http_code}\n" -X POST "%BASE_URL%/connexion" ^
  -H "Content-Type: application/json" ^
  -d "{\"nom\":\"TestClient\",\"telephone\":\"+22670999001\"}"
echo.

echo Inscription vendeur:
curl -s -w "Status: %%{http_code}\n" -X POST "%BASE_URL%/inscription-vendeur" ^
  -H "Content-Type: application/json" ^
  -d "{\"nom\":\"TestVendeur\",\"prenom\":\"API\",\"numero_ifu\":\"999888777\",\"telephone\":\"+22670999002\",\"email\":\"test@api.com\"}"
echo.

echo Connexion vendeur:
for /f "tokens=*" %%i in ('curl -s -X POST "%BASE_URL%/connexion" -H "Content-Type: application/json" -d "{\"nom\":\"TestVendeur\",\"prenom\":\"API\",\"telephone\":\"+22670999002\"}"') do set RESPONSE=%%i
echo %RESPONSE%

REM Extraire le token (simplification - en production utiliser jq ou un parser JSON)
echo.
echo IMPORTANT: Copiez le token de la reponse ci-dessus et remplacez YOUR_TOKEN dans les tests suivants
echo.
pause

echo 3. TEST AVEC AUTHENTIFICATION
echo ===============================
echo.
set /p TOKEN="Entrez le token: "

echo Profil:
curl -s -w "Status: %%{http_code}\n" -X GET "%BASE_URL%/profil" ^
  -H "Authorization: Bearer %TOKEN%"
echo.

echo Boutiques:
curl -s -w "Status: %%{http_code}\n" -X GET "%BASE_URL%/boutiques" ^
  -H "Authorization: Bearer %TOKEN%"
echo.

echo Produits:
curl -s -w "Status: %%{http_code}\n" -X GET "%BASE_URL%/produits" ^
  -H "Authorization: Bearer %TOKEN%"
echo.

echo Commandes:
curl -s -w "Status: %%{http_code}\n" -X GET "%BASE_URL%/commandes" ^
  -H "Authorization: Bearer %TOKEN%"
echo.

echo 4. TEST DASHBOARD VENDEUR
echo ==========================
echo.

echo Stats vendeur:
curl -s -w "Status: %%{http_code}\n" -X GET "%BASE_URL%/vendor/stats" ^
  -H "Authorization: Bearer %TOKEN%"
echo.

echo Dashboard vendeur:
curl -s -w "Status: %%{http_code}\n" -X GET "%BASE_URL%/vendor/dashboard" ^
  -H "Authorization: Bearer %TOKEN%"
echo.

echo Commandes vendeur:
curl -s -w "Status: %%{http_code}\n" -X GET "%BASE_URL%/vendor/orders" ^
  -H "Authorization: Bearer %TOKEN%"
echo.

echo Clients vendeur:
curl -s -w "Status: %%{http_code}\n" -X GET "%BASE_URL%/vendor/clients" ^
  -H "Authorization: Bearer %TOKEN%"
echo.

echo 5. TEST CREATION DONNEES
echo =========================
echo.

echo Creation boutique:
curl -s -w "Status: %%{http_code}\n" -X POST "%BASE_URL%/boutiques" ^
  -H "Authorization: Bearer %TOKEN%" ^
  -H "Content-Type: application/json" ^
  -d "{\"nom_boutique\":\"Boutique Test API\",\"description\":\"Test\",\"adresse\":\"Ouaga\",\"ville\":\"Ouagadougou\",\"pays\":\"Burkina Faso\"}"
echo.

echo Creation produit:
curl -s -w "Status: %%{http_code}\n" -X POST "%BASE_URL%/produits" ^
  -H "Authorization: Bearer %TOKEN%" ^
  -H "Content-Type: application/json" ^
  -d "{\"boutique_id\":1,\"categorie_id\":1,\"nom\":\"Produit Test API\",\"description\":\"Test\",\"prix\":1000,\"quantite_stock\":10}"
echo.

echo ========================================
echo           TESTS TERMINES
echo ========================================
echo.
echo Codes de statut attendus:
echo - 200: Succes
echo - 201: Cree avec succes
echo - 401: Non authentifie
echo - 422: Erreur de validation
echo.
pause