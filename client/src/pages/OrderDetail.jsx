
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  MapPin,
  Phone,
  Mail,
  CalendarDays,
  CreditCard,
  Receipt,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";

import { requestPaymentById } from "../config/paymentRequest";

const STATUS_CONFIG = {
  pending: {
    label: "Chờ xác nhận",
    color: "bg-yellow-100 text-yellow-800",
    icon: Clock,
  },
  confirmed: {
    label: "Đã xác nhận",
    color: "bg-blue-100 text-blue-800",
    icon: CheckCircle2,
  },
  delivered: {
    label: "Đang giao hàng",
    color: "bg-purple-100 text-purple-800",
    icon: Truck,
  },
  completed: {
    label: "Hoàn thành",
    color: "bg-green-100 text-green-800",
    icon: CheckCircle2,
  },
  cancelled: {
    label: "Đã hủy",
    color: "bg-red-100 text-red-800",
    icon: XCircle,
  },
};

const ORDER_STEPS = [
  "pending",
  "confirmed",
  "delivered",
  "completed",
];

const formatCurrency = (value) => {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "0 ₫";
  }

  return amount.toLocaleString("vi-VN") + " ₫";
};

const formatDate = (date) => {
  if (!date) return "Chưa có thông tin";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Chưa có thông tin";
  }

  return parsedDate.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getProductImage = (product) => {
  const images = product?.imagesProduct;

  if (typeof images === "string") {
    return images;
  }

  if (Array.isArray(images) && images.length > 0) {
    const firstImage = images[0];

    if (typeof firstImage === "string") {
      return firstImage;
    }

    return firstImage?.url || firstImage?.secure_url || "";
  }

  return "";
};

const getOrderFromResponse = (response) => {
  return (
    response?.metadata ??
    response?.data?.metadata ??
    response?.data?.data?.metadata ??
    null
  );
};

function OrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrderDetail = useCallback(async () => {
    if (!orderId) {
      setError("Không tìm thấy mã đơn hàng.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await requestPaymentById(orderId);
      const orderData = getOrderFromResponse(response);

      if (!orderData || !orderData._id) {
        throw new Error(
          response?.message || "Không tìm thấy thông tin đơn hàng."
        );
      }

      setOrder(orderData);
    } catch (err) {
      console.error("Lỗi lấy chi tiết đơn hàng:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Không thể tải thông tin đơn hàng. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    const loadOrderDetail = async () => {
      await fetchOrderDetail();
    };

    void loadOrderDetail();
  }, [fetchOrderDetail]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4">
        <LoaderCircle className="h-10 w-10 animate-spin text-red-600" />
        <p className="text-gray-600">Đang tải chi tiết đơn hàng...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 text-center">
        <Package className="mb-4 h-16 w-16 text-gray-300" />

        <h2 className="text-xl font-bold text-gray-800">
          Không thể tải đơn hàng
        </h2>

        <p className="mt-2 text-gray-500">
          {error || "Đơn hàng không tồn tại."}
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={fetchOrderDetail}
            className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white transition hover:bg-red-700"
          >
            <RefreshCw size={18} />
            Thử lại
          </button>

          <Link
            to="/account/my-orders"
            className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition hover:bg-gray-100"
          >
            Về đơn hàng của tôi
          </Link>
        </div>
      </div>
    );
  }

  const status = order.status || "pending";
  const statusInfo = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const StatusIcon = statusInfo.icon;

  const products = Array.isArray(order.products)
    ? order.products
    : [];

  const totalQuantity = products.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0
  );

  const subtotal = Number(order.totalPrice || 0);
  const finalPrice = Number(order.finalPrice ?? order.totalPrice ?? 0);
  const discountAmount = Math.max(0, subtotal - finalPrice);

  const paymentMethods = {
    cod: "Thanh toán khi nhận hàng (COD)",
    momo: "Ví điện tử MoMo",
    vnpay: "Cổng thanh toán VNPay",
  };

  const currentStep = ORDER_STEPS.indexOf(status);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-6xl">
        {/* Tiêu đề */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => navigate("/account/my-orders")}
            className="mb-4 inline-flex items-center gap-2 text-sm text-gray-600 transition hover:text-red-600"
          >
            <ArrowLeft size={18} />
            Quay lại đơn hàng của tôi
          </button>

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Chi tiết đơn hàng
              </h1>

              <p className="mt-2 break-all text-sm text-gray-500">
                Mã đơn hàng:{" "}
                <span className="font-semibold text-gray-700">
                  {order._id}
                </span>
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Ngày đặt: {formatDate(order.createdAt)}
              </p>
            </div>

            <span
              className={`inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${statusInfo.color}`}
            >
              <StatusIcon size={18} />
              {statusInfo.label}
            </span>
          </div>
        </div>

        {/* Tiến trình đơn hàng */}
        <section className="mb-6 rounded-xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="mb-6 text-lg font-bold text-gray-800">
            Trạng thái đơn hàng
          </h2>

          {status === "cancelled" ? (
            <div className="flex items-start gap-3 rounded-lg bg-red-50 p-4 text-red-700">
              <XCircle className="mt-0.5 shrink-0" size={22} />
              <div>
                <p className="font-semibold">Đơn hàng đã bị hủy</p>
                <p className="mt-1 text-sm">
                  Đơn hàng hiện không tiếp tục quy trình giao hàng.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
              {ORDER_STEPS.map((step, index) => {
                const stepInfo = STATUS_CONFIG[step];
                const StepIcon = stepInfo.icon;
                const isCompleted =
                  currentStep >= 0 && index <= currentStep;

                return (
                  <div
                    key={step}
                    className="flex flex-col items-center text-center"
                  >
                    <div
                      className={`mb-3 flex h-12 w-12 items-center justify-center rounded-full ${
                        isCompleted
                          ? "bg-red-600 text-white"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      <StepIcon size={22} />
                    </div>

                    <p
                      className={`text-sm font-semibold ${
                        isCompleted
                          ? "text-gray-800"
                          : "text-gray-400"
                      }`}
                    >
                      {stepInfo.label}
                    </p>

                    <span className="mt-1 text-xs text-gray-400">
                      Bước {index + 1}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Cột thông tin chính */}
          <div className="space-y-6 lg:col-span-2">
            {/* Thông tin người nhận */}
            <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-lg bg-red-50 p-2 text-red-600">
                  <MapPin size={22} />
                </div>

                <h2 className="text-lg font-bold text-gray-800">
                  Thông tin giao hàng
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Người nhận</p>
                  <p className="mt-1 font-semibold text-gray-800">
                    {order.fullName || "Chưa có thông tin"}
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <Phone
                    className="mt-0.5 shrink-0 text-gray-400"
                    size={18}
                  />

                  <div>
                    <p className="text-sm text-gray-500">
                      Số điện thoại
                    </p>
                    <p className="mt-1 text-gray-800">
                      {order.phoneNumber || "Chưa có thông tin"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail
                    className="mt-0.5 shrink-0 text-gray-400"
                    size={18}
                  />

                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="mt-1 break-all text-gray-800">
                      {order.email || "Chưa có thông tin"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin
                    className="mt-0.5 shrink-0 text-gray-400"
                    size={18}
                  />

                  <div>
                    <p className="text-sm text-gray-500">
                      Địa chỉ giao hàng
                    </p>
                    <p className="mt-1 text-gray-800">
                      {order.address || "Chưa có thông tin"}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Danh sách sản phẩm */}
            <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-red-50 p-2 text-red-600">
                    <Package size={22} />
                  </div>

                  <h2 className="text-lg font-bold text-gray-800">
                    Sản phẩm đã đặt
                  </h2>
                </div>

                <span className="text-sm text-gray-500">
                  {totalQuantity} sản phẩm
                </span>
              </div>

              {products.length === 0 ? (
                <p className="py-6 text-center text-gray-500">
                  Đơn hàng chưa có thông tin sản phẩm.
                </p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {products.map((item, index) => {
                    const product =
                      item.productId &&
                      typeof item.productId === "object"
                        ? item.productId
                        : null;

                    const imageUrl = getProductImage(product);
                    const productName =
                      product?.nameProduct || "Sản phẩm";

                    const price = Number(
                      product?.priceProduct || 0
                    );

                    const quantity = Number(item.quantity || 0);

                    return (
                      <div
                        key={product?._id || index}
                        className="flex gap-4 py-4 first:pt-0 last:pb-0"
                      >
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={productName}
                              className="h-full w-full object-contain"
                            />
                          ) : (
                            <Package
                              size={30}
                              className="text-gray-300"
                            />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-800">
                            {productName}
                          </p>

                          <p className="mt-2 text-sm text-gray-500">
                            Đơn giá: {formatCurrency(price)}
                          </p>

                          <p className="mt-1 text-sm text-gray-500">
                            Số lượng: {quantity}
                          </p>
                        </div>

                        <div className="shrink-0 text-right">
                          <p className="font-bold text-red-600">
                            {formatCurrency(price * quantity)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          {/* Cột tổng kết đơn hàng */}
          <aside className="space-y-6">
            <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-lg bg-red-50 p-2 text-red-600">
                  <Receipt size={22} />
                </div>

                <h2 className="text-lg font-bold text-gray-800">
                  Tổng kết đơn hàng
                </h2>
              </div>

              <div className="space-y-4 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">
                    Tạm tính
                  </span>
                  <span className="font-medium text-gray-800">
                    {formatCurrency(subtotal)}
                  </span>
                </div>

                {order.couponId && (
                  <div className="flex justify-between gap-3">
                    <span className="text-gray-500">
                      Mã giảm giá
                    </span>
                    <span className="font-medium text-green-600">
                      {order.couponId.nameCoupon ||
                        "Đã áp dụng"}
                    </span>
                  </div>
                )}

                {discountAmount > 0 && (
                  <div className="flex justify-between gap-3">
                    <span className="text-gray-500">
                      Tiết kiệm
                    </span>
                    <span className="font-medium text-green-600">
                      -{formatCurrency(discountAmount)}
                    </span>
                  </div>
                )}

                <div className="border-t border-dashed border-gray-200 pt-4">
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-semibold text-gray-700">
                      Tổng thanh toán
                    </span>

                    <span className="text-xl font-bold text-red-600">
                      {formatCurrency(finalPrice)}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-lg bg-red-50 p-2 text-red-600">
                  <CreditCard size={22} />
                </div>

                <h2 className="text-lg font-bold text-gray-800">
                  Thanh toán
                </h2>
              </div>

              <p className="text-sm text-gray-500">
                Phương thức thanh toán
              </p>

              <p className="mt-2 font-semibold text-gray-800">
                {paymentMethods[order.paymentMethod] ||
                  order.paymentMethod ||
                  "Chưa có thông tin"}
              </p>

              <div className="mt-4 border-t border-gray-100 pt-4">
                <p className="text-sm text-gray-500">
                  Trạng thái đơn hàng
                </p>

                <span
                  className={`mt-2 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${statusInfo.color}`}
                >
                  {statusInfo.label}
                </span>
              </div>
            </section>

            <button
              type="button"
              onClick={() => navigate("/account/my-orders")}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 font-semibold text-gray-700 transition hover:border-red-600 hover:text-red-600"
            >
              <CalendarDays size={18} />
              Xem tất cả đơn hàng
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default OrderDetail;