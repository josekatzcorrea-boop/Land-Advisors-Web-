# Optimizar fotos de galería (900px ancho, ~80% calidad JPEG)
$srcDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$maxW = 900
$quality = 82L
Add-Type -AssemblyName System.Drawing
$encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$encParam = New-Object System.Drawing.Imaging.EncoderParameters(1)
$encParam.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality, $quality)
Get-ChildItem "$srcDir\*.jpg" | Where-Object { $_.Name -notlike '*-opt.jpg' } | ForEach-Object {
  $img = [System.Drawing.Image]::FromFile($_.FullName)
  $nw = [Math]::Min($maxW, $img.Width)
  $nh = [int][Math]::Round($img.Height * ($nw / $img.Width))
  $bmp = New-Object System.Drawing.Bitmap $nw, $nh
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = 'HighQualityBicubic'
  $g.DrawImage($img, 0, 0, $nw, $nh)
  $out = Join-Path $srcDir ($_.BaseName + '-opt.jpg')
  $bmp.Save($out, $encoder, $encParam)
  $img.Dispose(); $bmp.Dispose(); $g.Dispose()
  Write-Host "OK $($_.BaseName)-opt.jpg"
}
