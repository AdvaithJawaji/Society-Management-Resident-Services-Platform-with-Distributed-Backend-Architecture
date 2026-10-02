USE society_management;

-- Users
CREATE INDEX idx_users_username ON users(username);

-- Flats
CREATE INDEX idx_flats_flat_number ON flats(flat_number);

-- Residents
CREATE INDEX idx_residents_phone ON residents(phone);

-- Maintenance Bills
CREATE INDEX idx_bills_status ON maintenance_bills(status);
CREATE INDEX idx_bills_month ON maintenance_bills(billing_month);

-- Payments
CREATE INDEX idx_payments_bill_id ON payments(bill_id);

-- Visitors
CREATE INDEX idx_visitors_phone ON visitors(phone);

-- Visitor Logs
CREATE INDEX idx_visitor_logs_status ON visitor_logs(status);
CREATE INDEX idx_visitor_logs_entry ON visitor_logs(entry_time);

-- Complaints
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_flat ON complaints(flat_id);

-- Notices
CREATE INDEX idx_notices_active ON notices(is_active);
