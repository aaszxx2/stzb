<#
.SYNOPSIS
  生成热更新包并更新版本清单

.DESCRIPTION
  将 dist/ 目录（排除 updates/ 子目录）打包为 zip，
  输出到 dist/updates/app-{version}.zip，
  同时更新 dist/updates/manifest.json 中的版本号和下载地址。

.PARAMETER Version
  新版本号，如 2.0.1

.EXAMPLE
  .\scripts\make-update.ps1 -Version 2.0.1
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$Version
)

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
$distDir = Join-Path $projectRoot "dist"
$updatesDir = Join-Path $distDir "updates"
$tempDir = Join-Path $env:TEMP "stzb-update-$Version"
$zipPath = Join-Path $updatesDir "app-$Version.zip"
$manifestPath = Join-Path $updatesDir "manifest.json"

Write-Host "=== 率土军费账本 - 热更新包生成 ===" -ForegroundColor Cyan
Write-Host "版本号: $Version"
Write-Host ""

# 1. 检查 dist 目录
if (-not (Test-Path $distDir)) {
    Write-Error "dist 目录不存在，请先运行 npm run build"
    exit 1
}

# 2. 创建 updates 目录
if (-not (Test-Path $updatesDir)) {
    New-Item -ItemType Directory -Path $updatesDir -Force | Out-Null
}

# 3. 清理临时目录
if (Test-Path $tempDir) {
    Remove-Item $tempDir -Recurse -Force
}
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

# 4. 复制 dist 内容到临时目录（排除 updates 子目录）
Write-Host "[1/4] 复制 Web 资源..." -ForegroundColor Yellow
Get-ChildItem -Path $distDir -Exclude "updates" | ForEach-Object {
    Copy-Item $_.FullName -Destination (Join-Path $tempDir $_.Name) -Recurse -Force
}

# 5. 打包为 zip
Write-Host "[2/4] 打包更新包..." -ForegroundColor Yellow
if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
}
Compress-Archive -Path (Join-Path $tempDir "*") -DestinationPath $zipPath -CompressionLevel Optimal

$zipSize = [math]::Round((Get-Item $zipPath).Length / 1MB, 2)
Write-Host "  更新包: app-$Version.zip ($zipSize MB)"

# 6. 更新 manifest.json
Write-Host "[3/4] 更新版本清单..." -ForegroundColor Yellow
$manifest = @{
    version = $Version
    url = "https://aaszxx2.github.io/stzb/updates/app-$Version.zip"
    notes = "版本 $Version 更新"
}
$manifest | ConvertTo-Json -Depth 5 | Set-Content -Path $manifestPath -Encoding UTF8
Write-Host "  manifest.json 已更新"

# 7. 清理临时目录
Write-Host "[4/4] 清理临时文件..." -ForegroundColor Yellow
Remove-Item $tempDir -Recurse -Force

Write-Host ""
Write-Host "=== 完成 ===" -ForegroundColor Green
Write-Host "更新包路径: $zipPath"
Write-Host "清单路径: $manifestPath"
Write-Host ""
Write-Host "下一步:" -ForegroundColor Cyan
Write-Host "  1. 将 dist/updates/ 目录部署到 GitHub Pages"
Write-Host "  2. 手机 APK 启动后会自动检测到 v$Version 更新"
Write-Host "  3. 用户点击'立即更新'即可自动下载并重启"
