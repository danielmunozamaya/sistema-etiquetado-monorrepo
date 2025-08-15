# Eliminar carpeta .git de la raíz si existe
$gitFolder = ".git"
if (Test-Path $gitFolder) {
    Remove-Item $gitFolder -Recurse -Force
    Write-Host "Carpeta .git eliminada."
}