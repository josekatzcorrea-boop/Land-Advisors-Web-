$root = "C:\Users\josek\Desktop\Land Advisors IA\Contexto"
$port = 8765

function Resolve-ServeFile {
  param([string]$UrlPath)
  if ([string]::IsNullOrWhiteSpace($UrlPath)) {
    return Join-Path $root "landing\index.html"
  }
  $rel = $UrlPath.Trim().TrimStart("/").TrimEnd("/")
  if ([string]::IsNullOrWhiteSpace($rel)) {
    return Join-Path $root "landing\index.html"
  }
  $rel = $rel -replace "/", [IO.Path]::DirectorySeparatorChar
  $candidate = Join-Path $root $rel
  if (Test-Path $candidate -PathType Leaf) { return $candidate }
  $indexInDir = Join-Path $candidate "index.html"
  if (Test-Path $indexInDir -PathType Leaf) { return $indexInDir }
  return $null
}

$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add("http://127.0.0.1:$port/")
$listener.Start()
Write-Host "Servidor local Land Advisors (puerto $port)"
Write-Host "Home:     http://127.0.0.1:$port/landing/index.html"
Write-Host "ILA:      http://127.0.0.1:$port/landing/indice-territorial/"
Write-Host "Ctrl+C para detener"

$mimes = @{
  ".html" = "text/html; charset=utf-8"
  ".css"  = "text/css; charset=utf-8"
  ".js"   = "application/javascript"
  ".svg"  = "image/svg+xml"
  ".png"  = "image/png"
  ".jpg"  = "image/jpeg"
  ".jpeg" = "image/jpeg"
  ".mp4"  = "video/mp4"
  ".webm" = "video/webm"
  ".mov"  = "video/quicktime"
  ".ico"  = "image/x-icon"
  ".json" = "application/json; charset=utf-8"
}

while ($listener.IsListening) {
  $ctx = $listener.GetContext()
  $path = [Uri]::UnescapeDataString($ctx.Request.Url.LocalPath).TrimStart("/")
  $file = Resolve-ServeFile $path
  $res = $ctx.Response
  if ($file) {
    $ext = [IO.Path]::GetExtension($file).ToLower()
    $res.ContentType = $mimes[$ext]
    if (-not $res.ContentType) { $res.ContentType = "application/octet-stream" }
    $bytes = [IO.File]::ReadAllBytes($file)
    $res.ContentLength64 = $bytes.Length
    $res.OutputStream.Write($bytes, 0, $bytes.Length)
  } else {
    $res.StatusCode = 404
    $msg = [Text.Encoding]::UTF8.GetBytes("Not found: $path")
    $res.OutputStream.Write($msg, 0, $msg.Length)
  }
  $res.Close()
}
