# Reinicia el servidor local de previsualización (puerto 8765)
$port = 8765
$serve = Join-Path $PSScriptRoot "serve.ps1"

Get-CimInstance Win32_Process -ErrorAction SilentlyContinue |
  Where-Object { $_.CommandLine -and $_.CommandLine -like "*serve.ps1*" } |
  ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }

Start-Sleep -Seconds 1
Start-Process powershell -ArgumentList @(
  "-NoExit",
  "-ExecutionPolicy", "Bypass",
  "-File", $serve
)

Write-Host "Servidor iniciado. Abre:"
Write-Host "  http://127.0.0.1:$port/landing/indice-territorial/"
