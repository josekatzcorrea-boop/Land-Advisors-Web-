# Genera catalogo/Land-Advisors-Catalogo-movil.pdf (vista móvil 430px)
$catalogDir = Split-Path $MyInvocation.MyCommand.Path -Parent
$root = Split-Path $catalogDir -Parent
$outPdf = Join-Path $catalogDir "Land-Advisors-Catalogo-movil.pdf"
$port = 8765
$url = "http://127.0.0.1:$port/catalogo/index.html"
$mjs = Join-Path $catalogDir "export-pdf-movil.mjs"

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

$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) {
  $cursorNode = "${env:ProgramFiles}\cursor\resources\app\resources\helpers\node.exe"
  if (Test-Path $cursorNode) { $node = @{ Source = $cursorNode } }
}
if (-not $node) {
  Write-Error "Node.js no está instalado."
  exit 1
}

$env:PAGE_URL = $url
$env:OUT_PDF = $outPdf
$env:PDF_SCALE = "1.5"
$env:CDP_PORT = "9224"

Push-Location $catalogDir
try {
  & $node.Source export-pdf-movil.mjs
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
} finally {
  Pop-Location
}

if (-not (Test-Path $outPdf)) {
  Write-Error "No se generó el PDF móvil."
  exit 1
}

$mb = [math]::Round((Get-Item $outPdf).Length / 1MB, 2)
Write-Host "PDF móvil: $outPdf ($mb MB)"
Write-Host "Vista pantalla 430px · listo para compartir"

# Cache-bust: actualiza ?v= en index.html según mtime del PDF
$indexHtml = Join-Path $catalogDir "index.html"
$pdfVersion = (Get-Item $outPdf).LastWriteTime.ToString("yyyyMMddHHmmss")
$html = [IO.File]::ReadAllText($indexHtml)
$updated = [regex]::Replace(
  $html,
  'href="Land-Advisors-Catalogo-movil\.pdf(\?v=[^"]*)?"',
  "href=`"Land-Advisors-Catalogo-movil.pdf?v=$pdfVersion`""
)
if ($updated -ne $html) {
  [IO.File]::WriteAllText($indexHtml, $updated)
  Write-Host "Enlace PDF actualizado: ?v=$pdfVersion"
}

if ($startedServer) {
  Write-Host "Ver HTML: $url"
}
