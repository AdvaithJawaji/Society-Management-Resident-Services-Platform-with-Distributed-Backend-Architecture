USE society_management;

CREATE TABLE IF NOT EXISTS feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    resident_id INT NOT NULL,
    rating INT NOT NULL CHECK(rating >= 1 AND rating <= 5),
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (resident_id) REFERENCES residents(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS service_providers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category ENUM('PLUMBER', 'ELECTRICIAN', 'MAID', 'CARPENTER', 'SECURITY') NOT NULL,
    phone VARCHAR(20) NOT NULL,
    rating DECIMAL(2,1) DEFAULT 5.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    event_date DATETIME NOT NULL,
    location VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS email_outbox (
    id INT AUTO_INCREMENT PRIMARY KEY,
    recipient_email VARCHAR(100) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    status ENUM('PENDING', 'SENT', 'FAILED') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sent_at TIMESTAMP NULL
);

-- Seed some default data
INSERT IGNORE INTO service_providers (id, name, category, phone, rating) VALUES
(1, 'Raju Plumber', 'PLUMBER', '9876500001', 4.8),
(2, 'Sharma Electricals', 'ELECTRICIAN', '9876500002', 4.5),
(3, 'Sita Bai', 'MAID', '9876500003', 4.9);

INSERT IGNORE INTO events (id, title, description, event_date, location) VALUES
(1, 'Diwali Celebration', 'Annual society Diwali gathering', DATE_ADD(CURDATE(), INTERVAL 15 DAY), 'Community Hall'),
(2, 'AGM Meeting', 'Annual General Meeting for budget discussion', DATE_ADD(CURDATE(), INTERVAL 7 DAY), 'Clubhouse');

INSERT IGNORE INTO feedback (id, resident_id, rating, comments) VALUES
(1, 1, 5, 'Great society management system!'),
(2, 2, 4, 'Need better parking facilities.');
