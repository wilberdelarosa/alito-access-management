-- ALITO Access Management - Initial Schema
-- Auto-generated migration

-- ========== EMPLOYEES TABLE ==========
CREATE TABLE IF NOT EXISTS employees (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  company TEXT,
  "docId" TEXT,
  "jobTitle" TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations
CREATE POLICY "Enable all operations for employees" ON employees
  FOR ALL USING (true) WITH CHECK (true);

-- ========== STATES TABLE ==========
CREATE TABLE IF NOT EXISTS states (
  id TEXT PRIMARY KEY,
  state TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  FOREIGN KEY (id) REFERENCES employees(id) ON DELETE CASCADE
);

ALTER TABLE states ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all operations for states" ON states
  FOR ALL USING (true) WITH CHECK (true);

-- ========== REQUESTS TABLE ==========
CREATE TABLE IF NOT EXISTS requests (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('PC', 'CC')),
  status TEXT NOT NULL CHECK (status IN ('DRAFT', 'PENDING', 'APPROVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
  "employeeIds" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  "createdBy" TEXT DEFAULT 'system',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all operations for requests" ON requests
  FOR ALL USING (true) WITH CHECK (true);

-- ========== INDEXES ==========
CREATE INDEX IF NOT EXISTS idx_employees_company ON employees(company);
CREATE INDEX IF NOT EXISTS idx_requests_type ON requests(type);
CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_created_at ON requests("createdAt");

-- ========== TRIGGERS FOR UPDATED_AT ==========
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_states_updated_at BEFORE UPDATE ON states
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_requests_updated_at BEFORE UPDATE ON requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
