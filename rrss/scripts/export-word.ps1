# Exporta documentos RRSS a Word (.docx) con codificacion UTF-8
$ErrorActionPreference = "Stop"
$rrssDir = Split-Path $PSScriptRoot -Parent
$outDir = "C:\Users\josek\Desktop\Land Advisors - Documentos RRSS"

New-Item -ItemType Directory -Force -Path $outDir | Out-Null

function Convert-HtmlToDocx {
    param(
        [string]$HtmlPath,
        [string]$DocxPath
    )
    $word = New-Object -ComObject Word.Application
    $word.Visible = $false
    $word.DisplayAlerts = 0
    try {
        $doc = $word.Documents.Open($HtmlPath, $false, $true)
        $format = 16  # wdFormatXMLDocument (.docx)
        $doc.SaveAs2([ref]$DocxPath, [ref]$format)
        $doc.Close($false)
    }
    finally {
        $word.Quit()
        [System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null
        [GC]::Collect()
        [GC]::WaitForPendingFinalizers()
    }
}

$htmlFiles = @(
    @{ Html = Join-Path $rrssDir "export\01-Branding-Book.html"; Docx = Join-Path $outDir "01 - Branding Book Land Advisors.docx" },
    @{ Html = Join-Path $rrssDir "export\02-Plan-de-Contenidos.html"; Docx = Join-Path $outDir "02 - Plan de Contenidos RRSS.docx" },
    @{ Html = Join-Path $rrssDir "export\03-Calendario-Junio-2026.html"; Docx = Join-Path $outDir "03 - Calendario Junio 2026.docx" }
)

foreach ($item in $htmlFiles) {
    if (-not (Test-Path $item.Html)) {
        throw "No se encontro: $($item.Html)"
    }
    Convert-HtmlToDocx -HtmlPath $item.Html -DocxPath $item.Docx
    Write-Host "Creado: $($item.Docx)"
}

Write-Host ""
Write-Host "Carpeta de salida: $outDir"
