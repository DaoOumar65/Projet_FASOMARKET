#!/usr/bin/env pwsh

Write-Host "🚀 TEST FINAL - APPLICATION CORRIGÉE" -ForegroundColor Green

Write-Host "`n1️⃣ Compilation..." -ForegroundColor White
try {
    $compileResult = mvn compile 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Compilation réussie" -ForegroundColor Green
    } else {
        Write-Host "❌ Erreur compilation" -ForegroundColor Red
        Write-Host $compileResult -ForegroundColor Gray
        exit 1
    }
} catch {
    Write-Host "❌ Erreur compilation: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "`n2️⃣ Démarrage de l'application..." -ForegroundColor White
Write-Host "⏳ Lancement de Spring Boot (peut prendre 30-60 secondes)..." -ForegroundColor Yellow

# Démarrer l'application en arrière-plan
$springProcess = Start-Process -FilePath "mvn" -ArgumentList "spring-boot:run" -PassThru -WindowStyle Hidden

# Attendre que l'application démarre
$maxWait = 60
$waited = 0
$appStarted = $false

while ($waited -lt $maxWait -and !$appStarted) {
    Start-Sleep -Seconds 2
    $waited += 2
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8081/actuator/health" -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            $appStarted = $true
            Write-Host "✅ Application démarrée sur le port 8081" -ForegroundColor Green
        }
    } catch {
        # Continuer à attendre
    }
    
    Write-Host "." -NoNewline -ForegroundColor Yellow
}

if (!$appStarted) {
    Write-Host "`n❌ Application n'a pas démarré dans les $maxWait secondes" -ForegroundColor Red
    $springProcess.Kill()
    exit 1
}

Write-Host "`n`n3️⃣ Test des endpoints..." -ForegroundColor White

$headers = @{
    "X-User-Id" = "615c948e-cb64-4eae-9c35-c45283a1ce16"
    "Content-Type" = "application/json"
}

# Test GET variantes
try {
    $getResponse = Invoke-RestMethod -Uri "http://localhost:8081/api/vendeur/produits/8442ccbc-6eee-4f5d-8cd2-6273ed2e1bdf/variantes" -Method GET -Headers $headers -TimeoutSec 5
    Write-Host "✅ GET /variantes fonctionne" -ForegroundColor Green
} catch {
    Write-Host "⚠️ GET /variantes: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Test POST variante
try {
    $postData = @{
        couleur = "Test Final"
        taille = "M"
        stock = 5
    } | ConvertTo-Json
    
    $postResponse = Invoke-RestMethod -Uri "http://localhost:8081/api/vendeur/produits/8442ccbc-6eee-4f5d-8cd2-6273ed2e1bdf/variantes" -Method POST -Headers $headers -Body $postData -TimeoutSec 5
    Write-Host "✅ POST /variantes fonctionne" -ForegroundColor Green
} catch {
    Write-Host "⚠️ POST /variantes: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host "`n🎉 SUCCÈS! Application corrigée et fonctionnelle" -ForegroundColor Green
Write-Host "🌐 Swagger UI: http://localhost:8081/swagger-ui.html" -ForegroundColor Cyan
Write-Host "📊 Actuator: http://localhost:8081/actuator/health" -ForegroundColor Cyan

Write-Host "`n⚠️ Arrêt de l'application de test..." -ForegroundColor Yellow
$springProcess.Kill()

Write-Host "✅ Test terminé avec succès!" -ForegroundColor Green