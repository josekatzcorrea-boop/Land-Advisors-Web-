# Land Advisors Brain — setup rápido (Windows)
$ErrorActionPreference = "Stop"
$brain = $PSScriptRoot

Write-Host "Land Advisors Brain — setup" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path "$brain\.env.local")) {
  Copy-Item "$brain\.env.example" "$brain\.env.local"
  Write-Host "Creado .env.local — completa Supabase y OpenAI antes de usar IA/busqueda." -ForegroundColor Yellow
} else {
  Write-Host ".env.local ya existe." -ForegroundColor Green
}

Write-Host ""
Write-Host "PASOS OBLIGATORIOS:" -ForegroundColor White
Write-Host "1. Proyecto en https://supabase.com"
Write-Host "2. SQL Editor: ejecutar ../supabase/migrations/20260709180000_brain_schema.sql"
Write-Host "3. Editar brain/.env.local con URL, keys y OPENAI_API_KEY"
Write-Host "4. npm install && npm run dev en esta carpeta"
Write-Host "5. http://localhost:3000/login — Crear cuenta (primer usuario)"
Write-Host ""
Write-Host "Importar ~20 casos historicos: http://localhost:3000/importar"
Write-Host ""

Set-Location $brain
if (-not (Test-Path "node_modules")) {
  npm install
}

Write-Host "Iniciando servidor en http://localhost:3000 ..." -ForegroundColor Cyan
npm run dev
