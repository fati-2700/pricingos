-- Script para corregir la tabla plans si tiene columnas en EUR
-- Ejecuta esto PRIMERO si obtienes errores sobre columnas que no existen

-- Verificar y renombrar columnas de EUR a USD
DO $$
BEGIN
  -- Renombrar monthly_price_eur a monthly_price_usd
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'plans' 
    AND column_name = 'monthly_price_eur'
  ) THEN
    ALTER TABLE plans RENAME COLUMN monthly_price_eur TO monthly_price_usd;
    RAISE NOTICE 'Columna monthly_price_eur renombrada a monthly_price_usd';
  ELSE
    RAISE NOTICE 'Columna monthly_price_eur no existe o ya fue renombrada';
  END IF;

  -- Renombrar setup_fee_eur a setup_fee_usd
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'plans' 
    AND column_name = 'setup_fee_eur'
  ) THEN
    ALTER TABLE plans RENAME COLUMN setup_fee_eur TO setup_fee_usd;
    RAISE NOTICE 'Columna setup_fee_eur renombrada a setup_fee_usd';
  ELSE
    RAISE NOTICE 'Columna setup_fee_eur no existe o ya fue renombrada';
  END IF;

  -- Renombrar lifetime_price_eur a lifetime_price_usd
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'plans' 
    AND column_name = 'lifetime_price_eur'
  ) THEN
    ALTER TABLE plans RENAME COLUMN lifetime_price_eur TO lifetime_price_usd;
    RAISE NOTICE 'Columna lifetime_price_eur renombrada a lifetime_price_usd';
  ELSE
    RAISE NOTICE 'Columna lifetime_price_eur no existe o ya fue renombrada';
  END IF;
END $$;

-- Verificar la estructura de la tabla
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'plans'
ORDER BY ordinal_position;

