# Abre el flujo de coexistencia (servidor local + navegador)
$root = Split-Path $PSScriptRoot -Parent
Set-Location $root

$port = 8787
$existing = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
if (-not $existing) {
  Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root'; node server.mjs"
  Start-Sleep -Seconds 2
}

$url = "http://localhost:$port/coexistencia"
Write-Host "Abriendo $url"
Start-Process $url

Write-Host ""
Write-Host "Si Meta bloquea el popup, agrega en Developers > Facebook Login > Ajustes:"
Write-Host "  URI valido de OAuth: $url"
Write-Host "  Dominios de la app: localhost"
Write-Host ""
Write-Host "En el popup: conectar cuenta EXISTENTE de WhatsApp Business (+56974533265)."
