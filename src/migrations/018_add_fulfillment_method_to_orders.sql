ALTER TABLE orders
ADD COLUMN IF NOT EXISTS fulfillment_method TEXT NOT NULL DEFAULT 'delivery';

ALTER TABLE orders
DROP CONSTRAINT IF EXISTS orders_fulfillment_method_check;

ALTER TABLE orders
ADD CONSTRAINT orders_fulfillment_method_check
CHECK (fulfillment_method IN ('pickup', 'delivery'));
