USE society_management;

-- Vehicles Table
CREATE TABLE IF NOT EXISTS vehicles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    resident_id INT NOT NULL,
    vehicle_number VARCHAR(50) NOT NULL UNIQUE,
    type ENUM('2_WHEELER', '4_WHEELER') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (resident_id) REFERENCES residents(id) ON DELETE CASCADE
);

-- Facilities Table
CREATE TABLE IF NOT EXISTS facilities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    capacity INT NOT NULL,
    status ENUM('AVAILABLE', 'MAINTENANCE', 'CLOSED') DEFAULT 'AVAILABLE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert Default Facilities
INSERT IGNORE INTO facilities (id, name, capacity) VALUES 
(1, 'Community Hall', 100),
(2, 'Gymnasium', 20),
(3, 'Swimming Pool', 30);

-- Facility Bookings Table
CREATE TABLE IF NOT EXISTS facility_bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    resident_id INT NOT NULL,
    facility_id INT NOT NULL,
    booking_date DATE NOT NULL,
    time_slot VARCHAR(50) NOT NULL,
    status ENUM('CONFIRMED', 'CANCELLED') DEFAULT 'CONFIRMED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (resident_id) REFERENCES residents(id) ON DELETE CASCADE,
    FOREIGN KEY (facility_id) REFERENCES facilities(id) ON DELETE CASCADE
);

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(255) NOT NULL,
    details TEXT,
    ip_address VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Alter Complaints for SLA
ALTER TABLE complaints
ADD COLUMN sla_breached BOOLEAN DEFAULT FALSE;

-- Add Token to Visitor Logs for QR
ALTER TABLE visitor_logs
ADD COLUMN pass_token VARCHAR(255) UNIQUE;
