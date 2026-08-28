import Header from "../components/Header";
import Footer from "../components/Footer";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
// import { requestLogin } from "../config/userRequest";

function LoginUser() {
  // =========================
  // STATE
  // =========================
  const [activeTab, setActiveTab] = useState("login");

  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });

  const [registerData, setRegisterData] = useState({
    phone: "",
    otp: "",
    password: "",
    otpMethod: "sms",
  });

  // =========================
  // LOGIN INPUT
  // =========================
  const handleLoginChange = (e) => {
    const { name, value } = e.target;

    setLoginData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================
  // REGISTER INPUT
  // =========================
  const handleRegisterChange = (e) => {
    const { name, value } = e.target;

    setRegisterData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================
  // LOGIN
  // =========================
  const handleLogin = (e) => {
    e.preventDefault();

    console.log("Login data:", loginData);

    // Sau này gọi API login ở đây
  };

  // =========================
  // REGISTER
  // =========================
  const handleRegister = (e) => {
    e.preventDefault();

    console.log("Register data:", registerData);

    // Sau này gọi API register ở đây
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#f2f4f5] text-[#191c1d]">
      {/* =========================
          HEADER
      ========================= */}
      <header className="shrink-0">
        <Header />
      </header>

      {/* =========================
          MAIN
      ========================= */}
      <main className="flex flex-1 items-center justify-center px-3 py-10 md:px-6 md:py-12">
        <div className="w-full max-w-[480px] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          {/* =========================
              TABS
          ========================= */}
          <div className="flex border-b border-gray-200">
            {/* ĐĂNG NHẬP */}
            <button
              type="button"
              onClick={() => setActiveTab("login")}
              className={`
                flex-1
                border-b-2
                py-4
                text-center
                text-lg
                font-semibold
                transition-colors
                ${
                  activeTab === "login"
                    ? "border-[#a30014] bg-white text-[#a30014]"
                    : "border-transparent bg-[#f8fafb] text-gray-500 hover:bg-gray-100"
                }
              `}
            >
              Đăng nhập
            </button>

            {/* ĐĂNG KÝ */}
            <button
              type="button"
              onClick={() => setActiveTab("register")}
              className={`
                flex-1
                border-b-2
                py-4
                text-center
                text-lg
                font-semibold
                transition-colors
                ${
                  activeTab === "register"
                    ? "border-[#a30014] bg-white text-[#a30014]"
                    : "border-transparent bg-[#f8fafb] text-gray-500 hover:bg-gray-100"
                }
              `}
            >
              Đăng ký
            </button>
          </div>

          {/* =========================
              CONTENT
          ========================= */}
          <div className="p-6 md:p-8">
            {/* =====================================================
                LOGIN
            ===================================================== */}
            {activeTab === "login" && (
              <div>
                <form onSubmit={handleLogin} className="space-y-5">
                  {/* USERNAME */}
                  <div>
                    <label
                      htmlFor="username"
                      className="mb-2 block text-sm font-semibold text-[#191c1d]"
                    >
                      Số điện thoại/Email
                    </label>

                    <input
                      id="username"
                      name="username"
                      type="text"
                      value={loginData.username}
                      onChange={handleLoginChange}
                      placeholder="Nhập số điện thoại hoặc email"
                      className="
                        h-11
                        w-full
                        rounded
                        border
                        border-gray-300
                        bg-[#f2f4f5]
                        px-4
                        text-sm
                        outline-none
                        transition-colors
                        focus:border-[#a30014]
                        focus:ring-1
                        focus:ring-[#a30014]
                      "
                    />
                  </div>

                  {/* PASSWORD */}
                  <div>
                    <label
                      htmlFor="login-password"
                      className="mb-2 block text-sm font-semibold text-[#191c1d]"
                    >
                      Mật khẩu
                    </label>

                    <div className="relative">
                      <input
                        id="login-password"
                        name="password"
                        type={showLoginPassword ? "text" : "password"}
                        value={loginData.password}
                        onChange={handleLoginChange}
                        placeholder="Nhập mật khẩu"
                        className="
                          h-11
                          w-full
                          rounded
                          border
                          border-gray-300
                          bg-[#f2f4f5]
                          pl-4
                          pr-12
                          text-sm
                          outline-none
                          transition-colors
                          focus:border-[#a30014]
                          focus:ring-1
                          focus:ring-[#a30014]
                        "
                      />

                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="
                          absolute
                          right-3
                          top-1/2
                          -translate-y-1/2
                          text-gray-500
                          transition
                          hover:text-[#a30014]
                        "
                      >
                        {showLoginPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* FORGOT PASSWORD */}
                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="
                        text-sm
                        text-gray-500
                        transition-colors
                        hover:text-[#a30014]
                      "
                    >
                      Quên mật khẩu?
                    </button>
                  </div>

                  {/* LOGIN BUTTON */}
                  <button
                    type="submit"
                    className="
                      mt-2
                      h-12
                      w-full
                      rounded-lg
                      bg-[#c92127]
                      text-base
                      font-semibold
                      text-white
                      transition-colors
                      hover:bg-[#a30014]
                      active:scale-[0.99]
                    "
                  >
                    Đăng nhập
                  </button>
                </form>

                {/* =========================
                    SOCIAL LOGIN
                ========================= */}
                <div className="mt-8">
                  <div className="relative mb-6 flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200" />
                    </div>

                    <div className="relative bg-white px-4 text-sm text-gray-500">
                      Hoặc đăng nhập bằng
                    </div>
                  </div>

                  <div className="flex justify-center gap-4">
                    {/* FACEBOOK */}
                    <button
                      type="button"
                      className="
                        flex
                        h-12
                        w-12
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-gray-200
                        bg-white
                        text-lg
                        font-bold
                        text-[#1877F2]
                        transition
                        hover:bg-gray-100
                      "
                    >
                      f
                    </button>

                    {/* GOOGLE */}
                    <button
                      type="button"
                      className="
                        flex
                        h-12
                        w-12
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-gray-200
                        bg-white
                        text-lg
                        font-bold
                        text-[#4285F4]
                        transition
                        hover:bg-gray-100
                      "
                    >
                      G
                    </button>

                    {/* APPLE */}
                    <button
                      type="button"
                      className="
                        flex
                        h-12
                        w-12
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-gray-200
                        bg-white
                        text-lg
                        font-bold
                        text-black
                        transition
                        hover:bg-gray-100
                      "
                    >
                      
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* =====================================================
                REGISTER
            ===================================================== */}
            {activeTab === "register" && (
              <div>
                <form onSubmit={handleRegister} className="space-y-5">
                  {/* PHONE */}
                  <div>
                    <label
                      htmlFor="phone"
                      className="mb-2 block text-sm font-semibold"
                    >
                      Số điện thoại
                    </label>

                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={registerData.phone}
                      onChange={handleRegisterChange}
                      placeholder="Nhập số điện thoại"
                      className="
                        h-11
                        w-full
                        rounded
                        border
                        border-gray-300
                        bg-[#f2f4f5]
                        px-4
                        text-sm
                        outline-none
                        transition
                        focus:border-[#a30014]
                        focus:ring-1
                        focus:ring-[#a30014]
                      "
                    />
                  </div>

                  {/* OTP METHOD */}
                  <div className="flex gap-6">
                    <label className="flex cursor-pointer items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name="otpMethod"
                        value="sms"
                        checked={registerData.otpMethod === "sms"}
                        onChange={handleRegisterChange}
                        className="accent-[#a30014]"
                      />

                      <span>SMS</span>
                    </label>

                    <label className="flex cursor-pointer items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name="otpMethod"
                        value="zalo"
                        checked={registerData.otpMethod === "zalo"}
                        onChange={handleRegisterChange}
                        className="accent-[#a30014]"
                      />

                      <span>Zalo</span>
                    </label>
                  </div>

                  {/* OTP */}
                  <div>
                    <label
                      htmlFor="otp"
                      className="mb-2 block text-sm font-semibold"
                    >
                      Mã xác nhận OTP
                    </label>

                    <div className="relative">
                      <input
                        id="otp"
                        name="otp"
                        type="text"
                        value={registerData.otp}
                        onChange={handleRegisterChange}
                        placeholder="Nhập mã OTP"
                        className="
                          h-11
                          w-full
                          rounded
                          border
                          border-gray-300
                          bg-[#f2f4f5]
                          pl-4
                          pr-24
                          text-sm
                          outline-none
                          transition
                          focus:border-[#a30014]
                          focus:ring-1
                          focus:ring-[#a30014]
                        "
                      />

                      <button
                        type="button"
                        className="
                          absolute
                          right-3
                          top-1/2
                          -translate-y-1/2
                          text-xs
                          font-bold
                          uppercase
                          tracking-wide
                          text-[#a30014]
                          hover:text-[#c92127]
                        "
                      >
                        Gửi mã
                      </button>
                    </div>
                  </div>

                  {/* REGISTER PASSWORD */}
                  <div>
                    <label
                      htmlFor="register-password"
                      className="mb-2 block text-sm font-semibold"
                    >
                      Mật khẩu
                    </label>

                    <div className="relative">
                      <input
                        id="register-password"
                        name="password"
                        type={showRegisterPassword ? "text" : "password"}
                        value={registerData.password}
                        onChange={handleRegisterChange}
                        placeholder="Nhập mật khẩu"
                        className="
                          h-11
                          w-full
                          rounded
                          border
                          border-gray-300
                          bg-[#f2f4f5]
                          pl-4
                          pr-12
                          text-sm
                          outline-none
                          transition
                          focus:border-[#a30014]
                          focus:ring-1
                          focus:ring-[#a30014]
                        "
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowRegisterPassword(!showRegisterPassword)
                        }
                        className="
                          absolute
                          right-3
                          top-1/2
                          -translate-y-1/2
                          text-gray-500
                          hover:text-[#a30014]
                        "
                      >
                        {showRegisterPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* REGISTER BUTTON */}
                  <button
                    type="submit"
                    className="
                      mt-2
                      h-12
                      w-full
                      rounded-lg
                      bg-[#c92127]
                      text-base
                      font-semibold
                      text-white
                      transition
                      hover:bg-[#a30014]
                      active:scale-[0.99]
                    "
                  >
                    Đăng ký
                  </button>
                </form>
              </div>
            )}

            {/* =========================
                TERMS
            ========================= */}
            <div className="mt-8 text-center text-sm leading-5 text-gray-500">
              Bằng việc đăng nhập, bạn đồng ý với{" "}
              <button type="button" className="text-[#a30014] hover:underline">
                Điều khoản sử dụng
              </button>{" "}
              và{" "}
              <button type="button" className="text-[#a30014] hover:underline">
                Chính sách bảo mật
              </button>{" "}
              của Bookstore.com
            </div>
          </div>
        </div>
      </main>

      {/* =========================
          FOOTER
      ========================= */}
      <footer className="mt-auto">
        <Footer />
      </footer>
    </div>
  );
}

export default LoginUser;
