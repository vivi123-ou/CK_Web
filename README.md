# Hệ thống Quản lý Khóa luận Tốt nghiệp (Thesis Management System)

## Giới thiệu chung

Trong bối cảnh giáo dục đại học hiện nay, công tác quản lý khóa luận truyền thống thường gặp nhiều bất cập như thông tin phân tán, dễ sai sót trong quá trình phân công và thiếu minh bạch trong chấm điểm. 

Hệ thống của chúng tôi ra đời nhằm:
- **Số hóa và tự động hóa:** Quản lý tập trung toàn bộ quy trình từ khi tạo đề tài, phân công giảng viên, thành lập hội đồng đến khi tổng hợp điểm và xuất báo cáo.
- **Phân quyền rõ ràng (RBAC):** Hệ thống phục vụ 4 nhóm đối tượng chính: Quản trị viên, Giáo vụ, Giảng viên và Sinh viên.

## Công nghệ sử dụng

- **Frontend:** React 19, Vite 8, Material-UI (MUI).
- **Backend:** Spring Boot 4 (Java 17/21), RESTful API, Spring Security, JWT (JSON Web Token).
- **Database:** MySQL 8.
- **Công cụ hỗ trợ khác:** iText 7 (xuất PDF báo cáo), Recharts (vẽ biểu đồ thống kê), Axios.

## Tính năng theo đối tượng

- **Quản trị viên (Admin):** Quản lý toàn bộ tài khoản người dùng, cấp phát tài khoản, phân quyền và khóa/mở tài khoản.
- **Giáo vụ:** Điều phối toàn bộ vòng đời khóa luận bao gồm tạo đề tài, phân công phản biện, thành lập hội đồng, định nghĩa tiêu chí chấm điểm, xuất báo cáo và xem thống kê.
- **Giảng viên:** Xem danh sách khóa luận được phân công (hướng dẫn/phản biện), thực hiện chấm điểm theo tiêu chí có trọng số và xác nhận phiếu điểm.
- **Sinh viên:** Xem thông tin khóa luận, trạng thái tiến độ và kết quả chấm điểm.

---

## Sơ đồ và Giao diện Hệ thống

### Mô hình Thực thể kết hợp (ER Diagram)
Mô hình ER thể hiện các thực thể chính và mối quan hệ giữa chúng trong hệ thống.
<div align="center">
  <img width="100%" alt="ER Diagram" src="https://github.com/user-attachments/assets/1f039cf0-170f-4a0f-82c3-4dc79636e8cc" />
</div>

### Trang Đăng nhập (Login Page)
Cổng vào duy nhất của hệ thống, sử dụng JWT Token để điều hướng người dùng dựa theo vai trò tương ứng.
<div align="center">
  <img width="100%" alt="Login Page" src="https://github.com/user-attachments/assets/7bca1df2-cf22-4f16-ac66-39403a1a7a3a" />
</div>

### Giao diện Quản trị viên (Admin)
<div align="center">
  <img width="100%" alt="Admin Dashboard" src="https://github.com/user-attachments/assets/d733a2c7-d122-4cbe-af88-dfdd9f1f4e68" />
  <img width="100%" alt="Admin User Management 1" src="https://github.com/user-attachments/assets/26fdd276-2c9c-4881-a035-263d69e3c5df" />
  <img width="100%" alt="Admin User Management 2" src="https://github.com/user-attachments/assets/08891b3a-9fb7-413c-a152-3d36824443c0" />
  <img width="100%" alt="Admin User Management 3" src="https://github.com/user-attachments/assets/08664efe-da7b-40ca-a820-8fcd1fcd3abc" />
</div>

### Giao diện Giáo vụ
<div align="center">
  <img width="100%" alt="Giaovu Dashboard" src="https://github.com/user-attachments/assets/20ac31f6-e8f9-429e-bf61-c74b1ea35833" />
  <img width="100%" alt="Giaovu Management 1" src="https://github.com/user-attachments/assets/1bd2b22c-40f5-452c-b486-f2879cda83f7" />
  <img width="100%" alt="Giaovu Management 2" src="https://github.com/user-attachments/assets/e522214e-2a86-4f35-960d-4d0ad0568dd9" />
  <img width="100%" alt="Giaovu Management 3" src="https://github.com/user-attachments/assets/176988f0-9a3c-4b31-890f-21e98e5ec128" />
  <img width="100%" alt="Giaovu Management 4" src="https://github.com/user-attachments/assets/931ce69e-8950-4419-9cae-473277e78a13" />
  <img width="100%" alt="Giaovu Management 5" src="https://github.com/user-attachments/assets/d98ee833-73cb-4d45-bd52-455ab3e4c904" />
</div>

### Giao diện Giảng viên
<div align="center">
  <img width="100%" alt="Giangvien Dashboard" src="https://github.com/user-attachments/assets/946128b4-4612-4128-97d6-bd3c416f9b56" />
  <img width="100%" alt="Giangvien View 1" src="https://github.com/user-attachments/assets/7331abac-610e-4467-bb4e-e0a4f103e840" />
  <img width="100%" alt="Giangvien View 2" src="https://github.com/user-attachments/assets/61f3cd6b-381f-4cf6-9ba8-2917a1cf311d" />
</div>

### Giao diện Sinh viên
<div align="center">
  <img width="100%" alt="Sinhvien Dashboard" src="https://github.com/user-attachments/assets/6f70c47c-9d68-46df-b079-4700c2eebd0d" />
  <img width="100%" alt="Sinhvien View 1" src="https://github.com/user-attachments/assets/26d68ed8-b8af-4c8e-99a9-8fde4777ff5c" />
  <img width="100%" alt="Sinhvien View 2" src="https://github.com/user-attachments/assets/2421b2be-a6da-4344-a961-f2faeb3b0792" />
</div>
