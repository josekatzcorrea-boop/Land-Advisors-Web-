# build-reel-001-branded.ps1 — Reel v2: branding, subtítulos, color grade, música aventurera
$ErrorActionPreference = "Stop"

$Root = Split-Path (Split-Path (Split-Path $PSScriptRoot -Parent) -Parent) -Parent
$VideoRoot = Join-Path $Root "rrss\video"
$Project = Join-Path $VideoRoot "inbox\REEL-001-terreno-optimo"
$Exports = Join-Path $VideoRoot "exports\REEL-001-terreno-optimo"
$ProcDir = Join-Path $Exports "processed"
$BrandingPng = Join-Path $VideoRoot "assets\branding\png"
$FontsDir = Join-Path $VideoRoot "assets\fonts"
$MusicDir = Join-Path $VideoRoot "assets\music"

$InputVideo = Join-Path $Project "drone\4k.mp4"
$VoScript = Join-Path $VideoRoot "briefs\REEL-001-vo-script.txt"
$VoAudio = Join-Path $Project "audio\vo-es-cl.mp3"
$VoVtt = Join-Path $Project "audio\vo-es-cl.vtt"
$VoAss = Join-Path $Project "audio\vo-es-cl.ass"
$MusicRaw = Join-Path $MusicDir "adventure-cinematic-raw.mp3"
$MusicFile = Join-Path $MusicDir "mezerg-style-electronic.mp3"
$MusicUrl = "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3"
$OutputFinal = Join-Path $Exports "REEL-001-final.mp4"
$OutputCover = Join-Path $VideoRoot "covers\REEL-001-cover.jpg"

$IntroDur = 2.5
$OutroDur = 2.0
$TailAfterVo = 2.0   # cola de dron tras la VO (antes del outro)
# VO empieza justo al terminar la intro (+ leve respiro)
$VoDelay = 0.15
$SubOffset = $IntroDur + $VoDelay
$VoVoice = "es-CL-LorenzoNeural"
$VoRate = "+8%"
$VoPitch = "+3Hz"

# Filtro color + zoom sutil (más dinámico)
$ColorFilter = "eq=contrast=1.12:saturation=1.42:brightness=0.03,unsharp=3:3:0.4"

foreach ($d in @($Exports, $ProcDir, $BrandingPng, $FontsDir, (Join-Path $Project "audio"), (Join-Path $Project "drone\clips"))) {
    New-Item -ItemType Directory -Force -Path $d | Out-Null
}

function Get-Ffmpeg {
    $c = Get-Command ffmpeg -ErrorAction SilentlyContinue
    if (-not $c) { Write-Error "ffmpeg no encontrado" }
    return $c.Source
}
function Get-Node {
    $n = Get-Command node -ErrorAction SilentlyContinue
    if ($n) { return $n.Source }
    $cursorNode = "${env:ProgramFiles}\cursor\resources\app\resources\helpers\node.exe"
    if (Test-Path $cursorNode) { return $cursorNode }
    Write-Error "Node.js no encontrado"
}

$ffmpeg = Get-Ffmpeg
$ffprobe = (Get-Command ffprobe).Source
$node = Get-Node

# Montserrat para libass (Regular = captions brand book)
$fontSemi = Join-Path $FontsDir "Montserrat-SemiBold.ttf"
$fontReg = Join-Path $FontsDir "Montserrat-Regular.ttf"
if (-not (Test-Path $fontReg) -or (Get-Item $fontReg).Length -lt 200000) {
    Write-Host "=== Descargando Montserrat ==="
    curl.exe -sL -o $fontReg "https://github.com/JulietaUla/Montserrat/raw/master/fonts/ttf/Montserrat-Regular.ttf"
}
if (-not (Test-Path $fontSemi) -or (Get-Item $fontSemi).Length -lt 200000) {
    curl.exe -sL -o $fontSemi "https://github.com/JulietaUla/Montserrat/raw/master/fonts/ttf/Montserrat-SemiBold.ttf"
}
$pipPrev = $ErrorActionPreference
$ErrorActionPreference = "Continue"
& python -m pip install fonttools pillow numpy scipy --quiet 2>$null
$ErrorActionPreference = $pipPrev
Write-Host "=== Verificando fuentes subtítulos (Montserrat) ==="
& python (Join-Path $VideoRoot "scripts\verify-font-lib.py") $fontReg
& python (Join-Path $VideoRoot "scripts\verify-font-lib.py") $fontSemi

# Música — base libre + procesado estilo Mezerg (electro-funk, pulso, tempo↑)
if (-not (Test-Path $MusicRaw) -or (Get-Item $MusicRaw).Length -lt 100000) {
    Write-Host "=== Descargando base musical ==="
    Invoke-WebRequest -Uri $MusicUrl -OutFile $MusicRaw -UseBasicParsing
}
Write-Host "=== Música estilo Mezerg (electro-funk, pulso, tempo) ==="
# Procesado agresivo: bass↑, sidechain pulse, tempo↑ — base ya descargada localmente
& $ffmpeg -y -hide_banner -loglevel error -ss 18 -i $MusicRaw -t 75 `
    -af "highpass=f=90,equalizer=f=80:width_type=o:width=2:g=9,equalizer=f=2200:width_type=o:width=2:g=5,acompressor=threshold=-20dB:ratio=5:attack=5:release=100,apulsator=mode=square:amount=0.42:hz=2.0,atempo=1.12,alimiter=limit=0.94" `
    -c:a libmp3lame -b:a 192k $MusicFile
if ($LASTEXITCODE -ne 0) { Write-Error "Falló procesado musical" }

# Clips dron
$clipCount = (Get-ChildItem (Join-Path $Project "drone\clips") -Filter *.mp4 -ErrorAction SilentlyContinue).Count
if ($clipCount -lt 3) {
    Write-Host "=== Dividiendo dron ==="
    & (Join-Path $VideoRoot "scripts\split-drone-clips.ps1") -InputVideo $InputVideo -ClipSeconds 10
}

# VO + subtítulos VTT
Write-Host "=== Voz en off + VTT ==="
& python -m pip install edge-tts --quiet
$voText = Get-Content $VoScript -Raw -Encoding UTF8
& python -m edge_tts --voice $VoVoice --rate=$VoRate --pitch=$VoPitch --text $voText --write-media $VoAudio --write-subtitles $VoVtt

& python (Join-Path $VideoRoot "scripts\vtt-to-ass.py") $VoVtt $VoAss $SubOffset
if ($LASTEXITCODE -ne 0) { Write-Error "Falló conversión VTT → ASS" }

$voDur = [double](& $ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 $VoAudio)
$targetTotal = $SubOffset + $voDur + $TailAfterVo + $OutroDur
Write-Host "=== Timeline: VO ${voDur}s → total ${targetTotal}s (cola ${TailAfterVo}s + outro ${OutroDur}s) ==="

# Branding PNG (Chrome headless) — isotipo igual que carruseles RRSS
Write-Host "=== Export branding intro/outro ==="
$serve = Join-Path $Root "landing\serve.ps1"
$port = 8765
$serverUp = $false
try {
    $r = Invoke-WebRequest -Uri "http://127.0.0.1:$port/" -Method Head -UseBasicParsing -TimeoutSec 2
    $serverUp = $true
} catch { }
if (-not $serverUp) {
    Start-Process powershell -ArgumentList "-ExecutionPolicy Bypass -File `"$serve`"" -WindowStyle Hidden
    Start-Sleep -Seconds 3
}
$mjs = Join-Path $VideoRoot "scripts\export-branding.mjs"
& $node $mjs intro
& $node $mjs outro

# Intro / outro video
$introMp4 = Join-Path $Exports "intro.mp4"
$outroMp4 = Join-Path $Exports "outro.mp4"
$encArgs = @("-c:v", "h264_nvenc", "-preset", "p1", "-pix_fmt", "yuv420p")
try { & $ffmpeg -hide_banner -f lavfi -i nullsrc -frames:v 1 -c:v h264_nvenc -f null - 2>$null }
catch { $encArgs = @("-c:v", "libx264", "-preset", "veryfast", "-pix_fmt", "yuv420p") }

Write-Host "=== Intro / outro ==="
$fadeIntroOut = [Math]::Max(0, $IntroDur - 0.5)
& $ffmpeg -y -hide_banner -loglevel error -loop 1 -i (Join-Path $BrandingPng "intro.png") -t $IntroDur `
    -vf "scale=1080:1920,fade=t=in:st=0:d=0.4,fade=t=out:st=${fadeIntroOut}:d=0.5" @encArgs $introMp4
& $ffmpeg -y -hide_banner -loglevel error -loop 1 -i (Join-Path $BrandingPng "outro.png") -t $OutroDur `
    -vf "scale=1080:1920,fade=t=in:st=0:d=0.35" @encArgs $outroMp4

# Segmentos 9:16 + color + zoom sutil
Write-Host "=== Procesando clips (color + vertical) ==="
$i = 1
Get-ChildItem (Join-Path $Project "drone\clips") -Filter *.mp4 | Sort-Object Name | ForEach-Object {
    $out = Join-Path $ProcDir ("seg-{0:D2}.mp4" -f $i)
    # Crop 9:16 + color grade (sin zoompan — xfade aporta el dinamismo)
    $vf = "crop=ih*9/16:ih:(iw-ih*9/16)/2:0,scale=1080:1920,fps=30,$ColorFilter"
    & $ffmpeg -y -hide_banner -loglevel error -i $_.FullName -an -vf $vf @encArgs $out
    $i++
}

function ConvertTo-ConcatPath([string]$Path) {
    return ("file '{0}'" -f ($Path -replace '\\', '/'))
}

# Concat: intro + dron (solo lo necesario) + outro
Write-Host "=== Concat con transiciones (duración ajustada a VO) ==="
$segFiles = @(Get-ChildItem $ProcDir -Filter seg-*.mp4 | Sort-Object Name | ForEach-Object { $_.FullName })
$planJson = & python (Join-Path $VideoRoot "scripts\plan-reel-timeline.py") $ffprobe $IntroDur $OutroDur $SubOffset $voDur $TailAfterVo $OutroDur @segFiles
$plan = $planJson | ConvertFrom-Json
Write-Host "Clips dron: $($plan.segment_count) | recorte último: $($plan.trim_last_seconds)s | objetivo: $($plan.target_total)s"

$selectedSegs = @()
for ($j = 0; $j -lt $plan.segments.Count; $j++) {
    $src = $plan.segments[$j]
    if ($j -eq ($plan.segments.Count - 1) -and [double]$plan.trim_last_seconds -gt 0.05) {
        $trimmed = Join-Path $ProcDir ("seg-trim-{0:D2}.mp4" -f ($j + 1))
        $segFull = [double](& $ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 $src)
        $keep = [Math]::Max(1.0, $segFull - [double]$plan.trim_last_seconds)
        & $ffmpeg -y -hide_banner -loglevel error -i $src -t $keep -c copy $trimmed
        $selectedSegs += $trimmed
    } else {
        $selectedSegs += $src
    }
}

$allClips = @($introMp4) + $selectedSegs + @($outroMp4)
$videoMux = Join-Path $Exports "_full-video.mp4"
$xfadeArgs = @($ffprobe, $videoMux) + $allClips
& python (Join-Path $VideoRoot "scripts\concat-xfade.py") @xfadeArgs
if ($LASTEXITCODE -ne 0) { Write-Error "Falló concat xfade" }

# Guardar lista para referencia
$allClips | ForEach-Object { ConvertTo-ConcatPath $_ } | Set-Content (Join-Path $Exports "concat-full.txt") -Encoding ASCII
$targetDur = [double](& $ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 $videoMux)
# Ajuste fino si el xfade difiere levemente del objetivo
if ([Math]::Abs($targetDur - $targetTotal) -gt 0.35) {
    Write-Host "Recorte final: ${targetDur}s → ${targetTotal}s"
    $trimmedMux = Join-Path $Exports "_full-video-trim.mp4"
    & $ffmpeg -y -hide_banner -loglevel error -i $videoMux -t $targetTotal -c copy $trimmedMux
    Move-Item -Force $trimmedMux $videoMux
    $targetDur = $targetTotal
}
$fadeOut = [Math]::Max(0, $targetDur - 3)
$voStartMs = [int](($IntroDur + $VoDelay) * 1000)

Write-Host "=== Audio (solo VO — sin música para IG) ==="
$fc = "[1:a]adelay=${voStartMs}|${voStartMs},apad=whole_dur=$targetDur,volume=1.0[a]"
$withAudio = Join-Path $Exports "_with-audio.mp4"
& $ffmpeg -y -hide_banner -loglevel error -i $videoMux -i $VoAudio `
    -filter_complex $fc -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -movflags +faststart $withAudio

# Subtítulos Montserrat (libass) — carpeta temp sin espacios
Write-Host "=== Quemando subtítulos ==="
$subWork = Join-Path $env:TEMP "la-reel-subtitles"
New-Item -ItemType Directory -Force -Path $subWork | Out-Null
Copy-Item $VoAss (Join-Path $subWork "subs.ass") -Force
# libass resuelve por nombre de familia — copiar como Montserrat.ttf (Regular = captions brand book)
Copy-Item $fontReg (Join-Path $subWork "Montserrat.ttf") -Force
Copy-Item $fontReg (Join-Path $subWork "Montserrat-Regular.ttf") -Force
Copy-Item $fontSemi (Join-Path $subWork "Montserrat-SemiBold.ttf") -Force
$assFile = (Join-Path $subWork "subs.ass") -replace "\\", "/" -replace ":", "\\:"
$fontsDirEsc = ($subWork -replace "\\", "/") -replace ":", "\\:"
$assFilter = "subtitles=${assFile}:fontsdir=${fontsDirEsc}"
$subOut = Join-Path $Exports "_subtitled.mp4"
& $ffmpeg -y -hide_banner -loglevel error -i $withAudio -vf $assFilter `
    -c:v h264_nvenc -preset p4 -cq 22 -c:a copy -movflags +faststart $subOut
if ($LASTEXITCODE -ne 0) {
    & $ffmpeg -y -hide_banner -loglevel error -i $withAudio -vf $assFilter `
        -c:v libx264 -preset veryfast -crf 21 -c:a copy -movflags +faststart $subOut
}
if ($LASTEXITCODE -ne 0) { Write-Error "Falló quemado de subtítulos" }
Move-Item -Force $subOut $OutputFinal

# Portada: frame del dron (sin intro/outro ni subtítulos)
Write-Host "=== Portada feed ==="
$coverSeg = Join-Path $ProcDir "seg-02.mp4"
if (-not (Test-Path $coverSeg)) {
    $coverSeg = (Get-ChildItem $ProcDir -Filter seg-*.mp4 | Sort-Object Name | Select-Object -First 1).FullName
}
$segDur = [double](& $ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 $coverSeg)
$coverTs = [Math]::Max(1, [Math]::Round($segDur / 2, 1))
& $ffmpeg -y -hide_banner -loglevel error -ss $coverTs -i $coverSeg -vframes 1 -q:v 2 $OutputCover

# Poster embebido en MP4 (evita frame negro si IG no recibe portada manual)
$withPoster = Join-Path $Exports "_with-poster.mp4"
& $ffmpeg -y -hide_banner -loglevel error -i $OutputFinal -i $OutputCover `
    -map 0 -map 1 -c copy -c:v:1 mjpeg -disposition:v:1 attached_pic $withPoster
if ($LASTEXITCODE -eq 0) { Move-Item -Force $withPoster $OutputFinal }

Remove-Item $videoMux, $withAudio -Force -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "Listo: $OutputFinal ($([math]::Round($targetDur,1))s | VO+$TailAfterVo+$OutroDur s post-VO)"
