USE society_management;

INSERT INTO roles (role_name) VALUES ('ADMIN'), ('RESIDENT'), ('SECURITY');

-- Passwords are 'password123' hashed with bcrypt
INSERT INTO users (username, password_hash, role_id) VALUES 
('admin1', '$2b$10$O/r1pmgcGhcbNo7FHQu0meUoj3vT8RsJ5EShXtDHd2yKJslrLaaGG', 1),
('resident_a101', '$2b$10$O/r1pmgcGhcbNo7FHQu0meUoj3vT8RsJ5EShXtDHd2yKJslrLaaGG', 2),
('security_main', '$2b$10$O/r1pmgcGhcbNo7FHQu0meUoj3vT8RsJ5EShXtDHd2yKJslrLaaGG', 3);

INSERT INTO flats (flat_number, block, floor, type) VALUES 
('A101', 'A', 1, '2BHK'),
('A102', 'A', 1, '3BHK'),
('B201', 'B', 2, '2BHK');

INSERT INTO residents (user_id, flat_id, name, phone, email, move_in_date) VALUES 
(2, 1, 'John Doe', '9876543210', 'john@example.com', '2023-01-15');
