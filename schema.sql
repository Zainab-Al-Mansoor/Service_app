-- On-Demand Service Database Schema
-- MySQL Database

-- Create Database
CREATE DATABASE IF NOT EXISTS ondemand_service_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ondemand_service_db;

-- Roles Table
CREATE TABLE IF NOT EXISTS roles (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    role_name ENUM('customer', 'provider', 'admin') NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    phone VARCHAR(50),
    avatar_url VARCHAR(500),
    role_id CHAR(36) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT,
    INDEX idx_users_email (email),
    INDEX idx_users_role (role_id)
);

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_categories_active (is_active)
);

-- Services Table
CREATE TABLE IF NOT EXISTS services (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    provider_id CHAR(36) NOT NULL,
    category_id CHAR(36),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    duration_minutes INT NOT NULL DEFAULT 60,
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_services_provider (provider_id),
    INDEX idx_services_category (category_id),
    INDEX idx_services_active (is_active)
);

-- Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    customer_id CHAR(36) NOT NULL,
    service_id CHAR(36) NOT NULL,
    provider_id CHAR(36) NOT NULL,
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    status ENUM('pending', 'accepted', 'rejected', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
    address TEXT NOT NULL,
    notes TEXT,
    total_amount DECIMAL(10, 2) NOT NULL,
    cancellation_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_bookings_customer (customer_id),
    INDEX idx_bookings_provider (provider_id),
    INDEX idx_bookings_status (status),
    INDEX idx_bookings_date (scheduled_date)
);

-- Provider Availability Table
CREATE TABLE IF NOT EXISTS provider_availability (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    provider_id CHAR(36) NOT NULL,
    day_of_week TINYINT NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_availability_provider (provider_id)
);

-- Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    booking_id CHAR(36) NOT NULL UNIQUE,
    customer_id CHAR(36) NOT NULL,
    provider_id CHAR(36) NOT NULL,
    rating TINYINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_reviews_provider (provider_id)
);

-- Insert Default Roles
INSERT IGNORE INTO roles (id, role_name, description) VALUES
    (UUID(), 'customer', 'Regular customer who can browse and book services'),
    (UUID(), 'provider', 'Service provider who can offer services'),
    (UUID(), 'admin', 'Administrator with full access to the system');

-- Insert Default Categories
INSERT IGNORE INTO categories (id, name, description, sort_order) VALUES
    (UUID(), 'Home Cleaning', 'Professional home cleaning services', 1),
    (UUID(), 'Plumbing', 'Pipe repair, installation, and maintenance', 2),
    (UUID(), 'Electrical', 'Electrical repairs and installations', 3),
    (UUID(), 'Beauty & Wellness', 'Salon and spa services at home', 4),
    (UUID(), 'Appliance Repair', 'Repair for home appliances', 5),
    (UUID(), 'Painting', 'Interior and exterior painting services', 6),
    (UUID(), 'AC Services', 'Air conditioning repair and maintenance', 7),
    (UUID(), 'Pest Control', 'Professional pest management', 8);

-- Create Default Admin User (password: admin123456)
-- Note: bcrypt hash with 10 salt rounds. IMPORTANT: Change password after first login!
INSERT IGNORE INTO users (id, email, password, full_name, role_id, is_verified, is_active)
SELECT
    UUID(),
    'admin@servicehub.com',
    '$2a$10$mzQsbSeanYJ.jKVPuIMvN.NhlBj1Ie2wwMLQK.pKhmTMNdlTBXwH2',
    'System Admin',
    id,
    TRUE,
    TRUE
FROM roles WHERE role_name = 'admin';

-- Create Views for Common Queries
CREATE OR REPLACE VIEW booking_details AS
SELECT
    b.*,
    c.full_name AS customer_name,
    c.email AS customer_email,
    c.phone AS customer_phone,
    p.full_name AS provider_name,
    p.email AS provider_email,
    s.name AS service_name,
    s.price AS service_price,
    s.duration_minutes,
    cat.name AS category_name
FROM bookings b
JOIN users c ON b.customer_id = c.id
JOIN users p ON b.provider_id = p.id
JOIN services s ON b.service_id = s.id
LEFT JOIN categories cat ON s.category_id = cat.id;

CREATE OR REPLACE VIEW service_details AS
SELECT
    s.*,
    p.full_name AS provider_name,
    p.email AS provider_email,
    p.phone AS provider_phone,
    p.avatar_url AS provider_avatar,
    p.is_verified AS provider_verified,
    c.name AS category_name
FROM services s
JOIN users p ON s.provider_id = p.id
LEFT JOIN categories c ON s.category_id = c.id;
