-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  employee_number VARCHAR(20) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  civil_number VARCHAR(20),
  sector VARCHAR(100),
  directorate VARCHAR(100),
  department VARCHAR(100),
  role VARCHAR(20) NOT NULL CHECK (role IN ('employee', 'supervisor', 'monitor', 'admin')),
  email VARCHAR(150),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Fingerprint forms table
CREATE TABLE IF NOT EXISTS forms (
  id SERIAL PRIMARY KEY,
  uuid VARCHAR(36) UNIQUE NOT NULL,
  employee_id INTEGER REFERENCES users(id),
  sector VARCHAR(100),
  directorate VARCHAR(100),
  department VARCHAR(100),
  day_name VARCHAR(20),
  date DATE,
  fingerprint_presence BOOLEAN DEFAULT FALSE,
  fingerprint_departure BOOLEAN DEFAULT FALSE,
  status VARCHAR(30) DEFAULT 'pending_supervisor'
    CHECK (status IN ('pending_supervisor', 'pending_monitor', 'pending_admin', 'approved', 'rejected')),
  submitted_at TIMESTAMP DEFAULT NOW(),

  -- Supervisor approval
  supervisor_id INTEGER REFERENCES users(id),
  supervisor_signature TEXT,
  supervisor_approved_at TIMESTAMP,
  supervisor_rejected_reason TEXT,

  -- Monitor approval
  monitor_id INTEGER REFERENCES users(id),
  monitor_signature TEXT,
  monitor_approved_at TIMESTAMP,
  monitor_rejected_reason TEXT,
  monitor_skipped BOOLEAN DEFAULT FALSE,

  -- Admin approval
  admin_id INTEGER REFERENCES users(id),
  admin_signature TEXT,
  admin_approved_at TIMESTAMP,
  admin_rejected_reason TEXT
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  message TEXT NOT NULL,
  form_id INTEGER REFERENCES forms(id),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
