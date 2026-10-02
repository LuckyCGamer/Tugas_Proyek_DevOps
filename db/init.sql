-- File ini untuk development lokal.
-- PERINGATAN: DROP TABLE menghapus data lama setiap kali file dijalankan ulang.

CREATE DATABASE IF NOT EXISTS laundry_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE laundry_db;

DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS services;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') NOT NULL DEFAULT 'user'
);

CREATE TABLE services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  price_per_kg DECIMAL(10,2) NOT NULL
);

CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  service_id INT NOT NULL,
  weight DECIMAL(5,2) NOT NULL,
  total_price DECIMAL(12,2) NOT NULL,
  status ENUM('Pending', 'Proses', 'Selesai') NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE RESTRICT
);

-- ===== DATA TESTING (hanya untuk lokal) =====

INSERT INTO services (name, price_per_kg) VALUES
  ('Cuci Kering', 6000),
  ('Cuci + Setrika', 8000),
  ('Express', 12000);

INSERT INTO users (name, phone, address, username, password, role) VALUES
  ('Administrator', '081200000000', 'Kantor Laundry', 'admin', 'admin123', 'admin'),
  ('Budi Santoso', '081211111111', 'Jl. Melati No. 1', 'budi', 'user123', 'user'),
  ('Siti Aminah', '081222222222', 'Jl. Mawar No. 2', 'siti', 'user123', 'user'),
  ('Andi Pratama', '081233333333', 'Jl. Kenanga No. 3', 'andi', 'user123', 'user');

INSERT INTO orders (user_id, service_id, weight, total_price, status) VALUES
  (2, 1, 3.5, 21000, 'Selesai'),
  (3, 2, 2.0, 16000, 'Proses'),
  (2, 3, 4.0, 48000, 'Pending');