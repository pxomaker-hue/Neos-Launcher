$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem

$repo = Split-Path -Parent $PSScriptRoot
$source = Join-Path $repo 'archive/releases/v0.6/neos-nextcloud35-v0.6.34.zip'
$output = Join-Path $repo 'archive/releases/v0.6/neos-nextcloud35-v0.6.35.zip'
$tempRoot = [System.IO.Path]::GetFullPath([System.IO.Path]::GetTempPath())
$work = Join-Path $tempRoot ('neos-v0635-' + [guid]::NewGuid().ToString('N'))
$work = [System.IO.Path]::GetFullPath($work)
if (-not $work.StartsWith($tempRoot.TrimEnd([System.IO.Path]::DirectorySeparatorChar) + [System.IO.Path]::DirectorySeparatorChar, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw 'Temporary build path is outside the temporary directory'
}
$changed = @(
    'novadashboard/js/app.js',
    'novadashboard/appinfo/info.xml',
    'novadashboard/CHANGELOG.md',
    'novadashboard/PLAN-v0.7.md'
)

[System.IO.Directory]::CreateDirectory($work) | Out-Null
$original = $null
try {
    $original = [System.IO.Compression.ZipFile]::OpenRead($source)
    $files = @($original.Entries | Where-Object { $_.Name })
    if ($files.Count -ne 162) { throw "Expected 162 v0.6.34 files, got $($files.Count)" }
    foreach ($name in $changed) {
        $entry = $original.GetEntry($name)
        if ($null -eq $entry) { throw "Missing $name in v0.6.34" }
        $target = Join-Path $work ($name -replace '/', [System.IO.Path]::DirectorySeparatorChar)
        [System.IO.Directory]::CreateDirectory((Split-Path -Parent $target)) | Out-Null
        $input = $entry.Open()
        $outputStream = [System.IO.File]::Create($target)
        try { $input.CopyTo($outputStream) } finally { $input.Dispose(); $outputStream.Dispose() }
    }
    $info = Get-Content -LiteralPath (Join-Path $work 'novadashboard/appinfo/info.xml') -Raw
    if (-not $info.Contains('<version>0.6.34</version>')) { throw 'Input ZIP is not v0.6.34' }
    & node (Join-Path $PSScriptRoot 'patch-v0635.js') (Join-Path $work 'novadashboard')
    if ($LASTEXITCODE -ne 0) { throw 'Patch failed' }
    $js = Join-Path $work 'novadashboard/js/app.js'
    & node --check $js
    if ($LASTEXITCODE -ne 0) { throw 'JavaScript syntax check failed' }
    & node (Join-Path $PSScriptRoot 'test-v0635.js') $js
    if ($LASTEXITCODE -ne 0) { throw 'Widget tests failed' }

    $candidate = Join-Path $work 'candidate.zip'
    $release = [System.IO.Compression.ZipFile]::Open($candidate, [System.IO.Compression.ZipArchiveMode]::Create)
    try {
        foreach ($entry in $files) {
            $newEntry = $release.CreateEntry($entry.FullName, [System.IO.Compression.CompressionLevel]::Optimal)
            $newEntry.LastWriteTime = $entry.LastWriteTime
            if ($changed -contains $entry.FullName) {
                $input = [System.IO.File]::OpenRead((Join-Path $work ($entry.FullName -replace '/', [System.IO.Path]::DirectorySeparatorChar)))
            } else {
                $input = $entry.Open()
            }
            $outputStream = $newEntry.Open()
            try { $input.CopyTo($outputStream) } finally { $input.Dispose(); $outputStream.Dispose() }
        }
    } finally { $release.Dispose() }
    $check = [System.IO.Compression.ZipFile]::OpenRead($candidate)
    try {
        $newFiles = @($check.Entries | Where-Object { $_.Name })
        if ($newFiles.Count -ne 162) { throw 'Output file count changed' }
        foreach ($entry in $newFiles) {
            $input = $entry.Open()
            try { $input.CopyTo([System.IO.Stream]::Null) } finally { $input.Dispose() }
        }
        $versionReader = [System.IO.StreamReader]::new($check.GetEntry('novadashboard/appinfo/info.xml').Open())
        try { $newInfo = $versionReader.ReadToEnd() } finally { $versionReader.Dispose() }
        if (-not $newInfo.Contains('<version>0.6.35</version>')) { throw 'Output version mismatch' }
    } finally { $check.Dispose() }
    Move-Item -LiteralPath $candidate -Destination $output -Force
    Write-Output "Published build: $output"
    Write-Output "SHA256: $((Get-FileHash -LiteralPath $output -Algorithm SHA256).Hash)"
} finally {
    if ($null -ne $original) { $original.Dispose() }
    if (Test-Path -LiteralPath $work) {
        $resolved = [System.IO.Path]::GetFullPath($work)
        if (-not $resolved.StartsWith($tempRoot.TrimEnd([System.IO.Path]::DirectorySeparatorChar) + [System.IO.Path]::DirectorySeparatorChar, [System.StringComparison]::OrdinalIgnoreCase)) {
            throw 'Refusing to remove a path outside the temporary directory'
        }
        Remove-Item -LiteralPath $resolved -Recurse -Force
    }
}
