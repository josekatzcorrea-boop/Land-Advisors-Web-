# Exporta cotización HTML → PDF (Chrome/Edge headless)
param(
  [string]$HtmlFile = "victoria-nitchel.html",
  [string]$OutPdf = "Cotizacion-Victoria-Nitchel.pdf"
)

$dir = Split-Path $MyInvocation.MyCommand.Path -Parent
$root = Split-Path $dir -Parent
$outPath = Join-Path $dir $OutPdf
$htmlPath = Join-Path $dir $HtmlFile
$port = 8765
$url = "http://127.0.0.1:$port/cotizaciones/$HtmlFile"

$chrome = @(
  "${env:ProgramFiles}\Google\Chrome\Application\chrome.exe",
  "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe"
) | Where-Object { Test-Path $_ } | Select-Object -First 1

if (-not $chrome) {
  $chrome = @(
    "${env:ProgramFiles}\Microsoft\Edge\Application\msedge.exe",
    "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe"
  ) | Where-Object { Test-Path $_ } | Select-Object -First 1
}

if (-not $chrome) {
  Write-Error "No se encontro Chrome ni Edge para exportar PDF."
  exit 1
}

function Test-ServerUp {
  try {
    $r = Invoke-WebRequest -Uri $url -Method Head -UseBasicParsing -TimeoutSec 2
    return $r.StatusCode -eq 200
  } catch {
    return $false
  }
}

$startedServer = $false
if (-not (Test-ServerUp)) {
  $serve = Join-Path $root "landing\serve.ps1"
  if (-not (Test-Path $serve)) {
    Write-Error "Servidor no activo. Ejecuta landing\serve.ps1 primero."
    exit 1
  }
  Start-Process powershell -ArgumentList "-ExecutionPolicy Bypass -File `"$serve`"" -WindowStyle Hidden
  $startedServer = $true
  $deadline = (Get-Date).AddSeconds(12)
  while ((Get-Date) -lt $deadline) {
    if (Test-ServerUp) { break }
    Start-Sleep -Milliseconds 400
  }
}

if (-not (Test-ServerUp)) {
  Write-Error "No se pudo acceder a $url"
  exit 1
}

if (Test-Path $outPath) { Remove-Item $outPath -Force }

& $chrome `
  --headless=new `
  --disable-gpu `
  --no-pdf-header-footer `
  --print-to-pdf="$outPath" `
  $url 2>&1 | Out-Null

Start-Sleep -Seconds 2

if (-not (Test-Path $outPath)) {
  Write-Error "No se genero el PDF."
  exit 1
}

$mb = [math]::Round((Get-Item $outPath).Length / 1MB, 2)
Write-Host "PDF listo: $outPath ($mb MB)"
if ($startedServer) { Write-Host "Servidor: http://127.0.0.1:$port/" }
