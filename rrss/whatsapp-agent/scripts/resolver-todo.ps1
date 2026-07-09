# Abre pestanas Meta para ultimo intento coexistencia +569
$appId = "1051202557331613"

Write-Host "Land Advisors - asistente Meta" -ForegroundColor Cyan
Write-Host "Paso 1: Login Meta y configura OAuth localhost"
Write-Host "Paso 2: Embedded Signup Builder - conectar cuenta existente"
Write-Host "Si falla: PLAN-B-CHIP-NUEVO.md"

Start-Process "https://developers.facebook.com/apps/$appId/fb-login/settings/"
Start-Sleep -Seconds 1
Start-Process "https://developers.facebook.com/apps/$appId/whatsapp-business/wa-embedded-signup/"
Start-Sleep -Seconds 1

$root = Split-Path $PSScriptRoot -Parent
$port = 8787
$existing = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
if (-not $existing) {
  $cmd = "cd `"$root`"; node server.mjs"
  Start-Process powershell -ArgumentList "-NoExit", "-Command", $cmd
  Start-Sleep -Seconds 2
}
Start-Process "http://localhost:$port/coexistencia"
