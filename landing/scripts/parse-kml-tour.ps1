param(
  [string]$KmlPath = (Join-Path (Split-Path $PSScriptRoot -Parent) "video\doc.kml"),
  [string]$OutPath = (Join-Path (Split-Path $PSScriptRoot -Parent) "video\tour.json")
)

$kml = Get-Content -LiteralPath $KmlPath -Raw -Encoding UTF8
$playlist = [regex]::Match($kml, '(?s)<gx:Playlist>(.*)</gx:Playlist>').Groups[1].Value
$steps = [System.Collections.Generic.List[hashtable]]::new()

foreach ($item in [regex]::Matches($playlist, '(?s)<gx:(FlyTo|Wait)>.*?</gx:\1>')) {
  $block = $item.Value
  if ($block -match '<gx:Wait>') {
    if ($block -match '<gx:duration>([^<]+)</gx:duration>') {
      $steps.Add(@{ wait = [double]$Matches[1] })
    }
    continue
  }
  $dur = 1.5
  if ($block -match '<gx:duration>([^<]+)</gx:duration>') { $dur = [double]$Matches[1] }
  if ($dur -lt 0.05) { $dur = 0.05 }
  $lon = $lat = $range = $heading = $tilt = 0.0
  if ($block -match '<longitude>([^<]+)</longitude>') { $lon = [double]$Matches[1] }
  if ($block -match '<latitude>([^<]+)</latitude>') { $lat = [double]$Matches[1] }
  if ($block -match '<range>([^<]+)</range>') { $range = [double]$Matches[1] }
  if ($block -match '<heading>([^<]+)</heading>') { $heading = [double]$Matches[1] }
  if ($block -match '<tilt>([^<]+)</tilt>') { $tilt = [double]$Matches[1] }
  $steps.Add(@{
    lon      = $lon
    lat      = $lat
    range    = $range
    heading  = $heading
    tilt     = $tilt
    duration = $dur
  })
}

@{
  name  = "Video inicial"
  steps = $steps
} | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $OutPath -Encoding UTF8

Write-Host "Wrote $($steps.Count) steps to $OutPath"
