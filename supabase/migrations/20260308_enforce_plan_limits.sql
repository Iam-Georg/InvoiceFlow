-- Server-side enforcement of plan limits via trigger.
-- Prevents bypassing client-side checks by calling Supabase API directly.

-- Invoice limit trigger
CREATE OR REPLACE FUNCTION check_invoice_limit()
RETURNS TRIGGER AS $$
DECLARE
  user_plan TEXT;
  invoice_count INT;
BEGIN
  SELECT plan INTO user_plan FROM profiles WHERE id = NEW.user_id;

  -- Unlimited plans
  IF user_plan IN ('professional', 'business') THEN
    RETURN NEW;
  END IF;

  SELECT COUNT(*) INTO invoice_count
  FROM invoices
  WHERE user_id = NEW.user_id;

  -- Starter: 10 invoices
  IF user_plan = 'starter' AND invoice_count >= 10 THEN
    RAISE EXCEPTION 'Rechnungslimit für Starter-Plan erreicht (max. 10)';
  END IF;

  -- Free: 3 invoices
  IF (user_plan IS NULL OR user_plan = 'free') AND invoice_count >= 3 THEN
    RAISE EXCEPTION 'Rechnungslimit für Free-Plan erreicht (max. 3)';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS enforce_invoice_limit ON invoices;
CREATE TRIGGER enforce_invoice_limit
  BEFORE INSERT ON invoices
  FOR EACH ROW EXECUTE FUNCTION check_invoice_limit();

-- Customer limit trigger
CREATE OR REPLACE FUNCTION check_customer_limit()
RETURNS TRIGGER AS $$
DECLARE
  user_plan TEXT;
  customer_count INT;
BEGIN
  SELECT plan INTO user_plan FROM profiles WHERE id = NEW.user_id;

  -- Starter and above: unlimited customers
  IF user_plan IN ('starter', 'professional', 'business') THEN
    RETURN NEW;
  END IF;

  SELECT COUNT(*) INTO customer_count
  FROM customers
  WHERE user_id = NEW.user_id;

  -- Free: 1 customer
  IF (user_plan IS NULL OR user_plan = 'free') AND customer_count >= 1 THEN
    RAISE EXCEPTION 'Kundenlimit für Free-Plan erreicht (max. 1)';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS enforce_customer_limit ON customers;
CREATE TRIGGER enforce_customer_limit
  BEFORE INSERT ON customers
  FOR EACH ROW EXECUTE FUNCTION check_customer_limit();
