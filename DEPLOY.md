# 🚀 Guía de Deployment - PricingOS

Esta guía te ayudará a subir tu proyecto a GitHub y deployarlo en Vercel.

## 📋 Paso 1: Preparar el Proyecto

### 1.1. Verificar que no hay archivos sensibles

Asegúrate de que NO estés subiendo:
- ❌ `.env.local` (ya está en .gitignore)
- ❌ `.env` (ya está en .gitignore)
- ❌ `node_modules/` (ya está en .gitignore)
- ❌ Cualquier archivo con API keys o secrets

### 1.2. Verificar .gitignore

El archivo `.gitignore` ya está configurado correctamente. Verifica que incluya:
- `.env*.local`
- `.env`
- `node_modules/`
- `.next/`
- `.vercel/`

---

## 📤 Paso 2: Subir a GitHub

### 2.1. Inicializar Git (si no lo has hecho)

Abre tu terminal en la carpeta del proyecto y ejecuta:

```bash
# Inicializar repositorio Git
git init

# Agregar todos los archivos
git add .

# Hacer el primer commit
git commit -m "Initial commit: PricingOS MVP"
```

### 2.2. Crear repositorio en GitHub

1. Ve a [github.com](https://github.com) e inicia sesión
2. Haz clic en el botón **"+"** (arriba a la derecha) → **"New repository"**
3. Configura el repositorio:
   - **Repository name**: `pricingos` (o el nombre que prefieras)
   - **Description**: "Micro-SaaS MVP for freelancer pricing"
   - **Visibility**: Private (recomendado) o Public
   - ❌ **NO marques** "Initialize with README" (ya tienes uno)
   - ❌ **NO marques** "Add .gitignore" (ya tienes uno)
4. Haz clic en **"Create repository"**

### 2.3. Conectar y subir el código

GitHub te mostrará comandos. Ejecuta estos (reemplaza `TU_USUARIO` con tu usuario de GitHub):

```bash
# Agregar el remoto de GitHub
git remote add origin https://github.com/TU_USUARIO/pricingos.git

# Cambiar a la rama main (si estás en otra)
git branch -M main

# Subir el código
git push -u origin main
```

Si te pide autenticación:
- **Opción 1**: Usa un Personal Access Token (Settings → Developer settings → Personal access tokens)
- **Opción 2**: Usa GitHub CLI: `gh auth login`

---

## 🌐 Paso 3: Deployar en Vercel

### 3.1. Crear cuenta en Vercel

1. Ve a [vercel.com](https://vercel.com)
2. Haz clic en **"Sign Up"**
3. Elige **"Continue with GitHub"** (recomendado)
4. Autoriza Vercel para acceder a tus repositorios

### 3.2. Importar el proyecto

1. En el dashboard de Vercel, haz clic en **"Add New..."** → **"Project"**
2. Selecciona tu repositorio `pricingos` de la lista
3. Haz clic en **"Import"**

### 3.3. Configurar el proyecto

Vercel detectará automáticamente que es un proyecto Next.js. Verifica:

- **Framework Preset**: Next.js
- **Root Directory**: `./` (raíz)
- **Build Command**: `npm run build` (automático)
- **Output Directory**: `.next` (automático)
- **Install Command**: `npm install` (automático)

### 3.4. Configurar Variables de Entorno

**⚠️ IMPORTANTE**: Antes de hacer deploy, configura todas las variables de entorno:

Haz clic en **"Environment Variables"** y agrega estas variables:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_supabase_service_role_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=tu_stripe_publishable_key
STRIPE_SECRET_KEY=tu_stripe_secret_key
STRIPE_WEBHOOK_SECRET=tu_stripe_webhook_secret

# App
NEXT_PUBLIC_APP_URL=https://tu-proyecto.vercel.app
```

**Nota**: Para `NEXT_PUBLIC_APP_URL`, primero haz el deploy y luego actualiza con tu URL real.

### 3.5. Hacer el Deploy

1. Haz clic en **"Deploy"**
2. Espera a que termine el build (2-5 minutos)
3. Una vez completado, verás tu URL: `https://tu-proyecto.vercel.app`

---

## 🔧 Paso 4: Configurar Webhook de Stripe

### 4.1. Obtener la URL de tu webhook

Tu webhook estará en: `https://tu-proyecto.vercel.app/api/webhooks/stripe`

### 4.2. Configurar en Stripe

1. Ve a [Stripe Dashboard](https://dashboard.stripe.com) → **Developers** → **Webhooks**
2. Haz clic en **"Add endpoint"**
3. Pega tu URL: `https://tu-proyecto.vercel.app/api/webhooks/stripe`
4. Selecciona estos eventos:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Haz clic en **"Add endpoint"**
6. Copia el **Signing secret** (empieza con `whsec_...`)

### 4.3. Actualizar Variable de Entorno

1. Ve a Vercel → Tu proyecto → **Settings** → **Environment Variables**
2. Actualiza `STRIPE_WEBHOOK_SECRET` con el nuevo secret
3. Haz clic en **"Save"**
4. Ve a **Deployments** → Haz clic en los 3 puntos del último deployment → **Redeploy**

---

## ✅ Paso 5: Verificar que Todo Funciona

### 5.1. Probar la aplicación

1. Visita tu URL de Vercel
2. Prueba el flujo completo:
   - Sign up / Login
   - Onboarding
   - Wizard
   - Generar paquetes
   - Checkout (usa tarjetas de prueba de Stripe)

### 5.2. Tarjetas de Prueba de Stripe

Para probar pagos, usa estas tarjetas:

- **Éxito**: `4242 4242 4242 4242`
- **Requiere autenticación**: `4000 0025 0000 3155`
- **Rechazada**: `4000 0000 0000 0002`

Cualquier fecha futura, cualquier CVC, cualquier código postal.

---

## 🔄 Actualizaciones Futuras

Cada vez que hagas cambios:

```bash
# Hacer cambios en tu código
git add .
git commit -m "Descripción de los cambios"
git push origin main
```

Vercel automáticamente:
1. Detectará el push
2. Hará un nuevo build
3. Deployará los cambios

---

## 🐛 Solución de Problemas

### Error: "Environment variable not found"
- Verifica que todas las variables estén configuradas en Vercel
- Asegúrate de que los nombres sean exactos (case-sensitive)

### Error: "Webhook signature verification failed"
- Verifica que `STRIPE_WEBHOOK_SECRET` esté correcto
- Asegúrate de usar el secret del endpoint correcto (test vs live)

### Error: "Plan not found" en checkout
- Verifica que los nombres de los planes en `components/PricingCards.tsx` coincidan exactamente con los de la base de datos
- Verifica que los planes estén insertados en Supabase

### Build falla en Vercel
- Revisa los logs en Vercel → Deployments → Logs
- Verifica que todas las dependencias estén en `package.json`
- Asegúrate de que no haya errores de TypeScript

---

## 📝 Checklist Final

Antes de considerar el deployment completo:

- [ ] Código subido a GitHub
- [ ] Proyecto deployado en Vercel
- [ ] Todas las variables de entorno configuradas
- [ ] Webhook de Stripe configurado
- [ ] URL de producción actualizada en `NEXT_PUBLIC_APP_URL`
- [ ] Probar signup/login
- [ ] Probar wizard y generación de paquetes
- [ ] Probar checkout con tarjeta de prueba
- [ ] Verificar que el webhook recibe eventos (Stripe Dashboard → Webhooks → Events)

---

¡Listo! Tu aplicación debería estar funcionando en producción. 🎉

