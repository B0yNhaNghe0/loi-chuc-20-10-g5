# Web lời chúc 20/10 — Chị em công ti G5

Web HTML/CSS/JavaScript thuần, không cần npm hoặc build. Gửi lời chúc ẩn danh, tự thiết kế thiệp, xem trước trực tiếp, tìm kiếm, lọc và tải tổng hợp lời chúc.

## Đưa lên GitHub Pages
1. Giải nén ZIP. Tạo repository trên GitHub.
2. Upload toàn bộ **nội dung bên trong** thư mục này vào gốc repository. `index.html` phải nằm ngay ở gốc.
3. Vào **Settings → Pages → Build and deployment**.
4. Chọn **Deploy from a branch**, branch **main**, thư mục **/(root)**, rồi Save.
5. Đợi GitHub triển khai và mở URL trong trang Pages (thường là `https://TEN-TAI-KHOAN.github.io/TEN-REPO/`).

GitHub Pages cho phép người có link truy cập trang. Khi chưa cấu hình Firebase, dữ liệu chỉ lưu trên trình duyệt của từng người; lời chúc mẫu không tính vào tổng và không được xuất.

## Kết nối Firebase để mọi người thấy cùng một dữ liệu
1. Trong Firebase Console, tạo/chọn project, thêm ứng dụng **Web** và lấy `firebaseConfig`.
2. Mở `firebase-config.js`, thay `window.FIREBASE_CONFIG = null;` bằng:

```js
window.FIREBASE_CONFIG = {
  apiKey: "GIA_TRI_CUA_BAN",
  authDomain: "PROJECT.firebaseapp.com",
  projectId: "PROJECT",
  appId: "GIA_TRI_CUA_BAN"
};
```

Có thể dán đầy đủ các trường của config Firebase cung cấp. Đây là cấu hình web công khai; không đưa khóa Service Account hoặc khóa private vào repository.

3. **Authentication → Sign-in method → Anonymous → Enable**.
4. **Authentication → Settings → Authorized domains**: thêm `TEN-TAI-KHOAN.github.io` (chỉ hostname, không có https hoặc tên repo).
5. Tạo **Cloud Firestore** ở production mode. Trong tab **Rules**, dán toàn bộ nội dung `firestore.rules` rồi **Publish**. Quy tắc này đã hỗ trợ lưu thiết kế thiệp và giới hạn trường, giá trị, độ dài.
6. Commit thay đổi `firebase-config.js` lên GitHub; đợi Pages triển khai lại.
7. Mở web ở hai trình duyệt khác nhau, gửi thử một thiệp: cả hai phải thấy cùng lời chúc và thiết kế. Trên trang phải hiện “Vườn lời chúc dùng chung · Cập nhật trực tiếp”.

Nếu lỗi kết nối, kiểm tra config, Anonymous Auth, authorized domains và Firestore Rules. Web giữ nội dung khi gửi thất bại và không chuyển ngầm sang lưu trên thiết bị.

## Chạy trên máy
Trong thư mục đã giải nén:

```sh
python -m http.server 8000
```

Mở http://localhost:8000. Không mở index.html trực tiếp bằng file:// vì app dùng JavaScript module.

## Cấu trúc
- index.html: nội dung và form thiết kế.
- style.css: giao diện, bố cục responsive, kiểu thiệp.
- app.js: xem trước, gửi, lưu, lọc, tìm kiếm, xuất và kết nối Firebase.
- firebase-config.js: cấu hình Firebase của bạn.
- firestore.rules: quy tắc đọc/ghi dữ liệu.

## Phạm vi dữ liệu
Chế độ Firebase hiển thị và xuất 300 lời chúc mới nhất. Thiết kế riêng gồm nền, chữ, họa tiết, khung, biểu tượng và bố cục; không đảm bảo hai người không chọn trùng thiết kế. Người gửi không được lưu tên/email/UID trong tài liệu lời chúc, nhưng Firebase Anonymous Auth vẫn tạo định danh nội bộ; không cam kết ẩn danh tuyệt đối. Theo rules hiện tại, người có link đều có thể xác thực ẩn danh để đọc/gửi; đây không phải giới hạn chỉ nhân viên G5. Không có kiểm duyệt tự động hoặc chống spam phía server. Quản trị viên có thể quản lý lời chúc trong Firebase Console; khách không sửa/xóa lời chúc qua web.

Giao diện dùng Google Fonts và Firebase SDK từ CDN khi có cấu hình; cần Internet để tải những tài nguyên này.
