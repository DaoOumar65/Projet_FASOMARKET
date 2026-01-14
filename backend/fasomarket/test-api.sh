# Tests des endpoints FasoMarket API
# Utiliser avec curl ou un client REST comme Postman

# Base URL
BASE_URL="http://localhost:8080/api/auth"

echo "🧪 Tests FasoMarket API"
echo "======================="

echo "📋 1. Test inscription client"
curl -X POST "$BASE_URL/inscription-client" \
  -H "Content-Type: application/json" \
  -d '{
    "nomComplet": "Jean Client",
    "telephone": "+22670111111",
    "email": "jean@client.com",
    "motDePasse": "password123"
  }'

echo -e "\n\n📋 2. Test inscription vendeur"
curl -X POST "$BASE_URL/inscription-vendeur" \
  -H "Content-Type: application/json" \
  -d '{
    "nomComplet": "Marie Vendeur",
    "telephone": "+22670222222",
    "email": "marie@vendeur.com",
    "motDePasse": "password123",
    "carteIdentite": "CI123456789"
  }'

echo -e "\n\n📋 3. Test connexion client"
curl -X POST "$BASE_URL/connexion" \
  -H "Content-Type: application/json" \
  -d '{
    "telephone": "+22670111111",
    "motDePasse": "password123"
  }'

echo -e "\n\n📋 4. Test connexion vendeur"
curl -X POST "$BASE_URL/connexion" \
  -H "Content-Type: application/json" \
  -d '{
    "telephone": "+22670222222",
    "motDePasse": "password123"
  }'

echo -e "\n\n✅ Tests terminés!"
echo "🌐 Swagger UI: http://localhost:8080/swagger-ui.html"