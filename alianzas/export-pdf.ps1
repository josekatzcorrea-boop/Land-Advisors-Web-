param(
  [ValidateSet("corredoras", "desarrolladores")]
  [string]$Tipo = "corredoras"
)

$dir = Split-Path $MyInvocation.MyCommand.Path -Parent
$root = Split-Path $dir -Parent

$html = if ($Tipo -eq "desarrolladores") { "desarrolladores.html" } else { "index.html" }
$outName = if ($Tipo -eq "desarrolladores") { "Alianzas-Desarrolladores.pdf" } else { "Alianzas-Corredoras.pdf" }

$outPdf = Join-Path $dir $outName
$port = 8765
$url = "http://127.0.0.1:$port/alianzas/$html"

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
  Write-Error "No se encontro Chrome ni Edge."
  exit 1
}

function Test-ServerUp {
  try {
    $r = Invoke-WebRequest -Uri $url -Method Head -UseBasicParsing -TimeoutSec 2
    return $r.StatusCode -eq 200
  } catch { return $false }
}

if (-not (Test-ServerUp)) {
  $serve = Join-Path $root "landing\serve.ps1"
  Start-Process powershell -ArgumentList "-ExecutionPolicy Bypass -File `"$serve`"" -WindowStyle Hidden
  $deadline = (Get-Date).AddSeconds(12)
  while ((Get-Date) -lt $deadline) {
    if (Test-ServerUp) { break }
    Start-Sleep -Milliseconds 400
  }
}

if (-not (Test-ServerUp)) {
  Write-Error "Servidor no disponible en $url"
  exit 1
}

if (Test-Path $outPdf) { Remove-Item $outPdf -Force }

& $chrome --headless=new --disable-gpu --no-pdf-header-footer --print-to-pdf="$outPdf" $url 2>&1 | Out-Null
Start-Sleep -Seconds 2

if (-not (Test-Path $outPdf)) {
  Write-Error "No se genero el PDF."
  exit 1
}

Write-Host "PDF listo: $outPdf"
