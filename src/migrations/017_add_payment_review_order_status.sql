ALTER TABLE orders
DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE orders
ADD CONSTRAINT orders_status_check
CHECK (status IN ('pending_payment', 'payment_review', 'ready_to_ship', 'completed', 'cancelled'));
