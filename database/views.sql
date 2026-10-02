USE society_management;

-- View: Payment Summary
CREATE OR REPLACE VIEW view_payment_summary AS
SELECT 
    b.billing_month,
    f.flat_number,
    f.block,
    r.name AS resident_name,
    b.amount AS bill_amount,
    COALESCE(SUM(p.amount), 0) AS total_paid,
    b.status
FROM maintenance_bills b
JOIN flats f ON b.flat_id = f.id
LEFT JOIN residents r ON f.id = r.flat_id
LEFT JOIN payments p ON b.id = p.bill_id
GROUP BY b.id, b.billing_month, f.flat_number, f.block, r.name, b.amount, b.status;


-- View: Pending Maintenance
CREATE OR REPLACE VIEW view_pending_maintenance AS
SELECT 
    f.flat_number,
    r.name AS resident_name,
    r.phone,
    b.billing_month,
    b.amount,
    b.due_date,
    b.status
FROM maintenance_bills b
JOIN flats f ON b.flat_id = f.id
JOIN residents r ON f.id = r.flat_id
WHERE b.status IN ('UNPAID', 'OVERDUE');


-- View: Complaint Summary
CREATE OR REPLACE VIEW view_complaint_summary AS
SELECT 
    c.id,
    c.title,
    c.category,
    c.priority,
    c.status,
    f.flat_number,
    r.name AS resident_name,
    u.username AS assigned_staff,
    c.created_at,
    c.resolved_date
FROM complaints c
JOIN flats f ON c.flat_id = f.id
JOIN residents r ON c.resident_id = r.id
LEFT JOIN users u ON c.assigned_to = u.id;


-- View: Visitor Activity
CREATE OR REPLACE VIEW view_visitor_activity AS
SELECT 
    vl.id AS log_id,
    v.name AS visitor_name,
    v.phone,
    f.flat_number,
    vl.purpose,
    vl.entry_time,
    vl.exit_time,
    vl.status,
    u.username AS recorded_by_staff
FROM visitor_logs vl
JOIN visitors v ON vl.visitor_id = v.id
JOIN flats f ON vl.flat_id = f.id
LEFT JOIN users u ON vl.recorded_by = u.id;
