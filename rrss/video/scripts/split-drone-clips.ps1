# split-drone-clips.ps1
# Divide un video largo de dron en clips cortos para Reels.
# Requiere: ffmpeg en PATH (winget install ffmpeg)

param(
    [Parameter(Mandatory = $true)]
    [string]$InputVideo,

    [int]$ClipSeconds = 10,
    [int]$MinClipSeconds = 5,
    [int]$MaxClipSeconds = 15,
    [string]$OutputDir = "",
    [switch]$ByScene,
    [double]$SceneThreshold = 0.35
)

$ErrorActionPreference = "Stop"

function Resolve-Ffmpeg {
    $cmd = Get-Command ffmpeg -ErrorAction SilentlyContinue
    if (-not $cmd) {
        Write-Error "ffmpeg no encontrado. Instala con: winget install ffmpeg"
    }
    return $cmd.Source
}

function Get-SceneTimestamps {
    param([string]$Path, [string]$Ffmpeg, [double]$Threshold)
    $filter = "select='gt(scene,$Threshold)',showinfo"
    $lines = & $Ffmpeg -hide_banner -i $Path -vf $filter -an -f null - 2>&1
    $times = @()
    foreach ($line in $lines) {
        if ($line -match 'pts_time:([\d.]+)') {
            $times += [double]$Matches[1]
        }
    }
    return ($times | Sort-Object -Unique)
}

function Export-Clip {
    param(
        [string]$InputPath,
        [string]$OutputPath,
        [double]$Start,
        [double]$Duration,
        [string]$Ffmpeg
    )
    $ffmpegArgs = @(
        "-y", "-ss", $Start.ToString("F3", [Globalization.CultureInfo]::InvariantCulture),
        "-i", $InputPath,
        "-t", $Duration.ToString("F3", [Globalization.CultureInfo]::InvariantCulture),
        "-c:v", "libx264", "-preset", "fast", "-crf", "20",
        "-an",
        "-movflags", "+faststart",
        "-pix_fmt", "yuv420p",
        $OutputPath
    )
    $prev = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    & $Ffmpeg @ffmpegArgs 2>$null
    $ErrorActionPreference = $prev
    if ($LASTEXITCODE -ne 0) { Write-Error "ffmpeg falló al exportar $OutputPath" }
}

if (-not (Test-Path $InputVideo)) {
    Write-Error "No existe: $InputVideo"
}

$ffmpeg = Resolve-Ffmpeg
$inputResolved = (Resolve-Path $InputVideo).Path
$baseName = [IO.Path]::GetFileNameWithoutExtension($inputResolved)

if ([string]::IsNullOrWhiteSpace($OutputDir)) {
    $OutputDir = Join-Path (Split-Path $inputResolved -Parent) "clips"
}
New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

# duración total
$ffprobe = Get-Command ffprobe -ErrorAction SilentlyContinue
$totalDuration = 0
if ($ffprobe) {
    $raw = & $ffprobe.Source -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 $inputResolved 2>$null
    $totalDuration = [double]$raw
}
if ($totalDuration -le 0) {
    Write-Error "No se pudo leer la duración del video."
}

Write-Host "Entrada: $inputResolved"
Write-Host "Duración: $([math]::Round($totalDuration, 1)) s"
Write-Host "Salida:  $OutputDir"
Write-Host ""

$segments = @()

if ($ByScene) {
    Write-Host "Modo: detección de escenas (umbral $SceneThreshold)"
    $cuts = Get-SceneTimestamps -Path $inputResolved -Ffmpeg $ffmpeg -Threshold $SceneThreshold
    $cuts = @(0.0) + $cuts + @($totalDuration) | Sort-Object -Unique

    for ($i = 0; $i -lt $cuts.Count - 1; $i++) {
        $start = $cuts[$i]
        $end = $cuts[$i + 1]
        $dur = $end - $start
        if ($dur -ge $MinClipSeconds) {
            if ($dur -gt $MaxClipSeconds) {
                # subdividir tramos largos
                $pos = $start
                while ($pos + $MaxClipSeconds -lt $end) {
                    $segments += @{ Start = $pos; Duration = $ClipSeconds }
                    $pos += $ClipSeconds
                }
                $remaining = $end - $pos
                if ($remaining -ge $MinClipSeconds) {
                    $segments += @{ Start = $pos; Duration = $remaining }
                }
            } else {
                $segments += @{ Start = $start; Duration = $dur }
            }
        }
    }
} else {
    Write-Host "Modo: segmentos fijos de ${ClipSeconds}s"
    $pos = 0.0
    while ($pos + $MinClipSeconds -le $totalDuration) {
        $dur = [Math]::Min($ClipSeconds, $totalDuration - $pos)
        if ($dur -ge $MinClipSeconds) {
            $segments += @{ Start = $pos; Duration = $dur }
        }
        $pos += $ClipSeconds
    }
}

if ($segments.Count -eq 0) {
    Write-Warning "No se generaron segmentos. Prueba -ByScene o reduce -MinClipSeconds."
    exit 0
}

$index = 1
foreach ($seg in $segments) {
    $outName = "{0}-clip-{1:D2}.mp4" -f $baseName, $index
    $outPath = Join-Path $OutputDir $outName
    Write-Host ("  [{0:D2}] {1:F1}s → {2:F1}s  →  {3}" -f $index, $seg.Start, ($seg.Start + $seg.Duration), $outName)
    Export-Clip -InputPath $inputResolved -OutputPath $outPath -Start $seg.Start -Duration $seg.Duration -Ffmpeg $ffmpeg
    $index++
}

Write-Host ""
Write-Host "Listo: $($segments.Count) clips en $OutputDir"
