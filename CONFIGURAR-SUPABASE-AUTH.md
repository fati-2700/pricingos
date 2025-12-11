# 🔧 Configurar Supabase Auth para Producción

## Problema

Cuando haces clic en el enlace de confirmación del email, te redirige a `localhost` en lugar de tu URL de producción.

## Solución: Configurar URLs de Redirección en Supabase

### Paso 1: Ir a la Configuración de Auth en Supabase

1. Ve a tu [Supabase Dashboard](https://app.supabase.com)
2. Selecciona tu proyecto
3. Ve a **Authentication** → **URL Configuration** (en el menú lateral)

### Paso 2: Configurar Site URL

En **Site URL**, pon tu URL de producción:

```
https://tu-proyecto.vercel.app
```

### Paso 3: Configurar Redirect URLs

En **Redirect URLs**, agrega estas URLs (una por línea):

```
https://tu-proyecto.vercel.app/signup
https://tu-proyecto.vercel.app/dashboard
http://localhost:3000/signup
http://localhost:3000/dashboard
```

**Importante**: 
- Agrega tanto la URL de producción como la de desarrollo
- Las URLs deben ser exactas (incluyendo `/signup` o `/dashboard`)
- No agregues una barra final (`/`) al final

### Paso 4: Guardar Cambios

Haz clic en **"Save"** para guardar los cambios.

---

## Verificación

### En Producción:

1. Ve a tu URL de Vercel: `https://tu-proyecto.vercel.app/signup`
2. Ingresa tu email
3. Revisa tu email y haz clic en el enlace de confirmación
4. Deberías ser redirigido a `https://tu-proyecto.vercel.app/signup` (no a localhost)

### En Desarrollo Local:

1. Ve a `http://localhost:3000/signup`
2. Ingresa tu email
3. El enlace debería redirigir a `http://localhost:3000/signup`

---

## Notas Importantes

### Variables de Entorno

Asegúrate de que en Vercel tengas configurado:

```
NEXT_PUBLIC_APP_URL=https://tu-proyecto.vercel.app
```

Aunque el código ahora usa `window.location.origin` automáticamente, es buena práctica tener esta variable configurada.

### Email Templates (Opcional)

Si quieres personalizar el email de confirmación:

1. Ve a **Authentication** → **Email Templates**
2. Selecciona **"Confirm signup"**
3. Puedes personalizar el contenido del email
4. El enlace `{{ .ConfirmationURL }}` se reemplazará automáticamente

---

## Solución de Problemas

### El enlace sigue yendo a localhost

1. Verifica que las Redirect URLs en Supabase incluyan tu URL de producción
2. Verifica que no haya espacios o caracteres extra en las URLs
3. Limpia la caché del navegador
4. Prueba en modo incógnito

### Error: "Invalid redirect URL"

- Verifica que la URL esté exactamente en la lista de Redirect URLs
- Asegúrate de que no haya diferencias (http vs https, con/sin www, etc.)

### El email no llega

- Revisa la carpeta de spam
- Verifica que el email esté correcto
- En modo test, revisa los logs de Supabase: **Authentication** → **Logs**

---

## Resumen

✅ **Site URL**: `https://tu-proyecto.vercel.app`  
✅ **Redirect URLs**: Agrega todas las URLs donde quieres redirigir después del login  
✅ **Variables de Entorno**: Configura `NEXT_PUBLIC_APP_URL` en Vercel  

¡Listo! Los enlaces de confirmación deberían funcionar correctamente en producción.

