# Guía Paso a Paso: Pre-poblar Tabla Plans con Stripe Price IDs

## 📋 Paso 1: Obtener tus Stripe Price IDs

### 1.1. Ve a tu Dashboard de Stripe
1. Inicia sesión en [dashboard.stripe.com](https://dashboard.stripe.com)
2. Asegúrate de estar en **modo test** o **modo live** según corresponda

### 1.2. Encuentra tus Productos y Precios
1. Ve a **Products** en el menú lateral
2. Para cada producto, haz clic en él para ver sus precios
3. Cada precio tiene un **Price ID** que comienza con `price_`

### 1.3. Identifica los 6 Price IDs que necesitas:

**Setup Fee Plans:**
- ✅ Starter Setup → Busca el producto y copia el Price ID del precio de $199 (one-time)
- ✅ Pro Setup → Busca el producto y copia el Price ID del precio de $299 (one-time)

**Monthly Plans:**
- ✅ Monthly Basic → Busca el producto y copia el Price ID del precio de $39/mes (recurring)
- ✅ Monthly Pro → Busca el producto y copia el Price ID del precio de $59/mes (recurring)

**Lifetime Plans:**
- ✅ Lifetime Basic → Busca el producto y copia el Price ID del precio de $399 (one-time)
- ✅ Lifetime Pro → Busca el producto y copia el Price ID del precio de $499 (one-time)

### 1.4. Formato de los Price IDs
Los Price IDs se ven así: `price_1AbCdEfGhIjKlMnOpQrStUv`

---

## 📝 Paso 2: Actualizar el Schema de la Base de Datos

Si ya ejecutaste el schema anterior, necesitas actualizar la tabla `plans`:

```sql
-- Ejecuta esto en Supabase SQL Editor para cambiar EUR a USD
ALTER TABLE plans 
  RENAME COLUMN monthly_price_eur TO monthly_price_usd;

ALTER TABLE plans 
  RENAME COLUMN setup_fee_eur TO setup_fee_usd;

ALTER TABLE plans 
  RENAME COLUMN lifetime_price_eur TO lifetime_price_usd;
```

**O si prefieres empezar desde cero:**
1. Ve a Supabase Dashboard → SQL Editor
2. Ejecuta el nuevo `database/schema.sql` (ya actualizado con USD)

---

## 💾 Paso 3: Insertar los Planes en la Base de Datos

### 3.1. Abre el archivo `database/insert-plans.sql`

### 3.2. Reemplaza los Placeholders

En el archivo `database/insert-plans.sql`, encontrarás líneas como:

```sql
('Starter Setup', 0, 199, 0, 'price_xxxxxxxxxxxxxxxxxxxxx'),
```

**Reemplaza `price_xxxxxxxxxxxxxxxxxxxxx` con tu Price ID real de Stripe.**

### 3.3. Ejemplo Completo

Aquí tienes un ejemplo de cómo debería verse (con Price IDs de ejemplo):

```sql
-- Insertar planes de Setup Fee
INSERT INTO plans (name, monthly_price_usd, setup_fee_usd, lifetime_price_usd, stripe_price_setup_id)
VALUES
  ('Starter Setup', 0, 199, 0, 'price_1ABC123def456GHI789'),
  ('Pro Setup', 0, 299, 0, 'price_1XYZ789abc123DEF456');

-- Insertar planes mensuales
INSERT INTO plans (name, monthly_price_usd, setup_fee_usd, lifetime_price_usd, stripe_price_monthly_id)
VALUES
  ('Monthly Basic', 39, 0, 0, 'price_1MONTHLY123456789'),
  ('Monthly Pro', 59, 0, 0, 'price_1MONTHLY987654321');

-- Insertar planes Lifetime
INSERT INTO plans (name, monthly_price_usd, setup_fee_usd, lifetime_price_usd, stripe_price_lifetime_id)
VALUES
  ('Lifetime Basic', 0, 0, 399, 'price_1LIFETIME123456'),
  ('Lifetime Pro', 0, 0, 499, 'price_1LIFETIME654321');
```

### 3.4. Ejecuta el SQL en Supabase

1. Ve a tu **Supabase Dashboard**
2. Abre **SQL Editor**
3. Copia y pega tu SQL actualizado (con tus Price IDs reales)
4. Haz clic en **Run** o presiona `Ctrl+Enter`
5. Verifica que aparezca "Success. No rows returned" o que veas los 6 planes listados

### 3.5. Verificar que se insertaron correctamente

Ejecuta esta consulta para verificar:

```sql
SELECT id, name, 
       monthly_price_usd, 
       setup_fee_usd, 
       lifetime_price_usd,
       stripe_price_setup_id, 
       stripe_price_monthly_id, 
       stripe_price_lifetime_id
FROM plans
ORDER BY name;
```

Deberías ver los 6 planes con sus Price IDs correctos.

---

## ✅ Paso 4: Verificar que el Código Funciona

### 4.1. El código ya está actualizado

El archivo `app/api/checkout/route.ts` ya está configurado para:
- ✅ Buscar el plan por nombre en la base de datos
- ✅ Obtener el Price ID correcto según el tipo (setup/monthly/lifetime)
- ✅ Usar ese Price ID para crear la sesión de checkout

### 4.2. Probar el Checkout

1. Inicia tu servidor: `npm run dev`
2. Ve a `/pricing`
3. Haz clic en cualquier botón de checkout
4. Deberías ser redirigido a Stripe Checkout con el precio correcto

---

## 🔍 Solución de Problemas

### Error: "Plan not found"
- Verifica que el nombre del plan en `components/PricingCards.tsx` coincida exactamente con el nombre en la base de datos
- Los nombres deben ser exactamente: "Starter Setup", "Pro Setup", "Monthly Basic", "Monthly Pro", "Lifetime Basic", "Lifetime Pro"

### Error: "Price ID not found for this plan type"
- Verifica que insertaste el Price ID correcto en la columna correcta:
  - `stripe_price_setup_id` para planes de setup
  - `stripe_price_monthly_id` para planes mensuales
  - `stripe_price_lifetime_id` para planes lifetime

### Los precios no se muestran correctamente
- Verifica que los precios en la base de datos estén en USD (no EUR)
- El código ya está actualizado para mostrar `$` en lugar de `€`

---

## 📌 Resumen

1. ✅ Obtén tus 6 Stripe Price IDs del dashboard
2. ✅ Actualiza el schema si es necesario (EUR → USD)
3. ✅ Edita `database/insert-plans.sql` con tus Price IDs reales
4. ✅ Ejecuta el SQL en Supabase
5. ✅ Verifica que los planes se insertaron correctamente
6. ✅ Prueba el checkout

¡Listo! Tu aplicación ahora usará los Price IDs reales de Stripe desde la base de datos.

