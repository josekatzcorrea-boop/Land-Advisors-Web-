Add-Type -AssemblyName System.Drawing

function Optimize-Image {
  param(
    [string]$SourcePath,
    [string]$DestPath,
    [int]$MaxWidth,
    [int]$Quality = 82,
    [switch]$RotateCCW
  )

  $img = [System.Drawing.Image]::FromFile($SourcePath)
  try {
    if ($RotateCCW) {
      $img.RotateFlip([System.Drawing.RotateFlipType]::Rotate270FlipNone)
    }
    $ratio = $MaxWidth / $img.Width
    if ($ratio -ge 1) { $newW = $img.Width; $newH = $img.Height }
    else { $newW = $MaxWidth; $newH = [int]($img.Height * $ratio) }

    $bmp = New-Object System.Drawing.Bitmap $newW, $newH
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.DrawImage($img, 0, 0, $newW, $newH)
    $g.Dispose()

    $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
      Where-Object { $_.MimeType -eq "image/jpeg" }
    $enc = New-Object System.Drawing.Imaging.EncoderParameters 1
    $enc.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter (
      [System.Drawing.Imaging.Encoder]::Quality, [long]$Quality
    )
    $bmp.Save($DestPath, $codec, $enc)
    $enc.Dispose()
    $bmp.Dispose()

    $kb = [math]::Round((Get-Item $DestPath).Length / 1KB, 1)
    Write-Host "OK $([IO.Path]::GetFileName($DestPath)) -> ${kb} KB (${newW}x${newH})"
  } finally {
    $img.Dispose()
  }
}

$landing = Split-Path -Parent $MyInvocation.MyCommand.Path
$srcDir = Get-ChildItem $landing -Directory | Where-Object { $_.Name -ne "images" } | Select-Object -First 1
$outDir = Join-Path $landing "images"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$jobs = @(
  @{ Pat = "HERO*";              Out = "hero.jpg";              W = 1600 },
  @{ Pat = "Jos*";               Out = "jose-katz.jpg";         W = 640 },
  @{ Pat = "Puerto varas*";       Out = "caso-puerto-varas.jpg"; W = 900 },
  @{ Pat = "Frutillar*";         Out = "caso-frutillar.jpg";    W = 900; RotateCCW = $true },
  @{ Pat = "Llanquihue*";        Out = "caso-llanquihue.jpg";   W = 900 },
  @{ Pat = "Como pensamos*";     Out = "como-pensamos.jpg";     W = 1400 },
  @{ Pat = "Cuenca*";            Out = "cuenca-llanquihue.jpg"; W = 560 },
  @{ Pat = "territorios*";        Out = "exploracion-terreno.jpg"; W = 1400 },
  @{ Pat = "Malalcahuello*";      Out = "malalcahuello.jpg";     W = 560 },
  @{ Pat = "caso presupuesto*"; Out = "caso-presupuesto.jpg"; W = 800 },
  @{ Pat = "caso comercial*";   Out = "caso-comercial.jpg";   W = 800 }
)

# AVIF (casos reales): copiar «buen terreno» ya optimizado
$buenTerreno = Get-ChildItem $outDir -File | Where-Object { $_.Name -like "buen terreno*" } | Select-Object -First 1
if ($buenTerreno) {
  Copy-Item -LiteralPath $buenTerreno.FullName -Destination (Join-Path $outDir "caso-buen-terreno.avif") -Force
  Write-Host "OK caso-buen-terreno.avif (AVIF)"
}

# Casos reales: fuentes suelen estar en images/ (no en carpeta raíz de assets)
$localCaseJobs = @(
  @{ Pat = "caso presupuesto*"; Out = "caso-presupuesto.jpg"; W = 800 },
  @{ Pat = "caso comercial*";   Out = "caso-comercial.jpg";   W = 800 }
)
foreach ($job in $localCaseJobs) {
  $file = Get-ChildItem $outDir -File |
    Where-Object { $_.Name -like $job.Pat -and $_.Name -ne $job.Out } |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 1
  if ($file) {
    Optimize-Image -SourcePath $file.FullName -DestPath (Join-Path $outDir $job.Out) -MaxWidth $job.W
  }
}

foreach ($job in $jobs) {
  $file = Get-ChildItem $srcDir.FullName -File | Where-Object { $_.Name -like $job.Pat } | Select-Object -First 1
  if (-not $file) { Write-Warning "Missing: $($job.Pat)"; continue }
  $params = @{
    SourcePath = $file.FullName
    DestPath   = (Join-Path $outDir $job.Out)
    MaxWidth   = $job.W
  }
  if ($job.RotateCCW) { $params.RotateCCW = $true }
  Optimize-Image @params
}
