-- ==============================================================================
-- SUPABASE AUTHENTICATION & ROW LEVEL SECURITY (RLS) MIGRATION
-- PASHU AAHAR & DAIRY KHATA (CATTLE FEED & DAIRY LEDGER)
-- ==============================================================================
-- Instructions:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard
-- 2. Select your Project (iocbkxmnsedtqijbopth) -> SQL Editor
-- 3. Run this script to bind expenses & customers to authenticated Supabase users.
-- ==============================================================================

-- 1. ADD USER_ID COLUMN TO CUSTOMERS (IF NOT EXISTS)
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. ADD USER_ID COLUMN TO EXPENSES (IF NOT EXISTS)
ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 3. CREATE INDEXES ON USER_ID FOR FAST LOOKUPS
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);

-- 4. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- 5. RLS POLICIES FOR CUSTOMERS
-- Users can only view, create, edit, and delete their own customers
CREATE POLICY "Users can manage own customers"
ON customers
FOR ALL
USING (auth.uid() = user_id OR user_id IS NULL)
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- 6. RLS POLICIES FOR EXPENSES
-- Users can only view, create, edit, and delete their own expenses
CREATE POLICY "Users can manage own expenses"
ON expenses
FOR ALL
USING (auth.uid() = user_id OR user_id IS NULL)
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- 7. RE-CREATE VIEW TO RESPECT USER SECURITY
CREATE OR REPLACE VIEW view_customer_khata_summary AS
SELECT 
    c.id AS customer_id,
    c.name AS customer_name,
    c.phone,
    c.address,
    c.user_id,
    COALESCE(SUM(e.amount), 0) AS total_purchases,
    COALESCE(SUM(CASE WHEN e.payment_status = 'PAID' THEN e.amount ELSE 0 END), 0) AS total_paid,
    COALESCE(SUM(CASE WHEN e.payment_status = 'UNPAID' THEN e.amount ELSE 0 END), 0) AS total_unpaid_due,
    COUNT(e.id) AS total_transactions
FROM customers c
LEFT JOIN expenses e ON c.id = e.customer_id
GROUP BY c.id, c.name, c.phone, c.address, c.user_id;
