param(
  [string]$LogoPath = "C:\Users\josek\Desktop\Land Advisors IA\Contexto\assets\LOGO GRANDE JPG-02.jpg",
  [string]$Isotipo3D = "C:\Users\josek\Desktop\Land Advisors IA\Contexto\assets\isotipo 3D-v2.png",
  [string]$OutPath = "C:\Users\josek\Desktop\Land Advisors IA\Contexto\assets\LOGO GRANDE JPG-02-3D.jpg",
  [double]$LeftZoneRatio = 0.45
)

Add-Type -AssemblyName System.Drawing

function Is-White([int]$r, [int]$g, [int]$b) {
  return ($r -gt 245 -and $g -gt 245 -and $b -gt 245)
}

function Is-IsotipoBlue([int]$r, [int]$g, [int]$b) {
  if (Is-White $r $g $b) { return $false }
  $max = [Math]::Max($r, [Math]::Max($g, $b))
  $min = [Math]::Min($r, [Math]::Min($g, $b))
  $sat = if ($max -eq 0) { 0 } else { ($max - $min) / $max }
  return ($b -ge $r -and $b -ge $g -and $sat -gt 0.25 -and $max -lt 120)
}

$logo = [System.Drawing.Bitmap]::FromFile($LogoPath)
$w = $logo.Width; $h = $logo.Height

$maxScanX = [int]($w * $LeftZoneRatio)

$minX = $w; $maxX = 0; $minY = $h; $maxY = 0
for ($y = 0; $y -lt $h; $y++) {
  for ($x = 0; $x -lt $maxScanX; $x++) {
    $c = $logo.GetPixel($x, $y)
    if (Is-IsotipoBlue $c.R $c.G $c.B) {
      if ($x -lt $minX) { $minX = $x }
      if ($x -gt $maxX) { $maxX = $x }
      if ($y -lt $minY) { $minY = $y }
      if ($y -gt $maxY) { $maxY = $y }
    }
  }
}

if ($maxX -le $minX) {
  throw "No se detectó isotipo azul en $LogoPath"
}

$padX = [int](($maxX - $minX) * 0.08)
$padY = [int](($maxY - $minY) * 0.08)
$boxX = [Math]::Max(0, $minX - $padX)
$boxY = [Math]::Max(0, $minY - $padY)
$boxW = ($maxX - $minX + 1) + 2 * $padX
$boxH = ($maxY - $minY + 1) + 2 * $padY

Write-Host "Isotipo 2D bbox: x=$boxX y=$boxY w=$boxW h=$boxH"

# Limpiar zona del isotipo 2D (fondo blanco)
$white = [System.Drawing.Color]::FromArgb(255, 255, 255)
for ($y = $boxY; $y -lt ($boxY + $boxH); $y++) {
  for ($x = $boxX; $x -lt ($boxX + $boxW); $x++) {
    if ($x -ge 0 -and $x -lt $w -and $y -ge 0 -and $y -lt $h) {
      $logo.SetPixel($x, $y, $white)
    }
  }
}

# Pegar isotipo 3D escalado en la misma caja
$iso = [System.Drawing.Bitmap]::FromFile($Isotipo3D)
$g = [System.Drawing.Graphics]::FromImage($logo)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
$dest = New-Object System.Drawing.Rectangle $boxX, $boxY, $boxW, $boxH
$g.DrawImage($iso, $dest)
$g.Dispose()
$iso.Dispose()

# Guardar
$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$enc = New-Object System.Drawing.Imaging.EncoderParameters(1)
$enc.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality, 95L)
$logo.Save($OutPath, $codec, $enc)
$logo.Dispose()

Write-Host "Guardado: $OutPath"
