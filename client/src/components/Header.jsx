import {

  ShoppingCart,
  UserRound,
  Bell,
  Menu,
  ChevronDown,
} from "lucide-react";
import { useState,useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Avatar, Dropdown, message } from 'antd';
import {  UserOutlined, DownOutlined} from '@ant-design/icons';
import { useStore } from "../hooks/useStore";
import { requestLogout } from "../config/userRequest";
import { listCategory } from "../config/categoryRequest";
import {  useParams } from "react-router-dom";
import SearchBox from "./SearchBox";

function Header() {
  const [active, setActive] = useState("Sách Trong Nước");
  const [showAccount, setShowAccount] = useState(false);
  const { dataUser, cart} = useStore();
   const [categories, setCategories] = useState([]);
   
   const { id: activeCategory } = useParams();
  const navigate = useNavigate();

 

 const menus = [
  { label: "Bài viết", path: "/blogs" },
  { label: "Liên hệ", path: "/" },
  { label: "Yêu thích", path: "/favorite" }, // đổi path cho đúng route của bạn
  { label: "Giới thiệu", path: "/" },
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
    {
        key: 'profile',
        label: 'Thông tin cá nhân',
        onClick: () => navigate('/info-user'),
    },
    {
        key: 'bookings',
        label: 'Đơn hàng của tôi',
        onClick: () => navigate('/order'),
    },
    {
        key: 'logout',
        label: 'Đăng xuất',
        onClick: HandleLogout,
    },
];
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const res = await listCategory();
        setCategories(res.metadata || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategory();
  
  }, []);
    


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
  <SearchBox />
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
                                     src={dataUser?.user?.avatar || undefined}
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
          <div className="md:hidden mt-4"><SearchBox mobile /></div>
        </div>

        {/* ================= NAVIGATION ================= */}
        <nav className="hidden md:flex items-center gap-7 py-3">
         {/* Category */}
{/* Category */}
<div className="relative group shrink-0">
  <button
    className="
      flex items-center gap-2 shrink-0
      font-bold text-[13px] text-gray-900
      hover:text-[#c92127] transition-colors
    "
  >
    <Menu size={21} strokeWidth={2.5} />
   
    <ChevronDown
      size={16}
      className="transition-transform duration-200 group-hover:rotate-180"
    />
  </button>

  {/* Dropdown */}
  <div
    className="
      absolute top-full left-0 z-50 pt-3 w-60
      opacity-0 invisible translate-y-2
      group-hover:opacity-100 group-hover:visible group-hover:translate-y-0
      transition-all duration-200 ease-out
    "
  >
    <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.15)] overflow-hidden">
      {/* Tiêu đề */}
      <h3 className="px-6 pt-6 pb-3 text-[20px] font-bold text-gray-500 leading-tight">
        Danh mục sản phẩm
      </h3>

      {/* Danh sách */}
      <ul className="px-3 pb-3 max-h-[380px] overflow-y-auto space-y-1">
        {categories.length > 0 ? (
          categories.map((category) => {
            const isActive = activeCategory === category._id;

            return (
              <li key={category._id}>
                <Link
                  to={`/category/${category._id}`}
                  
                  className={`
                    block px-4 py-4 rounded-xl
                    text-[15px] font-bold text-gray-900
                    transition-colors
                    ${
                      isActive
                        ? "bg-[#f3f4f6]"
                        : "hover:bg-[#f3f4f6]"
                    }
                  `}
                >
                  {category.nameCategory}
                </Link>
              </li>
            );
          })
        ) : (
          <li className="px-4 py-4 text-sm text-gray-400">
            Chưa có danh mục
          </li>
        )}
      </ul>
    </div>
  </div>
</div>
        

          {/* Menu */}
          {menus.map((menu) => (
  <Link
    key={menu.label}
    to={menu.path}
    onClick={() => setActive(menu.label)}
    className={`
      relative
      shrink-0
      text-[13px]
      font-semibold
      whitespace-nowrap
      transition-colors
      pb-1
      ${
        active === menu.label
          ? "text-[#c92127]"
          : "text-gray-800 hover:text-[#c92127]"
      }
    `}
  >
    {menu.label}

    {active === menu.label && (
      <span className="absolute left-0 right-0 -bottom-0.5 h-[2px] rounded-full bg-[#c92127]" />
    )}
  </Link>
))}
        </nav>
      </div>
    </header>
  );
}

export default Header;
