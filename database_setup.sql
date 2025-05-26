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

INSERT INTO users (username, email, password, role) VALUES 
('admin', 'admin@kebabplace.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
('user', 'user@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'customer'),
('staff', 'staff@kebabplace.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'staff');

CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT DEFAULT NULL,
    guest_phone VARCHAR(20),
    guest_name VARCHAR(100),
    items JSON NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
    payment_method VARCHAR(50),
    card_last_four VARCHAR(4),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE `menu` (
    `id` text NOT NULL,
    `name` text NOT NULL,
    `description` text NOT NULL,
    `price` float NOT NULL,
    `food_type` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `menu` (`id`, `name`, `description`, `price`, `food_type`) VALUES
('chicken-wrap', 'Chicken Kebab Wrap', 'Strips of delicious cooked chicken wrapped in a lightly toasted tortilla wrap with lettuce, mayo and salsa.', 6.5, 'wraps'),
('lamb-wrap', 'Lamb Kebab Wrap', 'The grilled lamb is then wrapped in a soft, warm pita bread and garnished with various vegetables and condiments, such as lettuce, tomatoes, onions, and a flavorful yogurt sauce.', 7, 'wraps'),
('falafel-wrap', 'Falafel Wrap', 'Crispy chickpea patties wrapped in warm pita with fresh veggies and our signature sauce. A delicious vegetarian favorite!', 6, 'wraps'),
('chicken-plate', 'Chicken Plate', ' Tender grilled chicken served with, fresh salad, and our special sauce.', 9, 'plates'),
('mix-grill', 'Mix Grill Plate', ' A hearty combo of grilled chicken, beef, and lamb served with your choice of three delicious sauces. A flavorful feast for meat lovers!', 12, 'plates'),
('veggie-plate', 'Veggie Plate', ' A colorful mix of grilled seasonal vegetables served with your choice of sauce.', 10, 'plates'),
('soda', 'Soda 0.5 L', 'Cola / Fanta / Sprite', 1.5, 'drinks'),
('water', 'Water 0.3 L', 'Mineral Water', 1, 'drinks');
