param (
    [string]$ExtensionPath = (Join-Path $PSScriptRoot "..\chrome-extension")
)

# Resolve to absolute path
$ExtensionPath = (Get-Item $ExtensionPath).FullName

$ChromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"

if (-Not (Test-Path $ChromePath)) {
    $ChromePath = "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
}

if (-Not (Test-Path $ChromePath)) {
    Write-Host "Chrome n'a pas été trouvé aux emplacements par défaut." -ForegroundColor Red
    Write-Host "Veuillez charger l'extension manuellement via chrome://extensions" -ForegroundColor Yellow
    exit 1
}

Write-Host "Lancement de Chrome avec l'extension ProspectOS chargée depuis : $ExtensionPath" -ForegroundColor Green
Write-Host "Note : Cela peut ouvrir une nouvelle fenêtre ou un nouvel onglet si Chrome est déjà ouvert." -ForegroundColor Cyan

Start-Process -FilePath $ChromePath -ArgumentList "--load-extension=`"$ExtensionPath`""
