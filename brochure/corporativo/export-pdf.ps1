# Genera brochure/corporativo/Land-Advisors-Corporativo.pdf (A4 apaisado)
$corpDir = Split-Path $MyInvocation.MyCommand.Path -Parent
$brochureDir = Split-Path $corpDir -Parent
$root = Split-Path $brochureDir -Parent
$outPdf = Join-Path $corpDir "Land-Advisors-Corporativo.pdf"
$port = 8765
$url = "http://127.0.0.1:$port/brochure/corporativo/index.html"

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
  Write-Error "No se encontró Chrome ni Edge para exportar PDF."
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
    Write-Error "Servidor no activo y no existe landing\serve.ps1"
    exit 1
  }
  Start-Process powershell -ArgumentList "-ExecutionPolicy Bypass -File `"$serve`"" -WindowStyle Hidden
  $startedServer = $true
  $deadline = (Get-Date).AddSeconds(12)
  while ((Get-Date) -lt $deadline) {
    if (Test-ServerUp) { break }
    Start-Sleep -Milliseconds 400
  }
  if (-not (Test-ServerUp)) {
    Write-Error "No se pudo iniciar el servidor local en puerto $port"
    exit 1
  }
}

if (Test-Path $outPdf) { Remove-Item $outPdf -Force }

& $chrome `
  --headless=new `
  --disable-gpu `
  --no-pdf-header-footer `
  --print-to-pdf="$outPdf" `
  $url 2>&1 | Out-Null

Start-Sleep -Seconds 3

if (-not (Test-Path $outPdf)) {
  Write-Error "No se generó el PDF. Abre corporativo/index.html y usa Exportar PDF."
  exit 1
}

$mb = [math]::Round((Get-Item $outPdf).Length / 1MB, 2)
Write-Host "PDF listo: $outPdf ($mb MB)"
Write-Host "Formato A4 apaisado · 10 páginas · brochure corporativo premium"

if ($startedServer) {
  Write-Host "Servidor: $url"
}
