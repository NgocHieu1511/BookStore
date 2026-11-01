import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  ChevronRight,
  CreditCard,
  Lock,
  RotateCcw,
  ShieldCheck,
  Ticket,
  Trash2,
  Zap,
} from "lucide-react";
import { useStore } from "../hooks/useStore";
import { requestUpdateInfoCart } from "../config/CartRequest";
import { requestPayment } from "../config/paymentRequest";

const Checkout = () => {
  const { cart } = useStore();
  const navigate = useNavigate();

  // ================= SHIPPING ADDRESS STATE =================
  const [receiverName, setReceiverName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");

  // ================= OTHER STATE =================
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [coupon, setCoupon] = useState("");

  // Kiểm tra giỏ hàng rỗng
  if (!cart || !cart.cart) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] text-gray-800 flex items-center justify-center">
        <div className="text-center py-16 bg-white p-8 rounded-lg shadow max-w-md w-full">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">
            Không có sản phẩm để thanh toán
          </h2>
          <p className="text-gray-500 mb-6">
            Giỏ hàng của bạn đang trống hoặc chưa được tải thành công.
          </p>
          <button
            onClick={() => navigate("/")}
            className="bg-[#c92127] text-white px-6 py-2 rounded-md font-semibold hover:bg-red-700 transition"
          >
            Quay về trang chủ
          </button>
        </div>
      </div>
    );
  }

  const cartData = cart.cart;
  const products = cartData.products || [];

  // ================= CALCULATE PRICE =================
  const subtotal = cartData.totalPrice || 0;
  const shippingFee = shippingMethod === "standard" ? 0 : 40000;
  const discount = cartData.couponId
    ? cartData.totalPrice - cartData.finalPrice
    : 0;
  const total =
    (cartData.couponId ? cartData.finalPrice : cartData.totalPrice) +
    shippingFee;

  // ================= FORMAT PRICE =================
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // ================= APPLY COUPON =================
  const handleApplyCoupon = () => {
    if (!coupon.trim()) {
      message.warning("Vui lòng nhập mã giảm giá");
      return;
    }
    message.info(`Đang áp dụng mã: ${coupon}`);
  };

  // ================= SUBMIT ORDER =================
  const handleOrder = async (e) => {
    e.preventDefault();

    // Validate form
    if (!receiverName.trim()) {
      message.error("Vui lòng nhập họ và tên người nhận");
      return;
    }
    if (!phone.trim()) {
      message.error("Vui lòng nhập số điện thoại");
      return;
    }
    if (!email.trim()) {
      message.error("Vui lòng nhập địa chỉ email");
      return;
    }
    if (!address.trim()) {
      message.error("Vui lòng nhập địa chỉ nhận hàng");
      return;
    }

    try {
      const data = {
        fullName: receiverName,
        phoneNumber: phone,
        address: address,
        email: email,
        note: note,
      };

      // Cập nhật thông tin giỏ hàng
      await requestUpdateInfoCart(data);

      const typePayment = paymentMethod;

      // Xử lý loại thanh toán
      if (paymentMethod === "cod") {
        const res = await requestPayment({ typePayment });
        message.success("Đặt hàng thành công!");
        navigate(`/payment-success/${res.metadata._id}`);
      } else if (paymentMethod === "momo") {
        const res = await requestPayment({ typePayment });
        console.log("Momo Payment Response:", res);
        window.open(res.metadata.payUrl, "_blank");
        message.info("Vui lòng hoàn tất thanh toán trên cổng MoMo");
      } else if (paymentMethod === "vnpay") {
        const res = await requestPayment({ typePayment });
        console.log("VNPay Payment Response:", res);
        window.open(res.metadata, "_blank");
        message.info("Vui lòng hoàn tất thanh toán trên cổng VNPay");
      }
    } catch (error) {
      message.error(
        error.response?.data?.message || "Có lỗi xảy ra khi đặt hàng"
      );
    }
  };

  // ================= PAYMENT OPTIONS =================
  const paymentOptions = [
    {
      id: "vnpay",
      name: "VNPAY-QR / Thẻ ATM Nội Địa",
      description:
        "Quét mã bằng ứng dụng ngân hàng (Vietcombank, MB, BIDV, Techcombank...)",
      type: "VNPAY",
      bg: "bg-blue-700",
    },
    {
      id: "momo",
      name: "Ví Điện Tử MoMo",
      description: "Thanh toán nhanh chóng, an toàn qua ứng dụng MoMo",
      type: "MoMo",
      bg: "bg-pink-600",
    },
    {
      id: "cod",
      name: "Thanh toán tiền mặt khi nhận hàng (COD)",
      description:
        "Bạn có thể kiểm tra hàng trước khi thanh toán cho nhân viên giao hàng",
      type: "COD",
      bg: "bg-emerald-600",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f0f2f5] text-gray-800">
      {/* TOP ANNOUNCEMENT */}
      <div className="bg-[#c92127] text-white text-xs py-1.5 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-2">
        <span className="bg-yellow-400 text-red-700 font-bold px-1.5 py-0.5 rounded text-[10px]">
          ƯU ĐÃI
        </span>
        <span className="hidden sm:block">
          🎉 MỪNG SINH NHẬT BOOKSTORE.COM - GIẢM THÊM ĐẾN 50% & MIỄN PHÍ VẬN
          CHUYỂN TOÀN QUỐC
        </span>
        <a href="#" className="underline font-semibold hover:text-yellow-200">
          Xem chi tiết &gt;
        </a>
      </div>

      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1240px] mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a
              href="/"
              className="text-3xl font-extrabold text-[#c92127] tracking-tight italic"
            >
              Bookstore<span className="text-gray-800">.com</span>
            </a>
            <div className="h-6 w-px bg-gray-300 hidden sm:block"></div>
            <span className="text-xl font-bold text-gray-700 uppercase tracking-wide hidden sm:block">
              Thanh Toán
            </span>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs font-semibold">
            <div className="flex items-center gap-1.5 text-gray-400">
              <span className="w-5 h-5 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center">
                1
              </span>
              <span>Giỏ Hàng</span>
            </div>
            <div className="w-8 h-px bg-gray-300"></div>
            <div className="flex items-center gap-1.5 text-[#c92127]">
              <span className="w-5 h-5 rounded-full bg-[#c92127] text-white flex items-center justify-center">
                2
              </span>
              <span>Thanh Toán</span>
            </div>
            <div className="w-8 h-px bg-gray-300"></div>
            <div className="flex items-center gap-1.5 text-gray-400">
              <span className="w-5 h-5 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center">
                3
              </span>
              <span>Hoàn Tất</span>
            </div>
          </div>

          <div className="flex items-center gap-5 text-sm">
            <div className="hidden lg:flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 px-3 py-1 rounded-full text-xs font-medium">
              <ShieldCheck size={15} />
              <span>Thanh toán an toàn & Bảo mật</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-[#c92127]">
                <span className="text-lg">☎</span>
              </div>
              <div>
                <div className="text-[11px] text-gray-400">Hotline hỗ trợ</div>
                <span className="font-bold text-[#c92127]">1900 636 467</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-[1240px] mx-auto px-4 py-6 w-full">
        <div className="mb-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-xs text-gray-500 hover:text-[#c92127] gap-1.5 font-medium transition-colors"
          >
            <ArrowLeft size={15} />
            <span>Quay về Giỏ hàng</span>
          </button>
        </div>

        <form
          onSubmit={handleOrder}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6"
        >
          {/* LEFT COLUMN */}
          <div className="lg:col-span-8 space-y-5">
            {/* ADDRESS SECTION */}
            <section className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-5 pt-5">
                <h2 className="text-base font-bold text-gray-800 uppercase pb-3 border-b border-gray-300">
                  ĐỊA CHỈ GIAO HÀNG
                </h2>
              </div>

              <div className="p-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-[170px_1fr] items-center gap-3">
                  <label className="text-sm text-gray-700">
                    Họ và tên người nhận <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={receiverName}
                    onChange={(e) => setReceiverName(e.target.value)}
                    placeholder="Nhập họ và tên người nhận"
                    required
                    className="w-full h-10 px-4 border border-gray-300 rounded-md text-sm font-semibold text-gray-700 focus:outline-none focus:border-[#c92127] focus:ring-1 focus:ring-[#c92127]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[170px_1fr] items-center gap-3">
                  <label className="text-sm text-gray-700">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Nhập số điện thoại"
                    required
                    className="w-full h-10 px-4 border border-gray-300 rounded-md text-sm font-semibold text-gray-700 focus:outline-none focus:border-[#c92127] focus:ring-1 focus:ring-[#c92127]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[170px_1fr] items-center gap-3">
                  <label className="text-sm text-gray-700">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Nhập địa chỉ email"
                    required
                    className="w-full h-10 px-4 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:border-[#c92127] focus:ring-1 focus:ring-[#c92127]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[170px_1fr] items-center gap-3">
                  <label className="text-sm text-gray-700">
                    Địa chỉ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Nhập địa chỉ nhận hàng"
                    required
                    className="w-full h-10 px-4 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:border-[#c92127] focus:ring-1 focus:ring-[#c92127]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[170px_1fr] items-start gap-3">
                  <label className="text-sm text-gray-700 pt-2">Ghi chú</label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi giao..."
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm text-gray-700 resize-none focus:outline-none focus:border-[#c92127] focus:ring-1 focus:ring-[#c92127]"
                  />
                </div>
              </div>
            </section>

            {/* SHIPPING METHOD */}
            <section className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-5 py-3.5 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-[#c92127] text-white flex items-center justify-center text-xs">
                    2
                  </span>
                  Phương Thức Vận Chuyển
                </h2>
                <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
                  <CheckCircle size={14} />
                  Đủ điều kiện Freeship
                </span>
              </div>

              <div className="p-5 space-y-3">
                <label
                  className={`flex items-start justify-between p-4 border rounded-lg cursor-pointer transition-all ${
                    shippingMethod === "standard"
                      ? "border-[#c92127] bg-[#fcf4f4]"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="shipping"
                      value="standard"
                      checked={shippingMethod === "standard"}
                      onChange={(e) => setShippingMethod(e.target.value)}
                      className="mt-1 accent-[#c92127]"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">
                          Giao hàng tiêu chuẩn
                        </span>
                        <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded">
                          MIỄN PHÍ
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Dự kiến nhận hàng:
                        <span className="font-bold text-gray-700 ml-1">
                          Chủ nhật, 30/08
                        </span>
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        Đơn vị vận chuyển: GHN Express, Viettel Post, SPX
                        Express
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-400 line-through">
                      25.000 đ
                    </span>
                    <div className="text-sm font-bold text-green-600">0 đ</div>
                  </div>
                </label>

                <label
                  className={`flex items-start justify-between p-4 border rounded-lg cursor-pointer transition-all ${
                    shippingMethod === "fast"
                      ? "border-[#c92127] bg-[#fcf4f4]"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="shipping"
                      value="fast"
                      checked={shippingMethod === "fast"}
                      onChange={(e) => setShippingMethod(e.target.value)}
                      className="mt-1 accent-[#c92127]"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">
                          Giao hàng Hỏa Tốc (2H - 4H)
                        </span>
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                          <Zap size={10} />
                          Siêu Tốc
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Dự kiến nhận hàng:
                        <span className="font-bold text-gray-700 ml-1">
                          Trước 17:00 hôm nay
                        </span>
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        Áp dụng cho khu vực nội thành TP. Hồ Chí Minh & Hà Nội
                      </p>
                    </div>
                  </div>
                  <div className="text-sm font-bold">40.000 đ</div>
                </label>
              </div>
            </section>

            {/* PAYMENT METHOD */}
            <section className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-5 py-3.5 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-[#c92127] text-white flex items-center justify-center text-xs">
                    3
                  </span>
                  Phương Thức Thanh Toán
                </h2>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Lock size={13} className="text-green-600" />
                  Bảo mật SSL 256-bit
                </span>
              </div>

              <div className="p-5 space-y-3">
                {paymentOptions.map((payment) => {
                  const active = paymentMethod === payment.id;
                  return (
                    <label
                      key={payment.id}
                      className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all ${
                        active
                          ? "border-[#c92127] bg-[#fcf4f4]"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <input
                          type="radio"
                          name="payment"
                          value={payment.id}
                          checked={active}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="accent-[#c92127]"
                        />
                        <div
                          className={`w-10 h-10 ${payment.bg} rounded-lg flex items-center justify-center text-white font-bold text-xs`}
                        >
                          {payment.id === "card" ? (
                            <CreditCard size={18} />
                          ) : payment.id === "cod" ? (
                            "₫"
                          ) : (
                            payment.type
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-gray-800 flex items-center gap-2">
                            <span>{payment.name}</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {payment.description}
                          </p>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-gray-300" />
                    </label>
                  );
                })}
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-4 space-y-4">
            {/* ORDER PRODUCTS */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider">
                  Đơn Hàng ({products.length} sản phẩm)
                </h3>
                <button
                  type="button"
                  onClick={() => navigate("/cart")}
                  className="text-xs text-[#c92127] font-semibold hover:underline"
                >
                  Sửa
                </button>
              </div>

              <div className="p-4 divide-y divide-gray-100 max-h-72 overflow-y-auto">
                {products.map((item) => {
                  const product = item.productId || {};
                  const price = product.priceProduct || 0;
                  const itemDiscount = product.discountProduct || 0;
                  const priceAfterDiscount =
                    price - (price * itemDiscount) / 100;
                  const itemSubtotal = priceAfterDiscount * item.quantity;

                  return (
                    <div
                      key={item._id || product._id}
                      className="flex items-start gap-3 py-3 first:pt-0"
                    >
                      <img
                        src={
                          product.imagesProduct?.[0] ||
                          "https://via.placeholder.com/150"
                        }
                        alt={product.nameProduct}
                        className="w-12 h-16 object-cover border border-gray-200 rounded flex-shrink-0"
                      />

                      <div className="flex-grow min-w-0">
                        <h4 className="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug">
                          {product.nameProduct}
                        </h4>
                        <div className="flex items-center justify-between mt-1 text-xs">
                          <span className="text-gray-400">
                            SL: {item.quantity}
                          </span>
                          <span className="font-bold text-gray-800">
                            {formatPrice(itemSubtotal)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* COUPON */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase flex items-center gap-1.5">
                  <Ticket size={15} className="text-[#c92127]" />
                  Mã Khuyến Mãi
                </span>
                <span className="text-[11px] text-gray-400">
                  Áp dụng tối đa 2 mã
                </span>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  placeholder="Nhập mã giảm giá/Gift Card"
                  className="flex-grow text-xs px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#c92127]"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="bg-[#c92127] text-white text-xs font-bold px-4 py-2 rounded hover:bg-red-700 transition-colors"
                >
                  Áp dụng
                </button>
              </div>

              {cartData.couponId && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between px-2.5 py-1.5 rounded text-xs bg-green-50 border border-green-200">
                    <div className="flex items-center gap-2">
                      <span className="bg-green-600 text-white font-bold text-[9px] px-1 rounded">
                        ĐÃ ÁP DỤNG
                      </span>
                      <span className="font-semibold text-green-900">
                        Voucher giảm giá đơn hàng
                      </span>
                    </div>
                    <button
                      type="button"
                      className="text-gray-400 hover:text-red-600"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* PAYMENT SUMMARY */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider pb-2 border-b border-gray-100">
                Chi Tiết Thanh Toán
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Thành tiền (Tạm tính):</span>
                  <span className="font-semibold text-gray-900">
                    {formatPrice(subtotal)}
                  </span>
                </div>

                {cartData.couponId && (
                  <div className="flex justify-between text-gray-600">
                    <span>Giảm giá từ voucher:</span>
                    <span className="font-semibold text-green-600">
                      -{formatPrice(discount)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển:</span>
                  <span className="font-semibold text-green-600">
                    {shippingFee === 0 ? "MIỄN PHÍ" : formatPrice(shippingFee)}
                  </span>
                </div>
              </div>

              {/* TOTAL */}
              <div className="pt-3 border-t border-gray-200 flex items-baseline justify-between">
                <div>
                  <span className="text-sm font-bold text-gray-900">
                    Tổng Số Tiền:
                  </span>
                  <div className="text-[11px] text-gray-400">
                    (Đã bao gồm VAT nếu có)
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-[#c92127]">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

            

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                className="w-full bg-[#c92127] hover:bg-red-700 text-white font-bold py-3.5 px-4 rounded-lg text-base uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 mt-4"
              >
                <span>XÁC NHẬN ĐẶT HÀNG</span>
                <ArrowRight size={16} />
              </button>

              <p className="text-[11px] text-center text-gray-400 leading-tight pt-1">
                Bằng việc nhấn "Xác nhận đặt hàng", bạn đồng ý với{" "}
                <a href="#" className="text-[#c92127] underline">
                  Điều khoản dịch vụ
                </a>{" "}
                của Bookstore.com
              </p>

              {/* TRUST */}
              <div className="pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-[11px] text-gray-500">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck size={15} className="text-green-600" />
                  <span>100% Sách chính hãng</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <RotateCcw size={15} className="text-blue-600" />
                  <span>Đổi trả trong 30 ngày</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>

      {/* FOOTER */}
      <footer className="bg-white text-gray-600 text-xs py-10 border-t border-gray-200 mt-12">
        <div className="max-w-[1240px] mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="text-2xl font-extrabold text-[#c92127] italic">
              Bookstore<span className="text-gray-800">.com</span>
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Lầu 5, 387-389 Hai Bà Trưng, Phường Xuân Hoà, TP. HCM <br />
              Công Ty Cổ Phần Phát Hành Sách TP. Hồ Chí Minh - BOOKSTORE <br />
              60 - 62 Lê Lợi, Phường Bến Nghé, Quận 1, TP. HCM, Việt Nam
            </p>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 uppercase text-xs tracking-wider mb-3">
              DỊCH VỤ
            </h4>
            <ul className="space-y-1.5 text-[11px] text-gray-500">
              <li>
                <a href="#" className="hover:text-[#c92127]">
                  Điều khoản sử dụng
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#c92127]">
                  Chính sách bảo mật thông tin cá nhân
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 uppercase text-xs tracking-wider mb-3">
              HỖ TRỢ
            </h4>
            <ul className="space-y-1.5 text-[11px] text-gray-500">
              <li>
                <a href="#" className="hover:text-[#c92127]">
                  Chính sách đổi - trả - hoàn tiền
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#c92127]">
                  Chính sách vận chuyển
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 uppercase text-xs tracking-wider mb-3">
              TÀI KHOẢN CỦA TÔI
            </h4>
            <ul className="space-y-1.5 text-[11px] text-gray-500">
              <li>
                <a href="#" className="hover:text-[#c92127]">
                  Chi tiết tài khoản
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#c92127]">
                  Lịch sử mua hàng
                </a>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Checkout;