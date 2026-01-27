-- Run this SQL in Supabase SQL Editor (supabase.com/dashboard/project/{project}/sql)

-- Developers table (stores developer profiles)
CREATE TABLE IF NOT EXISTS developers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email TEXT NOT NULL,
  name TEXT,
  company TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- API Keys table (stores generated API keys)
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  developer_id UUID REFERENCES developers(id) ON DELETE CASCADE,
  key_prefix TEXT NOT NULL,  -- First 20 chars for display
  key_hash TEXT NOT NULL,     -- SHA256 hash of full key
  name TEXT NOT NULL DEFAULT 'Default',
  environment TEXT NOT NULL DEFAULT 'test' CHECK (environment IN ('test', 'live')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  revoked_at TIMESTAMP WITH TIME ZONE,
  last_used_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE developers ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Developers: Users can only see/edit their own developer profile
CREATE POLICY "Users can view own developer profile" ON developers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own developer profile" ON developers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own developer profile" ON developers
  FOR UPDATE USING (auth.uid() = user_id);

-- API Keys: Users can only see/edit keys for their developer account
CREATE POLICY "Users can view own api keys" ON api_keys
  FOR SELECT USING (
    developer_id IN (SELECT id FROM developers WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert own api keys" ON api_keys
  FOR INSERT WITH CHECK (
    developer_id IN (SELECT id FROM developers WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update own api keys" ON api_keys
  FOR UPDATE USING (
    developer_id IN (SELECT id FROM developers WHERE user_id = auth.uid())
  );

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_developers_user_id ON developers(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_developer_id ON api_keys(developer_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON api_keys(key_hash);

-- OTP Codes table (for 2FA verification)
CREATE TABLE IF NOT EXISTS otp_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('email', 'sms')),
  destination TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for OTP codes
ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;

-- OTP policy: Only service role can insert/select (via Netlify functions)
CREATE POLICY "Service role full access on otp_codes" ON otp_codes
  USING (true)
  WITH CHECK (true);

-- Index for OTP lookups
CREATE INDEX IF NOT EXISTS idx_otp_codes_destination ON otp_codes(destination);
CREATE INDEX IF NOT EXISTS idx_otp_codes_expires ON otp_codes(expires_at);

-- User Security Settings table (for 2FA preferences)
CREATE TABLE IF NOT EXISTS user_security_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  two_factor_method TEXT CHECK (two_factor_method IN ('email', 'sms')),
  phone_number TEXT,
  phone_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for security settings
ALTER TABLE user_security_settings ENABLE ROW LEVEL SECURITY;

-- Users can manage their own security settings
CREATE POLICY "Users can view own security settings" ON user_security_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own security settings" ON user_security_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own security settings" ON user_security_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- Index for security settings
CREATE INDEX IF NOT EXISTS idx_user_security_settings_user_id ON user_security_settings(user_id);
