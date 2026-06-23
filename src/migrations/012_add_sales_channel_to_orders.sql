ALTER TABLE orders
ADD COLUMN IF NOT EXISTS sales_channel TEXT NOT NULL DEFAULT 'in_store';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'orders_sales_channel_check'
  ) THEN
    ALTER TABLE orders
    ADD CONSTRAINT orders_sales_channel_check
    CHECK (sales_channel IN ('in_store', 'online'));
  END IF;
END $$;
