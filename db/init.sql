CREATE DATABASE IF NOT EXISTS ecommerce_db;
USE ecommerce_db;

CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR(100),
  stock INT DEFAULT 0,
  image_url VARCHAR(255) DEFAULT 'placeholder.jpg'
);

CREATE TABLE customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150),
  address VARCHAR(255)
);

CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Contoh data awal produk (pakai placeholder, tinggal diganti nanti)
INSERT INTO products (name, price, category, stock, image_url) VALUES
('Demon Slayer Frame', 20.00, 'Poster', 50, 'placeholder.jpg'),
('Eren AOT Printed T-shirt', 15.00, 'Apparel', 30, 'placeholder.jpg'),
('Naruto Hoodie', 25.00, 'Apparel', 20, 'placeholder.jpg');