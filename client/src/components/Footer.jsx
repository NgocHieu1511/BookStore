import { MapPin, Mail, Phone, Play } from "lucide-react";

function Footer() {
  return (
    <footer className="bg-white mt-8 border-t border-gray-200">
      {/* Footer Main */}
      <div className="max-w-[1230px] mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* BRAND */}
          <div className="md:border-r border-gray-200 pr-6">
            <h2 className="text-3xl font-black italic text-red-700">
              Bookstore.com
            </h2>

            <p className="text-sm text-gray-600 leading-relaxed mt-4">
              Lầu 5, 387-389 Hai Bà Trưng, Quận 3, TP. HCM
            </p>

            <p className="text-sm text-gray-600 leading-relaxed mt-2">
              Công Ty Cổ Phần Phát Hành Sách TP HCM - BOOKSTORE.COM
            </p>

            {/* CONTACT */}
            <div className="flex flex-col gap-3 mt-5">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin size={18} className="text-red-700 shrink-0" />
                <span>TP. Hồ Chí Minh, Việt Nam</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone size={18} className="text-red-700 shrink-0" />
                <span>1900 6656</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail size={18} className="text-red-700 shrink-0" />
                <span>support@bookstore.com</span>
              </div>
            </div>

            {/* SOCIAL */}
            <div className="flex gap-3 mt-5">
              {/* Facebook */}
              <a
                href="#"
                aria-label="Facebook"
                className="w-9 h-9 rounded bg-blue-600 flex items-center justify-center text-white font-bold hover:opacity-80 transition"
              >
                f
              </a>

              {/* Youtube */}
              <a
                href="#"
                aria-label="Youtube"
                className="w-9 h-9 rounded bg-red-600 flex items-center justify-center text-white hover:opacity-80 transition"
              >
                <Play size={18} fill="white" />
              </a>
            </div>
          </div>

          {/* DỊCH VỤ */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase mb-4">
              Dịch vụ
            </h3>

            <div className="flex flex-col gap-3">
              <a
                href="#"
                className="text-sm text-gray-600 hover:text-red-700 transition"
              >
                Điều khoản sử dụng
              </a>

              <a
                href="#"
                className="text-sm text-gray-600 hover:text-red-700 transition"
              >
                Chính sách bảo mật thông tin cá nhân
              </a>

              <a
                href="#"
                className="text-sm text-gray-600 hover:text-red-700 transition"
              >
                Chính sách bảo mật thanh toán
              </a>

              <a
                href="#"
                className="text-sm text-gray-600 hover:text-red-700 transition"
              >
                Giới thiệu Bookstore.com
              </a>

              <a
                href="#"
                className="text-sm text-gray-600 hover:text-red-700 transition"
              >
                Hệ thống trung tâm - nhà sách
              </a>
            </div>
          </div>

          {/* HỖ TRỢ */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase mb-4">
              Hỗ trợ
            </h3>

            <div className="flex flex-col gap-3">
              <a
                href="#"
                className="text-sm text-gray-600 hover:text-red-700 transition"
              >
                Chính sách đổi - trả - hoàn tiền
              </a>

              <a
                href="#"
                className="text-sm text-gray-600 hover:text-red-700 transition"
              >
                Chính sách bảo hành - bồi hoàn
              </a>

              <a
                href="#"
                className="text-sm text-gray-600 hover:text-red-700 transition"
              >
                Chính sách vận chuyển
              </a>

              <a
                href="#"
                className="text-sm text-gray-600 hover:text-red-700 transition"
              >
                Chính sách khách sỉ
              </a>

              <a
                href="#"
                className="text-sm text-gray-600 hover:text-red-700 transition"
              >
                Phương thức thanh toán
              </a>
            </div>
          </div>

          {/* TÀI KHOẢN */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase mb-4">
              Tài khoản của tôi
            </h3>

            <div className="flex flex-col gap-3">
              <a
                href="#"
                className="text-sm text-gray-600 hover:text-red-700 transition"
              >
                Đăng nhập / Tạo mới tài khoản
              </a>

              <a
                href="#"
                className="text-sm text-gray-600 hover:text-red-700 transition"
              >
                Thay đổi địa chỉ khách hàng
              </a>

              <a
                href="#"
                className="text-sm text-gray-600 hover:text-red-700 transition"
              >
                Chi tiết tài khoản
              </a>

              <a
                href="#"
                className="text-sm text-gray-600 hover:text-red-700 transition"
              >
                Lịch sử mua hàng
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* COPYRIGHT */}
      <div className="bg-gray-100 py-4">
        <div className="max-w-[1230px] mx-auto px-6 text-center">
          <p className="text-sm text-gray-500">
            © 2024 - Bản quyền của Công Ty Cổ Phần Phát Hành Sách -
            Bookstore.com
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
