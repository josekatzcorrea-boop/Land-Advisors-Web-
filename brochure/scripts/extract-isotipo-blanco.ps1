# Extrae isotipo 3D blanco sin fondo desde logo invertido 3D.jpeg (solo brochure)
param(
  [string]$Source,
  [string]$Dest
)

$brochureDir = Split-Path $PSScriptRoot -Parent
$root = Split-Path $brochureDir -Parent
if (-not $Source) { $Source = Join-Path $root "assets\logo invertido 3D.jpeg" }
if (-not $Dest) { $Dest = Join-Path $brochureDir "assets\isotipo-3d-blanco-transparente.png" }

$destDir = Split-Path $Dest -Parent
if (-not (Test-Path $destDir)) { New-Item -ItemType Directory -Force -Path $destDir | Out-Null }

Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing @"
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;

public static class IsotipoExtract {
  static byte Alpha(byte r, byte g, byte b) {
    int max = Math.Max(r, Math.Max(g, b));
    int min = Math.Min(r, Math.Min(g, b));
    double sat = max == 0 ? 0 : (max - min) / (double)max;

    if (r > 205 && g > 205 && b > 205) return 255;
    if (max > 130 && sat < 0.22) return (byte)Math.Min(255, max);

    if (b > r + 18 && b > g + 8 && r < 90 && g < 120) return 0;

    if (max > 90 && sat < 0.18) return (byte)Math.Min(200, max - 40);
    return 0;
  }

  public static void Run(string src, string dst) {
    using (var input = new Bitmap(src)) {
      var outBmp = new Bitmap(input.Width, input.Height, PixelFormat.Format32bppArgb);
      var rect = new Rectangle(0, 0, input.Width, input.Height);
      var inData = input.LockBits(rect, ImageLockMode.ReadOnly, PixelFormat.Format24bppRgb);
      var outData = outBmp.LockBits(rect, ImageLockMode.WriteOnly, PixelFormat.Format32bppArgb);
      int inStride = inData.Stride;
      int outStride = outData.Stride;
      byte[] inPx = new byte[Math.Abs(inStride) * input.Height];
      byte[] outPx = new byte[Math.Abs(outStride) * input.Height];
      Marshal.Copy(inData.Scan0, inPx, 0, inPx.Length);

      for (int y = 0; y < input.Height; y++) {
        int inRow = y * inStride;
        int outRow = y * outStride;
        for (int x = 0; x < input.Width; x++) {
          int iIn = inRow + x * 3;
          int iOut = outRow + x * 4;
          byte b = inPx[iIn], g = inPx[iIn + 1], r = inPx[iIn + 2];
          byte a = Alpha(r, g, b);
          outPx[iOut] = b;
          outPx[iOut + 1] = g;
          outPx[iOut + 2] = r;
          outPx[iOut + 3] = a;
        }
      }

      Marshal.Copy(outPx, 0, outData.Scan0, outPx.Length);
      input.UnlockBits(inData);
      outBmp.UnlockBits(outData);
      outBmp.Save(dst, ImageFormat.Png);
      outBmp.Dispose();
    }
  }
}
"@

[IsotipoExtract]::Run($Source, $Dest)
Write-Host "OK -> $Dest"
