const productModel = require("../models/product.model");
const productSearch = require("../services/productSearch.service");
const { OK, Created } = require("../core/success.response");
const { BadRequestError, NotFoundError } = require("../core/error.response");
const { attachRatings } = require("../utils/feedbackHelper");
const { getFinalPrice } = require("../utils/price");

const reindex = (ids) =>
  ids.forEach((id) =>
    productSearch.indexProduct(id).catch((e) => console.error("[Meili]", e.message)),
  );

class FlashSaleController {
  // Public: chỉ lấy sách đang flash sale, kết thúc sớm nhất xếp trước
  async getFlashSale(req, res) {
    const products = await productModel
      .find({ discountProduct: { $gt: 0 }, dateEnd: { $gt: new Date() } })
      .populate("categoryProduct", "nameCategory")
      .sort({ dateEnd: 1 })
      .lean();

    const data = (await attachRatings(products)).map((p) => ({
      ...p,
      finalPrice: getFinalPrice(p),
    }));
    return new OK({ message: "Lấy flash sale thành công", metadata: data }).send(res);
  }

  // Admin: tạo flash sale cho nhiều sách
  async createFlashSale(req, res) {
    const { productIds, discount, dateEnd } = req.body;
    const percent = Number(discount);
    const end = new Date(dateEnd);

    if (
      !Array.isArray(productIds) || productIds.length === 0 ||
      !(percent > 0 && percent < 100) ||
      Number.isNaN(end.getTime()) || end <= new Date()
    ) {
      throw new BadRequestError("Thông tin flash sale không hợp lệ");
    }

    const count = await productModel.countDocuments({ _id: { $in: productIds } });
    if (count !== productIds.length) throw new NotFoundError("Có sản phẩm không tồn tại");

    await productModel.updateMany(
      { _id: { $in: productIds } },
      { discountProduct: percent, dateEnd: end },
    );
    reindex(productIds);
    return new Created({ message: "Tạo flash sale thành công" }).send(res);
  }

  // Admin: gỡ 1 sách khỏi flash sale
  async deleteFlashSale(req, res) {
    const { id } = req.params;
    await productModel.updateOne({ _id: id }, { discountProduct: 0, dateEnd: null });
    reindex([id]);
    return new OK({ message: "Đã gỡ khỏi flash sale" }).send(res);
  }
}

module.exports = new FlashSaleController();