# Isotipo liviano para favicon y footer (128px PNG)
Add-Type -AssemblyName System.Drawing

$landing = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$assets = Join-Path $landing "assets"
$src = Join-Path $assets "logo-isotipo-3d-transparente.png"
if (-not (Test-Path $src)) {
  $src = Join-Path $assets "logo-isotipo-3d.png"
}
$dest = Join-Path $assets "logo-isotipo-sm.png"
$size = 128

$img = [System.Drawing.Image]::FromFile($src)
try {
  $bmp = New-Object System.Drawing.Bitmap $size, $size
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.Clear([System.Drawing.Color]::Transparent)
  $scale = [Math]::Min($size / $img.Width, $size / $img.Height)
  $w = [int]($img.Width * $scale)
  $h = [int]($img.Height * $scale)
  $x = [int](($size - $w) / 2)
  $y = [int](($size - $h) / 2)
  $g.DrawImage($img, $x, $y, $w, $h)
  $g.Dispose()
  $bmp.Save($dest, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
  $kb = [math]::Round((Get-Item $dest).Length / 1KB, 1)
  Write-Host "OK logo-isotipo-sm.png -> ${kb} KB"
} finally {
  $img.Dispose()
}
