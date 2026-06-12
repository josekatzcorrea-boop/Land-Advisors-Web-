# Optimiza imágenes del brochure desde «Selección de fotografías» (+ respaldos landing)
Add-Type -AssemblyName System.Drawing

$photoLib = (Get-ChildItem "C:\Users\josek\Desktop" -Directory |
  Where-Object { $_.Name -like "Selecci* fotograf*" } |
  Select-Object -First 1).FullName

if (-not $photoLib) {
  throw "No se encontró la carpeta «Selección de fotografías» en el Escritorio."
}

Write-Host "Biblioteca: $photoLib"
$landingImg = Join-Path (Split-Path $MyInvocation.MyCommand.Path -Parent) "..\landing\images"
$out = Join-Path (Split-Path $MyInvocation.MyCommand.Path -Parent) "images"
New-Item -ItemType Directory -Force -Path $out | Out-Null

function Save-OptimizedJpeg {
  param(
    [string]$SourcePath,
    [string]$DestName,
    [int]$MaxWidth = 1200,
    [int]$Quality = 84
  )
  if (-not (Test-Path $SourcePath)) {
    Write-Warning "No encontrado: $SourcePath"
    return $false
  }
  $dest = Join-Path $out $DestName
  $img = [System.Drawing.Image]::FromFile($SourcePath)
  try {
    $ratio = if ($img.Width -gt $MaxWidth) { $MaxWidth / $img.Width } else { 1 }
    $newW = [int]($img.Width * $ratio)
    $newH = [int]($img.Height * $ratio)
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
    $bmp.Save($dest, $codec, $enc)
    $enc.Dispose()
    $bmp.Dispose()
    $kb = [math]::Round((Get-Item $dest).Length / 1KB, 1)
    Write-Host "OK $DestName <- $(Split-Path $SourcePath -Leaf) (${kb} KB, ${newW}x${newH})"
    return $true
  } finally {
    $img.Dispose()
  }
}

# Fuente principal: Selección de fotografías
$map = @(
  @{ Pat = "20241220_170216.jpg"; Dest = "cover.jpg";           W = 1200; Slide = "01 Portada" },
  @{ Pat = "20250823_104058.jpg"; Dest = "vida-familia.jpg";    W = 1200; Slide = "03 Primera/segunda vivienda" },
  @{ Pat = "DSC_2856.jpg";        Dest = "caminar-territorio.jpg"; W = 1200; Slide = "04 Caminar el lugar" },
  @{ Pat = "DJI_0127.jpg";        Dest = "buscar-terreno.jpg";  W = 1200; Slide = "Reserva / alternativa aérea" },
  @{ Pat = "20241102_144754.jpg"; Dest = "territorio.jpg";      W = 1200; Slide = "06 El sur que buscas" },
  @{ Pat = "20250405_114148.jpg"; Dest = "proyecto-terreno.jpg"; W = 1200; Slide = "08 Ya tienes terreno" },
  @{ Pat = "20241011_101220.jpg"; Dest = "camino-lago.jpg";     W = 1200; Slide = "07 Transparencia" }
)

foreach ($item in $map) {
  $src = Join-Path $photoLib $item.Pat
  if (Test-Path -LiteralPath $src) {
    Save-OptimizedJpeg -SourcePath $src -DestName $item.Dest -MaxWidth $item.W | Out-Null
  } else {
    Write-Warning "Falta en biblioteca: $($item.Pat) ($($item.Slide))"
  }
}

# Respaldos desde landing (fotos de casos actualizadas)
$landingFallbacks = @(
  @{ Src = "caso presupuesto.jpg"; Dest = "decidir.jpg"; W = 1200; Slide = "05 Decidir con presupuesto" },
  @{ Src = "caso-comercial.jpg";   Dest = "comercial.jpg"; W = 1200; Slide = "08 Proyecto comercial" }
)

foreach ($item in $landingFallbacks) {
  $src = Join-Path $landingImg $item.Src
  if (Test-Path $src) {
    Save-OptimizedJpeg -SourcePath $src -DestName $item.Dest -MaxWidth $item.W | Out-Null
  } else {
    Write-Warning "Falta en landing: $($item.Src) ($($item.Slide))"
  }
}

Write-Host "Imagenes listas en $out"
