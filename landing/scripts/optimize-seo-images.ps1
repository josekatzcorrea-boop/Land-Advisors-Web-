# Comprime imágenes SEO (blog, casos, intel) — Fase A rendimiento
Add-Type -AssemblyName System.Drawing

function Optimize-InPlace {
  param(
    [string]$FilePath,
    [int]$MaxWidth,
    [int]$Quality = 80
  )
  if (-not (Test-Path $FilePath)) {
    Write-Warning "Missing: $FilePath"
    return
  }
  $img = [System.Drawing.Image]::FromFile($FilePath)
  $ext = [IO.Path]::GetExtension($FilePath).ToLower()
  try {
    $ratio = $MaxWidth / $img.Width
    if ($ratio -ge 1) { $newW = $img.Width; $newH = $img.Height }
    else { $newW = $MaxWidth; $newH = [int]($img.Height * $ratio) }

    $bmp = New-Object System.Drawing.Bitmap $newW, $newH
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.DrawImage($img, 0, 0, $newW, $newH)
    $g.Dispose()

    $tmp = Join-Path $env:TEMP ("la-opt-" + [Guid]::NewGuid().ToString() + $ext)
    if ($ext -eq ".png") {
      $bmp.Save($tmp, [System.Drawing.Imaging.ImageFormat]::Png)
    } else {
      $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
        Where-Object { $_.MimeType -eq "image/jpeg" }
      $enc = New-Object System.Drawing.Imaging.EncoderParameters 1
      $enc.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter (
        [System.Drawing.Imaging.Encoder]::Quality, [long]$Quality
      )
      $bmp.Save($tmp, $codec, $enc)
      $enc.Dispose()
    }
    $bmp.Dispose()
    $img.Dispose()
    $img = $null
    Remove-Item -LiteralPath $FilePath -Force -ErrorAction SilentlyContinue
    Move-Item -LiteralPath $tmp -Destination $FilePath -Force
    $kb = [math]::Round((Get-Item $FilePath).Length / 1KB, 1)
    Write-Host "OK $([IO.Path]::GetFileName($FilePath)) -> ${kb} KB (${newW}x${newH})"
  } finally {
    if ($img) { $img.Dispose() }
  }
}

$landing = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$imgDir = Join-Path $landing "images"

$jobs = @(
  @{ File = "blog-vocacion.jpg"; W = 1200 },
  @{ File = "blog-cambio-uso.jpg"; W = 1200 },
  @{ File = "blog-conectividad.jpg"; W = 1200 },
  @{ File = "blog-plusvalia.jpg"; W = 1200 },
  @{ File = "blog-prc.jpg"; W = 1200 },
  @{ File = "blog-habilitacion.jpeg"; W = 1200 },
  @{ File = "intel-territorial.jpg"; W = 1400 },
  @{ File = "malalcahuello.jpg"; W = 900 },
  @{ File = "caso-llanquihue.jpg"; W = 900 },
  @{ File = "caso-elegir.jpg"; W = 900 },
  @{ File = "caso-puerto-varas.jpg"; W = 900 },
  @{ File = "caso-frutillar.jpg"; W = 900 },
  @{ File = "caso-proyecto.jpg"; W = 900 },
  @{ File = "prc.jpg"; W = 900 },
  @{ File = "loteo.jpg"; W = 900 },
  @{ File = "galeria\galeria-04.jpg"; W = 900 }
)

foreach ($job in $jobs) {
  Optimize-InPlace -FilePath (Join-Path $imgDir $job.File) -MaxWidth $job.W
}

Write-Host "Done optimize-seo-images"
