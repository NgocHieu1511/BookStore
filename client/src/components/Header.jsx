import {
  Search,
  ShoppingCart,
  UserRound,
  Bell,
  Menu,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

function Header() {
  const [active, setActive] = useState("Sách Trong Nước");

  const menus = [
    "Sách Trong Nước",
    "FOREIGN BOOKS",
    "VPP - Dụng Cụ Học Sinh",
    "Đồ Chơi",
    "Làm Đẹp - Sức Khỏe",
  ];

  return (
    <header className="w-full sticky top-0 z-50 bg-white shadow-sm">
      {/* ================= TOP BAR ================= */}
      <div className="hidden md:block bg-[#c92127] text-white">
        <div className="max-w-[1230px] mx-auto px-6 py-1.5 flex items-center justify-between text-[13px]">
          {/* Left */}
          <div className="flex items-center gap-4">
            <span className="font-bold">BOOKSTORE.COM</span>

            <span className="opacity-90">
              Cam Kết Chính Hãng - Giao Hàng Nhanh Chóng Toàn Quốc
            </span>
          </div>

          {/* Right */}
          <div className="flex items-center gap-5">
            <a href="#" className="hover:underline">
              Hỗ trợ
            </a>

            <a href="#" className="hover:underline">
              Kiểm tra đơn hàng
            </a>
          </div>
        </div>
      </div>

      {/* ================= MAIN HEADER ================= */}
      <div className="max-w-[1230px] mx-auto px-4 md:px-6">
        <div className="py-4 border-b border-gray-200">
          <div className="flex items-center justify-between gap-5">
            {/* LOGO */}
            <Link
              className="
                  shrink-0
                  text-[26px]
                  md:text-[32px]
                  font-black
                  italic
                  text-[#c92127]
                  tracking-tight
                "
              to="/"
            >
              Bookstore.com
            </Link>

            {/* SEARCH */}
            <div className="hidden md:flex flex-1 max-w-[650px]">
              <div className="flex w-full">
                <input
                  type="text"
                  placeholder="Tìm kiếm sách, văn phòng phẩm..."
                  className="
                    w-full
                    h-11
                    px-4
                    bg-[#f2f4f5]
                    border-2
                    border-[#c92127]
                    border-r-0
                    rounded-l-lg
                    outline-none
                    text-[14px]
                    text-gray-700
                    placeholder:text-gray-500
                    focus:ring-0
                  "
                />

                <button
                  className="
                    w-16
                    h-11
                    flex
                    items-center
                    justify-center
                    bg-[#c92127]
                    text-white
                    rounded-r-lg
                    hover:bg-[#a30014]
                    transition-colors
                  "
                >
                  <Search size={22} strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex items-center gap-4 md:gap-6 text-gray-700">
              {/* Notification */}
              <button
                className="
                  flex
                  flex-col
                  items-center
                  justify-center
                  hover:text-[#c92127]
                  transition-colors
                  group
                "
              >
                <Bell
                  size={27}
                  strokeWidth={1.8}
                  className="group-hover:scale-110 transition-transform"
                />

                <span className="hidden md:block text-[12px] mt-1">
                  Thông báo
                </span>
              </button>

              {/* Cart */}
              <button
                className="
                  relative
                  flex
                  flex-col
                  items-center
                  justify-center
                  hover:text-[#c92127]
                  transition-colors
                  group
                "
              >
                <ShoppingCart
                  size={27}
                  strokeWidth={1.8}
                  className="group-hover:scale-110 transition-transform"
                />

                {/* Badge */}
                <span
                  className="
                    absolute
                    -top-1
                    right-0
                    min-w-[18px]
                    h-[18px]
                    px-1
                    flex
                    items-center
                    justify-center
                    bg-[#c92127]
                    text-white
                    text-[10px]
                    font-bold
                    rounded-full
                    border-2
                    border-white
                  "
                >
                  3
                </span>

                <span className="hidden md:block text-[12px] mt-1">
                  Giỏ hàng
                </span>
              </button>

              {/* Account */}
              <button
                className="
                  flex
                  flex-col
                  items-center
                  justify-center
                  hover:text-[#c92127]
                  transition-colors
                  group
                "
              >
                <UserRound
                  size={27}
                  strokeWidth={1.8}
                  className="group-hover:scale-110 transition-transform"
                />

                <span className="hidden md:block text-[12px] mt-1">
                  Tài khoản
                </span>
              </button>
            </div>
          </div>

          {/* ================= MOBILE SEARCH ================= */}
          <div className="md:hidden mt-4">
            <div className="flex w-full">
              <input
                type="text"
                placeholder="Tìm kiếm sách, văn phòng phẩm..."
                className="
                  w-full
                  h-10
                  px-4
                  bg-[#f2f4f5]
                  border
                  border-[#c92127]
                  border-r-0
                  rounded-l-lg
                  outline-none
                  text-[14px]
                  focus:ring-0
                "
              />

              <button
                className="
                  w-12
                  h-10
                  flex
                  items-center
                  justify-center
                  bg-[#c92127]
                  text-white
                  rounded-r-lg
                "
              >
                <Search size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* ================= NAVIGATION ================= */}
        <nav className="hidden md:flex items-center gap-7 py-3 overflow-x-auto">
          {/* Category */}
          <button
            className="
              flex
              items-center
              gap-2
              shrink-0
              font-bold
              text-[13px]
              text-gray-900
              hover:text-[#c92127]
              transition-colors
            "
          >
            <Menu size={21} strokeWidth={2.5} />

            <span>DANH MỤC SẢN PHẨM</span>

            <ChevronDown size={16} />
          </button>

          {/* Menu */}
          {menus.map((menu) => (
            <a
              key={menu}
              href="#"
              onClick={() => setActive(menu)}
              className={`
                relative
                shrink-0
                text-[13px]
                font-semibold
                whitespace-nowrap
                transition-colors
                pb-1

                ${
                  active === menu
                    ? "text-[#c92127]"
                    : "text-gray-800 hover:text-[#c92127]"
                }
              `}
            >
              {menu}

              {/* Active underline */}
              {active === menu && (
                <span
                  className="
                    absolute
                    left-0
                    right-0
                    -bottom-0.5
                    h-[2px]
                    bg-[#c92127]
                    rounded-full
                  "
                />
              )}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}

export default Header;
