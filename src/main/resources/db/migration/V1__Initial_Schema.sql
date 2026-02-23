-- V1: Initial Schema for Statify

-- Each file upload session
CREATE TABLE IF NOT EXISTS uploads (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename    VARCHAR(255) NOT NULL,
    file_type   VARCHAR(10) NOT NULL CHECK (file_type IN ('csv', 'pdf')),
    status      VARCHAR(20) NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    row_count   INTEGER,
    error_msg   TEXT,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Categories (system-seeded + user-managed)
CREATE TABLE IF NOT EXISTS categories (
    id        SERIAL PRIMARY KEY,
    name      VARCHAR(100) NOT NULL UNIQUE,
    color     VARCHAR(7) NOT NULL DEFAULT '#6366F1',
    is_system BOOLEAN NOT NULL DEFAULT FALSE
);

-- Keyword → category mapping rules
CREATE TABLE IF NOT EXISTS categorization_rules (
    id          SERIAL PRIMARY KEY,
    keyword     VARCHAR(255) NOT NULL,
    category_id INTEGER NOT NULL REFERENCES categories(id),
    priority    INTEGER NOT NULL DEFAULT 0,
    match_count INTEGER NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Parsed transactions
CREATE TABLE IF NOT EXISTS transactions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    upload_id       UUID NOT NULL REFERENCES uploads(id) ON DELETE CASCADE,
    txn_date        DATE NOT NULL,
    description     TEXT NOT NULL,
    amount          NUMERIC(15, 2) NOT NULL,  -- positive = credit, negative = debit
    currency        CHAR(3) NOT NULL DEFAULT 'THB',
    category_id     INTEGER REFERENCES categories(id),
    matched_rule_id INTEGER REFERENCES categorization_rules(id),
    is_override     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Anomaly flags
CREATE TABLE IF NOT EXISTS anomalies (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    rule_name      VARCHAR(50) NOT NULL,
    severity       VARCHAR(10) NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH')),
    detail         JSONB,
    status         VARCHAR(20) NOT NULL DEFAULT 'open'
                       CHECK (status IN ('open', 'confirmed', 'dismissed')),
    reviewed_at    TIMESTAMPTZ,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed Initial Categories
INSERT INTO categories (name, color, is_system) VALUES
('Food & Drink', '#EF4444', TRUE),
('Transport', '#F59E0B', TRUE),
('Shopping', '#10B981', TRUE),
('Bills & Utilities', '#3B82F6', TRUE),
('Healthcare', '#8B5CF6', TRUE),
('Transfer', '#6366F1', TRUE),
('Salary', '#059669', TRUE),
('Other', '#94A3B8', TRUE)
ON CONFLICT (name) DO NOTHING;
