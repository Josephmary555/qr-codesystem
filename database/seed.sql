USE attendance_system;

-- Sample admins (1 Super Admin, 1 Event Admin)
INSERT INTO admins (name, email, password, institution, role) VALUES
('John Doe', 'superadmin@example.com', '$2b$10$examplehashedpassword123', 'Example University', 'super_admin'),
('Jane Smith', 'eventadmin@example.com', '$2b$10$examplehashedpassword456', 'Example College', 'event_admin');

-- Sample events
INSERT INTO events (purpose, admin_id) VALUES
('Annual Conference', 1),
('Workshop on AI', 2);

-- Sample users
INSERT INTO users (name, email, event_id) VALUES
('Alice Johnson', 'alice@example.com', 1),
('Bob Wilson', 'bob@example.com', 1),
('Charlie Brown', 'charlie@example.com', 2);

-- Sample attendance records
INSERT INTO attendance (user_id, event_id, time) VALUES
(1, 1, '2025-07-06 09:00:00'),
(2, 1, '2025-07-06 09:15:00'),
(3, 2, '2025-07-06 10:00:00');

-- Sample card designs
INSERT INTO card_designs (admin_id, template_name, design_json) VALUES
(1, 'Default Template', '{"text":"User Name","color":"#000000","bgColor":"#ffffff"}'),
(2, 'Blue Template', '{"text":"Attendee","color":"#0000ff","bgColor":"#e6f3ff"}');

-- Sample notification logs
INSERT INTO notification_logs (user_id, event_id, type, status) VALUES
(1, 1, 'registration', 'sent'),
(2, 1, 'attendance', 'sent'),
(3, 2, 'registration', 'failed');