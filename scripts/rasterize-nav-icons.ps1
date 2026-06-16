# Rasterize nav icons to 500x500 PNG using brand specs.
# Stroke: #052C4D width 10, round caps/joins
Add-Type -AssemblyName System.Drawing

$Brand = [System.Drawing.Color]::FromArgb(255, 5, 44, 77)
$White = [System.Drawing.Color]::White
$Size = 500
$Stroke = 10.0
$Cap = [System.Drawing.Drawing2D.LineCap]::Round
$Join = [System.Drawing.Drawing2D.LineJoin]::Round

function New-IconBitmap {
    $bmp = New-Object System.Drawing.Bitmap $Size, $Size
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.Clear($White)
    return @{ Bmp = $bmp; G = $g }
}

function Get-Pen {
    $p = New-Object System.Drawing.Pen $Brand, $Stroke
    $p.StartCap = $Cap; $p.EndCap = $Cap; $p.LineJoin = $Join
    return $p
}

function Get-Brush { return New-Object System.Drawing.SolidBrush $Brand }

function Save-Icon($ctx, $path) {
    $ctx.G.Dispose()
    $ctx.Bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
    $ctx.Bmp.Dispose()
}

function Draw-Noticias {
    $ctx = New-IconBitmap
    $g = $ctx.G; $pen = Get-Pen; $brush = Get-Brush
    # folded back page (left spine + bottom curve + inner edge)
    $fold = New-Object System.Drawing.Drawing2D.GraphicsPath
    [void]$fold.AddLine(155, 145, 155, 318)
    [void]$fold.AddArc(155, 318, 22, 22, 90, 90)
    [void]$fold.AddLine(177, 340, 177, 145)
    $g.DrawPath($pen, $fold)
    # front page frame
    $g.DrawRectangle($pen, 177, 145, 198, 195)
    # headline + text lines
    $g.DrawLine($pen, 197, 175, 355, 175)
    foreach ($y in 205, 230, 255, 280) { $g.DrawLine($pen, 197, $y, 287, $y) }
    # photo block (solid)
    $g.FillRectangle($brush, 302, 200, 58, 88)
    # arrow
    $g.DrawLine($pen, 155, 385, 345, 385)
    $g.DrawLine($pen, 325, 370, 345, 385)
    $g.DrawLine($pen, 325, 400, 345, 385)
    $fold.Dispose(); $pen.Dispose(); $brush.Dispose()
    Save-Icon $ctx (Join-Path $assets "NOTICIAS.png")
}

function Draw-Servicios {
    $ctx = New-IconBitmap
    $g = $ctx.G; $pen = Get-Pen; $brush = Get-Brush
    $cx = 250; $cy = 175; $r = 28
    $g.DrawEllipse($pen, $cx - $r, $cy - $r, $r * 2, $r * 2)
    $g.DrawEllipse($pen, $cx - 10, $cy - 10, 20, 20)
    foreach ($a in 0, 45, 90, 135, 180, 225, 270, 315) {
        $rad = [Math]::PI * $a / 180
        $x1 = $cx + [Math]::Cos($rad) * 43
        $y1 = $cy + [Math]::Sin($rad) * 43
        $x2 = $cx + [Math]::Cos($rad) * 56
        $y2 = $cy + [Math]::Sin($rad) * 56
        $g.DrawLine($pen, $x1, $y1, $x2, $y2)
    }
    # open hand — palm up, thumb left
    $hand = New-Object System.Drawing.Drawing2D.GraphicsPath
    [void]$hand.AddBezier(118, 318, 118, 292, 138, 272, 168, 262)
    [void]$hand.AddBezier(168, 262, 205, 248, 245, 252, 285, 272)
    [void]$hand.AddBezier(285, 272, 320, 288, 342, 310, 348, 338)
    [void]$hand.AddBezier(348, 338, 352, 358, 338, 372, 315, 372)
    [void]$hand.AddLine(315, 372, 195, 372)
    [void]$hand.AddBezier(195, 372, 158, 372, 132, 358, 122, 338)
    [void]$hand.AddBezier(122, 338, 115, 328, 115, 322, 118, 318)
    [void]$hand.CloseFigure()
    $g.DrawPath($pen, $hand)
    # cuff (solid)
    $cuff = @(
        (New-Object System.Drawing.Point 108, 318),
        (New-Object System.Drawing.Point 118, 308),
        (New-Object System.Drawing.Point 118, 352),
        (New-Object System.Drawing.Point 108, 362)
    )
    $g.FillPolygon($brush, $cuff)
    $hand.Dispose(); $pen.Dispose(); $brush.Dispose()
    Save-Icon $ctx (Join-Path $assets "SERVICIOS.png")
}

function Draw-Clientes {
    $ctx = New-IconBitmap
    $g = $ctx.G; $pen = Get-Pen; $brush = Get-Brush
    # speech bubble — rounded rect + tail
    $bx = 178; $by = 128; $bw = 148; $bh = 82; $r = 14
    $bubble = New-Object System.Drawing.Drawing2D.GraphicsPath
    [void]$bubble.AddLine($bx + $r, $by, $bx + $bw - $r, $by)
    [void]$bubble.AddArc($bx + $bw - 2 * $r, $by, 2 * $r, 2 * $r, 270, 90)
    [void]$bubble.AddLine($bx + $bw, $by + $r, $bx + $bw, $by + $bh - $r)
    [void]$bubble.AddArc($bx + $bw - 2 * $r, $by + $bh - 2 * $r, 2 * $r, 2 * $r, 0, 90)
    [void]$bubble.AddLine($bx + $bw - $r, $by + $bh, $bx + 78, $by + $bh)
    [void]$bubble.AddLine($bx + 58, $by + $bh, $bx + 48, $by + $bh + 22)
    [void]$bubble.AddLine($bx + 48, $by + $bh + 22, $bx + 38, $by + $bh)
    [void]$bubble.AddLine($bx + $r, $by + $bh)
    [void]$bubble.AddArc($bx, $by + $bh - 2 * $r, 2 * $r, 2 * $r, 90, 90)
    [void]$bubble.AddLine($bx, $by + $r)
    [void]$bubble.AddArc($bx, $by, 2 * $r, 2 * $r, 180, 90)
    [void]$bubble.CloseFigure()
    $g.DrawPath($pen, $bubble)
    $g.DrawLine($pen, 200, 160, 300, 160)
    $g.DrawLine($pen, 200, 185, 260, 185)
    # heart
    $heart = New-Object System.Drawing.Drawing2D.GraphicsPath
    [void]$heart.AddBezier(155, 175, 155, 155, 170, 145, 180, 160)
    [void]$heart.AddBezier(180, 160, 190, 145, 205, 155, 205, 175)
    [void]$heart.AddBezier(205, 175, 205, 195, 180, 215, 180, 215)
    [void]$heart.AddBezier(180, 215, 155, 195, 155, 175, 155, 175)
    $g.FillPath($brush, $heart)
    # people
    foreach ($p in @(@(195,285,22,305,340), @(130,300,18,312,340), @(260,300,18,312,340))) {
        $g.DrawEllipse($pen, $p[0]-$p[2], $p[1]-$p[2], $p[2]*2, $p[2]*2)
        $body = New-Object System.Drawing.Drawing2D.GraphicsPath
        [void]$body.AddArc($p[0]-$p[2], $p[3], $p[2]*2, ($p[4]-$p[3])*2, 180, 180)
        $g.DrawPath($pen, $body)
        $body.Dispose()
    }
    $bubble.Dispose(); $heart.Dispose(); $pen.Dispose(); $brush.Dispose()
    Save-Icon $ctx (Join-Path $assets "CLIENTES.png")
}

function Draw-Vision {
    $ctx = New-IconBitmap
    $g = $ctx.G; $pen = Get-Pen; $brush = Get-Brush
    # head outer
    $head = New-Object System.Drawing.Drawing2D.GraphicsPath
    [void]$head.AddBezier(310, 130, 360, 130, 395, 175, 395, 230)
    [void]$head.AddBezier(395, 230, 395, 280, 375, 310, 340, 330)
    [void]$head.AddLine(340, 330, 340, 360)
    [void]$head.AddBezier(340, 360, 340, 375, 325, 385, 310, 385)
    [void]$head.AddLine(310, 385, 260, 385)
    [void]$head.AddBezier(260, 385, 245, 385, 230, 375, 230, 360)
    [void]$head.AddLine(230, 360, 230, 330)
    [void]$head.AddBezier(230, 330, 195, 310, 175, 280, 175, 230)
    [void]$head.AddBezier(175, 230, 175, 175, 210, 130, 260, 130)
    [void]$head.AddBezier(260, 130, 270, 130, 280, 128, 290, 125)
    [void]$head.AddBezier(290, 125, 295, 123, 302, 125, 310, 130)
    $g.FillPath($brush, $head)
    # brain cutout (white)
    $brain = New-Object System.Drawing.Drawing2D.GraphicsPath
    [void]$brain.AddBezier(240, 175, 220, 195, 215, 230, 225, 265)
    [void]$brain.AddBezier(225, 265, 235, 300, 260, 315, 290, 300)
    [void]$brain.AddBezier(290, 300, 320, 285, 335, 250, 330, 215)
    [void]$brain.AddBezier(330, 215, 325, 180, 300, 160, 270, 165)
    [void]$brain.AddBezier(270, 165, 255, 168, 245, 170, 240, 175)
    $g.SetClip($brain)
    $g.Clear($White)
    $g.ResetClip()
    # eye
    $g.DrawEllipse($pen, 256, 214, 44, 28)
    $g.FillEllipse($brush, 272, 222, 12, 12)
    foreach ($a in -90, -45, 0, 45, 90, 135, 180) {
        $rad = [Math]::PI * $a / 180
        $x1 = 278 + [Math]::Cos($rad) * 24
        $y1 = 228 + [Math]::Sin($rad) * 18
        $x2 = 278 + [Math]::Cos($rad) * 32
        $y2 = 228 + [Math]::Sin($rad) * 24
        $g.DrawLine($pen, $x1, $y1, $x2, $y2)
    }
    # arrow
    $g.DrawLine($pen, 200, 410, 340, 410)
    $g.DrawLine($pen, 320, 395, 340, 410)
    $g.DrawLine($pen, 320, 425, 340, 410)
    $head.Dispose(); $brain.Dispose(); $pen.Dispose(); $brush.Dispose()
    $dest = (Get-ChildItem -Path $assets -Filter "VIS*.png" | Select-Object -First 1).FullName
    if (-not $dest) { $dest = Join-Path $assets "VISION.png" }
    Save-Icon $ctx $dest
}

$assets = Join-Path (Split-Path $PSScriptRoot -Parent) "assets"
Draw-Noticias
Draw-Servicios
Draw-Clientes
Draw-Vision
Write-Output ('OK rasterized 4 icons to ' + $assets)

# Snap anti-aliased edge pixels to pure brand blue
function Snap-BrandBlue($filePath) {
    $bytes = [System.IO.File]::ReadAllBytes($filePath)
    $ms = New-Object System.IO.MemoryStream(,$bytes)
    $bmp = [System.Drawing.Bitmap]::FromStream($ms)
    $ms.Dispose()
    for ($y = 0; $y -lt $bmp.Height; $y++) {
        for ($x = 0; $x -lt $bmp.Width; $x++) {
            $px = $bmp.GetPixel($x, $y)
            if ($px.A -lt 40) { continue }
            if ($px.R -gt 230 -and $px.G -gt 230 -and $px.B -gt 230) { continue }
            $bmp.SetPixel($x, $y, $Brand)
        }
    }
    $out = New-Object System.IO.MemoryStream
    $bmp.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)
    [System.IO.File]::WriteAllBytes($filePath, $out.ToArray())
    $bmp.Dispose(); $out.Dispose()
}

foreach ($f in Get-ChildItem -Path $assets -Filter "*.png" | Where-Object { $_.Name -match '^(NOTICIAS|SERVICIOS|CLIENTES|VIS)' }) {
    Snap-BrandBlue $f.FullName
}
Write-Output "OK snapped colors to #052C4D"
