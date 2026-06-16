param(
  [string]$Source = "C:\Users\josek\Desktop\Land Advisors IA\Contexto\assets\isotipo 3D.png",
  [string]$Dest = "C:\Users\josek\Desktop\Land Advisors IA\Contexto\assets\isotipo 3D-052C4D.png"
)

Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing @"
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;

public static class IsotipoRecolor {
  static bool IsLogo(byte r, byte g, byte b) {
    int max = Math.Max(r, Math.Max(g, b));
    int min = Math.Min(r, Math.Min(g, b));
    double sat = max == 0 ? 0 : (max - min) / (double)max;
    bool white = r > 235 && g > 235 && b > 235;
    bool shadow = sat < 0.12 && max < 210;
    bool blue = b >= r && b >= g && sat > 0.18;
    return !white && !shadow && blue;
  }

  public static void Run(string src, string dst, byte tr, byte tg, byte tb) {
    using (var bmp = new Bitmap(src)) {
      var rect = new Rectangle(0, 0, bmp.Width, bmp.Height);
      var data = bmp.LockBits(rect, ImageLockMode.ReadWrite, PixelFormat.Format24bppRgb);
      int stride = data.Stride;
      int bytes = Math.Abs(stride) * bmp.Height;
      byte[] px = new byte[bytes];
      Marshal.Copy(data.Scan0, px, 0, bytes);

      var lit = new System.Collections.Generic.List<int>();
      for (int y = 0; y < bmp.Height; y++) {
        int row = y * stride;
        for (int x = 0; x < bmp.Width; x++) {
          int i = row + x * 3;
          byte b = px[i], g = px[i + 1], r = px[i + 2];
          if (!IsLogo(r, g, b)) continue;
          lit.Add((int)(0.299 * r + 0.587 * g + 0.114 * b));
        }
      }
      lit.Sort();
      int idx = (int)(lit.Count * 0.92);
      if (idx >= lit.Count) idx = lit.Count - 1;
      int threshold = lit[idx];

      double refR = 1, refG = 1, refB = 1;
      int count = 0;
      for (int y = 0; y < bmp.Height; y++) {
        int row = y * stride;
        for (int x = 0; x < bmp.Width; x++) {
          int i = row + x * 3;
          byte b = px[i], g = px[i + 1], r = px[i + 2];
          if (!IsLogo(r, g, b)) continue;
          int lum = (int)(0.299 * r + 0.587 * g + 0.114 * b);
          if (lum < threshold) continue;
          refR += r; refG += g; refB += b; count++;
        }
      }
      refR /= count; refG /= count; refB /= count;

      double ratioR = tr / refR, ratioG = tg / refG, ratioB = tb / refB;

      for (int y = 0; y < bmp.Height; y++) {
        int row = y * stride;
        for (int x = 0; x < bmp.Width; x++) {
          int i = row + x * 3;
          byte b = px[i], g = px[i + 1], r = px[i + 2];
          if (!IsLogo(r, g, b)) continue;
          px[i + 2] = (byte)Math.Min(255, (int)Math.Round(r * ratioR));
          px[i + 1] = (byte)Math.Min(255, (int)Math.Round(g * ratioG));
          px[i] = (byte)Math.Min(255, (int)Math.Round(b * ratioB));
        }
      }

      Marshal.Copy(px, 0, data.Scan0, bytes);
      bmp.UnlockBits(data);
      bmp.Save(dst, ImageFormat.Png);
    }
  }
}
"@

[IsotipoRecolor]::Run($Source, $Dest, 5, 44, 77)
Write-Host "OK -> $Dest"
