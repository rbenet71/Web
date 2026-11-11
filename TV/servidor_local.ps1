$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
$root = (Get-Location).Path
$port = 8765
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
try { $listener.Start() } catch { Write-Host "No se pudo abrir el puerto $port : $_"; Read-Host 'Intro para cerrar'; exit 1 }
Write-Host "TV Libre IPTV en http://localhost:$port/ - pulsa Ctrl+C para cerrar"
Start-Process "http://localhost:$port/"
$mime = @{'.html'='text/html; charset=utf-8';'.js'='application/javascript; charset=utf-8';'.css'='text/css; charset=utf-8';'.json'='application/json; charset=utf-8';'.webmanifest'='application/manifest+json';'.png'='image/png';'.svg'='image/svg+xml';'.ico'='image/x-icon'}
try {
 while ($listener.IsListening) {
  $ctx = $listener.GetContext()
  try {
   $relative = [uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath.TrimStart('/'))
   if (-not $relative) { $relative='index.html' }
   $full = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($root,$relative.Replace('/', [System.IO.Path]::DirectorySeparatorChar)))
   $prefix = $root.TrimEnd([System.IO.Path]::DirectorySeparatorChar) + [System.IO.Path]::DirectorySeparatorChar
   if (-not $full.StartsWith($prefix,[StringComparison]::OrdinalIgnoreCase)) { $ctx.Response.StatusCode=403 }
   elseif (-not [System.IO.File]::Exists($full)) { $ctx.Response.StatusCode=404 }
   else {
    $bytes=[System.IO.File]::ReadAllBytes($full)
    $ext=[System.IO.Path]::GetExtension($full).ToLowerInvariant()
    $ctx.Response.ContentType=if($mime.ContainsKey($ext)){$mime[$ext]}else{'application/octet-stream'}
    $ctx.Response.ContentLength64=$bytes.Length
    $ctx.Response.OutputStream.Write($bytes,0,$bytes.Length)
   }
  } catch {try{$ctx.Response.StatusCode=500}catch{}} finally {try{$ctx.Response.Close()}catch{}}
 }
} finally { $listener.Stop();$listener.Close() }
