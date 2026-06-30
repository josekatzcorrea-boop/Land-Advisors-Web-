# Isotipo azul 3D sin fondo — para slides con fondo claro (#F4F7F8)
param(
  [string]$Source,
  [string]$Dest
)

$assetsDir = Split-Path $PSScriptRoot -Parent
$root = Split-Path $assetsDir -Parent
if (-not $Source) { $Source = Join-Path $assetsDir "logo-isotipo-3d.png" }
if (-not $Dest) { $Dest = Join-Path $assetsDir "logo-isotipo-3d-transparente.png" }

Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing @"
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;

public static class IsotipoAzulExtract {
  static byte Alpha(byte r, byte g, byte b) {
    int max = Math.Max(r, Math.Max(g, b));
    int min = Math.Min(r, Math.Min(g, b));
    double sat = max == 0 ? 0 : (max - min) / (double)max;

    if (r > 248 && g > 248 && b > 248) return 0;
    if (r > 235 && g > 235 && b > 235) return (byte)Math.Max(0, 255 - (r + g + b) / 3 + 200);

    if (b >= r && b >= g && sat > 0.15) return 255;

    if (max > 120 && sat < 0.15) return (byte)Math.Min(255, max - 80);
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

[IsotipoAzulExtract]::Run($Source, $Dest)
Write-Host "OK -> $Dest"
