const paymentModel = require("../models/payment.model");
const userModel = require("../models/user.model");
const productModel = require("../models/product.model");
const categoryModel = require("../models/category.model");
const { OK } = require("../core/success.response");

const VN_TZ = "Asia/Ho_Chi_Minh";
const VN_OFFSET_MS = 7 * 60 * 60 * 1000; // Việt Nam = UTC+7, không có giờ mùa hè
const DAY_MS = 24 * 60 * 60 * 1000;
const LOW_STOCK_LIMIT = 5; // tồn kho <= 5 thì cảnh báo

// 00:00 của ngày hiện tại theo giờ Việt Nam (trả về Date chuẩn UTC)
const startOfDayVN = (date = new Date()) =>
  new Date(
    Math.floor((date.getTime() + VN_OFFSET_MS) / DAY_MS) * DAY_MS - VN_OFFSET_MS
  );

// Date -> "YYYY-MM-DD" theo giờ Việt Nam
const dateKeyVN = (date) =>
  new Date(date.getTime() + VN_OFFSET_MS).toISOString().slice(0, 10);

// % thay đổi so với hôm qua.
// Hôm qua = 0 mà hôm nay > 0 -> trả null (không tính được %), FE hiển thị "mới".
const percentChange = (current, previous) => {
  if (!previous) return current > 0 ? null : 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
};

class StatisticalController {
  // ADMIN: số liệu tổng quan cho trang Dashboard
  async getOverview(req, res) {
    const startToday = startOfDayVN();
    const startTomorrow = new Date(startToday.getTime() + DAY_MS);
    const startYesterday = new Date(startToday.getTime() - DAY_MS);
    const startWeek = new Date(startToday.getTime() - 6 * DAY_MS); // 7 ngày gồm cả hôm nay

    const [
      dailyRows,
      newUsersToday,
      newUsersYesterday,
      pendingOrders,
      lowStockCount,
      lowStockProducts,
      recentOrders,
      totalProducts,
      totalCategories,
    ] = await Promise.all([
      // 1 lần aggregate cho cả 7 ngày: doanh thu + số đơn + số sách bán ra.
      // Không tính đơn đã hủy.
      paymentModel.aggregate([
        {
          $match: {
            createdAt: { $gte: startWeek, $lt: startTomorrow },
            status: { $ne: "cancelled" },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt",
                timezone: VN_TZ,
              },
            },
            revenue: { $sum: "$finalPrice" },
            orders: { $sum: 1 },
            soldProducts: { $sum: { $sum: "$products.quantity" } },
          },
        },
      ]),
      userModel.countDocuments({
        createdAt: { $gte: startToday, $lt: startTomorrow },
      }),
      userModel.countDocuments({
        createdAt: { $gte: startYesterday, $lt: startToday },
      }),
      paymentModel.countDocuments({ status: "pending" }),
      productModel.countDocuments({ stockProduct: { $lte: LOW_STOCK_LIMIT } }),
      productModel
        .find({ stockProduct: { $lte: LOW_STOCK_LIMIT } })
        .sort({ stockProduct: 1 })
        .limit(5)
        .select("nameProduct stockProduct")
        .lean(),
      paymentModel
        .find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("fullName finalPrice totalPrice status createdAt")
        .lean(),
      productModel.countDocuments(),
      categoryModel.countDocuments(),
    ]);

    // Ghép dữ liệu vào đủ 7 ngày (ngày không có đơn vẫn phải có cột = 0)
    const byDate = new Map(dailyRows.map((row) => [row._id, row]));
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = dateKeyVN(new Date(startWeek.getTime() + i * DAY_MS));
      const row = byDate.get(date);
      return {
        date,
        revenue: row?.revenue || 0,
        orders: row?.orders || 0,
        soldProducts: row?.soldProducts || 0,
      };
    });

    const today = last7Days[6];
    const yesterday = last7Days[5];

    return new OK({
      message: "Lấy số liệu thống kê thành công",
      metadata: {
        today: {
          revenue: today.revenue,
          orders: today.orders,
          soldProducts: today.soldProducts,
          newUsers: newUsersToday,
        },
        change: {
          revenue: percentChange(today.revenue, yesterday.revenue),
          orders: percentChange(today.orders, yesterday.orders),
          soldProducts: percentChange(today.soldProducts, yesterday.soldProducts),
          newUsers: percentChange(newUsersToday, newUsersYesterday),
        },
        last7Days,
        pendingOrders,
        lowStock: { count: lowStockCount, products: lowStockProducts },
        recentOrders,
        totals: { products: totalProducts, categories: totalCategories },
      },
    }).send(res);
  }
}

module.exports = new StatisticalController();