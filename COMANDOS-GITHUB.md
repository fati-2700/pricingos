# 📤 Comandos para Subir a GitHub

## Opción 1: Usar el Script Automático (Recomendado)

1. Abre PowerShell en la carpeta del proyecto
2. Ejecuta:
```powershell
.\subir-github.ps1
```

## Opción 2: Comandos Manuales

### Paso 1: Inicializar Git

```bash
git init
```

### Paso 2: Agregar Archivos

```bash
git add .
```

### Paso 3: Crear Commit

```bash
git commit -m "Initial commit: PricingOS MVP"
```

### Paso 4: Crear Repositorio en GitHub

1. Ve a [github.com](https://github.com)
2. Haz clic en **"+"** → **"New repository"**
3. Nombre: `pricingos` (o el que prefieras)
4. **NO marques** "Initialize with README"
5. Haz clic en **"Create repository"**

### Paso 5: Conectar y Subir

```bash
# Reemplaza TU_USUARIO con tu usuario de GitHub
git remote add origin https://github.com/TU_USUARIO/pricingos.git

# Cambiar a rama main
git branch -M main

# Subir código
git push -u origin main
```

Si te pide autenticación:
- Usa un **Personal Access Token** (GitHub → Settings → Developer settings → Personal access tokens)
- O usa GitHub CLI: `gh auth login`

---

## 🚀 Después de Subir a GitHub

Sigue las instrucciones en **[DEPLOY.md](./DEPLOY.md)** para deployar en Vercel.


