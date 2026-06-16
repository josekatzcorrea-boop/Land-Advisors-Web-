# Genera HTML autocontenido para compartir (vista móvil, sin huecos A4 del PDF)
Add-Type -AssemblyName System.Drawing

$corpDir = Split-Path $MyInvocation.MyCommand.Path -Parent
$brochureDir = Split-Path $corpDir -Parent
$root = Split-Path $brochureDir -Parent
$outFile = Join-Path $corpDir "Land-Advisors-Brochure-compartir.html"

function Get-ImageDataUri {
  param(
    [string]$SourcePath,
    [int]$MaxWidth = 1600,
    [int]$JpegQuality = 82
  )
  if (-not (Test-Path -LiteralPath $SourcePath)) {
    Write-Warning "Imagen no encontrada: $SourcePath"
    return $null
  }

  $ext = [IO.Path]::GetExtension($SourcePath).ToLower()
  if ($ext -eq ".avif" -or $ext -eq ".webp") {
    $bytes = [IO.File]::ReadAllBytes($SourcePath)
    $mime = if ($ext -eq ".avif") { "image/avif" } else { "image/webp" }
    return "data:$mime;base64,$([Convert]::ToBase64String($bytes))"
  }

  $img = [System.Drawing.Image]::FromFile($SourcePath)
  try {
    $ext = [IO.Path]::GetExtension($SourcePath).ToLower()
    $ratio = if ($img.Width -gt $MaxWidth) { $MaxWidth / $img.Width } else { 1 }
    $newW = [int]($img.Width * $ratio)
    $newH = [int]($img.Height * $ratio)

    $bmp = New-Object System.Drawing.Bitmap $newW, $newH
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.DrawImage($img, 0, 0, $newW, $newH)
    $g.Dispose()

    $ms = New-Object IO.MemoryStream
    if ($ext -eq ".png") {
      $bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
      $mime = "image/png"
    } else {
      $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
        Where-Object { $_.MimeType -eq "image/jpeg" }
      $enc = New-Object System.Drawing.Imaging.EncoderParameters 1
      $enc.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter (
        [System.Drawing.Imaging.Encoder]::Quality, [long]$JpegQuality
      )
      $bmp.Save($ms, $codec, $enc)
      $enc.Dispose()
      $mime = "image/jpeg"
    }
    $bmp.Dispose()
    $b64 = [Convert]::ToBase64String($ms.ToArray())
    $ms.Dispose()
    return "data:$mime;base64,$b64"
  } finally {
    $img.Dispose()
  }
}

function Resolve-BrochureImagePath {
  param([string]$Src)
  if ($Src -match '^\.\./\.\./assets/(.+)$') {
    return Join-Path $root ("assets\" + $Matches[1])
  }
  if ($Src -match '^\.\./assets/(.+)$') {
    $leaf = [System.Uri]::UnescapeDataString($Matches[1])
    return Join-Path $brochureDir ("assets\" + $leaf)
  }
  if ($Src -match '^\.\./images/(.+)$') {
    $leaf = [System.Uri]::UnescapeDataString($Matches[1])
    return Join-Path $brochureDir ("images\" + $leaf)
  }
  return $null
}

$htmlPath = Join-Path $corpDir "index.html"
$cssPath = Join-Path $corpDir "corporativo.css"
$rawHtml = Get-Content $htmlPath -Raw -Encoding UTF8
$css = Get-Content $cssPath -Raw -Encoding UTF8

$mainMatch = [regex]::Match($rawHtml, '(?s)<main class="brochure-pages">.*?</main>')
if (-not $mainMatch.Success) {
  Write-Error "No se encontró <main> en index.html"
  exit 1
}
$mainHtml = $mainMatch.Value

$maxWidths = @{
  "PAB_3486.jpg" = 1400
  "hero.jpg" = 1200
  "caso-frutillar.jpg" = 1200
  "galeria-04.jpg" = 1200
  "galeria-03.jpg" = 1200
  "buscar-terreno.jpg" = 1200
  "pryecto comercial.avif" = 1400
  "LOGO GRANDE JPG-02-3D.jpg" = 900
  "isotipo-3d-blanco-transparente.png" = 400
  "José Katz.png" = 400
}

$seen = @{}
foreach ($m in [regex]::Matches($mainHtml, 'src="([^"]+)"')) {
  $src = $m.Groups[1].Value
  if ($src.StartsWith("data:") -or $seen.ContainsKey($src)) { continue }
  $seen[$src] = $true
  $filePath = Resolve-BrochureImagePath -Src $src
  if (-not $filePath) { continue }
  $fileName = Split-Path $filePath -Leaf
  $maxW = if ($maxWidths.ContainsKey($fileName)) { $maxWidths[$fileName] } else { 1200 }
  $uri = Get-ImageDataUri -SourcePath $filePath -MaxWidth $maxW
  if ($uri) {
    $mainHtml = $mainHtml.Replace("src=`"$src`"", "src=`"$uri`"")
    Write-Host "OK $fileName"
  }
}

$css = $css -replace '(?s)/\* —— Impresión PDF vertical —— \*/\s*@media print \{.*$', ''

$standaloneCss = @'
/* Archivo para compartir: siempre vista móvil */
html[data-export="movil"] .brochure-toolbar {
  display: none !important;
}
html[data-export="movil"] .page,
html[data-export="movil"] .page-cover {
  min-height: 0 !important;
  height: auto !important;
  max-height: none !important;
}
html[data-export="movil"] .page-body,
html[data-export="movil"] .page-cover-panel {
  flex: 0 0 auto !important;
}
body.brochure-standalone {
  background: #1a2328;
}
body.brochure-standalone .brochure-pages {
  max-width: 430px;
  margin: 0 auto;
  box-shadow: 0 0 60px rgba(0, 0, 0, 0.45);
}
'@

$doc = @"
<!DOCTYPE html>
<html lang="es" data-export="movil">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Land Advisors Chile — Brochure</title>
  <meta name="description" content="Consultora de estrategia inmobiliaria en el sur de Chile. Te ayudamos a comprar el terreno correcto.">
  <meta name="theme-color" content="#052c4d">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
$css
$standaloneCss
  </style>
</head>
<body class="brochure-corp brochure-standalone">
$mainHtml
</body>
</html>
"@

[System.IO.File]::WriteAllText($outFile, $doc, [Text.UTF8Encoding]::new($false))
$mb = [math]::Round((Get-Item $outFile).Length / 1MB, 2)
Write-Host "Archivo listo: $outFile ($mb MB)"
Write-Host "Compartir por WhatsApp/correo · abrir en el navegador del celular"

$indexHtml = Join-Path $corpDir "index.html"
$htmlVer = (Get-Item $outFile).LastWriteTime.ToString("yyyyMMddHHmmss")
$indexRaw = [IO.File]::ReadAllText($indexHtml)
$indexUpdated = [regex]::Replace(
  $indexRaw,
  'href="Land-Advisors-Brochure-compartir\.html(\?v=[^"]*)?"',
  "href=`"Land-Advisors-Brochure-compartir.html?v=$htmlVer`""
)
if ($indexUpdated -ne $indexRaw) {
  [IO.File]::WriteAllText($indexHtml, $indexUpdated)
  Write-Host "Enlace HTML actualizado: ?v=$htmlVer"
}
