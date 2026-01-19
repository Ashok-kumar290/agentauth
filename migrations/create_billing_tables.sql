-- Subscription and Usage Tables Migration
-- Run this after the existing migrations

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL UNIQUE,
    
    -- Stripe references
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255) UNIQUE,
    stripe_price_id VARCHAR(255),
    
    -- Plan info
    plan VARCHAR(20) NOT NULL DEFAULT 'free',
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    
    -- Billing period
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    
    -- Usage tracking
    api_calls_used INTEGER NOT NULL DEFAULT 0,
    api_calls_limit INTEGER NOT NULL DEFAULT 1000,
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    canceled_at TIMESTAMP,
    trial_end TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_plan CHECK (plan IN ('free', 'startup', 'pro', 'enterprise')),
    CONSTRAINT chk_status CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete', 'unpaid'))
);

-- Indexes for subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- Usage records table (high-volume)
CREATE TABLE IF NOT EXISTS usage_records (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    
    -- API call details
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    status_code INTEGER,
    
    -- Timing
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    response_time_ms INTEGER,
    
    -- Billing period
    billing_period VARCHAR(7) NOT NULL,  -- YYYY-MM
    
    -- Metadata
    ip_address VARCHAR(45),
    user_agent VARCHAR(500)
);

-- Indexes for usage_records
CREATE INDEX IF NOT EXISTS idx_usage_user_id ON usage_records(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_timestamp ON usage_records(timestamp);
CREATE INDEX IF NOT EXISTS idx_usage_billing_period ON usage_records(billing_period);
CREATE INDEX IF NOT EXISTS idx_usage_user_period ON usage_records(user_id, billing_period);
CREATE INDEX IF NOT EXISTS idx_usage_user_endpoint ON usage_records(user_id, endpoint);

-- Usage summaries table (aggregated)
CREATE TABLE IF NOT EXISTS usage_summaries (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    billing_period VARCHAR(7) NOT NULL,  -- YYYY-MM
    
    -- Aggregated counts
    total_api_calls INTEGER NOT NULL DEFAULT 0,
    consents_created INTEGER NOT NULL DEFAULT 0,
    authorizations_created INTEGER NOT NULL DEFAULT 0,
    verifications_performed INTEGER NOT NULL DEFAULT 0,
    
    -- Performance stats
    avg_response_time_ms INTEGER,
    error_count INTEGER NOT NULL DEFAULT 0,
    
    -- Timestamps
    first_call_at TIMESTAMP,
    last_call_at TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Unique constraint
    CONSTRAINT uq_usage_summary_user_period UNIQUE (user_id, billing_period)
);

-- Indexes for usage_summaries
CREATE INDEX IF NOT EXISTS idx_summary_user_id ON usage_summaries(user_id);
CREATE INDEX IF NOT EXISTS idx_summary_period ON usage_summaries(billing_period);

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for subscriptions
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for usage_summaries
DROP TRIGGER IF EXISTS update_usage_summaries_updated_at ON usage_summaries;
CREATE TRIGGER update_usage_summaries_updated_at
    BEFORE UPDATE ON usage_summaries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant RLS for subscriptions (if using multi-tenancy)
-- ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY subscriptions_user_policy ON subscriptions
--     USING (user_id = current_setting('app.user_id', true));
