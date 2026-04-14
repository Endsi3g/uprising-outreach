param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("Desktop", "Local")]
    [string]$Target = "Desktop"
)

# Configuration
$FRONTEND_DIR = "frontend"
$BACKEND_DIR = "backend"

# ── 1. Automatic Version Increment ───────────────────────────────────────────
Write-Host "`n[1/3] Mise à jour de la version..." -ForegroundColor Cyan
Set-Location $FRONTEND_DIR

# Check current version
$pkg = Get-Content package.json | ConvertFrom-Json
$currentVersion = $pkg.version

# If version is still 0.1.0, and we want v1.2.1
if ($currentVersion -eq "0.1.0") {
    Write-Host "Initialisation de la version à 1.2.1..." -ForegroundColor Yellow
    npm version 1.2.1 --no-git-tag-version
} else {
    npm version patch --no-git-tag-version
}

$newPkg = Get-Content package.json | ConvertFrom-Json
$newVersion = $newPkg.version
Write-Host "Nouvelle version : v$newVersion" -ForegroundColor Green
Set-Location ".."

# ── 2. Git Automation ────────────────────────────────────────────────────────
Write-Host "`n[2/3] Synchronisation Git..." -ForegroundColor Cyan
git add .
git commit -m "chore(release): v$newVersion - Production Ready Build"
git push origin main

# ── 3. Targeted Build ────────────────────────────────────────────────────────
if ($Target -eq "Desktop") {
    Write-Host "`n[3/3] Construction pour Desktop (Electron .exe)..." -ForegroundColor Cyan
    Set-Location $FRONTEND_DIR
    npm run build:electron:full
    Set-Location ".."
    Write-Host "`nBuild terminé ! Artifact disponible dans frontend/dist/" -ForegroundColor Yellow
} else {
    Write-Host "`n[3/3] Construction pour Local (Production)..." -ForegroundColor Cyan
    Set-Location $FRONTEND_DIR
    npm run build
    Set-Location ".."
}

Write-Host "`n=== Déploiement Terminé : v$newVersion ($Target) ===" -ForegroundColor Green
