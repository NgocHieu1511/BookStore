
import { useCallback, useEffect, useState } from "react";
import {
  Wallet,
  ShoppingCart,
  BookOpen,
  Tags,
  TrendingUp,
  Clock,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

import { listProducts } from "../../config/productRequest";
import { listCategory } from "../../config/categoryRequest";
import { requestAdminPaymentList } from "../../config/paymentRequest";

const formatMoney = (value) =>
  Number(value || 0).toLocaleString("vi-VN") + " ₫";

const formatNumber = (value) =>
  Number(value || 0).toLocaleString("vi-VN");

const formatDate = (value) => {
  if (!value) return "—";

  return new Date(value).toLocaleDateString("vi-VN");
};

const statusLabels = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  delivered: "Đang giao",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
};

const statusColors = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  delivered: "bg-violet-100 text-violet-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

function extractList(response) {
  // Backend của bạn dùng SuccessResponse.metadata
  const data = response?.metadata ?? response?.data?.metadata ?? [];

  return Array.isArray(data) ? data : [];
}

function StatCard({ title, value, description, icon: Icon }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <h2 className="mt-3 text-2xl font-bold text-gray-900">
            {value}
          </h2>
          <p className="mt-2 text-xs text-gray-500">
            {description}
          </p>
        </div>

        <div className="rounded-xl bg-red-50 p-3 text-[#c92127]">
          <Icon size={23} />
        </div>
      </div>
    </div>
  );
}

function DashboardOverview() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(async () => {
    try {
      const results = await Promise.allSettled([
        Promise.resolve().then(listProducts),
        Promise.resolve().then(listCategory),
        Promise.resolve().then(requestAdminPaymentList),
      ]);

      const [productResult, categoryResult, orderResult] = results;

      if (productResult.status === "fulfilled") {
        setProducts(extractList(productResult.value));
      } else {
        console.error("Lỗi lấy sản phẩm:", productResult.reason);
      }

      if (categoryResult.status === "fulfilled") {
        setCategories(extractList(categoryResult.value));
      } else {
        console.error("Lỗi lấy danh mục:", categoryResult.reason);
      }

      if (orderResult.status === "fulfilled") {
        setOrders(extractList(orderResult.value));
      } else {
        console.error("Lỗi lấy đơn hàng:", orderResult.reason);
      }

      if (results.every((result) => result.status === "rejected")) {
        throw new Error(
          "Không thể tải dữ liệu. Hãy kiểm tra backend và quyền Admin."
        );
      }
    } catch (err) {
      setError(
        err.message || "Không thể tải dữ liệu Dashboard."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    document.title = "Dashboard | BookStore Admin";
    void Promise.resolve().then(fetchDashboard);
  }, [fetchDashboard]);

  // Không tính đơn đã hủy vào doanh thu thống kê.
  const validOrders = orders.filter(
    (order) => order.status !== "cancelled"
  );

  const totalRevenue = validOrders.reduce(
    (sum, order) =>
      sum + Number(order.finalPrice ?? order.totalPrice ?? 0),
    0
  );

  const pendingOrders = orders.filter(
    (order) => order.status === "pending"
  ).length;

  const lowStockProducts = products.filter(
    (product) => Number(product.stockProduct) <= 5
  );

  // Tạo dữ liệu doanh thu của 7 ngày gần nhất.
  const today = new Date();

  const revenueByDay = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setHours(0, 0, 0, 0);
    date.setDate(today.getDate() - (6 - index));

    const nextDate = new Date(date);
    nextDate.setDate(date.getDate() + 1);

    const revenue = validOrders.reduce((sum, order) => {
      const orderDate = new Date(order.createdAt);

      if (
        Number.isNaN(orderDate.getTime()) ||
        orderDate < date ||
        orderDate >= nextDate
      ) {
        return sum;
      }

      return (
        sum +
        Number(order.finalPrice ?? order.totalPrice ?? 0)
      );
    }, 0);

    return {
      label: date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
      }),
      revenue,
    };
  });

  const maxRevenue = Math.max(
    ...revenueByDay.map((item) => item.revenue),
    1
  );

  const recentOrders = [...orders]
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0) -
        new Date(a.createdAt || 0)
    )
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-[#f8fafb] p-4 sm:p-6">
      {/* Tiêu đề */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="mb-2 text-sm text-gray-500">
            Trang chủ / Quản trị hệ thống / Tổng quan
          </p>

          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Dashboard
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Tổng quan tình hình kinh doanh của BookStore.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setLoading(true);
            setError("");
            fetchDashboard();
          }}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-[#c92127] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#a51b20] disabled:opacity-60"
        >
          <RefreshCw
            size={17}
            className={loading ? "animate-spin" : ""}
          />
          Làm mới dữ liệu
        </button>
      </div>

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Thẻ thống kê */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Tổng doanh thu"
          value={loading ? "Đang tải..." : formatMoney(totalRevenue)}
          description="Đơn hàng chưa bị hủy"
          icon={Wallet}
        />

        <StatCard
          title="Tổng đơn hàng"
          value={loading ? "..." : formatNumber(orders.length)}
          description={`${pendingOrders} đơn đang chờ xác nhận`}
          icon={ShoppingCart}
        />

        <StatCard
          title="Tổng sản phẩm"
          value={loading ? "..." : formatNumber(products.length)}
          description={`${lowStockProducts.length} sản phẩm tồn kho thấp`}
          icon={BookOpen}
        />

        <StatCard
          title="Tổng danh mục"
          value={loading ? "..." : formatNumber(categories.length)}
          description="Danh mục đang có trong hệ thống"
          icon={Tags}
        />
      </div>

      {/* Biểu đồ và cảnh báo */}
      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm xl:col-span-2">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-2 text-green-600">
              <TrendingUp size={21} />
            </div>

            <div>
              <h2 className="font-bold text-gray-900">
                Doanh thu 7 ngày gần nhất
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                Tổng hợp từ ngày tạo đơn hàng
              </p>
            </div>
          </div>

          {loading ? (
            <p className="py-10 text-center text-sm text-gray-500">
              Đang tải biểu đồ...
            </p>
          ) : (
            <div className="flex h-56 items-end gap-2 sm:gap-4">
              {revenueByDay.map((item) => (
                <div
                  key={item.label}
                  className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
                >
                  <span className="max-w-full truncate text-center text-[10px] text-gray-500 sm:text-xs">
                    {item.revenue > 0
                      ? formatMoney(item.revenue)
                      : "0 ₫"}
                  </span>

                  <div className="flex h-36 w-full items-end">
                    <div
                      title={formatMoney(item.revenue)}
                      className="w-full rounded-t-md bg-[#c92127] transition-all"
                      style={{
                        height: `${
                          item.revenue > 0
                            ? Math.max(
                                (item.revenue / maxRevenue) * 100,
                                4
                              )
                            : 0
                        }%`,
                      }}
                    />
                  </div>

                  <span className="text-xs text-gray-500">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
              <AlertTriangle size={21} />
            </div>

            <div>
              <h2 className="font-bold text-gray-900">
                Cảnh báo tồn kho
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                Tồn kho từ 5 sản phẩm trở xuống
              </p>
            </div>
          </div>

          {loading ? (
            <p className="text-sm text-gray-500">Đang tải...</p>
          ) : lowStockProducts.length === 0 ? (
            <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
              Không có sản phẩm tồn kho thấp.
            </p>
          ) : (
            <div className="space-y-3">
              {lowStockProducts.slice(0, 5).map((product) => (
                <div
                  key={product._id}
                  className="flex items-center justify-between gap-3 border-b border-gray-100 pb-3 last:border-0"
                >
                  <p className="min-w-0 truncate text-sm font-medium text-gray-800">
                    {product.nameProduct}
                  </p>

                  <span className="shrink-0 rounded-md bg-red-50 px-2 py-1 text-xs font-semibold text-red-600">
                    Còn {product.stockProduct}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Bảng đơn hàng gần đây */}
      <section className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-gray-100 p-5">
          <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
            <Clock size={21} />
          </div>

          <div>
            <h2 className="font-bold text-gray-900">
              Đơn hàng gần đây
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              5 đơn hàng mới nhất
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-5 py-4">Mã đơn</th>
                <th className="px-5 py-4">Khách hàng</th>
                <th className="px-5 py-4">Ngày đặt</th>
                <th className="px-5 py-4">Thanh toán</th>
                <th className="px-5 py-4">Trạng thái</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {!loading && recentOrders.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-10 text-center text-gray-500"
                  >
                    Chưa có đơn hàng.
                  </td>
                </tr>
              )}

              {recentOrders.map((order) => (
                <tr
                  key={order._id}
                  className="transition hover:bg-gray-50"
                >
                  <td className="px-5 py-4 font-semibold text-[#c92127]">
                    #{String(order._id).slice(-8).toUpperCase()}
                  </td>

                  <td className="px-5 py-4 text-gray-700">
                    {order.fullName || order.userId?.fullName || "—"}
                  </td>

                  <td className="px-5 py-4 text-gray-500">
                    {formatDate(order.createdAt)}
                  </td>

                  <td className="px-5 py-4 font-medium text-gray-800">
                    {formatMoney(
                      order.finalPrice ?? order.totalPrice
                    )}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${
                        statusColors[order.status] ||
                        "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {statusLabels[order.status] || order.status || "—"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default DashboardOverview;