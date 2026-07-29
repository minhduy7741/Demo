-- Khởi tạo Database cho dự án Demo (Node.js + MySQL)
-- Bạn có thể import file này vào giao diện Potato PaaS để test tính năng Import Database!

-- 1. Xóa bảng cũ nếu tồn tại (để import lại từ đầu không bị lỗi)
DROP TABLE IF EXISTS notes;
DROP TABLE IF EXISTS users;

-- 2. Tạo bảng users
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL
);

-- 3. Tạo bảng notes
CREATE TABLE notes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  content TEXT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Chèn dữ liệu mẫu (Sample Data)
-- Lưu ý: Mật khẩu dưới đây đều là '123456' đã được mã hóa bằng bcrypt.
INSERT INTO users (id, username, password) VALUES 
(1, 'minhduy', '$2b$10$Kd6kf4YDMxpjq9/N8JDse.ZYJkgXZM7Ooae9QAdCA5NU..lI6TfJi'),
(2, 'admin', '$2b$10$Kd6kf4YDMxpjq9/N8JDse.ZYJkgXZM7Ooae9QAdCA5NU..lI6TfJi'),
(3, 'khach', '$2b$10$Kd6kf4YDMxpjq9/N8JDse.ZYJkgXZM7Ooae9QAdCA5NU..lI6TfJi');

-- Chèn một số bài viết (notes) mẫu
INSERT INTO notes (userId, content, createdAt) VALUES 
(1, 'Chào mừng đến với hệ thống Potato PaaS! Đây là bài viết đầu tiên.', '2026-07-29 10:00:00'),
(1, 'Chức năng Import Database của Potato PaaS hoạt động thật tuyệt vời!', '2026-07-29 10:05:00'),
(2, 'Tài khoản admin đang kiểm tra hệ thống. Mọi thứ OK.', '2026-07-29 10:10:00'),
(3, 'Xin chào mọi người, mình là khách mới tham gia.', '2026-07-29 10:15:00');
