
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { message } from "antd";
import {
  CheckCircle,
  Package,
  User,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Calendar,
} from "lucide-react";

import { requestPaymentById } from "../config/paymentRequest";

function PaymentSuccess() {
  // Lấy orderId từ URL
  // Ví dụ: /payment-success/68c123abc...
  const { orderId } = useParams();

  // Lưu thông tin đơn hàng
  const [dataPayment, setDataPayment] = useState(null);

const [loading, setLoading] = useState(false); // Khởi tạo mặc định là false

useEffect(() => {
  // Nếu không có orderId, dừng luôn, không gọi setLoading đồng bộ nữa
  if (!orderId) return;

  const fetchDataPayment = async () => {
    setLoading(true); // Gọi trong async function -> an toàn, không bị warning
    try {
      // Gọi API lấy đơn hàng theo orderId
      const res = await requestPaymentById(orderId);

      // Backend trả về dữ liệu trong metadata
      setDataPayment(res.metadata);
    } catch (error) {
      console.error("Lỗi lấy thông tin thanh toán:", error);
      message.error("Không thể tải thông tin đơn hàng");
    } finally {
      // Chạy sau khi API xong (async) -> an toàn
      setLoading(false);
    }
  };

  fetchDataPayment();
}, [orderId]);

  // ============================
  // FORMAT GIÁ TIỀN
  // ============================
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price || 0);
  };

  // ============================
  // FORMAT NGÀY
  // ============================
  const formatDate = (date) => {
    if (!date) return "Không có thông tin";

    return new Date(date).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ============================
  // HIỂN THỊ TÊN PHƯƠNG THỨC
  // ============================
  const getPaymentMethodName = (method) => {
    const methods = {
      cod: "Thanh toán khi nhận hàng (COD)",
      momo: "Ví MoMo",
      vnpay: "VNPay",
    };

    return methods[method] || method || "Không xác định";
  };

  // ============================
  // HIỂN THỊ TRẠNG THÁI
  // ============================
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        text: "Chờ xác nhận",
        color: "bg-yellow-100 text-yellow-800",
      },

      confirmed: {
        text: "Đã xác nhận",
        color: "bg-blue-100 text-blue-800",
      },

      delivered: {
        text: "Đang giao hàng",
        color: "bg-purple-100 text-purple-800",
      },

      completed: {
        text: "Hoàn thành",
        color: "bg-green-100 text-green-800",
      },

      cancelled: {
        text: "Đã hủy",
        color: "bg-red-100 text-red-800",
      },
    };

    const config =
      statusConfig[status] || {
        text: status || "Không xác định",
        color: "bg-gray-100 text-gray-800",
      };

    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-semibold ${config.color}`}
      >
        {config.text}
      </span>
    );
  };

  // ============================
  // ĐANG LOADING
  // ============================
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f2f5]">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 h-20 flex items-center">
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
          </div>
        </header>

        <div className="flex items-center justify-center min-h-[500px]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-[#c92127] rounded-full animate-spin mx-auto mb-4"></div>

            <p className="text-gray-600">
              Đang tải thông tin đơn hàng...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ============================
  // KHÔNG TÌM THẤY ĐƠN HÀNG
  // ============================
  if (!dataPayment) {
    return (
      <div className="min-h-screen bg-[#f0f2f5]">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 h-20 flex items-center">
            <div className="text-2xl font-black italic tracking-tight text-[#c92127]">
              📚 Bookstore<span className="text-gray-800">.com</span>
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 py-16">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 text-center">
            <div className="flex justify-center mb-5">
              <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-4xl text-red-500">✕</span>
              </div>
            </div>

            <h1 className="text-2xl font-bold text-gray-800 mb-3">
              Không tìm thấy đơn hàng
            </h1>

            <p className="text-gray-500 mb-6">
              Đơn hàng không tồn tại hoặc đã xảy ra lỗi khi tải dữ liệu.
            </p>

            <Link
              to="/"
              className="inline-block px-6 py-3 rounded-lg bg-[#c92127] text-white font-bold hover:bg-[#a81a1f] transition"
            >
              VỀ TRANG CHỦ
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // Danh sách sản phẩm
  const products = dataPayment.products || [];

  // Tính số tiền giảm
  const discountAmount =
    (dataPayment.totalPrice || 0) - (dataPayment.finalPrice || 0);

  return (
    <div className="min-h-screen bg-[#f0f2f5] text-[#333] flex flex-col">

      {/* ============================
          TOP NOTIFICATION
      ============================ */}
      <div className="bg-[#c92127] text-white text-sm font-semibold text-center py-2 px-4">
        🎉 CHÚC MỪNG BẠN ĐÃ THANH TOÁN THÀNH CÔNG! 🎉
      </div>

      {/* ============================
          HEADER
      ============================ */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-3">
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

            <div className="h-6 w-px bg-gray-300"></div>

            <span className="text-sm font-bold tracking-wider text-gray-700 uppercase">
              THANH TOÁN
            </span>
          </div>

          {/* Step */}
          <div className="hidden md:flex items-center gap-4 text-xs font-medium">

            <div className="flex items-center gap-2 text-gray-500">
              <span className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center font-bold">
                ✓
              </span>

              <span>Giỏ hàng</span>
            </div>

            <span className="w-8 h-px bg-gray-300"></span>

            <div className="flex items-center gap-2 text-gray-500">
              <span className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center font-bold">
                ✓
              </span>

              <span>Thanh toán</span>
            </div>

            <span className="w-8 h-px bg-gray-300"></span>

            <div className="flex items-center gap-2 text-[#c92127] font-bold">
              <span className="w-5 h-5 rounded-full bg-[#c92127] text-white flex items-center justify-center">
                3
              </span>

              <span>Hoàn tất</span>
            </div>
          </div>
        </div>
      </header>

      {/* ============================
          MAIN
      ============================ */}
      <main className="max-w-6xl mx-auto px-4 py-8 w-full flex-grow">

        {/* ============================
            SUCCESS CARD
        ============================ */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-10 text-center">

          {/* Success icon */}
          <div className="flex justify-center mb-5">
            <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                <CheckCircle size={42} />
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-emerald-600 mb-3">
            THANH TOÁN THÀNH CÔNG!
          </h1>

          <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto">
            Cảm ơn bạn đã mua hàng tại{" "}
            <span className="font-bold text-gray-900">
              Bookstore.com
            </span>
            . Đơn hàng của bạn đã được ghi nhận thành công.
          </p>

          {/* Order ID */}
          <div className="mt-6 max-w-xl mx-auto bg-gray-50 rounded-lg p-5 border border-gray-200 text-left space-y-3">

            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <span className="text-gray-500 text-sm">
                Mã đơn hàng:
              </span>

              <span className="font-mono font-bold text-[#c92127] text-base break-all ml-4">
                #{dataPayment._id}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">
                Trạng thái:
              </span>

              {getStatusBadge(dataPayment.status)}
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">
                Phương thức:
              </span>

              <span className="font-semibold text-gray-800">
                {getPaymentMethodName(dataPayment.paymentMethod)}
              </span>
            </div>

          </div>

          {/* Success message */}
          <div className="mt-4 max-w-xl mx-auto bg-emerald-50 border border-emerald-100 rounded-lg p-4 text-left flex items-start gap-3">

            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 font-bold">
              ✓
            </div>

            <div>
              <p className="font-bold text-emerald-800 text-sm">
                Thanh toán đã được xác nhận
              </p>

              <p className="text-emerald-700 text-xs mt-1">
                Đơn hàng của bạn đã được ghi nhận và đang được chuẩn bị
                để giao đến bạn.
              </p>
            </div>

          </div>
        </section>

        {/* ============================
            ORDER CONTENT
        ============================ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">

          {/* ============================
              LEFT
          ============================ */}
          <div className="lg:col-span-2 space-y-6">

            {/* CUSTOMER INFORMATION */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">

              <h2 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2">
                <User size={23} />
                Thông Tin Người Nhận
              </h2>

              <div className="space-y-4">

                {/* Full name */}
                <div className="flex items-start gap-3">
                  <User
                    className="text-gray-500 mt-1 flex-shrink-0"
                    size={19}
                  />

                  <div>
                    <p className="text-sm text-gray-500">
                      Họ và tên
                    </p>

                    <p className="font-semibold text-gray-800">
                      {dataPayment.fullName || "Không có thông tin"}
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-3">
                  <Phone
                    className="text-gray-500 mt-1 flex-shrink-0"
                    size={19}
                  />

                  <div>
                    <p className="text-sm text-gray-500">
                      Số điện thoại
                    </p>

                    <p className="font-semibold text-gray-800">
                      {dataPayment.phoneNumber || "Không có thông tin"}
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-3">
                  <Mail
                    className="text-gray-500 mt-1 flex-shrink-0"
                    size={19}
                  />

                  <div>
                    <p className="text-sm text-gray-500">
                      Email
                    </p>

                    <p className="font-semibold text-gray-800">
                      {dataPayment.email || "Không có thông tin"}
                    </p>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-3">
                  <MapPin
                    className="text-gray-500 mt-1 flex-shrink-0"
                    size={19}
                  />

                  <div>
                    <p className="text-sm text-gray-500">
                      Địa chỉ giao hàng
                    </p>

                    <p className="font-semibold text-gray-800">
                      {dataPayment.address || "Không có thông tin"}
                    </p>
                  </div>
                </div>

              </div>
            </section>

            {/* PRODUCTS */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">

              <h2 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2">
                <Package size={23} />
                Sản Phẩm Đã Đặt
              </h2>

              {products.length === 0 ? (
                <p className="text-gray-500 text-center py-5">
                  Không có sản phẩm trong đơn hàng.
                </p>
              ) : (
                <div className="space-y-4">

                  {products.map((item) => {

                    // productId là object do backend populate
                    const product = item.productId;

                    // Tránh lỗi nếu product không tồn tại
                    if (!product) {
                      return null;
                    }

                    const price = product.priceProduct || 0;

                    const discount =
                      product.discountProduct || 0;

                    const priceAfterDiscount =
                      price - (price * discount) / 100;

                    const subtotal =
                      priceAfterDiscount * (item.quantity || 0);

                    return (
                      <div
                        key={item._id}
                        className="flex gap-4 pb-4 border-b border-gray-200 last:border-0"
                      >

                        {/* Product image */}
                        <img
                          src={product.imagesProduct?.[0]}
                          alt={product.nameProduct}
                          className="w-24 h-32 object-cover rounded-lg bg-gray-100"
                        />

                        {/* Product information */}
                        <div className="flex-grow">

                          <h3 className="font-semibold text-gray-800 mb-2">
                            {product.nameProduct}
                          </h3>

                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {product.descriptionProduct}
                          </p>

                          {/* Price */}
                          <div className="flex items-center gap-3 mb-2">

                            {discount > 0 && (
                              <span className="text-sm text-gray-400 line-through">
                                {formatPrice(price)}
                              </span>
                            )}

                            <span className="text-base font-bold text-[#c92127]">
                              {formatPrice(priceAfterDiscount)}
                            </span>

                            {discount > 0 && (
                              <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-xs font-semibold">
                                -{discount}%
                              </span>
                            )}

                          </div>

                          {/* Quantity + subtotal */}
                          <div className="flex justify-between items-center">

                            <p className="text-sm text-gray-600">
                              Số lượng: {item.quantity}
                            </p>

                            <p className="text-base font-bold text-gray-800">
                              {formatPrice(subtotal)}
                            </p>

                          </div>

                        </div>
                      </div>
                    );
                  })}

                </div>
              )}
            </section>

          </div>

          {/* ============================
              RIGHT - ORDER SUMMARY
          ============================ */}
          <div className="lg:col-span-1">

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-4 space-y-6">

              {/* ORDER INFORMATION */}
              <div>

                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Thông Tin Đơn Hàng
                </h2>

                <div className="space-y-4">

                  {/* Date */}
                  <div className="flex items-center gap-3">

                    <Calendar
                      className="text-gray-500 flex-shrink-0"
                      size={19}
                    />

                    <div className="flex-grow">
                      <p className="text-xs text-gray-500">
                        Ngày đặt
                      </p>

                      <p className="text-sm font-semibold text-gray-800">
                        {formatDate(dataPayment.createdAt)}
                      </p>
                    </div>

                  </div>

                  {/* Payment method */}
                  <div className="flex items-center gap-3">

                    <CreditCard
                      className="text-gray-500 flex-shrink-0"
                      size={19}
                    />

                    <div className="flex-grow">

                      <p className="text-xs text-gray-500">
                        Phương thức thanh toán
                      </p>

                      <p className="text-sm font-semibold text-gray-800">
                        {getPaymentMethodName(
                          dataPayment.paymentMethod
                        )}
                      </p>

                    </div>
                  </div>

                  {/* Status */}
                  <div>

                    <p className="text-xs text-gray-500 mb-2">
                      Trạng thái
                    </p>

                    {getStatusBadge(dataPayment.status)}

                  </div>

                </div>
              </div>

              {/* PRICE SUMMARY */}
              <div className="border-t border-gray-200 pt-5">

                <h3 className="font-bold text-gray-800 mb-4">
                  Chi Tiết Thanh Toán
                </h3>

                <div className="space-y-3">

                  {/* Total price */}
                  <div className="flex justify-between text-gray-700">

                    <span>Tạm tính</span>

                    <span className="font-semibold">
                      {formatPrice(dataPayment.totalPrice)}
                    </span>

                  </div>

                  {/* Coupon */}
                  {dataPayment.couponId && (
                    <div className="flex justify-between gap-3 text-green-600">

                      <span>
                        Giảm giá (
                        {dataPayment.couponId.nameCoupon}
                        {dataPayment.couponId.discount != null &&
                          ` - ${dataPayment.couponId.discount}%`}
                        )
                      </span>

                      <span className="font-semibold whitespace-nowrap">
                        -{formatPrice(discountAmount)}
                      </span>

                    </div>
                  )}

                  {/* Shipping */}
                  <div className="flex justify-between text-gray-700">

                    <span>Phí vận chuyển</span>

                    <span className="font-semibold text-green-600">
                      Miễn phí
                    </span>

                  </div>

                  {/* Final price */}
                  <div className="border-t border-gray-200 pt-3 flex justify-between text-xl font-bold text-gray-800">

                    <span>Tổng cộng</span>

                    <span className="text-[#c92127]">
                      {formatPrice(dataPayment.finalPrice)}
                    </span>

                  </div>

                </div>
              </div>

              {/* ============================
                  ACTION BUTTONS
              ============================ */}
              <div className="space-y-3">

                <Link
                  to="/"
                  className="block w-full"
                >
                  <button
                    className="w-full bg-[#c92127] text-white py-3 rounded-lg
                               font-bold hover:bg-[#a81a1f] transition"
                  >
                    TIẾP TỤC MUA SẮM
                  </button>
                </Link>

                <Link
                  to="/orders"
                  className="block w-full"
                >
                  <button
                    className="w-full border border-gray-300 text-gray-700
                               py-3 rounded-lg font-semibold
                               hover:bg-gray-50 transition"
                  >
                    XEM ĐƠN HÀNG CỦA TÔI
                  </button>
                </Link>

              </div>

            </div>
          </div>
        </div>

        {/* ============================
            BOTTOM INFORMATION
        ============================ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">

          <div className="bg-white rounded-lg border border-gray-200 p-5 text-center">

            <div className="flex justify-center mb-2">
              <Package
                size={28}
                className="text-[#c92127]"
              />
            </div>

            <h3 className="font-bold text-gray-800 text-sm">
              Đang xử lý đơn hàng
            </h3>

            <p className="text-xs text-gray-500 mt-1">
              Chúng tôi sẽ chuẩn bị đơn hàng sớm nhất.
            </p>

          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-5 text-center">

            <div className="text-2xl mb-2">
              🚚
            </div>

            <h3 className="font-bold text-gray-800 text-sm">
              Giao hàng nhanh
            </h3>

            <p className="text-xs text-gray-500 mt-1">
              Theo dõi đơn hàng sau khi được bàn giao.
            </p>

          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-5 text-center">

            <div className="text-2xl mb-2">
              💬
            </div>

            <h3 className="font-bold text-gray-800 text-sm">
              Hỗ trợ khách hàng
            </h3>

            <p className="text-xs text-gray-500 mt-1">
              Liên hệ với chúng tôi nếu cần hỗ trợ.
            </p>

          </div>

        </div>

      </main>

      {/* ============================
          FOOTER
      ============================ */}
      <footer className="bg-white border-t border-gray-200 mt-8">

        <div className="max-w-6xl mx-auto px-4 py-6 text-center">

          <p className="text-xs text-gray-400">
            © 2026 Bookstore.com - Bản quyền thuộc về Bookstore.
          </p>

          <p className="text-xs text-gray-400 mt-1">
            Giao dịch thanh toán được bảo mật bằng SSL 256-bit
          </p>

        </div>

      </footer>

    </div>
  );
}

export default PaymentSuccess;

