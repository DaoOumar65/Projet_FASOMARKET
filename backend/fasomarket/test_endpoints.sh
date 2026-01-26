#!/bin/bash

# Script de test des endpoints backend FasoMarket
BASE_URL="http://localhost:8081"
ADMIN_ID="admin-uuid-here"

echo "🧪 Test des endpoints backend..."

# Test badges admin
echo "📊 Test /api/admin/badges"
curl -X GET "$BASE_URL/api/admin/badges" \
  -H "X-User-Id: $ADMIN_ID" \
  -H "Content-Type: application/json"

echo -e "\n"

# Test notifications admin
echo "🔔 Test /api/admin/notifications"
curl -X GET "$BASE_URL/api/admin/notifications" \
  -H "X-User-Id: $ADMIN_ID" \
  -H "Content-Type: application/json"

echo -e "\n"

# Test compteur notifications admin
echo "🔢 Test /api/admin/notifications/compteur"
curl -X GET "$BASE_URL/api/admin/notifications/compteur" \
  -H "X-User-Id: $ADMIN_ID" \
  -H "Content-Type: application/json"

echo -e "\n"

# Test validations
echo "✅ Test /api/admin/validations"
curl -X GET "$BASE_URL/api/admin/validations" \
  -H "X-User-Id: $ADMIN_ID" \
  -H "Content-Type: application/json"

echo -e "\n✅ Tests terminés"