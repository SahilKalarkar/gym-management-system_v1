-- Create Database
CREATE DATABASE gym_db;
USE gym_db;

-- Members Table
CREATE TABLE members (
    id INT PRIMARY KEY AUTO_INCREMENT,
    member_id VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15) NOT NULL,
    membership_type ENUM('Basic', 'Premium', 'Elite') NOT NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    join_date DATE NOT NULL,
    photo VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Payments Table
CREATE TABLE payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    payment_id VARCHAR(20) UNIQUE NOT NULL,
    member_id INT NOT NULL,
    member_name VARCHAR(100) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status ENUM('paid', 'pending', 'failed') DEFAULT 'pending',
    payment_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);

-- Trainers Table
CREATE TABLE trainers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    specialty VARCHAR(100) NOT NULL,
    phone VARCHAR(15),
    email VARCHAR(100),
    photo VARCHAR(255),
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Classes Table
CREATE TABLE classes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    trainer_id INT,
    schedule VARCHAR(255),
    capacity INT DEFAULT 20,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trainer_id) REFERENCES trainers(id) ON DELETE SET NULL
);

-- Sample Data
INSERT INTO members (member_id, name, email, phone, membership_type, status, join_date) VALUES
('MEM001', 'Rahul Sharma', 'rahul@email.com', '9876543210', 'Premium', 'active', '2026-01-15'),
('MEM002', 'Priya Patel', 'priya@email.com', '9876543211', 'Elite', 'active', '2026-02-01'),
('MEM003', 'Amit Singh', 'amit@email.com', '9876543212', 'Basic', 'inactive', '2026-01-20');

INSERT INTO payments (payment_id, member_id, member_name, amount, status, payment_date) VALUES
('PAY001', 1, 'Rahul Sharma', 1999.00, 'paid', '2026-03-01'),
('PAY002', 2, 'Priya Patel', 2999.00, 'paid', '2026-03-15'),
('PAY003', 3, 'Amit Singh', 999.00, 'pending', '2026-03-20');

INSERT INTO trainers (name, specialty, phone, email) VALUES
('John Doe', 'Yoga Trainer', '9876543215', 'john@gym.com'),
('Jane Smith', 'HIIT Coach', '9876543216', 'jane@gym.com');
