# 📚 BookStore

Website thương mại điện tử bán sách full-stack, gồm giao diện khách hàng, trang quản trị (admin), thanh toán trực tuyến, chat thời gian thực và chatbot AI tư vấn sách.

## ✨ Tính năng

### Khách hàng
- Đăng ký (xác thực OTP qua email), đăng nhập thường và đăng nhập bằng **Google**, quên mật khẩu
- Xem sách theo danh mục, trang chi tiết sách, sách liên quan, sách bán chạy theo tuần
- **Tìm kiếm nhanh** với Meilisearch (chịu lỗi chính tả, ưu tiên sách bán chạy)
- Giỏ hàng, áp dụng mã giảm giá (coupon), **Flash Sale** có đồng hồ đếm ngược
- Thanh toán qua **VNPay** và **MoMo**
- Quản lý tài khoản: thông tin cá nhân, sổ địa chỉ, sách yêu thích, lịch sử đơn hàng, hủy đơn
- Đánh giá / phản hồi sản phẩm kèm hình ảnh
- Đọc blog
- **Chat trực tiếp** với admin (Socket.IO)
- **Chatbot AI** (Google Gemini) tư vấn sách dựa trên dữ liệu cửa hàng

### Quản trị (Admin)
- Dashboard thống kê (biểu đồ Chart.js)
- Quản lý sách, danh mục, mã giảm giá, giảm giá sản phẩm, Flash Sale
- Quản lý đơn hàng và cập nhật trạng thái
- Quản lý người dùng (khóa / mở khóa tài khoản)
- Quản lý blog (soạn thảo bằng TinyMCE) và tin nhắn khách hàng

## 🛠️ Công nghệ sử dụng

| Phần | Công nghệ |
| --- | --- |
| **Client** | React 19, Vite, React Router 7, Tailwind CSS 4, Ant Design, MUI, Chart.js, Axios, Socket.IO Client, `@react-oauth/google` |
| **Server** | Node.js, Express 5, MongoDB (Mongoose), JWT + Cookie, Socket.IO, Multer, Nodemailer (Gmail OAuth2), express-rate-limit |
| **Dịch vụ ngoài** | Cloudinary (lưu ảnh), Meilisearch (tìm kiếm), VNPay, MoMo, Google Gemini (`@google/genai`), Google OAuth |

## 📁 Cấu trúc thư mục

```
book-store/
├── client/                    # Ứng dụng React (Vite)
│   └── src/
│       ├── components/        # Header, Footer, Banner, ChatWidget, AIChatbot, ...
│       ├── pages/             # Trang người dùng + admin/
│       ├── config/            # Axios client & các file gọi API
│       ├── hooks/             # useDebounce, useCountdown, useAutoSave, ...
│       ├── routes/            # Khai báo route
│       └── store/             # Context / Provider
└── server/                    # REST API (Express)
    └── src/
        ├── server.js          # Điểm khởi chạy (cổng 3000)
        ├── routes/            # Định tuyến API
        ├── controllers/       # Xử lý nghiệp vụ
        ├── models/            # Schema Mongoose
        ├── middleware/        # authUser, authAdmin
        ├── services/          # chatbot, tìm kiếm sản phẩm
        ├── config/            # MongoDB, Cloudinary, Meilisearch, Socket.IO
        ├── scripts/           # syncMeili.js (đồng bộ dữ liệu tìm kiếm)
        └── utils/             # Gửi mail, tiện ích
```

## ✅ Yêu cầu

- [Node.js](https://nodejs.org/) >= 18
- MongoDB (local hoặc MongoDB Atlas)
- [Meilisearch](https://www.meilisearch.com/) chạy tại `http://127.0.0.1:7700` (mặc định)
- Tài khoản/khóa API: Cloudinary, Google Cloud (OAuth + Gmail API), VNPay, MoMo, Google Gemini

## 🚀 Cài đặt & chạy

### 1. Clone dự án

```bash
git clone <url-repo-cua-ban>
cd book-store
```

### 2. Cấu hình Server

```bash
cd server
npm install
```

Tạo file `server/.env`:

```env
# Database & bảo mật
MONGO_URI=mongodb://127.0.0.1:27017/book-store
JWT_SECRET=<chuoi-bi-mat>
CLIENT_URL=http://localhost:5173
REQUIRE_EMAIL_VERIFY=true

# Gửi email (Gmail OAuth2)
EMAIL_USER=<email-gui-thu>
CLIENT_ID=<google-client-id>
CLIENT_SECRET=<google-client-secret>
REDIRECT_URI=<redirect-uri>
REFRESH_TOKEN=<refresh-token>

# Đăng nhập Google
GOOGLE_CLIENT_ID=<google-client-id>

# Cloudinary
CLOUDINARY_CLOUD_NAME=<cloud-name>
CLOUDINARY_API_KEY=<api-key>
CLOUDINARY_API_SECRET=<api-secret>

# Thanh toán
VNPAY_TMN_CODE=<ma-tmn>
VNPAY_SECURE_SECRET=<secure-secret>
MOMO_ACCESS_KEY=<access-key>
MOMO_SECRET_KEY=<secret-key>

# Meilisearch
MEILI_HOST=http://127.0.0.1:7700
MEILI_MASTER_KEY=<master-key>

# Chatbot AI
GEMINI_API_KEY=<gemini-api-key>
GEMINI_MODEL=<ten-model-gemini>
```

Chạy server (mặc định tại `http://localhost:3000`):

```bash
npm start
```

Đồng bộ dữ liệu sách sang Meilisearch (chạy khi đã có dữ liệu, hoặc khi cần lập lại chỉ mục):

```bash
npm run sync:search
```

### 3. Cấu hình Client

```bash
cd ../client
npm install
```

Tạo file `client/.env`:

```env
VITE_API_URL=http://localhost:3000
VITE_CLIENT_ID_GOOGLE=<google-client-id>
```

Chạy client (mặc định tại `http://localhost:5173`):

```bash
npm run dev
```

> ⚠️ Server đang cho phép CORS cho `http://localhost:5173` và `http://127.0.0.1:5173`. Nếu đổi cổng/domain client, hãy sửa `CLIENT_ORIGINS` trong `server/src/server.js`.

## 📜 Các lệnh có sẵn

| Thư mục | Lệnh | Mô tả |
| --- | --- | --- |
| `client` | `npm run dev` | Chạy môi trường phát triển |
| `client` | `npm run build` | Build bản production |
| `client` | `npm run preview` | Xem thử bản build |
| `client` | `npm run lint` | Kiểm tra ESLint |
| `server` | `npm start` | Chạy server với nodemon |
| `server` | `npm run sync:search` | Đồng bộ sản phẩm sang Meilisearch |

## 🔌 Tổng quan API

Tiền tố chung: `/api`

| Nhóm | Endpoint gốc | Ghi chú |
| --- | --- | --- |
| Người dùng | `/api/user` | Đăng ký, đăng nhập, Google login, OTP, địa chỉ, yêu thích, quản lý user (admin) |
| Danh mục | `/api/category` | CRUD (ghi: admin) |
| Sản phẩm | `/api/product` | Danh sách, chi tiết, tìm kiếm, bán chạy, CRUD (ghi: admin) |
| Giỏ hàng | `/api/cart` | Tạo, cập nhật, xóa, áp dụng coupon |
| Mã giảm giá | `/api/coupon` | CRUD (admin) |
| Thanh toán / Đơn hàng | `/api/payment` | Tạo thanh toán, callback VNPay/MoMo, đơn của tôi, hủy đơn, quản lý đơn (admin) |
| Đánh giá | `/api/feedback` | Gửi và xem đánh giá |
| Blog | `/api/blogs` | Danh sách, chi tiết, tạo/xóa (admin) |
| Tin nhắn | `/api/message` | Chat người dùng – admin |
| Chatbot | `/api/chatbot/ask` | Giới hạn 15 yêu cầu/phút/IP |
| Flash Sale | `/api/flash-sale` | Xem; tạo/xóa (admin) |
| Thống kê | `/api/statistical` | Dữ liệu dashboard (admin) |

Xác thực dùng JWT lưu trong cookie (`accessToken`, có cơ chế `refresh-token`). Socket.IO cũng xác thực bằng cookie này; mỗi user có phòng riêng và admin có phòng chung `admins`.

## 🔒 Lưu ý bảo mật

- **Không commit file `.env`** (đã được khai báo trong `.gitignore`). Nếu từng chia sẻ/đẩy các khóa thật (Mongo, Cloudinary, Gmail, VNPay, MoMo, Gemini, Meilisearch...), hãy **đổi (rotate) toàn bộ** chúng.
- Thông tin VNPay/MoMo nên dùng môi trường sandbox khi phát triển.

## 📝 Giấy phép

Dự án phục vụ mục đích học tập. Cập nhật thông tin giấy phép tại đây nếu cần.
