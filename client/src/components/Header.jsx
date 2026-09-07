import {
  Search,
  ShoppingCart,
  UserRound,
  Bell,
  Menu,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Avatar, Dropdown, message } from 'antd';
import {  UserOutlined, DownOutlined} from '@ant-design/icons';
import { useStore } from "../hooks/useStore";
import { requestLogout } from "../config/userRequest";

function Header() {
  const [active, setActive] = useState("Sách Trong Nước");
  const [showAccount, setShowAccount] = useState(false);
  const { dataUser, cart} = useStore();
  const navigate = useNavigate();
  console.log("dataUser:", dataUser);
 

  const menus = [
    "Sách Trong Nước",
    "FOREIGN BOOKS",
    "VPP - Dụng Cụ Học Sinh",
    "Đồ Chơi",
    "Làm Đẹp - Sức Khỏe",
  ];
  const HandleLogout = async() => {
      try {
        await requestLogout();
            setTimeout(() => {
                window.location.reload();
            }, 1000);
            navigate('/');
      } catch (error) {
        message.error(error);
      }
    }
      const userMenuItems = [
        { key: 'profile', label: 'Thông tin cá nhân', href: '/info-user' },
        { key: 'bookings', label: 'Đơn hàng của tôi', href: '/bookings' },
        { key: 'warranty', label: 'Quản lý bảo hành', href: '/warranty' },
        { key: 'logout', label: 'Đăng xuất', onClick: HandleLogout},

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
            {/* ================= LOGO ================= */}
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

            {/* ================= SEARCH ================= */}
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

            {/* ================= ACTIONS ================= */}
            <div className="flex items-center gap-4 md:gap-6 text-gray-700">
              {/* ================= NOTIFICATION ================= */}
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

              {/* ================= CART ================= */}
              <button
                onClick={() => navigate("/cart")}
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
                {/* Badge số lượng */}
  <span
    className="
      absolute 
      -top-1 
      -right-1 
      bg-[#c92127] 
      text-white 
      text-[10px] 
      font-bold 
      h-4 
      min-w-4 
      px-1 
      rounded-full 
      flex 
      items-center 
      justify-center 
      leading-none
    "
  >
    {cart?.cart?.products?.length || 0} {/* Thay 3 bằng biến số lượng giỏ hàng của bạn (ví dụ: {cartCount}) */}
  </span>

               

                <span className="hidden md:block text-[12px] mt-1">
                  Giỏ hàng
                </span>
              </button>

              {/* ================= ACCOUNT ================= */}

              <div className="relative">
                
                {/* Account Button */}
               {dataUser ? (
   <Dropdown
    menu={{ items: userMenuItems }}
                                
                                placement="bottomRight"
                                trigger={['click']}
                              popupRender={(menu) => (
                                    <div className="bg-white rounded-lg shadow-xl border border-gray-100 mt-1 min-w-[200px] overflow-hidden">
                                        <div className="px-4 py-3 border-b border-gray-100">
                                            <p className="font-medium text-gray-800">
                                                {dataUser.user.fullName || 'Người dùng'}
                                            </p>

                                            <p className="text-xs text-gray-500 truncate">{dataUser.email}</p>
                                        </div>
                                        {menu}
                                    </div>
                                )}
                            >
                                <div className="flex items-center cursor-pointer gap-2">
                                    <Avatar
                                        icon={<UserOutlined />}
                                        className="bg-green-500 flex items-center justify-center"
                                        size="large"
                                        src={`${import.meta.env.VITE_API_URL}/uploads/avatars/${dataUser.avatar}`}
                                    />
                                    <div className="hidden md:block">
                                        <span className="text-sm font-medium">{dataUser.user.fullName || 'Người dùng'}</span>
                                        <DownOutlined className="text-xs ml-1" />
                                    </div>
                                </div>
                            </Dropdown>
) : (
  <button
    onClick={() => setShowAccount(!showAccount)}
    className="flex flex-col items-center justify-center hover:text-[#c92127] transition-colors group"
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
)}
                 
               

                {/* ================= ACCOUNT DROPDOWN ================= */}
                {showAccount && (
                  <div
                    className="
                      absolute
                      right-0
                      mt-2
                      w-64
                      bg-white
                      rounded-lg
                      shadow-lg
                      border
                      border-gray-200
                      p-4
                      z-50
                    "
                  >
                    <div className="flex flex-col gap-3">
                      {/* ĐĂNG NHẬP */}
                      <Link
                        to="/login"
                        onClick={() => setShowAccount(false)}
                        className="
                          w-full
                          bg-[#c92127]
                          text-white
                          py-2.5
                          rounded-lg
                          font-bold
                          text-center
                          hover:bg-[#a30014]
                          transition-colors
                        "
                      >
                        Đăng nhập
                      </Link>

                      {/* ĐĂNG KÝ */}
                      <Link
                        to="/login"
                        onClick={() => setShowAccount(false)}
                        className="
                          w-full
                          border-2
                          border-[#c92127]
                          text-[#c92127]
                          py-2
                          rounded-lg
                          font-bold
                          text-center
                          hover:bg-[#c92127]
                          hover:text-white
                          transition-colors
                        "
                      >
                        Đăng ký
                      </Link>
                    </div>
                  </div>
                )}
              </div>
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
