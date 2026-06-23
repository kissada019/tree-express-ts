UPDATE orders
SET status = 'pending_payment'
WHERE status = 'pending';

ALTER TABLE orders
ALTER COLUMN status SET DEFAULT 'completed';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'orders_status_check'
  ) THEN
    ALTER TABLE orders
    ADD CONSTRAINT orders_status_check
    CHECK (status IN ('pending_payment', 'ready_to_ship', 'completed', 'cancelled'));
  END IF;
END $$;
