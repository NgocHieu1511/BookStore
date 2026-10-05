
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  RefreshCw,
  ShoppingBag,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { requestMyPayments } from "../config/paymentRequest";

const STATUS_MAP = {
  pending: {
    label: "Chờ xác nhận",
    className: "bg-yellow-100 text-yellow-700",
  },
  confirmed: {
    label: "Đã xác nhận",
    className: "bg-blue-100 text-blue-700",
  },
  delivered: {
    label: "Đang giao hàng",
    className: "bg-purple-100 text-purple-700",
  },
  completed: {
    label: "Hoàn thành",
    className: "bg-green-100 text-green-700",
  },
  cancelled: {
    label: "Đã hủy",
    className: "bg-red-100 text-red-700",
  },
};

const PAYMENT_MAP = {
  cod: "Thanh toán khi nhận hàng",
  momo: "MoMo",
  vnpay: "VNPay",
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(Number(amount) || 0);
};

const formatDate = (date) => {
  if (!date) return "Chưa có thông tin";

  return new Date(date).toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

 const fetchMyOrders = async () => {
  try {
    setLoading(true);
    setError("");

    const response = await requestMyPayments();

    console.log("Dữ liệu API đơn hàng:", response);

    // Lấy danh sách đơn hàng từ response
    const orderList =
      response?.metadata ??
      response?.data?.metadata;

    if (!Array.isArray(orderList)) {
      throw new Error(
        response?.message ||
          "Dữ liệu đơn hàng không đúng định dạng"
      );
    }

    setOrders(orderList);
  } catch (err) {
    console.error("Lỗi lấy danh sách đơn hàng:", err);

    setError(
      err?.response?.data?.message ||
        err?.message ||
        "Không thể tải danh sách đơn hàng."
    );
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    const loadOrders = async () => {
      await fetchMyOrders();
    };

    void loadOrders();
  }, []);

  const totalOrders = orders.length;

  const processingOrders = orders.filter((order) =>
    ["pending", "confirmed", "delivered"].includes(order.status)
  ).length;

  const completedOrders = orders.filter(
    (order) => order.status === "completed"
  ).length;

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 animate-spin text-red-600" />
          <p className="text-gray-500">
            Đang tải danh sách đơn hàng...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-6xl">
        {/* Tiêu đề */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-800">
              <Package className="h-7 w-7 text-red-600" />
              Đơn hàng của tôi
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Theo dõi và kiểm tra các đơn hàng bạn đã đặt.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchMyOrders}
            className="flex items-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm hover:bg-gray-100"
          >
            <RefreshCw className="h-4 w-4" />
            Làm mới
          </button>
        </div>

        {/* Thông báo lỗi */}
        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            <XCircle className="mt-0.5 h-5 w-5 shrink-0" />

            <div>
              <p className="font-semibold">
                Không thể tải đơn hàng
              </p>

              <p className="mt-1 text-sm">{error}</p>

              <button
                type="button"
                onClick={fetchMyOrders}
                className="mt-2 text-sm font-semibold underline"
              >
                Thử lại
              </button>
            </div>
          </div>
        )}

        {/* Thống kê */}
        {!error && (
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">
                Tổng số đơn hàng
              </p>

              <p className="mt-2 text-2xl font-bold text-gray-800">
                {totalOrders}
              </p>
            </div>

            <div className="rounded-xl border bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">
                Đơn đang xử lý
              </p>

              <p className="mt-2 flex items-center gap-2 text-2xl font-bold text-blue-600">
                <Clock className="h-6 w-6" />
                {processingOrders}
              </p>
            </div>

            <div className="rounded-xl border bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">
                Đơn hoàn thành
              </p>

              <p className="mt-2 flex items-center gap-2 text-2xl font-bold text-green-600">
                <CheckCircle className="h-6 w-6" />
                {completedOrders}
              </p>
            </div>
          </div>
        )}

        {/* Danh sách đơn hàng */}
        {!error && orders.length > 0 && (
          <div className="space-y-5">
            {orders.map((order) => {
              const statusInfo = STATUS_MAP[order.status] || {
                label: order.status || "Không xác định",
                className: "bg-gray-100 text-gray-700",
              };

              const products = order.products || [];

              return (
                <div
                  key={order._id}
                  className="overflow-hidden rounded-xl border bg-white shadow-sm"
                >
                  {/* Thông tin đầu đơn hàng */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-gray-50 px-5 py-4">
                    <div>
                      <p className="text-sm text-gray-500">
                        Mã đơn hàng
                      </p>

                      <p className="mt-1 break-all font-semibold text-red-600">
                        #{order._id}
                      </p>
                    </div>

                    <div className="text-sm">
                      <p className="text-gray-500">Ngày đặt</p>

                      <p className="mt-1 font-medium text-gray-700">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold ${statusInfo.className}`}
                    >
                      {statusInfo.label}
                    </span>
                  </div>

                  {/* Danh sách sách */}
                  <div className="space-y-4 p-5">
                    {products.map((item, index) => {
                      const product = item.productId;

                      return (
                        <div
                          key={product?._id || index}
                          className="flex items-center gap-4"
                        >
                          {product?.imagesProduct?.[0] ? (
                            <img
                              src={product.imagesProduct[0]}
                              alt={product.nameProduct || "Sách"}
                              className="h-20 w-16 rounded border object-cover"
                            />
                          ) : (
                            <div className="flex h-20 w-16 items-center justify-center rounded border bg-gray-100">
                              <ShoppingBag className="h-6 w-6 text-gray-400" />
                            </div>
                          )}

                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-800">
                              {product?.nameProduct ||
                                "Sản phẩm không còn khả dụng"}
                            </p>

                            <p className="mt-2 text-sm text-gray-500">
                              Số lượng: {item.quantity || 1}
                            </p>

                            {product?.priceProduct != null && (
                              <p className="mt-1 text-sm text-gray-600">
                                Giá hiện tại:{" "}
                                {formatCurrency(product.priceProduct)}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Tổng tiền và thanh toán */}
                  <div className="flex flex-wrap items-center justify-between gap-4 border-t px-5 py-4">
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>
                        Thanh toán:{" "}
                        <span className="font-medium text-gray-800">
                          {PAYMENT_MAP[order.paymentMethod] ||
                            order.paymentMethod}
                        </span>
                      </p>

                      <p>
                        Số sản phẩm:{" "}
                        {products.reduce(
                          (sum, item) =>
                            sum + (Number(item.quantity) || 1),
                          0
                        )}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        Tổng thanh toán
                      </p>

                      <p className="mt-1 text-xl font-bold text-red-600">
                        {formatCurrency(
                          order.finalPrice ?? order.totalPrice
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Nút xem chi tiết */}
                  <div className="flex justify-end border-t px-5 py-3">
                    <Link
                      to={`/order/${order._id}`}
                      className="rounded-lg border border-red-600 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      Xem chi tiết
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Chưa có đơn hàng */}
        {!error && orders.length === 0 && (
          <div className="rounded-xl border bg-white px-4 py-14 text-center shadow-sm">
            <ShoppingBag className="mx-auto h-14 w-14 text-gray-300" />

            <h2 className="mt-4 text-lg font-semibold text-gray-800">
              Bạn chưa có đơn hàng nào
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Những đơn hàng bạn đặt sẽ xuất hiện tại đây.
            </p>

            <Link
              to="/"
              className="mt-5 inline-block rounded-lg bg-red-600 px-5 py-2.5 font-medium text-white hover:bg-red-700"
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyOrders;