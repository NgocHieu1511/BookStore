import { useState } from "react";
import { message } from "antd";
import { useNavigate } from "react-router-dom";
import {
    Mail,
    ArrowLeft,
    ShieldCheck,
    LockKeyhole,
    KeyRound,
    Eye,
    EyeOff,
    ChevronLeft,
} from "lucide-react";

import {
    requestForgotPassword,
    requestVerifyForgotPassword,
} from "../config/userRequest";
import Header from "../components/Header";
import Footer from "../components/Footer";

function ForgotPassword() {
    const navigate = useNavigate();

    const [step, setStep] = useState(1);

    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [loading, setLoading] = useState(false);

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

    // =========================
    // GỬI OTP
    // =========================

    const handleSendOTP = async (e) => {
        e.preventDefault();

        if (!email.trim()) {
            message.error("Vui lòng nhập email");
            return;
        }

        setLoading(true);

        try {
            await requestForgotPassword({
                email: email.trim(),
            });

            message.success("Mã OTP đã được gửi đến email");

            setStep(2);
        } catch (error) {
            message.error(
                error.response?.data?.message ||
                    "Không thể gửi OTP"
            );
        } finally {
            setLoading(false);
        }
    };

    // =========================
    // ĐỔI MẬT KHẨU
    // =========================

    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (!otp || !password || !confirmPassword) {
            message.error("Vui lòng nhập đầy đủ thông tin");
            return;
        }

        if (password.length < 6) {
            message.error(
                "Mật khẩu phải có ít nhất 6 ký tự"
            );
            return;
        }

        if (password !== confirmPassword) {
            message.error(
                "Mật khẩu xác nhận không khớp"
            );
            return;
        }

        setLoading(true);

        try {
            await requestVerifyForgotPassword({
                otp,
                password,
            });

            message.success("Đổi mật khẩu thành công");

            setTimeout(() => {
                navigate("/login");
            }, 1000);
        } catch (error) {
            message.error(
                error.response?.data?.message ||
                    "Đổi mật khẩu thất bại"
            );
        } finally {
            setLoading(false);
        }
    };

    // =========================
    // QUAY LẠI BƯỚC 1
    // =========================

    const handleBackToEmail = () => {
        setStep(1);
        setOtp("");
        setPassword("");
        setConfirmPassword("");
    };

    return (
        <div className="min-h-screen bg-[#f0f0f0] flex flex-col">
            <Header />

            {/* =========================
                MAIN
            ========================= */}

            <main className="flex-grow w-full max-w-6xl mx-auto px-4 py-6">

                <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-10 mb-8 max-w-3xl mx-auto">

                    {/* =========================
                        BACK TO LOGIN
                    ========================= */}

                    <div className="mb-5">
                        <button
                            type="button"
                            onClick={() => navigate("/login")}
                            className="
                                inline-flex
                                items-center
                                text-xs
                                md:text-sm
                                text-sky-600
                                hover:text-sky-800
                                font-medium
                                transition-colors
                            "
                        >
                            <ChevronLeft
                                size={16}
                                className="mr-1"
                            />

                            Quay lại màn hình Đăng nhập
                        </button>
                    </div>

                    {/* =========================
                        HEADER
                    ========================= */}

                    <div className="text-center mt-2 mb-8">

                        <div className="
                            mx-auto
                            mb-4
                            w-14
                            h-14
                            rounded-full
                            bg-red-50
                            flex
                            items-center
                            justify-center
                        ">
                            {step === 1 ? (
                                <LockKeyhole
                                    size={28}
                                    strokeWidth={1.8}
                                    className="text-[#C92127]"
                                />
                            ) : (
                                <ShieldCheck
                                    size={28}
                                    strokeWidth={1.8}
                                    className="text-[#C92127]"
                                />
                            )}
                        </div>

                        <h1 className="
                            text-xl
                            md:text-2xl
                            font-bold
                            text-gray-800
                            uppercase
                            tracking-wide
                        ">
                            {step === 1
                                ? "QUÊN MẬT KHẨU?"
                                : "ĐẶT LẠI MẬT KHẨU"}
                        </h1>

                        <p className="
                            text-xs
                            md:text-sm
                            text-gray-600
                            mt-2
                            max-w-md
                            mx-auto
                            leading-relaxed
                        ">
                            {step === 1
                                ? "Vui lòng nhập email của bạn. Chúng tôi sẽ gửi mã OTP để xác thực tài khoản."
                                : "Nhập mã OTP được gửi đến email và tạo mật khẩu mới cho tài khoản của bạn."}
                        </p>

                    </div>

                    {/* =========================
                        STEP INDICATOR
                    ========================= */}

                    <div className="max-w-md mx-auto mb-8">

                        <div className="flex items-center">

                            {/* STEP 1 */}

                            <div className="flex items-center">

                                <div
                                    className={`
                                        w-8
                                        h-8
                                        rounded-full
                                        flex
                                        items-center
                                        justify-center
                                        text-xs
                                        font-bold
                                        transition
                                        ${
                                            step >= 1
                                                ? "bg-[#C92127] text-white"
                                                : "bg-gray-200 text-gray-500"
                                        }
                                    `}
                                >
                                    1
                                </div>

                                <span className="
                                    ml-2
                                    text-xs
                                    font-medium
                                    text-gray-600
                                ">
                                    Nhập Email
                                </span>

                            </div>

                            {/* LINE */}

                            <div className="
                                flex-1
                                h-px
                                bg-gray-200
                                mx-3
                            " />

                            {/* STEP 2 */}

                            <div className="flex items-center">

                                <div
                                    className={`
                                        w-8
                                        h-8
                                        rounded-full
                                        flex
                                        items-center
                                        justify-center
                                        text-xs
                                        font-bold
                                        transition
                                        ${
                                            step === 2
                                                ? "bg-[#C92127] text-white"
                                                : "bg-gray-200 text-gray-500"
                                        }
                                    `}
                                >
                                    2
                                </div>

                                <span className="
                                    ml-2
                                    text-xs
                                    font-medium
                                    text-gray-600
                                ">
                                    Đặt mật khẩu
                                </span>

                            </div>

                        </div>

                    </div>

                    {/* =========================
                        STEP 1
                    ========================= */}

                    {step === 1 && (
                        <form
                            onSubmit={handleSendOTP}
                            className="max-w-md mx-auto space-y-5"
                        >

                            {/* EMAIL */}

                            <div>

                                <label
                                    htmlFor="email"
                                    className="
                                        block
                                        text-xs
                                        md:text-sm
                                        font-medium
                                        text-gray-700
                                        mb-1.5
                                    "
                                >
                                    <span className="text-[#C92127] font-bold">
                                        *
                                    </span>{" "}
                                    Địa chỉ Email
                                </label>

                                <div className="relative">

                                    <Mail
                                        size={17}
                                        className="
                                            absolute
                                            left-3.5
                                            top-1/2
                                            -translate-y-1/2
                                            text-gray-400
                                        "
                                    />

                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(
                                                e.target.value
                                            )
                                        }
                                        placeholder="Nhập địa chỉ email của bạn"
                                        autoComplete="email"
                                        className="
                                            w-full
                                            pl-10
                                            pr-3.5
                                            py-2.5
                                            text-sm
                                            border
                                            border-gray-300
                                            rounded-md
                                            focus:outline-none
                                            focus:ring-2
                                            focus:ring-[#C92127]
                                            focus:border-[#C92127]
                                            transition
                                        "
                                    />

                                </div>

                            </div>

                            {/* SUBMIT */}

                            <div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="
                                        w-full
                                        bg-[#C92127]
                                        hover:bg-[#a8181d]
                                        active:bg-[#921419]
                                        disabled:bg-gray-400
                                        text-white
                                        font-bold
                                        py-2.5
                                        px-4
                                        rounded-md
                                        shadow
                                        transition
                                        duration-150
                                        uppercase
                                        tracking-wider
                                        text-sm
                                    "
                                >
                                    {loading
                                        ? "ĐANG GỬI..."
                                        : "GỬI MÃ OTP"}
                                </button>

                            </div>

                        </form>
                    )}

                    {/* =========================
                        STEP 2
                    ========================= */}

                    {step === 2 && (
                        <form
                            onSubmit={handleResetPassword}
                            className="max-w-md mx-auto space-y-5"
                        >

                            {/* EMAIL DISPLAY */}

                            <div className="
                                bg-gray-50
                                border
                                border-gray-200
                                rounded-md
                                px-4
                                py-3
                            ">

                                <div className="
                                    flex
                                    items-center
                                    gap-2
                                ">

                                    <Mail
                                        size={16}
                                        className="text-[#C92127]"
                                    />

                                    <span className="
                                        text-xs
                                        text-gray-500
                                    ">
                                        Mã OTP đã gửi đến
                                    </span>

                                </div>

                                <p className="
                                    text-sm
                                    font-semibold
                                    text-gray-800
                                    mt-1
                                    break-all
                                ">
                                    {email}
                                </p>

                            </div>

                            {/* OTP */}

                            <div>

                                <label
                                    htmlFor="otp"
                                    className="
                                        block
                                        text-xs
                                        md:text-sm
                                        font-medium
                                        text-gray-700
                                        mb-1.5
                                    "
                                >
                                    <span className="text-[#C92127] font-bold">
                                        *
                                    </span>{" "}
                                    Mã OTP
                                </label>

                                <div className="relative">

                                    <KeyRound
                                        size={17}
                                        className="
                                            absolute
                                            left-3.5
                                            top-1/2
                                            -translate-y-1/2
                                            text-gray-400
                                        "
                                    />

                                    <input
                                        id="otp"
                                        type="text"
                                        value={otp}
                                        onChange={(e) =>
                                            setOtp(
                                                e.target.value
                                            )
                                        }
                                        placeholder="Nhập mã OTP"
                                        maxLength={6}
                                        className="
                                            w-full
                                            pl-10
                                            pr-3.5
                                            py-2.5
                                            text-sm
                                            border
                                            border-gray-300
                                            rounded-md
                                            tracking-[0.3em]
                                            font-semibold
                                            focus:outline-none
                                            focus:ring-2
                                            focus:ring-[#C92127]
                                            focus:border-[#C92127]
                                            transition
                                        "
                                    />

                                </div>

                            </div>

                            {/* PASSWORD */}

                            <div>

                                <label
                                    htmlFor="password"
                                    className="
                                        block
                                        text-xs
                                        md:text-sm
                                        font-medium
                                        text-gray-700
                                        mb-1.5
                                    "
                                >
                                    <span className="text-[#C92127] font-bold">
                                        *
                                    </span>{" "}
                                    Mật khẩu mới
                                </label>

                                <div className="relative">

                                    <LockKeyhole
                                        size={17}
                                        className="
                                            absolute
                                            left-3.5
                                            top-1/2
                                            -translate-y-1/2
                                            text-gray-400
                                        "
                                    />

                                    <input
                                        id="password"
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(
                                                e.target.value
                                            )
                                        }
                                        placeholder="Nhập mật khẩu mới"
                                        autoComplete="new-password"
                                        className="
                                            w-full
                                            pl-10
                                            pr-11
                                            py-2.5
                                            text-sm
                                            border
                                            border-gray-300
                                            rounded-md
                                            focus:outline-none
                                            focus:ring-2
                                            focus:ring-[#C92127]
                                            focus:border-[#C92127]
                                            transition
                                        "
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(
                                                !showPassword
                                            )
                                        }
                                        className="
                                            absolute
                                            right-3
                                            top-1/2
                                            -translate-y-1/2
                                            text-gray-400
                                            hover:text-gray-600
                                        "
                                    >
                                        {showPassword ? (
                                            <EyeOff size={17} />
                                        ) : (
                                            <Eye size={17} />
                                        )}
                                    </button>

                                </div>

                                <p className="
                                    mt-1.5
                                    text-[11px]
                                    text-gray-400
                                ">
                                    Mật khẩu phải có ít nhất 6 ký tự
                                </p>

                            </div>

                            {/* CONFIRM PASSWORD */}

                            <div>

                                <label
                                    htmlFor="confirmPassword"
                                    className="
                                        block
                                        text-xs
                                        md:text-sm
                                        font-medium
                                        text-gray-700
                                        mb-1.5
                                    "
                                >
                                    <span className="text-[#C92127] font-bold">
                                        *
                                    </span>{" "}
                                    Xác nhận mật khẩu
                                </label>

                                <div className="relative">

                                    <LockKeyhole
                                        size={17}
                                        className="
                                            absolute
                                            left-3.5
                                            top-1/2
                                            -translate-y-1/2
                                            text-gray-400
                                        "
                                    />

                                    <input
                                        id="confirmPassword"
                                        type={
                                            showConfirmPassword
                                                ? "text"
                                                : "password"
                                        }
                                        value={
                                            confirmPassword
                                        }
                                        onChange={(e) =>
                                            setConfirmPassword(
                                                e.target.value
                                            )
                                        }
                                        placeholder="Nhập lại mật khẩu"
                                        autoComplete="new-password"
                                        className="
                                            w-full
                                            pl-10
                                            pr-11
                                            py-2.5
                                            text-sm
                                            border
                                            border-gray-300
                                            rounded-md
                                            focus:outline-none
                                            focus:ring-2
                                            focus:ring-[#C92127]
                                            focus:border-[#C92127]
                                            transition
                                        "
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowConfirmPassword(
                                                !showConfirmPassword
                                            )
                                        }
                                        className="
                                            absolute
                                            right-3
                                            top-1/2
                                            -translate-y-1/2
                                            text-gray-400
                                            hover:text-gray-600
                                        "
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff size={17} />
                                        ) : (
                                            <Eye size={17} />
                                        )}
                                    </button>

                                </div>

                            </div>

                            {/* SUBMIT */}

                            <div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="
                                        w-full
                                        bg-[#C92127]
                                        hover:bg-[#a8181d]
                                        active:bg-[#921419]
                                        disabled:bg-gray-400
                                        text-white
                                        font-bold
                                        py-2.5
                                        px-4
                                        rounded-md
                                        shadow
                                        transition
                                        duration-150
                                        uppercase
                                        tracking-wider
                                        text-sm
                                    "
                                >
                                    {loading
                                        ? "ĐANG XỬ LÝ..."
                                        : "ĐẶT LẠI MẬT KHẨU"}
                                </button>

                            </div>

                            {/* BACK STEP */}

                            <button
                                type="button"
                                onClick={handleBackToEmail}
                                className="
                                    w-full
                                    flex
                                    items-center
                                    justify-center
                                    gap-1
                                    text-xs
                                    text-gray-500
                                    hover:text-[#C92127]
                                    transition
                                "
                            >
                                <ArrowLeft size={14} />
                                Thay đổi email
                            </button>

                        </form>
                    )}

                </section>

            </main>

            {/* =========================
                NEWSLETTER
            ========================= */}

            <aside className="
                bg-[#999999]
                py-3.5
                px-4
            ">

                <div className="
                    max-w-6xl
                    mx-auto
                    flex
                    flex-col
                    md:flex-row
                    items-center
                    justify-between
                    gap-3
                ">

                    <div className="
                        flex
                        items-center
                        space-x-2.5
                        text-white
                        font-medium
                        text-sm
                    ">
                        <Mail size={18} />

                        <span>
                            ĐĂNG KÝ NHẬN BẢN TIN
                        </span>
                    </div>

                    <div className="
                        w-full
                        md:w-auto
                        flex-1
                        max-w-lg
                        flex
                        items-center
                    ">

                        <input
                            type="email"
                            placeholder="Nhập địa chỉ email của bạn"
                            className="
                                w-full
                                text-xs
                                md:text-sm
                                px-3.5
                                py-2
                                border
                                border-transparent
                                rounded-l-md
                                focus:outline-none
                            "
                        />

                        <button
                            type="button"
                            className="
                                bg-[#F39801]
                                hover:bg-[#d88400]
                                text-white
                                text-xs
                                md:text-sm
                                font-semibold
                                px-6
                                py-2
                                rounded-r-md
                                shrink-0
                                transition-colors
                            "
                        >
                            Đăng ký
                        </button>

                    </div>

                </div>

            </aside>

            {/* =========================
                FOOTER
            ========================= */}

       <Footer />

        </div>
    );
}

export default ForgotPassword;