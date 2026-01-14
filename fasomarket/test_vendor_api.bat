@echo off
set BASE_URL=http://localhost:8000/api
set TOKEN=YOUR_TOKEN_HERE

echo Test API Vendor FasoMarket
echo.

echo Dashboard:
curl -s -X GET "%BASE_URL%/vendor/dashboard" ^
  -H "Authorization: Bearer %TOKEN%"
echo.

echo Commandes:
curl -s -X GET "%BASE_URL%/vendor/orders" ^
  -H "Authorization: Bearer %TOKEN%"
echo.

echo Clients:
curl -s -X GET "%BASE_URL%/vendor/clients" ^
  -H "Authorization: Bearer %TOKEN%"
echo.

pause