@echo off
echo === ANALYSE PRECISE DE L'ERREUR 500 ===

set BASE_URL=http://localhost:8081
set PRODUCT_ID=8442ccbc-6eee-4f5d-8cd2-6273ed2e1bdf
set VENDOR_ID=12345678-1234-1234-1234-123456789012

echo.
echo 1. Test endpoint public (doit fonctionner):
curl -s -w "Status: %%{http_code}\n" "%BASE_URL%/api/produits/%PRODUCT_ID%"

echo.
echo.
echo 2. Test endpoint vendeur (erreur 500):
curl -s -w "Status: %%{http_code}\n" -H "X-User-Id: %VENDOR_ID%" "%BASE_URL%/api/vendeur/produits/%PRODUCT_ID%"

echo.
echo.
echo 3. Test avec un produit existant:
curl -s "%BASE_URL%/api/produits/actifs" | findstr "id" | head -1
for /f "tokens=2 delims=:" %%a in ('curl -s "%BASE_URL%/api/produits/actifs" ^| findstr "id" ^| head -1') do (
    set EXISTING_ID=%%a
    set EXISTING_ID=!EXISTING_ID:"=!
    set EXISTING_ID=!EXISTING_ID:,=!
    echo Produit existant: !EXISTING_ID!
    curl -s -w "Status: %%{http_code}\n" -H "X-User-Id: %VENDOR_ID%" "%BASE_URL%/api/vendeur/produits/!EXISTING_ID!"
)

pause