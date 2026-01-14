<?php

class ApiTester
{
    private $baseUrl = 'http://localhost:8000/api';
    private $token = null;

    public function test()
    {
        echo "🚀 Test API FasoMarket\n";
        
        $this->testPublicRoutes();
        $this->testAuthentication();
        
        if ($this->token) {
            $this->testBoutiques();
            $this->testProduits();
        }
    }

    private function testPublicRoutes()
    {
        $this->makeRequest('GET', '/boutiques-publiques', null, false);
        $this->makeRequest('GET', '/produits-publics', null, false);
    }

    private function testAuthentication()
    {
        $vendeurData = [
            'nom' => 'Test',
            'prenom' => 'User',
            'numero_ifu' => '123456789',
            'telephone' => '+22670000001',
            'email' => 'test@example.com'
        ];
        
        $this->makeRequest('POST', '/inscription-vendeur', $vendeurData, false);
        
        $loginData = [
            'nom' => 'Test',
            'prenom' => 'User',
            'telephone' => '+22670000001'
        ];
        
        $loginResponse = $this->makeRequest('POST', '/connexion', $loginData, false);
        
        if ($loginResponse && isset($loginResponse['token'])) {
            $this->token = $loginResponse['token'];
            $this->makeRequest('GET', '/profil');
        }
    }

    private function testBoutiques()
    {
        $boutiqueData = [
            'nom_boutique' => 'Test Shop',
            'description' => 'Test',
            'adresse' => 'Test Address',
            'ville' => 'Test City',
            'pays' => 'Test Country'
        ];
        
        $this->makeRequest('POST', '/boutiques', $boutiqueData);
        $this->makeRequest('GET', '/boutiques');
    }

    private function testProduits()
    {
        $produitData = [
            'boutique_id' => 1,
            'categorie_id' => 1,
            'nom' => 'Test Product',
            'description' => 'Test',
            'prix' => 1000,
            'quantite_stock' => 10
        ];
        
        $this->makeRequest('POST', '/produits', $produitData);
        $this->makeRequest('GET', '/produits');
    }

    private function makeRequest($method, $endpoint, $data = null, $useAuth = true)
    {
        $url = $this->baseUrl . $endpoint;
        $ch = curl_init();
        
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
        
        $headers = ['Content-Type: application/json'];
        
        if ($useAuth && $this->token) {
            $headers[] = 'Authorization: Bearer ' . $this->token;
        }
        
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        
        if ($data && in_array($method, ['POST', 'PUT', 'PATCH'])) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        }
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        $decodedResponse = json_decode($response, true);
        
        echo "$method $endpoint: " . ($httpCode >= 200 && $httpCode < 300 ? "✅" : "❌") . " $httpCode\n";
        
        return $decodedResponse;
    }
}

$tester = new ApiTester();
$tester->test();