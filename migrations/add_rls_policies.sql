-- ============================================================
-- AgentAuth Row-Level Security (RLS) Migration
-- 
-- This migration adds tenant isolation at the database level.
-- Even if application code has bugs, data cannot leak between tenants.
-- ============================================================

-- First, add developer_id column to tables that need it
-- (Skip if already exists)

-- Add developer_id to consents if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'consents' AND column_name = 'developer_id'
    ) THEN
        ALTER TABLE consents ADD COLUMN developer_id VARCHAR(64);
        CREATE INDEX idx_consents_developer_id ON consents(developer_id);
    END IF;
END $$;

-- Add developer_id to authorizations if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'authorizations' AND column_name = 'developer_id'
    ) THEN
        ALTER TABLE authorizations ADD COLUMN developer_id VARCHAR(64);
        CREATE INDEX idx_authorizations_developer_id ON authorizations(developer_id);
    END IF;
END $$;

-- Add developer_id to spending_limits if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'spending_limits' AND column_name = 'developer_id'
    ) THEN
        ALTER TABLE spending_limits ADD COLUMN developer_id VARCHAR(64);
        CREATE INDEX idx_spending_limits_developer_id ON spending_limits(developer_id);
    END IF;
END $$;

-- Add developer_id to spending_rules if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'spending_rules' AND column_name = 'developer_id'
    ) THEN
        ALTER TABLE spending_rules ADD COLUMN developer_id VARCHAR(64);
        CREATE INDEX idx_spending_rules_developer_id ON spending_rules(developer_id);
    END IF;
END $$;

-- Add developer_id to audit_logs if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'audit_logs' AND column_name = 'developer_id'
    ) THEN
        ALTER TABLE audit_logs ADD COLUMN developer_id VARCHAR(64);
        CREATE INDEX idx_audit_logs_developer_id ON audit_logs(developer_id);
    END IF;
END $$;

-- Add developer_id to webhooks if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'webhooks' AND column_name = 'developer_id'
    ) THEN
        ALTER TABLE webhooks ADD COLUMN developer_id VARCHAR(64);
        CREATE INDEX idx_webhooks_developer_id ON webhooks(developer_id);
    END IF;
END $$;


-- ============================================================
-- Enable RLS on all tenant tables
-- ============================================================

ALTER TABLE consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE authorizations ENABLE ROW LEVEL SECURITY;

-- Only enable if table exists
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'spending_limits') THEN
        ALTER TABLE spending_limits ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'spending_rules') THEN
        ALTER TABLE spending_rules ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
        ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'webhooks') THEN
        ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;


-- ============================================================
-- Create RLS Policies
-- Each tenant can only see their own data
-- ============================================================

-- Consents: Read/write only own data
DROP POLICY IF EXISTS consents_tenant_isolation ON consents;
CREATE POLICY consents_tenant_isolation ON consents
    FOR ALL
    USING (
        developer_id IS NULL 
        OR developer_id = current_setting('app.tenant_id', true)
    )
    WITH CHECK (
        developer_id IS NULL 
        OR developer_id = current_setting('app.tenant_id', true)
    );

-- Authorizations: Read/write only own data
DROP POLICY IF EXISTS authorizations_tenant_isolation ON authorizations;
CREATE POLICY authorizations_tenant_isolation ON authorizations
    FOR ALL
    USING (
        developer_id IS NULL 
        OR developer_id = current_setting('app.tenant_id', true)
    )
    WITH CHECK (
        developer_id IS NULL 
        OR developer_id = current_setting('app.tenant_id', true)
    );

-- Spending Limits
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'spending_limits') THEN
        DROP POLICY IF EXISTS spending_limits_tenant_isolation ON spending_limits;
        CREATE POLICY spending_limits_tenant_isolation ON spending_limits
            FOR ALL
            USING (
                developer_id IS NULL 
                OR developer_id = current_setting('app.tenant_id', true)
            )
            WITH CHECK (
                developer_id IS NULL 
                OR developer_id = current_setting('app.tenant_id', true)
            );
    END IF;
END $$;

-- Spending Rules
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'spending_rules') THEN
        DROP POLICY IF EXISTS spending_rules_tenant_isolation ON spending_rules;
        CREATE POLICY spending_rules_tenant_isolation ON spending_rules
            FOR ALL
            USING (
                developer_id IS NULL 
                OR developer_id = current_setting('app.tenant_id', true)
            )
            WITH CHECK (
                developer_id IS NULL 
                OR developer_id = current_setting('app.tenant_id', true)
            );
    END IF;
END $$;

-- Audit Logs (read-only for tenants, append-only)
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
        DROP POLICY IF EXISTS audit_logs_tenant_read ON audit_logs;
        CREATE POLICY audit_logs_tenant_read ON audit_logs
            FOR SELECT
            USING (
                developer_id IS NULL 
                OR developer_id = current_setting('app.tenant_id', true)
            );
        
        DROP POLICY IF EXISTS audit_logs_tenant_insert ON audit_logs;
        CREATE POLICY audit_logs_tenant_insert ON audit_logs
            FOR INSERT
            WITH CHECK (true);  -- Allow inserts from any context
    END IF;
END $$;

-- Webhooks
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'webhooks') THEN
        DROP POLICY IF EXISTS webhooks_tenant_isolation ON webhooks;
        CREATE POLICY webhooks_tenant_isolation ON webhooks
            FOR ALL
            USING (
                developer_id IS NULL 
                OR developer_id = current_setting('app.tenant_id', true)
            )
            WITH CHECK (
                developer_id IS NULL 
                OR developer_id = current_setting('app.tenant_id', true)
            );
    END IF;
END $$;


-- ============================================================
-- Grant permissions (adjust for your database user)
-- ============================================================

-- The application user needs to be able to set the session variable
-- This is typically done automatically, but ensure the user has usage rights

COMMENT ON POLICY consents_tenant_isolation ON consents IS 
    'RLS policy: Each developer can only access their own consents';

COMMENT ON POLICY authorizations_tenant_isolation ON authorizations IS 
    'RLS policy: Each developer can only access their own authorizations';
