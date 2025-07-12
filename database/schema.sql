CREATE DATABASE attendance_system;
USE attendance_system;

-- Admins table (for admin users with roles)
CREATE TABLE admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  institution VARCHAR(255),
  role ENUM('super_admin', 'event_admin') DEFAULT 'event_admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Events table (for events/purposes created by admins)
CREATE TABLE events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  purpose VARCHAR(255) NOT NULL,
  admin_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
);

-- Users table (for attendees registered for events)
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  event_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL
);

-- Attendance table (records scanned QR codes)
CREATE TABLE attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  event_id INT,
  time DATETIME NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- Card Designs table (stores card templates for QR codes)
CREATE TABLE card_designs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  admin_id INT,
  template_name VARCHAR(255) NOT NULL,
  design_json TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
);

-- Notification Logs table (tracks email notifications)
CREATE TABLE notification_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  event_id INT,
  type ENUM('registration', 'attendance') NOT NULL,
  status ENUM('sent', 'failed') NOT NULL,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL
);

ALTER TABLE events
  ADD COLUMN date DATE NULL,
  ADD COLUMN location VARCHAR(255) NULL;

CREATE TABLE event_registration_links (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  registration_link VARCHAR(512) NOT NULL,
  qr_code LONGTEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);