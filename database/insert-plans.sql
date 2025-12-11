-- Script para insertar planes con tus Stripe Price IDs
-- Este script primero actualiza las columnas si están en EUR, luego inserta los planes

-- Paso 1: Actualizar columnas de EUR a USD (si es necesario)
-- Ejecuta esto solo si tu tabla todavía tiene columnas con _eur

DO $$
BEGIN
  -- Verificar si existe monthly_price_eur y renombrar a monthly_price_usd
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'plans' AND column_name = 'monthly_price_eur'
  ) THEN
    ALTER TABLE plans RENAME COLUMN monthly_price_eur TO monthly_price_usd;
  END IF;

  -- Verificar si existe setup_fee_eur y renombrar a setup_fee_usd
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'plans' AND column_name = 'setup_fee_eur'
  ) THEN
    ALTER TABLE plans RENAME COLUMN setup_fee_eur TO setup_fee_usd;
  END IF;

  -- Verificar si existe lifetime_price_eur y renombrar a lifetime_price_usd
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'plans' AND column_name = 'lifetime_price_eur'
  ) THEN
    ALTER TABLE plans RENAME COLUMN lifetime_price_eur TO lifetime_price_usd;
  END IF;
END $$;

-- Paso 2: Eliminar planes existentes (opcional - descomenta si quieres empezar limpio)
-- DELETE FROM plans;

-- Paso 3: Insertar planes de Setup Fee
INSERT INTO plans (name, monthly_price_usd, setup_fee_usd, lifetime_price_usd, stripe_price_setup_id)
VALUES
  ('Starter Setup', 0, 199, 0, 'price_1Sd7HtLde0a3fzQxbf2ZgrE3'),
  ('Pro Setup', 0, 299, 0, 'price_1Sd7IMLde0a3fzQxKKjDmQiE');

-- Paso 4: Insertar planes mensuales
INSERT INTO plans (name, monthly_price_usd, setup_fee_usd, lifetime_price_usd, stripe_price_monthly_id)
VALUES
  ('Monthly Basic', 39, 0, 0, 'price_1Sd7ItLde0a3fzQxavNLmerk'),
  ('Monthly Pro', 59, 0, 0, 'price_1Sd7JILde0a3fzQxgwExmF75');

-- Paso 5: Insertar planes Lifetime
INSERT INTO plans (name, monthly_price_usd, setup_fee_usd, lifetime_price_usd, stripe_price_lifetime_id)
VALUES
  ('Lifetime Basic', 0, 0, 399, 'price_1Sd7JvLde0a3fzQx83tg0l8o'),
  ('Lifetime Pro', 0, 0, 499, 'price_1Sd7KMLde0a3fzQxrJQsgVCP');

-- Paso 6: Verificar que se insertaron correctamente
SELECT id, name, monthly_price_usd, setup_fee_usd, lifetime_price_usd, 
       stripe_price_setup_id, stripe_price_monthly_id, stripe_price_lifetime_id
FROM plans
ORDER BY name;
