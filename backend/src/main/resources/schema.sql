-- UniMarket Database Schema - MySQL 8.0+
CREATE DATABASE IF NOT EXISTS unimarket CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE unimarket;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    avatar VARCHAR(500),
    role ENUM('USER', 'SELLER', 'ADMIN') DEFAULT 'USER',
    is_seller BOOLEAN DEFAULT FALSE,
    seller_approved BOOLEAN DEFAULT FALSE,
    shop_name VARCHAR(100),
    shop_description TEXT,
    shop_avatar VARCHAR(500),
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email), INDEX idx_role (role)
) ENGINE=InnoDB;

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    image VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(15, 2) NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    images TEXT,
    seller_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
    view_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    FULLTEXT INDEX idx_search (name, description)
) ENGINE=InnoDB;

-- Product variants table
CREATE TABLE IF NOT EXISTS product_variants (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    size VARCHAR(50),
    color VARCHAR(50),
    color_code VARCHAR(10),
    price DECIMAL(15, 2),
    quantity INT DEFAULT 0,
    sku VARCHAR(100) UNIQUE,
    images TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_product_variant (product_id, size, color)
) ENGINE=InnoDB;

-- Cart items table
CREATE TABLE IF NOT EXISTS cart_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    variant_id BIGINT,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL,
    UNIQUE KEY unique_user_product_variant (user_id, product_id, variant_id)
) ENGINE=InnoDB;

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    buyer_id BIGINT NOT NULL,
    seller_id BIGINT NOT NULL,
    total_amount DECIMAL(15, 2) NOT NULL,
    shipping_address TEXT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    note TEXT,
    payment_method ENUM('COD', 'VNPAY') DEFAULT 'COD',
    is_paid BOOLEAN DEFAULT FALSE,
    vnpay_txn_ref VARCHAR(100),
    status ENUM('PENDING', 'ADMIN_APPROVED', 'SELLER_CONFIRMED', 'SHIPPING', 'DELIVERED', 'CANCELLED') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    product_image VARCHAR(500),
    price DECIMAL(15, 2) NOT NULL,
    quantity INT NOT NULL,
    variant_id BIGINT,
    variant_size VARCHAR(50),
    variant_color VARCHAR(50),
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    type VARCHAR(50),
    link VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ========== SEED DATA ==========

-- Admin (pass: admin123)
INSERT INTO users (email, password, full_name, phone, role) VALUES
('admin@unimarket.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'Admin UniMarket', '0901234567', 'ADMIN');

-- Sellers (pass: 123456)
INSERT INTO users (email, password, full_name, phone, address, role, is_seller, seller_approved, shop_name, shop_description) VALUES
('techstore@gmail.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'Nguyễn Văn Tech', '0912345678', 'Hà Nội', 'SELLER', TRUE, TRUE, 'Tech Store Pro', 'Chuyên điện thoại, laptop chính hãng'),
('fashionista@gmail.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'Trần Thị Fashion', '0923456789', 'TP.HCM', 'SELLER', TRUE, TRUE, 'Fashionista VN', 'Thời trang nam nữ hot trend'),
('bookworm@gmail.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'Lê Minh Sách', '0934567890', 'Đà Nẵng', 'SELLER', TRUE, TRUE, 'Book Worm', 'Sách hay giá tốt'),
('sportking@gmail.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'Phạm Thể Thao', '0945678901', 'Hải Phòng', 'SELLER', TRUE, TRUE, 'Sport King', 'Đồ thể thao chính hãng'),
('beautyqueen@gmail.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'Hoàng Mỹ Phẩm', '0956789012', 'Cần Thơ', 'SELLER', TRUE, TRUE, 'Beauty Queen', 'Mỹ phẩm authentic 100%'),
('homemart@gmail.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'Vũ Gia Dụng', '0967890123', 'Nha Trang', 'SELLER', TRUE, TRUE, 'Home Mart', 'Đồ gia dụng thông minh');

-- Users (pass: 123456)
INSERT INTO users (email, password, full_name, phone, address, role) VALUES
('user1@gmail.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'Nguyễn Văn An', '0978901234', 'Q1, TP.HCM', 'USER'),
('user2@gmail.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'Trần Thị Bình', '0989012345', 'Q7, TP.HCM', 'USER'),
('user3@gmail.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'Lê Văn Cường', '0990123456', 'Hà Nội', 'USER'),
('user4@gmail.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'Phạm Thị Dung', '0901234560', 'Đà Nẵng', 'USER'),
('user5@gmail.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'Hoàng Văn Em', '0912345670', 'Huế', 'USER');

-- Categories
INSERT INTO categories (name, description, image) VALUES
('Điện thoại', 'Smartphone và phụ kiện', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400'),
('Laptop', 'Laptop và máy tính', 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400'),
('Thời trang Nam', 'Quần áo nam', 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=400'),
('Thời trang Nữ', 'Quần áo nữ', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'),
('Sách', 'Sách và văn phòng phẩm', 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400'),
('Thể thao', 'Đồ thể thao', 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400'),
('Mỹ phẩm', 'Skincare và makeup', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400'),
('Gia dụng', 'Đồ gia dụng', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400'),
('Đồng hồ', 'Đồng hồ thời trang', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'),
('Phụ kiện', 'Phụ kiện điện tử', 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=400');

-- Products - Tech Store (seller_id=2)
INSERT INTO products (name, description, price, quantity, images, seller_id, category_id, status, view_count) VALUES
('iPhone 15 Pro Max 256GB', 'Apple iPhone 15 Pro Max Titan chính hãng VN/A', 34990000, 50, 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600', 2, 1, 'APPROVED', 5200),
('iPhone 15 128GB', 'iPhone 15 Pink chính hãng', 24990000, 80, 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600', 2, 1, 'APPROVED', 3800),
('Samsung Galaxy S24 Ultra', 'Samsung S24 Ultra 256GB Snapdragon 8 Gen 3', 31990000, 45, 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600', 2, 1, 'APPROVED', 4100),
('Samsung Galaxy Z Fold5', 'Galaxy Z Fold5 512GB màn hình gập', 41990000, 20, 'https://images.unsplash.com/photo-1628744876497-eb30460be9f6?w=600', 2, 1, 'APPROVED', 2900),
('Xiaomi 14 Ultra', 'Xiaomi 14 Ultra camera Leica', 27990000, 35, 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600', 2, 1, 'APPROVED', 2100),
('OPPO Find X7 Ultra', 'OPPO Find X7 Ultra Hasselblad', 25990000, 40, 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=600', 2, 1, 'APPROVED', 1800),
('MacBook Pro 14 M3 Pro', 'MacBook Pro 14 inch M3 Pro 18GB/512GB', 52990000, 25, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600', 2, 2, 'APPROVED', 6500),
('MacBook Air 15 M3', 'MacBook Air 15 inch M3 8GB/256GB', 32990000, 40, 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=600', 2, 2, 'APPROVED', 4200),
('Dell XPS 15 OLED', 'Dell XPS 15 i7-13700H 16GB/512GB OLED', 42990000, 20, 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600', 2, 2, 'APPROVED', 2800),
('Asus ROG Zephyrus G14', 'ROG Zephyrus G14 Ryzen 9 RTX 4060', 38990000, 15, 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600', 2, 2, 'APPROVED', 3100),
('AirPods Pro 2', 'AirPods Pro 2 USB-C chống ồn', 6490000, 150, 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600', 2, 10, 'APPROVED', 8900),
('Apple Watch Series 9', 'Apple Watch S9 45mm GPS', 11990000, 60, 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=600', 2, 9, 'APPROVED', 4500);

-- Products - Fashionista (seller_id=3)
INSERT INTO products (name, description, price, quantity, images, seller_id, category_id, status, view_count) VALUES
('Áo Polo Nam Ralph Lauren', 'Áo polo nam authentic cotton pique', 1890000, 100, 'https://images.unsplash.com/photo-1625910513413-5fc330ec4de2?w=600', 3, 3, 'APPROVED', 2300),
('Áo Thun Oversize Unisex', 'Áo thun form rộng 100% cotton', 299000, 500, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600', 3, 3, 'APPROVED', 5600),
('Quần Jeans Nam Slim Fit', 'Quần jean nam co giãn màu xanh đậm', 650000, 200, 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600', 3, 3, 'APPROVED', 3200),
('Áo Khoác Bomber Nam', 'Áo khoác bomber da lộn phong cách', 890000, 80, 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600', 3, 3, 'APPROVED', 1900),
('Váy Đầm Công Sở', 'Váy đầm nữ thanh lịch công sở', 750000, 120, 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600', 3, 4, 'APPROVED', 4100),
('Áo Sơ Mi Nữ Lụa', 'Áo sơ mi nữ chất lụa cao cấp', 480000, 150, 'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=600', 3, 4, 'APPROVED', 2800),
('Chân Váy Midi Xếp Ly', 'Chân váy xếp ly dáng midi Hàn Quốc', 420000, 180, 'https://images.unsplash.com/photo-1583496661160-fb5886a0edd2?w=600', 3, 4, 'APPROVED', 3500),
('Túi Xách Nữ Da Cao Cấp', 'Túi xách nữ da bò thật thương hiệu', 1290000, 60, 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600', 3, 4, 'APPROVED', 2100),
('Giày Sneaker Adidas', 'Giày Adidas Ultraboost chính hãng', 3290000, 70, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600', 3, 3, 'APPROVED', 5800),
('Giày Cao Gót Nữ', 'Giày cao gót 7cm da mềm', 590000, 100, 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600', 3, 4, 'APPROVED', 2400);

-- Products - Book Worm (seller_id=4)
INSERT INTO products (name, description, price, quantity, images, seller_id, category_id, status, view_count) VALUES
('Đắc Nhân Tâm', 'Dale Carnegie - Bản dịch mới nhất', 108000, 500, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600', 4, 5, 'APPROVED', 12000),
('Nhà Giả Kim', 'Paulo Coelho - Tác phẩm kinh điển', 79000, 400, 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600', 4, 5, 'APPROVED', 9500),
('Atomic Habits', 'James Clear - Thói quen nguyên tử', 189000, 300, 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600', 4, 5, 'APPROVED', 7800),
('Sapiens: Lược Sử Loài Người', 'Yuval Noah Harari', 229000, 200, 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=600', 4, 5, 'APPROVED', 6200),
('Tư Duy Nhanh Và Chậm', 'Daniel Kahneman - Nobel Kinh tế', 249000, 150, 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600', 4, 5, 'APPROVED', 4500),
('Clean Code', 'Robert C. Martin - Lập trình viên', 450000, 100, 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600', 4, 5, 'APPROVED', 3800);

-- Products - Sport King (seller_id=5)
INSERT INTO products (name, description, price, quantity, images, seller_id, category_id, status, view_count) VALUES
('Giày Chạy Bộ Nike Air Zoom', 'Nike Air Zoom Pegasus 40', 3590000, 80, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600', 5, 6, 'APPROVED', 4200),
('Áo Thể Thao Nike Dri-FIT', 'Áo tập gym Nike thoáng khí', 890000, 200, 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=600', 5, 6, 'APPROVED', 3100),
('Quần Short Thể Thao', 'Quần short gym co giãn 4 chiều', 390000, 300, 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600', 5, 6, 'APPROVED', 2800),
('Bóng Đá Adidas Champions', 'Bóng đá Adidas chính hãng size 5', 890000, 150, 'https://images.unsplash.com/photo-1614632537423-1e6c2e7e0aab?w=600', 5, 6, 'APPROVED', 1900),
('Vợt Cầu Lông Yonex', 'Vợt Yonex Astrox 88D Pro', 3890000, 40, 'https://images.unsplash.com/photo-1617083934555-5e9e6e48ad4c?w=600', 5, 6, 'APPROVED', 2500),
('Yoga Mat Premium', 'Thảm yoga TPE 6mm cao cấp', 490000, 200, 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600', 5, 6, 'APPROVED', 3400);

-- Products - Beauty Queen (seller_id=6)
INSERT INTO products (name, description, price, quantity, images, seller_id, category_id, status, view_count) VALUES
('Serum Vitamin C Klairs', 'Klairs Freshly Juiced Vitamin Drop', 420000, 200, 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600', 6, 7, 'APPROVED', 5600),
('Kem Chống Nắng Anessa', 'Anessa Perfect UV Sunscreen SPF50+', 550000, 300, 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600', 6, 7, 'APPROVED', 7200),
('Son Dior Rouge', 'Dior Rouge 999 Matte chính hãng', 1090000, 100, 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600', 6, 7, 'APPROVED', 4800),
('Nước Hoa Chanel No.5', 'Chanel No.5 EDP 50ml authentic', 3290000, 50, 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=600', 6, 7, 'APPROVED', 3200),
('Mặt Nạ Innisfree', 'Innisfree Green Tea Mask 10 miếng', 250000, 400, 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=600', 6, 7, 'APPROVED', 6100),
('Toner Klairs Supple', 'Klairs Supple Preparation Toner', 380000, 250, 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600', 6, 7, 'APPROVED', 4300);

-- Products - Home Mart (seller_id=7)
INSERT INTO products (name, description, price, quantity, images, seller_id, category_id, status, view_count) VALUES
('Nồi Chiên Không Dầu Philips', 'Philips Airfryer XXL 7.3L', 4990000, 60, 'https://images.unsplash.com/photo-1648146299556-8e05b4a68608?w=600', 7, 8, 'APPROVED', 8900),
('Máy Hút Bụi Dyson V15', 'Dyson V15 Detect không dây', 18990000, 20, 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=600', 7, 8, 'APPROVED', 4500),
('Máy Xay Sinh Tố Vitamix', 'Vitamix E310 Explorian 1400W', 12990000, 30, 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=600', 7, 8, 'APPROVED', 3100),
('Bộ Nồi Inox Fissler', 'Fissler Original Profi 5 món', 8990000, 25, 'https://images.unsplash.com/photo-1584990347449-a9a1f6e7f7ce?w=600', 7, 8, 'APPROVED', 2800),
('Ghế Công Thái Học Herman', 'Herman Miller Aeron Full Options', 35990000, 10, 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=600', 7, 8, 'APPROVED', 5200),
('Đèn Bàn Xiaomi LED', 'Xiaomi Mi LED Desk Lamp Pro', 990000, 150, 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600', 7, 8, 'APPROVED', 3600);

-- Orders
INSERT INTO orders (buyer_id, seller_id, total_amount, shipping_address, phone, payment_method, status, is_paid) VALUES
(8, 2, 34990000, '123 Nguyễn Huệ, Q1, TP.HCM', '0978901234', 'VNPAY', 'DELIVERED', TRUE),
(8, 3, 1949000, '123 Nguyễn Huệ, Q1, TP.HCM', '0978901234', 'COD', 'DELIVERED', TRUE),
(9, 2, 52990000, '456 Lê Lợi, Q7, TP.HCM', '0989012345', 'VNPAY', 'SHIPPING', TRUE),
(9, 4, 376000, '456 Lê Lợi, Q7, TP.HCM', '0989012345', 'COD', 'DELIVERED', TRUE),
(10, 5, 4480000, '789 Hoàng Diệu, Hà Nội', '0990123456', 'COD', 'SELLER_CONFIRMED', FALSE),
(10, 6, 970000, '789 Hoàng Diệu, Hà Nội', '0990123456', 'VNPAY', 'DELIVERED', TRUE),
(11, 7, 4990000, '321 Bạch Đằng, Đà Nẵng', '0901234560', 'COD', 'PENDING', FALSE),
(12, 3, 3290000, '654 Trần Phú, Huế', '0912345670', 'VNPAY', 'ADMIN_APPROVED', TRUE);

-- Order items
INSERT INTO order_items (order_id, product_id, product_name, product_image, price, quantity) VALUES
(1, 1, 'iPhone 15 Pro Max 256GB', 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600', 34990000, 1),
(2, 13, 'Áo Polo Nam Ralph Lauren', 'https://images.unsplash.com/photo-1625910513413-5fc330ec4de2?w=600', 1890000, 1),
(2, 14, 'Áo Thun Oversize Unisex', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600', 299000, 2),
(3, 7, 'MacBook Pro 14 M3 Pro', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600', 52990000, 1),
(4, 23, 'Đắc Nhân Tâm', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600', 108000, 2),
(4, 24, 'Nhà Giả Kim', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600', 79000, 2),
(5, 29, 'Giày Chạy Bộ Nike Air Zoom', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600', 3590000, 1),
(5, 30, 'Áo Thể Thao Nike Dri-FIT', 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=600', 890000, 1),
(6, 35, 'Serum Vitamin C Klairs', 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600', 420000, 1),
(6, 36, 'Kem Chống Nắng Anessa', 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600', 550000, 1),
(7, 41, 'Nồi Chiên Không Dầu Philips', 'https://images.unsplash.com/photo-1648146299556-8e05b4a68608?w=600', 4990000, 1),
(8, 21, 'Giày Sneaker Adidas', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600', 3290000, 1);

-- Notifications
INSERT INTO notifications (user_id, title, message, type, link, is_read) VALUES
(2, 'Đơn hàng mới', 'Bạn có đơn hàng mới #1', 'ORDER', '/seller/orders/1', TRUE),
(2, 'Đơn hàng đã giao', 'Đơn hàng #1 đã giao thành công', 'ORDER', '/seller/orders/1', TRUE),
(3, 'Đơn hàng mới', 'Bạn có đơn hàng mới #2', 'ORDER', '/seller/orders/2', TRUE),
(8, 'Đơn hàng đã giao', 'Đơn hàng #1 của bạn đã được giao', 'ORDER', '/orders/1', TRUE),
(9, 'Đơn hàng đang giao', 'Đơn hàng #3 đang được vận chuyển', 'ORDER', '/orders/3', FALSE),
(5, 'Đơn hàng mới', 'Bạn có đơn hàng mới #5', 'ORDER', '/seller/orders/5', FALSE),
(7, 'Đơn hàng mới', 'Bạn có đơn hàng mới #7', 'ORDER', '/seller/orders/7', FALSE);

SELECT 'Database setup completed!' AS Status;
