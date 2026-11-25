import { useCallback, useEffect, useState } from "react";
import {
  Wallet,
  ShoppingCart,
  BookOpen,
  UserPlus,
  TrendingUp,
  TrendingDown,
  Clock,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

import { requestGetOverview } from "../../config/statisticalRequest";
import { useStore } from "../../hooks/useStore";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const formatMoney = (value) =>
  Number(value || 0).toLocaleString("vi-VN") + " ₫";

const formatNumber = (value) => Number(value || 0).toLocaleString("vi-VN");

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString("vi-VN") : "—";

// "2026-11-12" -> "T5 12/11"
const DAY_NAMES = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
const formatDayLabel = (dateKey) => {
  const [, month, day] = dateKey.split("-");
  const dayOfWeek = new Date(`${dateKey}T12:00:00+07:00`).getDay();
  return `${DAY_NAMES[dayOfWeek]} ${day}/${month}`;
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

// value === null  -> hôm qua chưa có dữ liệu nên không tính được %
function ChangeBadge({ value }) {
  if (value === null) {
    return (
      <span className="text-xs text-gray-500">Hôm qua chưa có dữ liệu</span>
    );
  }

  const isUp = value >= 0;
  const Icon = isUp ? TrendingUp : TrendingDown;

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold ${
        isUp ? "text-green-600" : "text-red-600"
      }`}
    >
      <Icon size={14} />
      {isUp ? "+" : ""}
      {value}% so với hôm qua
    </span>
  );
}

function StatCard({ title, value, change, description, icon: Icon, loading }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-gray-500">{title}</p>
          <h2 className="mt-3 truncate text-2xl font-bold text-gray-900">
            {loading ? "..." : value}
          </h2>
          <div className="mt-2 min-h-4">
            {!loading && <ChangeBadge value={change} />}
          </div>
          <p className="mt-1 text-xs text-gray-500">{!loading && description}</p>
        </div>

        <div className="rounded-xl bg-red-50 p-3 text-[#c92127]">
          <Icon size={23} />
        </div>
      </div>
    </div>
  );
}

function DashboardOverview() {
  const { dataUser } = useStore();
  const admin = dataUser?.user;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const res = await requestGetOverview();
      setData(res.metadata);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Không thể tải dữ liệu Dashboard. Hãy kiểm tra backend và quyền Admin."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    document.title = "Dashboard | BookStore Admin";
    void Promise.resolve().then(fetchData);
  }, [fetchData]);

  const last7Days = data?.last7Days ?? [];
  const weekRevenue = last7Days.reduce((sum, day) => sum + day.revenue, 0);

  const chartData = {
    labels: last7Days.map((day) => formatDayLabel(day.date)),
    datasets: [
      {
        label: "Doanh thu",
        data: last7Days.map((day) => day.revenue),
        backgroundColor: "rgba(201, 33, 39, 0.65)",
        borderColor: "#c92127",
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: { label: (ctx) => formatMoney(ctx.parsed.y) },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) =>
            new Intl.NumberFormat("vi-VN", { notation: "compact" }).format(value),
        },
      },
    },
  };

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
            Xin chào, {admin?.fullName || "Quản trị viên"} — đây là tình hình
            kinh doanh hôm nay của BookStore.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setLoading(true);
            setError("");
            fetchData();
          }}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-[#c92127] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#a51b20] disabled:opacity-60"
        >
          <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
          Làm mới dữ liệu
        </button>
      </div>

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* 4 thẻ thống kê hôm nay */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Doanh thu hôm nay"
          value={formatMoney(data?.today.revenue)}
          change={data?.change.revenue}
          description="Không tính đơn đã hủy"
          icon={Wallet}
          loading={loading || !data}
        />
        <StatCard
          title="Đơn hàng hôm nay"
          value={formatNumber(data?.today.orders)}
          change={data?.change.orders}
          description={`${data?.pendingOrders ?? 0} đơn đang chờ xác nhận`}
          icon={ShoppingCart}
          loading={loading || !data}
        />
        <StatCard
          title="Sách đã bán hôm nay"
          value={formatNumber(data?.today.soldProducts)}
          change={data?.change.soldProducts}
          description={`${formatNumber(data?.totals.products)} đầu sách trong kho`}
          icon={BookOpen}
          loading={loading || !data}
        />
        <StatCard
          title="Người dùng mới"
          value={formatNumber(data?.today.newUsers)}
          change={data?.change.newUsers}
          description="Tài khoản đăng ký hôm nay"
          icon={UserPlus}
          loading={loading || !data}
        />
      </div>

      {/* Biểu đồ + cảnh báo tồn kho */}
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
                Tổng 7 ngày: {formatMoney(weekRevenue)}
              </p>
            </div>
          </div>

          {loading || !data ? (
            <p className="py-10 text-center text-sm text-gray-500">
              Đang tải biểu đồ...
            </p>
          ) : (
            <div className="h-64">
              <Bar data={chartData} options={chartOptions} />
            </div>
          )}
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
              <AlertTriangle size={21} />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">Cảnh báo tồn kho</h2>
              <p className="mt-1 text-xs text-gray-500">
                {data
                  ? `${data.lowStock.count} sản phẩm còn từ 5 cuốn trở xuống`
                  : "Tồn kho từ 5 cuốn trở xuống"}
              </p>
            </div>
          </div>

          {loading || !data ? (
            <p className="text-sm text-gray-500">Đang tải...</p>
          ) : data.lowStock.products.length === 0 ? (
            <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
              Không có sản phẩm tồn kho thấp.
            </p>
          ) : (
            <div className="space-y-3">
              {data.lowStock.products.map((product) => (
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

      {/* Đơn hàng gần đây */}
      <section className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-gray-100 p-5">
          <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
            <Clock size={21} />
          </div>
          <div>
            <h2 className="font-bold text-gray-900">Đơn hàng gần đây</h2>
            <p className="mt-1 text-xs text-gray-500">5 đơn hàng mới nhất</p>
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
              {!loading && data?.recentOrders.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-gray-500">
                    Chưa có đơn hàng.
                  </td>
                </tr>
              )}

              {(data?.recentOrders ?? []).map((order) => (
                <tr key={order._id} className="transition hover:bg-gray-50">
                  <td className="px-5 py-4 font-semibold text-[#c92127]">
                    #{String(order._id).slice(-8).toUpperCase()}
                  </td>
                  <td className="px-5 py-4 text-gray-700">
                    {order.fullName || "—"}
                  </td>
                  <td className="px-5 py-4 text-gray-500">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-5 py-4 font-medium text-gray-800">
                    {formatMoney(order.finalPrice ?? order.totalPrice)}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${
                        statusColors[order.status] || "bg-gray-100 text-gray-600"
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