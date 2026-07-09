# Perfecciona 1004.mp4: audio, color, escala IG, cierre Land Advisors
$ErrorActionPreference = "Stop"

$InputVideo = "C:\Users\josek\Desktop\LAND ADVISORS\PUBLICIDAD\Videos editados\1004.mp4"
$OutDir = "C:\Users\josek\Desktop\Land Advisors IA\Contexto\rrss\video\exports\1004"
$OutPublic = "C:\Users\josek\Desktop\LAND ADVISORS\PUBLICIDAD\Videos editados\1004-final.mp4"
$Root = Split-Path (Split-Path (Split-Path $PSScriptRoot -Parent) -Parent) -Parent
$VideoRoot = Join-Path $Root "rrss\video"
$BrandingPng = Join-Path $VideoRoot "assets\branding\png"

$OutroDur = 2.0
$XfadeDur = 0.45

New-Item -ItemType Directory -Force -Path $OutDir, $BrandingPng | Out-Null

function Get-Ffmpeg {
  $c = Get-Command ffmpeg -ErrorAction SilentlyContinue
  if (-not $c) { throw "ffmpeg no encontrado" }
  return $c.Source
}
function Get-Node {
  $n = Get-Command node -ErrorAction SilentlyContinue
  if ($n) { return $n.Source }
  $cursorNode = "${env:ProgramFiles}\cursor\resources\app\resources\helpers\node.exe"
  if (Test-Path $cursorNode) { return $cursorNode }
  throw "Node.js no encontrado"
}

$ffmpeg = Get-Ffmpeg
$ffprobe = (Get-Command ffprobe).Source
$node = Get-Node

$encArgs = @("-c:v", "h264_nvenc", "-preset", "p4", "-rc", "vbr", "-cq", "22", "-pix_fmt", "yuv420p")
try {
  & $ffmpeg -hide_banner -f lavfi -i nullsrc -frames:v 1 -c:v h264_nvenc -f null - 2>$null
} catch {
  $encArgs = @("-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p")
}

# Outro PNG
$serve = Join-Path $Root "landing\serve.ps1"
$port = 8765
$serverUp = $false
try {
  $r = Invoke-WebRequest -Uri "http://127.0.0.1:$port/" -Method Head -UseBasicParsing -TimeoutSec 3
  $serverUp = $true
} catch { }
if (-not $serverUp) {
  Start-Process powershell -ArgumentList "-ExecutionPolicy Bypass -File `"$serve`"" -WindowStyle Hidden
  Start-Sleep -Seconds 4
}
$mjs = Join-Path $VideoRoot "scripts\export-branding.mjs"
& $node $mjs outro
if ($LASTEXITCODE -ne 0) { throw "Falló export outro PNG" }

$outroMp4 = Join-Path $OutDir "outro.mp4"
$fadeOutroIn = 0.35
& $ffmpeg -y -hide_banner -loglevel error -loop 1 -i (Join-Path $BrandingPng "outro.png") `
  -f lavfi -i "anullsrc=channel_layout=stereo:sample_rate=48000" -t $OutroDur `
  -vf "scale=1080:1920,fade=t=in:st=0:d=$fadeOutroIn,fps=30" -shortest @encArgs `
  -c:a aac -b:a 192k -video_track_timescale 15360 $outroMp4

$mainProcessed = Join-Path $OutDir "main-processed.mp4"
$mainDur = [double](& $ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 $InputVideo)

# Video: escala IG + color LA + gradiente sutil bajo para legibilidad captions quemadas
# Audio: highpass + denoise + compresión + loudnorm -14 LUFS (estándar RRSS)
$vf = @(
  "scale=1080:1920:flags=lanczos"
  "eq=contrast=1.10:saturation=1.28:brightness=0.02"
  "unsharp=3:3:0.38"
  "drawbox=x=0:y=ih*0.72:w=iw:h=ih*0.28:color=black@0.18:t=fill"
  "fade=t=out:st=$([Math]::Max(0, $mainDur - 0.4)):d=0.4"
) -join ","

$af = @(
  "highpass=f=85"
  "afftdn=nf=-22:nt=w"
  "acompressor=threshold=-22dB:ratio=4:attack=8:release=140:makeup=2"
  "loudnorm=I=-14:TP=-1.5:LRA=11"
  "afade=t=out:st=$([Math]::Max(0, $mainDur - 0.5)):d=0.5"
) -join ","

Write-Host "=== Procesando video + audio ($mainDur s) ==="
& $ffmpeg -y -hide_banner -loglevel warning -i $InputVideo `
  -vf $vf -af $af @encArgs -r 30 -video_track_timescale 15360 -c:a aac -b:a 192k -ar 48000 -movflags +faststart $mainProcessed
if ($LASTEXITCODE -ne 0) { throw "Falló procesamiento principal" }

# Concat outro (fade ya aplicado al final del main)
$final = Join-Path $OutDir "1004-final.mp4"
$concatFilter = "[0:v][0:a][1:v][1:a]concat=n=2:v=1:a=1[v][a]"
& $ffmpeg -y -hide_banner -loglevel warning -i $mainProcessed -i $outroMp4 `
  -filter_complex $concatFilter -map "[v]" -map "[a]" @encArgs -c:a aac -b:a 192k -movflags +faststart $final
if ($LASTEXITCODE -ne 0) { throw "Falló concat con outro" }

Copy-Item -Force $final $OutPublic

# Portada
$cover = Join-Path $OutDir "1004-cover.jpg"
& $ffmpeg -y -hide_banner -loglevel error -ss 28 -i $mainProcessed -update 1 -vframes 1 -q:v 2 $cover

$finalDur = [double](& $ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 $final)
$mb = [math]::Round((Get-Item $final).Length / 1MB, 1)
Write-Host ""
Write-Host "Listo: $final ($finalDur s, $mb MB)"
Write-Host "Copia: $OutPublic"
Write-Host "Portada: $cover"
