param([string]$Path)
$bytes = [IO.File]::ReadAllBytes($Path)
for ($i = 0; $i -lt $bytes.Length - 8; $i++) {
  if ($bytes[$i] -eq 0x6D -and $bytes[$i + 1] -eq 0x76 -and $bytes[$i + 2] -eq 0x68 -and $bytes[$i + 3] -eq 0x64) {
    $ver = $bytes[$i + 8]
    if ($ver -eq 0) {
      $timescale = [BitConverter]::ToUInt32($bytes, $i + 20)
      if ([BitConverter]::IsLittleEndian) {
        $b = [BitConverter]::GetBytes($timescale); [Array]::Reverse($b)
        $timescale = [BitConverter]::ToUInt32($b, 0)
      }
      $duration = [BitConverter]::ToUInt32($bytes, $i + 24)
      if ([BitConverter]::IsLittleEndian) {
        $b = [BitConverter]::GetBytes($duration); [Array]::Reverse($b)
        $duration = [BitConverter]::ToUInt32($b, 0)
      }
    } else {
      $timescale = [BitConverter]::ToUInt32($bytes, $i + 28)
      if ([BitConverter]::IsLittleEndian) {
        $b = [BitConverter]::GetBytes($timescale); [Array]::Reverse($b)
        $timescale = [BitConverter]::ToUInt32($b, 0)
      }
      $duration = [BitConverter]::ToUInt64($bytes, $i + 32)
      if ([BitConverter]::IsLittleEndian) {
        $b = [BitConverter]::GetBytes($duration); [Array]::Reverse($b)
        $duration = [BitConverter]::ToUInt64($b, 0)
      }
    }
    $sec = $duration / $timescale
    Write-Output $sec
    exit 0
  }
}
Write-Error "mvhd not found"
exit 1
