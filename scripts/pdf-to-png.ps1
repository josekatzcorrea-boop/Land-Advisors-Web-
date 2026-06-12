param(
    [Parameter(Mandatory = $true)][string]$PdfPath,
    [Parameter(Mandatory = $true)][string]$OutPng,
    [int]$Dpi = 300
)

Add-Type -AssemblyName System.Runtime.WindowsRuntime

function Await($WinRtTask, [Type]$ResultType) {
    $asTask = ([System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object {
        $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1'
    })[0]
    $netTask = $asTask.MakeGenericMethod($ResultType).Invoke($null, @($WinRtTask))
    $netTask.Wait(-1) | Out-Null
    $netTask.Result
}

$null = [Windows.Storage.StorageFile, Windows.Storage, ContentType = WindowsRuntime]
$null = [Windows.Data.Pdf.PdfDocument, Windows.Data.Pdf, ContentType = WindowsRuntime]
$null = [Windows.Graphics.Imaging.BitmapEncoder, Windows.Graphics.Imaging, ContentType = WindowsRuntime]

$file = Await ([Windows.Storage.StorageFile]::GetFileFromPathAsync($PdfPath)) ([Windows.Storage.StorageFile])
$doc = Await ([Windows.Data.Pdf.PdfDocument]::LoadFromFileAsync($file)) ([Windows.Data.Pdf.PdfDocument])
$page = $doc.GetPage(0)

$scale = $Dpi / 96.0
$width = [int][Math]::Ceiling($page.Size.Width * $scale)
$height = [int][Math]::Ceiling($page.Size.Height * $scale)

$renderStream = New-Object Windows.Storage.Streams.InMemoryRandomAccessStream
$renderTask = $page.RenderToStreamAsync($renderStream, [Windows.Graphics.Size]::new($width, $height))
$null = Await $renderTask ([Windows.Storage.Streams.IRandomAccessStream])

$renderStream.Seek(0) | Out-Null
$decoder = [Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($renderStream).GetAwaiter().GetResult().GetResults()
$softwareBitmap = Await ($decoder.GetSoftwareBitmapAsync()) ([Windows.Graphics.Imaging.SoftwareBitmap])

$outDir = Split-Path -Parent $OutPng
if ($outDir -and -not (Test-Path $outDir)) { New-Item -ItemType Directory -Force -Path $outDir | Out-Null }

$outStream = [Windows.Storage.Streams.FileRandomAccessStream]::CreateAsync(
    [Windows.Storage.StorageFile]::GetFileFromPathAsync($OutPng).GetAwaiter().GetResult(),
    [Windows.Storage.FileAccessMode]::ReadWrite,
    [Windows.Storage.StorageOpenOptions]::None,
    [Windows.Storage.Streams.FileOpenDisposition]::ReplaceExisting
).GetAwaiter().GetResult()

$encoder = Await ([Windows.Graphics.Imaging.BitmapEncoder]::CreateAsync(
    [Windows.Graphics.Imaging.BitmapEncoder]::PngEncoderId,
    $outStream
)) ([Windows.Graphics.Imaging.BitmapEncoder])

$encoder.SetSoftwareBitmap($softwareBitmap)
$null = Await ($encoder.FlushAsync()) ([Windows.Storage.Streams.IRandomAccessStream])

$outStream.Dispose()
$renderStream.Dispose()
$page.Dispose()
$doc.Dispose()

Write-Output "Saved: $OutPng (${width}x${height})"
