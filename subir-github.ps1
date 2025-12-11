# Script para subir PricingOS a GitHub
# Ejecuta este script en PowerShell: .\subir-github.ps1

Write-Host "🚀 Inicializando repositorio Git..." -ForegroundColor Green

# Inicializar Git
git init

Write-Host "✅ Git inicializado" -ForegroundColor Green

Write-Host "📦 Agregando archivos..." -ForegroundColor Green

# Agregar todos los archivos
git add .

Write-Host "✅ Archivos agregados" -ForegroundColor Green

Write-Host "💾 Creando commit inicial..." -ForegroundColor Green

# Crear commit
git commit -m "Initial commit: PricingOS MVP - Complete micro-SaaS for freelancer pricing"

Write-Host "✅ Commit creado" -ForegroundColor Green

Write-Host ""
Write-Host "📝 PRÓXIMOS PASOS MANUALES:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Ve a https://github.com y crea un nuevo repositorio" -ForegroundColor Cyan
Write-Host "2. NO inicialices con README (ya tienes uno)" -ForegroundColor Cyan
Write-Host "3. Copia la URL de tu repositorio (ej: https://github.com/TU_USUARIO/pricingos.git)" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. Luego ejecuta estos comandos (reemplaza TU_USUARIO y pricingos):" -ForegroundColor Yellow
Write-Host ""
Write-Host "   git remote add origin https://github.com/TU_USUARIO/pricingos.git" -ForegroundColor White
Write-Host "   git branch -M main" -ForegroundColor White
Write-Host "   git push -u origin main" -ForegroundColor White
Write-Host ""
Write-Host "5. Para deployar en Vercel, sigue las instrucciones en DEPLOY.md" -ForegroundColor Cyan
Write-Host ""

