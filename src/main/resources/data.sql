-- Seed admin account (password: admin123)
-- All passwords encode to the SAME hash for simplicity in dev.
-- In production, each user should have a unique password.
-- BCrypt hash of 'admin123': $2a$10$yvOysTruNqHHLl2/.8FJz./7V5TZJ53XRuuLoU1smFgu0EhvQnij2
INSERT INTO users (email, password, full_name, phone, role, status, failed_login_attempts, created_at, updated_at)
SELECT 'admin@university.edu.vn', '$2a$10$yvOysTruNqHHLl2/.8FJz./7V5TZJ53XRuuLoU1smFgu0EhvQnij2', 'Quản trị viên', '0123456789', 'ADMIN', 'ACTIVE', 0, NOW(), NOW()
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@university.edu.vn');

-- Seed Giao vu account (password: admin123)
INSERT INTO users (email, password, full_name, phone, role, status, failed_login_attempts, created_at, updated_at)
SELECT 'giaovu@university.edu.vn', '$2a$10$yvOysTruNqHHLl2/.8FJz./7V5TZJ53XRuuLoU1smFgu0EhvQnij2', 'Giáo vụ Khoa', '0123456790', 'GIAO_VU', 'ACTIVE', 0, NOW(), NOW()
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'giaovu@university.edu.vn');

-- Seed Giang vien accounts (password: admin123)
INSERT INTO users (email, password, full_name, phone, role, status, failed_login_attempts, created_at, updated_at)
SELECT 'gv1@university.edu.vn', '$2a$10$yvOysTruNqHHLl2/.8FJz./7V5TZJ53XRuuLoU1smFgu0EhvQnij2', 'Nguyễn Văn A', '0123456791', 'GIANG_VIEN', 'ACTIVE', 0, NOW(), NOW()
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'gv1@university.edu.vn');

INSERT INTO users (email, password, full_name, phone, role, status, failed_login_attempts, created_at, updated_at)
SELECT 'gv2@university.edu.vn', '$2a$10$yvOysTruNqHHLl2/.8FJz./7V5TZJ53XRuuLoU1smFgu0EhvQnij2', 'Trần Thị B', '0123456792', 'GIANG_VIEN', 'ACTIVE', 0, NOW(), NOW()
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'gv2@university.edu.vn');

INSERT INTO users (email, password, full_name, phone, role, status, failed_login_attempts, created_at, updated_at)
SELECT 'gv3@university.edu.vn', '$2a$10$yvOysTruNqHHLl2/.8FJz./7V5TZJ53XRuuLoU1smFgu0EhvQnij2', 'Lê Văn C', '0123456793', 'GIANG_VIEN', 'ACTIVE', 0, NOW(), NOW()
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'gv3@university.edu.vn');

-- Seed Sinh vien accounts (password: admin123)
INSERT INTO users (email, password, full_name, phone, role, status, failed_login_attempts, created_at, updated_at)
SELECT 'sv1@university.edu.vn', '$2a$10$yvOysTruNqHHLl2/.8FJz./7V5TZJ53XRuuLoU1smFgu0EhvQnij2', 'Phạm Văn D', '0123456794', 'SINH_VIEN', 'ACTIVE', 0, NOW(), NOW()
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'sv1@university.edu.vn');

INSERT INTO users (email, password, full_name, phone, role, status, failed_login_attempts, created_at, updated_at)
SELECT 'sv2@university.edu.vn', '$2a$10$yvOysTruNqHHLl2/.8FJz./7V5TZJ53XRuuLoU1smFgu0EhvQnij2', 'Hoàng Thị E', '0123456795', 'SINH_VIEN', 'ACTIVE', 0, NOW(), NOW()
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'sv2@university.edu.vn');

