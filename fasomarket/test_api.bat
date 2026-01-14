@echo off
set BASE_URL=http://localhost:8000/api

echo Test API FasoMarket
echo.

echo Routes publiques:
curl -s -X GET "%BASE_URL%/boutiques-publiques"
echo.
curl -s -X GET "%BASE_URL%/produits-publics"
echo.

echo Inscription:
curl -s -X POST "%BASE_URL%/inscription-vendeur" ^
  -H "Content-Type: application/json" ^
  -d "{\"nom\":\"Test\",\"prenom\":\"User\",\"numero_ifu\":\"123456789\",\"telephone\":\"+22670000001\",\"email\":\"test@example.com\"}"
echo.

echo Connexion:
curl -s -X POST "%BASE_URL%/connexion" ^
  -H "Content-Type: application/json" ^
  -d "{\"nom\":\"Test\",\"prenom\":\"User\",\"telephone\":\"+22670000001\"}"
echo.

pause