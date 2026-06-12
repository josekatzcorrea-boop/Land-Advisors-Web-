# Copia el video mas reciente a landing/images/territorio.mp4

$landing = Split-Path (Split-Path $MyInvocation.MyCommand.Path -Parent) -Parent

$imagesDir = Join-Path $landing "images"

$searchRoots = @(

  $imagesDir,

  (Join-Path $landing "video"),

  $landing,

  (Join-Path $landing "Im�genes"),

  (Join-Path $landing "Imagenes")

)



$ext = @(".mp4", ".webm", ".mov", ".m4v")

$videos = foreach ($dir in $searchRoots) {

  if (-not (Test-Path -LiteralPath $dir)) { continue }

  Get-ChildItem -LiteralPath $dir -Recurse -File -ErrorAction SilentlyContinue | Where-Object {

    $ext -contains $_.Extension.ToLower()

  }

}



$latest = $videos | Sort-Object LastWriteTime -Descending | Select-Object -First 1

if (-not $latest) {

  Write-Warning "No hay video en images/, Imagenes/ ni video/. Sube un .mp4 a landing/images/"

  exit 1

}



New-Item -ItemType Directory -Force -Path $imagesDir | Out-Null

$dest = Join-Path $imagesDir "territorio.mp4"

if ($latest.Extension -ieq ".mp4") {

  Copy-Item -LiteralPath $latest.FullName -Destination $dest -Force

} else {

  Write-Warning "Formato $($latest.Extension): copiando como territorio$($latest.Extension)"

  $dest = Join-Path $imagesDir ("territorio" + $latest.Extension.ToLower())

  Copy-Item -LiteralPath $latest.FullName -Destination $dest -Force

}



Write-Host "Video listo: $dest (desde $($latest.Name), $([math]::Round($latest.Length/1MB,1)) MB)"

