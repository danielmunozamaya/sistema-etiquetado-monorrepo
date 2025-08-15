# Comprobar si se está ejecutando como administrador
$currentIdentity = [Security.Principal.WindowsIdentity]::GetCurrent()
$principal = New-Object Security.Principal.WindowsPrincipal($currentIdentity)
if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host "Este script debe ejecutarse como administrador. Por favor, reinícialo con permisos de administrador." -ForegroundColor Red
    exit 1
}

# Eliminar carpeta .git de la raíz si existe
$gitFolder = ".git"
if (Test-Path $gitFolder) {
    Remove-Item $gitFolder -Recurse -Force
    Write-Host "Carpeta .git eliminada."
}