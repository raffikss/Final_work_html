CREATE DATABASE IF NOT EXISTS kebab_place;
USE kebab_place;


CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('customer', 'admin', 'staff') DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT IGNORE INTO users (username, email, password, role) VALUES 
('admin', 'admin@kebabplace.com', 'admin', 'admin'),
('user', 'user@gmail.com', 'user', 'customer'),
('staff', 'staff@kebabplace.com', 'staff', 'staff');