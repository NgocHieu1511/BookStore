
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button, Spin, Tag, message } from "antd";
import {
  ArrowLeft,
  Package,
  UserRound,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  CalendarDays,
  ReceiptText,
  AlertCircle,
} from "lucide-react";

import { requestAdminPaymentDetail } from "../../../../config/paymentRequest";

const STATUS_MAP = {
  pending: { label: "Chờ xác nhận", color: "gold" },
  confirmed: { label: "Đã xác nhận", color: "blue" },

  delivered: { label: "Đã giao hàng", color: "cyan" },
  completed: { label: "Hoàn thành", color: "green" },
  cancelled: { label: "Đã hủy", color: "red" },
};

const PAYMENT_MAP = {
  cod: "Thanh toán khi nhận hàng (COD)",
  momo: "Ví MoMo",
  vnpay: "VNPay",
};
const STATUS_LABELS = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  delivered: "Đã giao hàng",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
};

const formatDateTime = (date) => {
  return new Date(date).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatPrice = (price) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(Number(price) || 0);

const formatDate = (date) => {
  if (!date) return "Không có thông tin";

  return new Date(date).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="text-gray-400 mt-1">
        <Icon size={18} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="font-medium text-gray-800 break-words">
          {value || "Chưa có thông tin"}
        </p>
      </div>
    </div>
  );
}

function OrderDetailAdmin() {
  const { orderId } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState("");

useEffect(() => {
    let active = true;

    const fetchOrderDetail = async () => {
        try {
            const res = await requestAdminPaymentDetail(orderId);

            if (!active) return;

            if (!res?.metadata) {
                setErrorText("Mã đơn hàng không tồn tại.");
                return;
            }

            setOrder(res.metadata);
        } catch (error) {
            console.error("Lỗi lấy chi tiết đơn hàng:", error);

            if (!active) return;

            const text =
                error.response?.data?.message ||
                "Không thể tải chi tiết đơn hàng.";

            setErrorText(text);
            message.error(text);
        } finally {
            if (active) {
                setLoading(false);
            }
        }
    };

    if (orderId) {
        fetchOrderDetail();
    }

    return () => {
        active = false;
    };
}, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Spin size="large" tip="Đang tải chi tiết đơn hàng..." />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-3xl mx-auto bg-white rounded-xl p-8 text-center">
          <AlertCircle
            size={44}
            className="mx-auto mb-4 text-red-500"
          />

          <h1 className="text-xl font-bold mb-2">
            Không thể tải đơn hàng
          </h1>

          <p className="text-gray-500 mb-6">
            {errorText || "Đơn hàng không tồn tại."}
          </p>

          <Link to="/admin/orders">
            <Button icon={<ArrowLeft size={16} />}>
              Quay lại danh sách
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const products = order.products || [];
  const status = STATUS_MAP[order.status] || {
    label: order.status || "Không xác định",
    color: "default",
  };

  const discountAmount = Math.max(
    0,
    (order.totalPrice || 0) - (order.finalPrice || 0)
  );

  const totalQuantity = products.reduce(
    (total, item) => total + (Number(item.quantity) || 0),
    0
  );

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Tiêu đề */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <Link
              to="/admin/orders"
              className="inline-flex items-center gap-2 text-gray-500 hover:text-[#c92127] mb-3"
            >
              <ArrowLeft size={17} />
              Quay lại danh sách đơn hàng
            </Link>

            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Chi tiết đơn hàng
            </h1>

            <p className="text-sm text-gray-500 mt-2 break-all">
              Mã đơn hàng: {order._id}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-gray-500">Trạng thái:</span>
            <Tag color={status.color}>{status.label}</Tag>
          </div>
        </div>

        {/* Thông tin chung */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
          <div className="bg-white rounded-xl shadow-sm p-5">
            <div className="flex items-center gap-3 mb-4">
              <CalendarDays className="text-[#c92127]" />
              <h2 className="font-bold text-gray-800">
                Thông tin đơn hàng
              </h2>
            </div>

            <InfoRow
              icon={ReceiptText}
              label="Mã đơn hàng"
              value={order._id}
            />

            <InfoRow
              icon={CalendarDays}
              label="Ngày đặt"
              value={formatDate(order.createdAt)}
            />

            <InfoRow
              icon={Package}
              label="Số lượng sách"
              value={`${totalQuantity} quyển`}
            />
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5">
            <div className="flex items-center gap-3 mb-4">
              <UserRound className="text-[#c92127]" />
              <h2 className="font-bold text-gray-800">
                Thông tin khách hàng
              </h2>
            </div>

            <InfoRow
              icon={UserRound}
              label="Họ và tên"
              value={order.fullName || order.userId?.fullName}
            />

            <InfoRow
              icon={Mail}
              label="Email"
              value={order.email || order.userId?.email}
            />

            <InfoRow
              icon={Phone}
              label="Số điện thoại"
              value={order.phoneNumber}
            />
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5">
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="text-[#c92127]" />
              <h2 className="font-bold text-gray-800">
                Địa chỉ giao hàng
              </h2>
            </div>

            <InfoRow
              icon={UserRound}
              label="Người nhận"
              value={order.fullName}
            />

            <InfoRow
              icon={Phone}
              label="Số điện thoại"
              value={order.phoneNumber}
            />

            <InfoRow
              icon={MapPin}
              label="Địa chỉ"
              value={order.address}
            />
          </div>
        </div>

        {/* Danh sách sản phẩm */}
        <div className="bg-white rounded-xl shadow-sm p-5 mb-5">
          <div className="flex items-center gap-3 mb-5">
            <Package className="text-[#c92127]" />
            <h2 className="text-lg font-bold text-gray-800">
              Sản phẩm trong đơn hàng
            </h2>
          </div>

          {products.length === 0 ? (
            <p className="text-gray-500 py-6 text-center">
              Đơn hàng không có thông tin sản phẩm.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-left">
                    <th className="p-3">Sản phẩm</th>
                    <th className="p-3 text-right">Đơn giá</th>
                    <th className="p-3 text-center">Số lượng</th>
                    <th className="p-3 text-right">Thành tiền</th>
                  </tr>
                </thead>

                <tbody>
                  {products.map((item, index) => {
                    const product = item.productId;

                    const name =
                      product?.nameProduct ||
                      "Sản phẩm không còn tồn tại";

                    const price = Number(
                      product?.priceProduct || 0
                    );

                    const quantity = Number(item.quantity) || 0;

                    const image = Array.isArray(
                      product?.imagesProduct
                    )
                      ? product.imagesProduct[0]
                      : product?.imagesProduct;

                    return (
                      <tr
                        key={product?._id || index}
                        className="border-b border-gray-100"
                      >
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            {image ? (
                              <img
                                src={image}
                                alt={name}
                                className="w-14 h-16 object-cover rounded border"
                              />
                            ) : (
                              <div className="w-14 h-16 bg-gray-100 rounded flex items-center justify-center">
                                <Package
                                  size={22}
                                  className="text-gray-400"
                                />
                              </div>
                            )}

                            <div>
                              <p className="font-medium text-gray-800">
                                {name}
                              </p>

                              {product?._id && (
                                <p className="text-xs text-gray-400 mt-1">
                                  ID: {product._id}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="p-3 text-right whitespace-nowrap">
                          {formatPrice(price)}
                        </td>

                        <td className="p-3 text-center">
                          {quantity}
                        </td>

                        <td className="p-3 text-right font-semibold whitespace-nowrap">
                          {formatPrice(price * quantity)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Thanh toán và tổng tiền */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white rounded-xl shadow-sm p-5">
            <div className="flex items-center gap-3 mb-4">
              <CreditCard className="text-[#c92127]" />
              <h2 className="text-lg font-bold text-gray-800">
                Thông tin thanh toán
              </h2>
            </div>

            <InfoRow
              icon={CreditCard}
              label="Phương thức thanh toán"
              value={
                PAYMENT_MAP[order.paymentMethod] ||
                order.paymentMethod
              }
            />

            <InfoRow
              icon={ReceiptText}
              label="Trạng thái đơn hàng"
              value={status.label}
            />

            <InfoRow
              icon={CalendarDays}
              label="Cập nhật lần cuối"
              value={formatDate(order.updatedAt)}
            />

            {order.couponId && (
              <InfoRow
                icon={ReceiptText}
                label="Mã giảm giá"
                value={
                  order.couponId.nameCoupon ||
                  order.couponId._id
                }
              />
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5">
            <h2 className="text-lg font-bold text-gray-800 mb-5">
              Tổng kết đơn hàng
            </h2>

            <div className="space-y-4">
              <div className="flex justify-between gap-4">
                <span className="text-gray-500">
                  Tổng tiền hàng
                </span>
                <span className="font-medium">
                  {formatPrice(order.totalPrice)}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-gray-500">
                  Giảm giá
                </span>
                <span className="text-green-600 font-medium">
                  -{formatPrice(discountAmount)}
                </span>
              </div>

              <div className="border-t pt-4 flex justify-between gap-4 items-center">
                <span className="font-bold text-gray-800">
                  Tổng thanh toán
                </span>
                <span className="text-xl font-bold text-[#c92127]">
                  {formatPrice(order.finalPrice)}
                </span>
              </div>
            </div>
          </div>
        </div>
{/* Lịch sử trạng thái đơn hàng */}
<div className="bg-white rounded-lg shadow p-6 mt-6">
  <h2 className="text-xl font-bold text-gray-800 mb-6">
    Lịch sử trạng thái đơn hàng
  </h2>

  {!order.statusHistory?.length ? (
    <p className="text-gray-500">
      Chưa có lịch sử trạng thái đơn hàng.
    </p>
  ) : (
    <div className="space-y-5">
      {[...order.statusHistory]
        .sort(
          (a, b) =>
            new Date(a.changedAt) - new Date(b.changedAt)
        )
        .map((item, index) => (
          <div
            key={`${item.status}-${item.changedAt}-${index}`}
            className="flex gap-4"
          >
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 rounded-full bg-blue-600 mt-1" />
              {index < order.statusHistory.length - 1 && (
                <div className="w-0.5 flex-1 bg-gray-200 mt-2" />
              )}
            </div>

            <div className="pb-3">
              <p className="font-semibold text-gray-800">
                {STATUS_LABELS[item.status] || item.status}
              </p>

              <p className="text-sm text-gray-500 mt-1">
                {formatDateTime(item.changedAt)}
              </p>

              {item.note && (
                <p className="text-sm text-gray-600 mt-1">
                  {item.note}
                </p>
              )}
            </div>
          </div>
        ))}
    </div>
  )}
</div>
        <div className="mt-6">
          <Link to="/admin/orders">
            <Button icon={<ArrowLeft size={16} />}>
              Quay lại danh sách đơn hàng
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default OrderDetailAdmin;