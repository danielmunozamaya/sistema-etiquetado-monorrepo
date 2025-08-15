Write-Host "Iniciando despliegue."

# Comprobar si se está ejecutando como administrador
$currentIdentity = [Security.Principal.WindowsIdentity]::GetCurrent()
$principal = New-Object Security.Principal.WindowsPrincipal($currentIdentity)
if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host "Este script debe ejecutarse como administrador. Por favor, reinícialo con permisos de administrador." -ForegroundColor Red
    exit 1
}

# Comprobar .envs antes de parar pm2
$envs = @(
    "backend/.env",
    "backend/.env.prod",
    "frontend/.env.production",
    "frontend/.prod.env"
)
$allOk = $true

foreach ($envFile in $envs) {
    if (-Not (Test-Path $envFile)) {
        Write-Host "Falta el archivo $envFile" -ForegroundColor Red
        $allOk = $false
    } else {
        $lines = Get-Content $envFile | Where-Object {$_ -match "="}
        foreach ($line in $lines) {
            if ($line -match "^\s*#") { continue }
            $kv = $line -split "=", 2
            if ($kv.Count -ne 2 -or [string]::IsNullOrWhiteSpace($kv[1])) {
                Write-Host "Variable sin valor en ${envFile}: $line" -ForegroundColor Red
                $allOk = $false
            }
        }
    }
}

if (-not $allOk) {
    Write-Host "Corrige los archivos .env antes de continuar." -ForegroundColor Red
    exit 1
}

# Parar y borrar proceso en pm2
pm2 stop etiquetado-backend
pm2 delete etiquetado-backend
pm2 save --force
pm2-startup install

# Instalar dependencias backend (yarn)
Set-Location backend
yarn install
Set-Location ..

# Instalar dependencias frontend (npm)
Set-Location frontend
npm install
Set-Location ..

# Build frontend y copiar a backend/public
Set-Location frontend
npm run build
Set-Location ..

$publicFolder = "backend/public"
if (Test-Path $publicFolder) {
    Remove-Item "$publicFolder\*" -Recurse -Force
}
Copy-Item "frontend/dist/*" $publicFolder -Recurse -Force
Write-Host "Build copiado a backend/public"

# Build backend
Set-Location backend
yarn run build

# Desplegar en pm2
pm2 start ecosystem.config.js
pm2 save --force
pm2-startup install
Set-Location ..

Write-Host "Despliegue completado."