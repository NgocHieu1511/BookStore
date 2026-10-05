import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Button,
  Input,
  Select,
  Space,
  Table,
  Tag,
  message,
} from "antd";
import {
  Search,
  RefreshCw,
  Package,
} from "lucide-react";

import {
  requestAdminPaymentList,
  requestUpdatePaymentStatus,
} from "../../config/paymentRequest";

const STATUS_OPTIONS = [
  { value: "pending", label: "Chờ xác nhận" },
  { value: "confirmed", label: "Đã xác nhận" },
  { value: "delivered", label: "Đã giao hàng" },
  { value: "completed", label: "Hoàn thành" },
  { value: "cancelled", label: "Đã hủy" },
];

const STATUS_COLORS = {
  pending: "gold",
  confirmed: "blue",
  delivered: "cyan",
  completed: "green",
  cancelled: "red",
};

const STATUS_LABELS = Object.fromEntries(
  STATUS_OPTIONS.map((item) => [
    item.value,
    item.label,
  ])
);

const formatPrice = (price) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price || 0);

const formatDate = (date) =>
  date
    ? new Date(date).toLocaleString("vi-VN")
    : "—";

function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const [keyword, setKeyword] = useState("");
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Lấy danh sách đơn hàng từ backend
  const fetchOrders = async (
    page = pagination.current,
    pageSize = pagination.pageSize,
    search = searchText,
    status = statusFilter
  ) => {
    setLoading(true);

    try {
      const params = {
        page,
        limit: pageSize,
        keyword: search,
      };

      if (status !== "all") {
        params.status = status;
      }

      const res = await requestAdminPaymentList(params);
      const data = res.metadata;

      setOrders(data.orders || []);

      setPagination({
        current: data.pagination.currentPage,
        pageSize: data.pagination.pageSize,
        total: data.pagination.totalOrders,
      });
    } catch (error) {
      console.error("Lỗi lấy đơn hàng:", error);

      message.error(
        error.response?.data?.message ||
          "Không thể tải danh sách đơn hàng"
      );
    } finally {
      setLoading(false);
    }
  };

 useEffect(() => {
    const loadOrders = async () => {
        await fetchOrders(1, 10, "", "all");
    };

    loadOrders();
}, []);

  // Tìm kiếm đơn hàng
  const handleSearch = () => {
    setSearchText(keyword.trim());
    fetchOrders(1, pagination.pageSize, keyword.trim(), statusFilter);
  };

  // Lọc theo trạng thái
  const handleFilterStatus = (value) => {
    setStatusFilter(value);
    fetchOrders(1, pagination.pageSize, searchText, value);
  };

  // Cập nhật trạng thái đơn hàng
  const handleUpdateStatus = async (orderId, status) => {
    setUpdatingId(orderId);

    try {
      await requestUpdatePaymentStatus(orderId, status);

      message.success("Cập nhật trạng thái thành công");

      await fetchOrders(
        pagination.current,
        pagination.pageSize,
        searchText,
        statusFilter
      );
    } catch (error) {
      console.error("Lỗi cập nhật đơn hàng:", error);

      message.error(
        error.response?.data?.message ||
          "Cập nhật trạng thái thất bại"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const columns = [
    {
      title: "Mã đơn hàng",
      dataIndex: "_id",
      key: "_id",
      width: 190,
      render: (id) => (
        <span className="font-semibold text-[#c92127]">
          #{id}
        </span>
      ),
    },
    {
      title: "Khách hàng",
      key: "customer",
      width: 210,
      render: (_, order) => (
        <div>
          <div className="font-medium">
            {order.fullName || order.userId?.fullName || "—"}
          </div>
          <div className="text-gray-500 text-xs">
            {order.email || order.userId?.email || "—"}
          </div>
          <div className="text-gray-500 text-xs">
            {order.phoneNumber || ""}
          </div>
        </div>
      ),
    },
    {
      title: "Sản phẩm",
      key: "products",
      width: 100,
      align: "center",
      render: (_, order) => {
        const count = (order.products || []).reduce(
          (total, item) => total + (item.quantity || 0),
          0
        );

        return `${count} quyển`;
      },
    },
    {
      title: "Tổng tiền",
      dataIndex: "finalPrice",
      key: "finalPrice",
      width: 150,
      render: (price) => (
        <span className="font-semibold">
          {formatPrice(price)}
        </span>
      ),
    },
    {
      title: "Thanh toán",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      width: 140,
      render: (method) => {
        const labels = {
          cod: "COD",
          momo: "MoMo",
          vnpay: "VNPay",
        };

        return labels[method] || method || "—";
      },
    },
    {
      title: "Ngày đặt",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      render: formatDate,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 160,
      render: (status) => (
        <Tag color={STATUS_COLORS[status] || "default"}>
          {STATUS_LABELS[status] || status}
        </Tag>
      ),
    },
    {
      title: "Cập nhật",
      key: "action",
      width: 210,
      render: (_, order) => (
        <Select
          value={order.status}
          style={{ width: 175 }}
          loading={updatingId === order._id}
          disabled={
            updatingId !== null ||
            ["completed", "cancelled"].includes(order.status)
          }
          options={STATUS_OPTIONS.map((item) => ({
            ...item,
            disabled:
              ["completed", "cancelled"].includes(order.status) &&
              item.value !== order.status,
          }))}
          onChange={(value) =>
            handleUpdateStatus(order._id, value)
          }
        />
      ),
    },{
  title: "Chi tiết",
  key: "detail",
  width: 110,
  render: (_, order) => (
    <Link to={`/admin/orders/${order._id}`}>
      <Button type="link">
        Xem chi tiết
      </Button>
    </Link>
  ),
},
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-[1600px] mx-auto">
        {/* Tiêu đề */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-3">
              <Package className="text-[#c92127]" />
              Quản lý đơn hàng
            </h1>

            <p className="text-gray-500 mt-2">
              Theo dõi và cập nhật đơn hàng của khách hàng.
            </p>
          </div>

          <Button
            icon={<RefreshCw size={16} />}
            onClick={() =>
              fetchOrders(
                pagination.current,
                pagination.pageSize,
                searchText,
                statusFilter
              )
            }
            loading={loading}
          >
            Làm mới
          </Button>
        </div>

        {/* Tìm kiếm và lọc */}
        <div className="bg-white rounded-xl p-4 mb-5 shadow-sm">
          <div className="flex flex-col md:flex-row gap-3">
            <Input
              allowClear
              placeholder="Nhập mã đơn, tên, email hoặc số điện thoại..."
              prefix={<Search size={16} />}
              value={keyword}
              onChange={(event) =>
                setKeyword(event.target.value)
              }
              onPressEnter={handleSearch}
              className="max-w-xl"
            />

            <Space wrap>
              <Button
                type="primary"
                style={{
                  backgroundColor: "#c92127",
                }}
                onClick={handleSearch}
              >
                Tìm kiếm
              </Button>

              <Select
                value={statusFilter}
                style={{ width: 200 }}
                onChange={handleFilterStatus}
                options={[
                  { value: "all", label: "Tất cả trạng thái" },
                  ...STATUS_OPTIONS,
                ]}
              />
            </Space>
          </div>
        </div>

        {/* Bảng đơn hàng */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="mb-4 font-semibold text-gray-700">
            Tổng số đơn hàng: {pagination.total}
          </div>

          <Table
            rowKey="_id"
            columns={columns}
            dataSource={orders}
            loading={loading}
            scroll={{ x: 1350 }}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "50"],
              showTotal: (total) => `Tổng ${total} đơn hàng`,
              onChange: (page, pageSize) => {
                fetchOrders(
                  page,
                  pageSize,
                  searchText,
                  statusFilter
                );
              },
            }}
            locale={{
              emptyText: "Chưa có đơn hàng nào",
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default OrderManagement;