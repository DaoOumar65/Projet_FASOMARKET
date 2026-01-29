@echo off
echo ========================================
echo TEST DES NOUVEAUX ENDPOINTS BACKEND
echo ========================================

echo.
echo 1. Test modification produit avec images et statut
curl -X PUT "http://localhost:8080/api/vendeur/produits/PRODUIT_ID_HERE" ^
  -H "Content-Type: application/json" ^
  -H "X-User-Id: VENDOR_USER_ID_HERE" ^
  -d "{\"nom\":\"Produit Modifié\",\"prix\":25000,\"status\":\"ACTIVE\",\"imagesList\":[\"uploads/produits/image1.jpg\",\"uploads/produits/image2.jpg\"]}"

echo.
echo 2. Test création variante
curl -X POST "http://localhost:8080/api/vendeur/produits/PRODUIT_ID_HERE/variantes" ^
  -H "Content-Type: application/json" ^
  -H "X-User-Id: VENDOR_USER_ID_HERE" ^
  -d "{\"couleur\":\"Rouge\",\"taille\":\"M\",\"stock\":10,\"prixAjustement\":0}"

echo.
echo 3. Test liste variantes
curl -X GET "http://localhost:8080/api/vendeur/produits/PRODUIT_ID_HERE/variantes" ^
  -H "X-User-Id: VENDOR_USER_ID_HERE"

echo.
echo 4. Test modification variante
curl -X PUT "http://localhost:8080/api/vendeur/produits/PRODUIT_ID_HERE/variantes/VARIANTE_ID_HERE" ^
  -H "Content-Type: application/json" ^
  -H "X-User-Id: VENDOR_USER_ID_HERE" ^
  -d "{\"couleur\":\"Bleu\",\"taille\":\"L\",\"stock\":15}"

echo.
echo 5. Test suppression variante
curl -X DELETE "http://localhost:8080/api/vendeur/produits/PRODUIT_ID_HERE/variantes/VARIANTE_ID_HERE" ^
  -H "X-User-Id: VENDOR_USER_ID_HERE"

echo.
echo ========================================
echo TESTS TERMINÉS
echo ========================================
echo.
echo INSTRUCTIONS:
echo 1. Remplacez PRODUIT_ID_HERE par un ID de produit existant
echo 2. Remplacez VENDOR_USER_ID_HERE par l'ID du vendeur propriétaire
echo 3. Remplacez VARIANTE_ID_HERE par l'ID d'une variante existante
echo 4. Assurez-vous que le backend est démarré sur le port 8080
echo.
pause