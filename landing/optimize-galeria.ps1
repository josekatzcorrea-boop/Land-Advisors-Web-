Add-Type -AssemblyName System.Drawing

function Optimize-GaleriaImage {
  param(
    [string]$SourcePath,
    [string]$DestPath,
    [int]$TargetW = 720,
    [int]$TargetH = 480,
    [int]$Quality = 84,
    [double]$Saturation = 1.0,
    [double]$Brightness = 1.0
  )

  $img = [System.Drawing.Image]::FromFile($SourcePath)
  try {
    $srcW = $img.Width
    $srcH = $img.Height
    $targetRatio = $TargetW / $TargetH
    $srcRatio = $srcW / $srcH

    if ($srcRatio -gt $targetRatio) {
      $cropH = $srcH
      $cropW = [int]($srcH * $targetRatio)
      $cropX = [int](($srcW - $cropW) / 2)
      $cropY = 0
    } else {
      $cropW = $srcW
      $cropH = [int]($srcW / $targetRatio)
      $cropX = 0
      $cropY = [int](($srcH - $cropH) / 2)
    }

    $bmp = New-Object System.Drawing.Bitmap $TargetW, $TargetH
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $dest = New-Object System.Drawing.Rectangle 0, 0, $TargetW, $TargetH
    $src = New-Object System.Drawing.Rectangle $cropX, $cropY, $cropW, $cropH
    $g.DrawImage($img, $dest, $src, [System.Drawing.GraphicsUnit]::Pixel)

    if ($Saturation -ne 1.0 -or $Brightness -ne 1.0) {
      $adjusted = New-Object System.Drawing.Bitmap $TargetW, $TargetH
      $g2 = [System.Drawing.Graphics]::FromImage($adjusted)
      $cm = New-Object System.Drawing.Imaging.ColorMatrix
      $s = $Saturation
      $lw = 0.3086; $ly = 0.586; $lb = 0.114
      $cm.Matrix00 = $lw * (1 - $s) + $s
      $cm.Matrix01 = $ly * (1 - $s)
      $cm.Matrix02 = $lb * (1 - $s)
      $cm.Matrix10 = $lw * (1 - $s)
      $cm.Matrix11 = $ly * (1 - $s) + $s
      $cm.Matrix12 = $lb * (1 - $s)
      $cm.Matrix20 = $lw * (1 - $s)
      $cm.Matrix21 = $ly * (1 - $s)
      $cm.Matrix22 = $lb * (1 - $s) + $s
      $cm.Matrix33 = 1
      $cm.Matrix40 = 0.001 * ($Brightness - 1) * 255
      $cm.Matrix41 = $cm.Matrix40
      $cm.Matrix42 = $cm.Matrix40
      $attrs = New-Object System.Drawing.Imaging.ImageAttributes
      $attrs.SetColorMatrix($cm)
      $full = New-Object System.Drawing.Rectangle 0, 0, $TargetW, $TargetH
      $g2.DrawImage($bmp, $full, 0, 0, $TargetW, $TargetH, [System.Drawing.GraphicsUnit]::Pixel, $attrs)
      $g2.Dispose(); $attrs.Dispose(); $bmp.Dispose()
      $bmp = $adjusted
    } else {
      $g.Dispose()
    }

    $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
      Where-Object { $_.MimeType -eq "image/jpeg" }
    $enc = New-Object System.Drawing.Imaging.EncoderParameters 1
    $enc.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter (
      [System.Drawing.Imaging.Encoder]::Quality, [long]$Quality
    )
    $bmp.Save($DestPath, $codec, $enc)
    $enc.Dispose(); $bmp.Dispose()
  } finally {
    $img.Dispose()
  }
}

$landing = Split-Path -Parent $MyInvocation.MyCommand.Path
$srcDir = Get-ChildItem $landing -Directory | Where-Object { $_.Name -ne "images" } | Select-Object -First 1
$outDir = Join-Path $landing "images\galeria"
$tempDir = Join-Path $outDir "_temp"
New-Item -ItemType Directory -Force -Path $tempDir | Out-Null
Get-ChildItem $outDir -File | Remove-Item -Force
if (Test-Path $tempDir) { Get-ChildItem $tempDir -File | Remove-Item -Force }

function Find-Src([scriptblock]$Filter) {
  Get-ChildItem $srcDir.FullName -File | Where-Object $Filter | Select-Object -First 1
}

$defs = @(
  @{ Find = { $_.Name -like "galeria 0*" };           Alt = "Vista a&eacute;rea del territorio y campos de la regi&oacute;n"; Sat = 0.92; Bri = 1.02 }
  @{ Find = { $_.Name -like "galeria 11*" };          Alt = "Terreno en desarrollo con vista al lago y volcanes" }
  @{ Find = { $_.Name -like "galeria 9*" };           Alt = "Caminos rurales y volc&aacute;n en la cuenca"; Sat = 0.95 }
  @{ Find = { $_.Name -like "galeria 8*" };           Alt = "Costa, lago y cordillera nevada"; Sat = 0.94 }
  @{ Find = { $_.Name -like "galeria 4*" };           Alt = "Exploraci&oacute;n en terreno con volc&aacute;n al fondo"; Sat = 0.94 }
  @{ Find = { $_.Name -like "galeria 5*" };           Alt = "Vida activa junto al lago y la ciudad"; Sat = 0.93 }
  @{ Find = { $_.Name -like "Galeria6*" -or $_.Name -like "galeria 6*" }; Alt = "Hotel y borde costero en la cuenca del lago"; Sat = 0.90 }
  @{ Find = { $_.Name -like "galeria 7*" };           Alt = "Arquitectura contempor&aacute;nea frente al lago"; Sat = 0.92 }
  @{ Find = { $_.Name -like "galeria235*" };          Alt = "Teatro del Lago en Frutillar"; Sat = 0.93 }
  @{ Find = { $_.Name -like "galeria123*" };          Alt = "Vista de Frutillar con el volc&aacute;n Osorno"; Sat = 0.94 }
  @{ Find = { $_.Name -like "galeria99*" };           Alt = "Puerto Varas, arquitectura y vida local"; Sat = 0.93 }
  @{ Find = { $_.BaseName -eq "galeria" };            Alt = "Hotel Frutillar y entorno del lago"; Sat = 0.92 }
  @{ Find = { $_.Name -like "galeria 10*" };          Alt = "Acceso a propiedad rural"; Sat = 0.93 }
  @{ Find = { $_.Name -like "galeria 3*" };           Alt = "Volc&aacute;n nevado en la cordillera"; Sat = 0.92 }
)

$items = [System.Collections.Generic.List[object]]::new()
$i = 0
foreach ($def in $defs) {
  $file = Find-Src $def.Find
  if (-not $file) { Write-Warning "Missing: $($def.Alt)"; continue }
  $tempPath = Join-Path $tempDir ("src-{0:D3}.jpg" -f $i)
  $sat = if ($def.Sat) { $def.Sat } else { 1.0 }
  $bri = if ($def.Bri) { $def.Bri } else { 1.0 }
  Optimize-GaleriaImage -SourcePath $file.FullName -DestPath $tempPath -Saturation $sat -Brightness $bri
  $items.Add([PSCustomObject]@{ Temp = $tempPath; Alt = $def.Alt; Source = $file.Name })
  $i++
}

$shuffled = $items | Sort-Object { Get-Random }
$idx = 1
$lines = [System.Collections.Generic.List[string]]::new()
foreach ($item in $shuffled) {
  $outName = "galeria-{0:D2}.jpg" -f $idx
  $outPath = Join-Path $outDir $outName
  Move-Item -LiteralPath $item.Temp -Destination $outPath -Force
  $lines.Add("              <figure><img src=`"images/galeria/$outName`" alt=`"$($item.Alt)`" width=`"720`" height=`"480`" loading=`"lazy`"></figure>")
  Write-Host "$outName <- $($item.Source)"
  $idx++
}

Remove-Item $tempDir -Force -Recurse -ErrorAction SilentlyContinue
$fragment = Join-Path $landing "galeria-carousel-fragment.html"
$lines -join "`n" | Set-Content -Path $fragment -Encoding UTF8
Write-Host "Total: $($shuffled.Count) images (random order). Fragment: $fragment"
