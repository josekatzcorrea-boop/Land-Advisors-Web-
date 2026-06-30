# Logo grande 3D sin fondo — para slides con fondo claro (#F4F7F8 / blanco)
param(
  [string]$Source,
  [string]$Dest
)

$assetsDir = Split-Path $PSScriptRoot -Parent
if (-not $Source) { $Source = Join-Path $assetsDir "LOGO GRANDE JPG-02-3D.jpg" }
if (-not $Dest) { $Dest = Join-Path $assetsDir "logo-grande-3d-transparente.png" }

Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing @"
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;

public static class LogoGrandeExtract {
  static double Sat(byte r, byte g, byte b) {
    int max = Math.Max(r, Math.Max(g, b));
    int min = Math.Min(r, Math.Min(g, b));
    return max == 0 ? 0 : (max - min) / (double)max;
  }

  static byte Alpha(byte r, byte g, byte b) {
    int max = Math.Max(r, Math.Max(g, b));
    double sat = Sat(r, g, b);
    int lum = (r + g + b) / 3;

    if (r > 252 && g > 252 && b > 252) return 0;
    if (lum > 248 && sat < 0.04) return 0;

    if (lum > 235 && sat < 0.06) {
      return (byte)Math.Max(0, Math.Min(255, (248 - lum) * 18));
    }

    if (lum > 220 && sat < 0.04) {
      return (byte)Math.Max(0, Math.Min(255, (235 - lum) * 8));
    }

    if (b >= r && b >= g && sat > 0.12) return 255;
    if (sat < 0.14 && max > 90 && max < 220) return 255;

    if (max > 70) return 255;
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

[LogoGrandeExtract]::Run($Source, $Dest)
Write-Host "OK -> $Dest"
