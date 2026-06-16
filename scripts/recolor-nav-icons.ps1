# Recolor nav icon PNGs to brand blue #052C4D - shape and stroke unchanged.
param(
  [string]$AssetsDir = (Join-Path (Split-Path $PSScriptRoot -Parent) "assets"),
  [string]$Only = ""
)

Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing @"
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;

public static class NavIconRecolor {
  static bool IsInk(byte r, byte g, byte b, byte a) {
    if (a < 24) return false;
    if (r > 245 && g > 245 && b > 245) return false;
    return true;
  }

  public static void Run(string src, string dst) {
    using (var input = new Bitmap(src)) {
      using (var bmp = new Bitmap(input.Width, input.Height, PixelFormat.Format32bppArgb)) {
        using (var g = Graphics.FromImage(bmp)) {
          g.Clear(Color.Transparent);
          g.DrawImage(input, 0, 0, input.Width, input.Height);
        }

        var rect = new Rectangle(0, 0, bmp.Width, bmp.Height);
        var data = bmp.LockBits(rect, ImageLockMode.ReadWrite, PixelFormat.Format32bppArgb);
        int stride = data.Stride;
        int bytes = Math.Abs(stride) * bmp.Height;
        byte[] px = new byte[bytes];
        Marshal.Copy(data.Scan0, px, 0, bytes);

        for (int y = 0; y < bmp.Height; y++) {
          int row = y * stride;
          for (int x = 0; x < bmp.Width; x++) {
            int i = row + x * 4;
            byte b = px[i], g = px[i + 1], r = px[i + 2], a = px[i + 3];
            if (!IsInk(r, g, b, a)) continue;
            px[i] = 77;     // B
            px[i + 1] = 44; // G
            px[i + 2] = 5;  // R
          }
        }

        Marshal.Copy(px, 0, data.Scan0, bytes);
        bmp.UnlockBits(data);
        bmp.Save(dst, ImageFormat.Png);
      }
    }
  }
}
"@

$targets = if ($Only) {
  Get-ChildItem -Path $AssetsDir -Filter $Only -ErrorAction SilentlyContinue
} else {
  Get-ChildItem -Path $AssetsDir -Filter "*.png" |
    Where-Object { $_.BaseName -match '^(noticias|servicios|clientes|vision|visi.n)$' }
}

if (-not $targets -or $targets.Count -eq 0) {
  Write-Warning "No icon PNGs found in $AssetsDir"
  exit 1
}

foreach ($file in $targets) {
  $tmp = Join-Path $AssetsDir ("_recolor-" + $file.Name)
  [NavIconRecolor]::Run($file.FullName, $tmp)
  Move-Item -Path $tmp -Destination $file.FullName -Force
  Write-Output "OK $($file.Name)"
}

Write-Output "Done - color only #052C4D, no geometry changes."
