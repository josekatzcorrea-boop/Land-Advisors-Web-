# Recolorea iconos de historias destacadas a azul institucional #052C4D
param(
  [string]$AssetsDir = (Split-Path $MyInvocation.MyCommand.Path -Parent)
)

Add-Type -AssemblyName System.Drawing

$blueR = 5
$blueG = 44
$blueB = 77
$icons = @("asesoria.png", "servicios.png", "noticias.png", "clientes.png")

function Recolor-Icon {
  param([string]$Path)

  $src = [System.Drawing.Bitmap]::FromFile($Path)
  $w = $src.Width
  $h = $src.Height
  $dst = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

  for ($x = 0; $x -lt $w; $x++) {
    for ($y = 0; $y -lt $h; $y++) {
      $p = $src.GetPixel($x, $y)
      $lum = 0.299 * $p.R + 0.587 * $p.G + 0.114 * $p.B
      $a = [int]$p.A

      if ($a -lt 8 -or $lum -gt 245) {
        $dst.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
        continue
      }

      $darkness = [Math]::Max(0, [Math]::Min(1, (255 - $lum) / 255))
      $outA = [int][Math]::Round(255 * $darkness * ($a / 255), 0)
      if ($outA -lt 4) {
        $dst.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
      } else {
        $dst.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($outA, $blueR, $blueG, $blueB))
      }
    }
  }

  $src.Dispose()
  $dst.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
  $dst.Dispose()
}

foreach ($name in $icons) {
  $path = Join-Path $AssetsDir $name
  if (-not (Test-Path $path)) {
    Write-Error "No encontrado: $path"
    exit 1
  }
  Recolor-Icon -Path $path
  Write-Host "OK $name"
}

Write-Host "Iconos actualizados a #052C4D (fondo transparente)"
