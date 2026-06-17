# Exporta carrusel RRSS a PNG 1080x1350 (Chrome/Edge headless)
param(
  [string]$PostId = "2026-06-09-R1",
  [int]$Port = 8765,
  [int]$SlideCount = 0,
  [string]$IgPrefix = "",
  [ValidateSet("vertical", "square")]
  [string]$Format = "vertical"
)

$scriptDir = Split-Path $MyInvocation.MyCommand.Path -Parent
$rrssDir = Split-Path $scriptDir -Parent
$root = Split-Path $rrssDir -Parent
$outDir = Join-Path $rrssDir "output\$PostId"
$url = "http://127.0.0.1:$Port/rrss/posts/$PostId/index.html"
$mjs = Join-Path $scriptDir "export-carousel.mjs"

function Test-ServerUp {
  try {
    $r = Invoke-WebRequest -Uri $url -Method Head -UseBasicParsing -TimeoutSec 3
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
  $deadline = (Get-Date).AddSeconds(15)
  while ((Get-Date) -lt $deadline) {
    if (Test-ServerUp) { break }
    Start-Sleep -Milliseconds 400
  }
  if (-not (Test-ServerUp)) {
    Write-Error "No se pudo iniciar el servidor local en puerto $Port"
    exit 1
  }
}

$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) {
  $cursorNode = "${env:ProgramFiles}\cursor\resources\app\resources\helpers\node.exe"
  if (Test-Path $cursorNode) { $node = @{ Source = $cursorNode } }
}
if (-not $node) {
  Write-Error "Node.js no está instalado."
  exit 1
}

$env:POST_ID = $PostId
$env:SERVE_PORT = "$Port"
$env:CAROUSEL_URL = $url
$env:CAROUSEL_FORMAT = $Format

if ($SlideCount -le 0) {
  $jsonPath = Join-Path $rrssDir "posts\$PostId.json"
  if (Test-Path $jsonPath) {
    $postJson = Get-Content $jsonPath -Raw | ConvertFrom-Json
    $SlideCount = [int]$postJson.slides_count
  }
  if ($SlideCount -le 0) { $SlideCount = 7 }
}
$env:SLIDE_COUNT = "$SlideCount"

if (-not $IgPrefix) {
  if ($PostId -match "2026-06-09-R1|2026-06-17-R1") {
    $IgPrefix = "land-advisors-relanzamiento"
  } elseif ($PostId -match "2026-06-18-R1") {
    $IgPrefix = "land-advisors-identidad"
  } else {
    $IgPrefix = "land-advisors-$($PostId.ToLower())"
  }
}

Push-Location $scriptDir
try {
  & $node.Source export-carousel.mjs
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
} finally {
  Pop-Location
}

if (-not (Test-Path $outDir)) {
  Write-Error "No se generó la carpeta de salida."
  exit 1
}

Write-Host ""
Write-Host "Listo: $outDir"
Get-ChildItem $outDir -Filter "slide-*.png" | ForEach-Object {
  $kb = [math]::Round($_.Length / 1KB, 0)
  Write-Host "  $($_.Name) ($kb KB)"
}

$igDir = Join-Path $outDir "instagram"
New-Item -ItemType Directory -Force -Path $igDir | Out-Null
1..$SlideCount | ForEach-Object {
  $n = "{0:D2}" -f $_
  $src = Join-Path $outDir "slide-$n.png"
  if (Test-Path $src) {
    Copy-Item $src (Join-Path $igDir "$IgPrefix-$n.png") -Force
  }
}
Write-Host ""
Write-Host "Publicar desde: $igDir"
Write-Host "  $IgPrefix-01.png ... $($IgPrefix)-$('{0:D2}' -f $SlideCount).png (1080x1350, carrusel IG/FB)"

if ($startedServer) {
  Write-Host "Servidor local: http://127.0.0.1:$Port/"
}
