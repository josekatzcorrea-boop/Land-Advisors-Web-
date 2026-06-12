param(
    [string]$InputPath,
    [string]$OutputPath,
    [int]$X,
    [int]$Y,
    [int]$Width,
    [int]$Height
)

Add-Type -AssemblyName System.Drawing
$src = [System.Drawing.Image]::FromFile($InputPath)
$rect = New-Object System.Drawing.Rectangle $X, $Y, $Width, $Height
$dest = New-Object System.Drawing.Bitmap $Width, $Height
$g = [System.Drawing.Graphics]::FromImage($dest)
$g.Clear([System.Drawing.Color]::White)
$g.DrawImage($src, 0, 0, $rect, [System.Drawing.GraphicsUnit]::Pixel)
$g.Dispose()
$dest.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
$src.Dispose()
$dest.Dispose()
Write-Output "Cropped to $OutputPath"
