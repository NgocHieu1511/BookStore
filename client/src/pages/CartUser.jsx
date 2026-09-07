import { useState } from "react";
import Header from "../components/Header";
import { useStore } from "../hooks/useStore";
import {
  Truck,
  Gift,
  Ticket,
  Trash2,
  Minus,
  Plus,
  ArrowLeft,
  ArrowRight,
  ShoppingCart,
  Check,
  ShieldCheck,
  RotateCcw,
  Coins,
  CircleHelp,
} from "lucide-react";
import {
  requestApplyCounpon,
  requestDeleteProductCart,
  requestUpdateQuantity,
} from "../config/CartRequest";
import { message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import  Footer  from "../components/Footer";

const CartUser = () => {
  const { cart, getCart } = useStore();

  // cart có thể chưa có dữ liệu khi component render lần đầu
  // nên luôn lấy dữ liệu bằng ?. để tránh lỗi undefined
  const cartData = cart?.cart;
  const products = cartData?.products || [];
  const coupons = cart?.coupons || [];

  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [deleteModal, setDeleteModal] = useState({
    show: false,
    product: null,
  });

  // Lưu ID sản phẩm được chọn
  const [selectedItems, setSelectedItems] = useState(() =>
    products.map((item) => item.productId?._id)
  );

  const navigate = useNavigate();

  const formatPrice = (price = 0) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Giá sản phẩm sau khi áp dụng discount của sản phẩm
  const calculateProductPrice = (item) => {
    const product = item?.productId;
    if (!product) return 0;

    const price = product.priceProduct || 0;
    const discount = product.discountProduct || 0;

    return price - (price * discount) / 100;
  };

  // Thành tiền của một sản phẩm
  const calculateSubtotal = (item) => {
    return calculateProductPrice(item) * (item.quantity || 0);
  };

  // Chỉ tính tiền những sản phẩm đang được chọn
  const selectedProducts = products.filter((item) =>
    selectedItems.includes(item.productId?._id)
  );

  const subtotal = selectedProducts.reduce(
    (sum, item) => sum + calculateSubtotal(item),
    0
  );

  // Tính giảm giá coupon
  const calculateDiscount = () => {
    if (!selectedCoupon) return 0;

    if (subtotal < (selectedCoupon.minPrice || 0)) {
      return 0;
    }

    return subtotal * ((selectedCoupon.discount || 0) / 100);
  };

  const voucherDiscount = calculateDiscount();

  // Miễn phí ship từ 350.000đ
  const freeShipProgress = Math.min((subtotal / 350000) * 100, 100);
  const shippingFee = subtotal >= 350000 ? 0 : 30000;

  const total = Math.max(0, subtotal - voucherDiscount + shippingFee);

  // Tăng / giảm số lượng
  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      const data = {
        productId,
        newQuantity,
      };

      const res = await requestUpdateQuantity(data);

      await getCart();

      message.success(res.message);
    } catch (error) {
      message.error(
        error?.response?.data?.message || "Cập nhật số lượng thất bại"
      );
    }
  };

  // Mở modal xác nhận xóa
  const openDeleteModal = (product) => {
    setDeleteModal({
      show: true,
      product,
    });
  };

  // Đóng modal
  const closeDeleteModal = () => {
    setDeleteModal({
      show: false,
      product: null,
    });
  };

  // Xóa sản phẩm khỏi giỏ hàng
  const handleRemoveProduct = async (productId) => {
    if (!productId) return;

    try {
      const res = await requestDeleteProductCart(productId);

      await getCart();

      setSelectedItems((items) =>
        items.filter((itemId) => itemId !== productId)
      );

      closeDeleteModal();

      message.success(res.message);
    } catch (error) {
      message.error(
        error?.response?.data?.message || "Xóa sản phẩm thất bại"
      );
    }
  };

  // Chọn / bỏ chọn một sản phẩm
  const toggleItem = (id) => {
    setSelectedItems((items) =>
      items.includes(id)
        ? items.filter((itemId) => itemId !== id)
        : [...items, id]
    );
  };

  // Chọn / bỏ chọn tất cả
  const toggleAll = () => {
    if (selectedItems.length === products.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(
        products.map((item) => item.productId?._id).filter(Boolean)
      );
    }
  };

  // Xóa các sản phẩm đang được chọn
  // Xóa thật trên database bằng API, không dùng setProducts
  const removeSelected = async () => {
    if (selectedItems.length === 0) return;

    try {
      for (const productId of selectedItems) {
        await requestDeleteProductCart(productId);
      }

      await getCart();
      setSelectedItems([]);

      message.success("Đã xóa các sản phẩm được chọn");
    } catch (error) {
      message.error(
        error?.response?.data?.message || "Xóa sản phẩm thất bại"
      );
    }
  };

  // Áp dụng coupon
  const applyCoupon = async (coupon) => {
    if (subtotal < (coupon.minPrice || 0)) {
      message.error(
        `Đơn hàng tối thiểu ${formatPrice(coupon.minPrice)} để áp dụng mã này`
      );
      return;
    }

    try {
      const res = await requestApplyCounpon({
        couponId: coupon._id,
      });

      setSelectedCoupon(coupon);
      message.success(res.message);
    } catch (error) {
      message.error(
        error?.response?.data?.message || "Áp dụng mã giảm giá thất bại"
      );
    }
  };

  const handleCheckout = async () => {
    if (selectedItems.length === 0) {
      message.warning("Vui lòng chọn ít nhất một sản phẩm");
      return;
    }

    await getCart();
    navigate("/checkout");
  };

  // Nếu cart chưa có dữ liệu hoặc không có giỏ hàng
  if (!cart || !cartData) {
    return (
      <div>
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <h2 className="text-2xl font-semibold text-gray-600">
              Giỏ hàng của bạn đang trống
            </h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5] text-[#333]">
      <Header />
      <main className="py-6">
        <div className="max-w-7xl mx-auto px-4">

          {/* TITLE */}
          <div className="flex items-baseline gap-2 mb-4">
            <h1 className="text-lg md:text-xl font-bold uppercase">
              Giỏ Hàng
            </h1>
            <span className="text-gray-500 text-sm font-medium">
              ({products.length} sản phẩm)
            </span>
          </div>

          {/* FREE SHIPPING */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 text-xs md:text-sm font-medium">
                <Truck className="w-5 h-5 text-emerald-600" />
                <span>
                  {subtotal >= 350000 ? (
                    <strong className="text-emerald-600">
                      Bạn đã được miễn phí vận chuyển!
                    </strong>
                  ) : (
                    <>
                      Mua thêm{" "}
                      <strong className="text-[#c92127]">
                        {formatPrice(Math.max(0, 350000 - subtotal))}
                      </strong>{" "}
                      để được{" "}
                      <span className="text-emerald-700 font-bold uppercase">
                        Miễn phí vận chuyển
                      </span>
                    </>
                  )}
                </span>
              </div>

              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                Đạt {Math.round(freeShipProgress)}% chỉ tiêu
              </span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${freeShipProgress}%` }}
              />
            </div>

            <div className="mt-3 pt-2.5 border-t border-dashed border-gray-200 flex items-center justify-between text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-[#c92127]" />
                <span>
                  Chương trình quà tặng:{" "}
                  <strong>Nhận quà (0/3)</strong> - Tặng Bookmark & Sổ tay khi
                  đạt mốc 350.000 đ
                </span>
              </div>

              <button className="text-[#c92127] font-semibold hidden sm:flex items-center gap-1">
                Xem quà
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* MAIN GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* LEFT */}
            <div className="lg:col-span-8 space-y-4">

              {/* SELECT ALL */}
              <div className="bg-white px-4 py-3 rounded-lg shadow-sm border border-gray-200 flex items-center justify-between text-sm">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={
                      products.length > 0 &&
                      selectedItems.length === products.length
                    }
                    onChange={toggleAll}
                    className="h-4 w-4 accent-[#c92127]"
                  />
                  <span>Chọn tất cả ({products.length} sản phẩm)</span>
                </label>

                <div className="hidden sm:flex items-center gap-10 text-gray-500 text-xs">
                  <span>Số lượng</span>
                  <span>Thành tiền</span>
                  <button
                    onClick={removeSelected}
                    disabled={selectedItems.length === 0}
                    className="text-gray-400 hover:text-[#c92127] disabled:opacity-40"
                    title="Xóa sản phẩm đã chọn"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* PRODUCTS */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y divide-gray-100">
                {products.length === 0 ? (
                  <div className="py-16 text-center">
                    <ShoppingCart className="w-14 h-14 mx-auto text-gray-300" />
                    <h3 className="mt-4 font-bold text-gray-700">
                      Giỏ hàng đang trống
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">
                      Hãy thêm sản phẩm vào giỏ hàng để tiếp tục.
                    </p>
                  </div>
                ) : (
                  products.map((item) => {
                    const product = item.productId;

                    if (!product) return null;

                    const productId = product._id;
                    const priceAfterDiscount = calculateProductPrice(item);
                    const itemSubtotal = calculateSubtotal(item);

                    return (
                      <div
                        key={item._id}
                        className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(productId)}
                            onChange={() => toggleItem(productId)}
                            className="mt-2 h-4 w-4 accent-[#c92127]"
                          />

                          <img
                            src={
                              product.imagesProduct?.[0] ||
                              "/placeholder.jpg"
                            }
                            alt={product.nameProduct}
                            className="w-20 h-28 object-cover rounded border border-gray-200 shrink-0"
                          />

                          <div className="min-w-0">
                            <h3 className="text-sm font-medium text-gray-800 line-clamp-2 hover:text-[#c92127]">
                              {product.nameProduct}
                            </h3>

                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                              {product.descriptionProduct}
                            </p>

                            {product.metadata && (
                              <p className="text-xs text-gray-500 mt-1">
                                {product.metadata.author} •{" "}
                                {product.metadata.publisher}
                              </p>
                            )}

                            <div className="mt-1 flex flex-wrap items-baseline gap-2">
                              {product.discountProduct > 0 && (
                                <span className="text-xs text-gray-400 line-through">
                                  {formatPrice(product.priceProduct)}
                                </span>
                              )}

                              <span className="text-base font-bold text-[#c92127]">
                                {formatPrice(priceAfterDiscount)}
                              </span>

                              {product.discountProduct > 0 && (
                                <span className="text-[10px] font-bold text-white bg-[#c92127] px-1 rounded">
                                  -{product.discountProduct}%
                                </span>
                              )}
                            </div>

                            <span className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              Còn hàng
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between w-full sm:w-auto gap-6 pt-2 sm:pt-0 border-t sm:border-0 border-gray-100">
                          <div className="flex items-center border border-gray-300 rounded">
                            <button
                              onClick={() =>
                                handleQuantityChange(
                                  productId,
                                  item.quantity - 1
                                )
                              }
                              disabled={item.quantity <= 1}
                              className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 border-r border-gray-300 disabled:opacity-40"
                            >
                              <Minus className="w-3 h-3" />
                            </button>

                            <span className="w-10 text-center text-xs font-semibold">
                              {item.quantity}
                            </span>

                            <button
                              onClick={() =>
                                handleQuantityChange(
                                  productId,
                                  item.quantity + 1
                                )
                              }
                              disabled={
                                item.quantity >=
                                (product.stockProduct || Infinity)
                              }
                              className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 border-l border-gray-300 disabled:opacity-40"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="text-right w-28">
                            <span className="text-base font-bold text-[#c92127]">
                              {formatPrice(itemSubtotal)}
                            </span>
                          </div>

                          <button
                            onClick={() =>
                              openDeleteModal({
                                _id: productId,
                                name: product.nameProduct,
                              })
                            }
                            className="text-gray-400 hover:text-[#c92127] p-1"
                            title="Xóa sản phẩm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* BOTTOM ACTION */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <Link
                  to="/"
                  className="inline-flex items-center text-sm font-semibold text-[#c92127] hover:underline"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Tiếp tục mua sắm
                </Link>

                <button
                  onClick={removeSelected}
                  disabled={selectedItems.length === 0}
                  className="text-xs text-gray-500 hover:text-red-600 border border-gray-300 hover:border-red-400 rounded px-3 py-1.5 disabled:opacity-40"
                >
                  Xóa các sản phẩm đã chọn
                </button>
              </div>
            </div>

            {/* RIGHT */}
            <div className="lg:col-span-4 space-y-4">

              {/* VOUCHER */}
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Ticket className="w-5 h-5 text-[#c92127]" />
                    <span className="text-sm font-bold uppercase">
                      Khuyến Mãi
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    Tối đa 2 mã
                  </span>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {coupons.length === 0 ? (
                    <p className="text-sm text-gray-400">
                      Hiện không có mã giảm giá.
                    </p>
                  ) : (
                    coupons.map((coupon) => {
                      const isValid = subtotal >= (coupon.minPrice || 0);
                      const isSelected =
                        selectedCoupon?._id === coupon._id;

                      return (
                        <button
                          key={coupon._id}
                          onClick={() => applyCoupon(coupon)}
                          disabled={!isValid}
                          className={`w-full text-left p-3 rounded-lg border-2 transition ${
                            isSelected
                              ? "border-green-500 bg-green-50"
                              : isValid
                              ? "border-gray-200 hover:border-blue-300"
                              : "border-gray-200 opacity-50 cursor-not-allowed"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-bold text-blue-600">
                              {coupon.nameCoupon}
                            </span>
                            <span className="text-red-600 font-bold">
                              -{coupon.discount}%
                            </span>
                          </div>

                          <p className="text-xs text-gray-600">
                            Đơn tối thiểu:{" "}
                            {formatPrice(coupon.minPrice)}
                          </p>

                          {isSelected && (
                            <p className="text-xs text-green-600 mt-1 font-semibold">
                              ✓ Đã áp dụng
                            </p>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* ORDER SUMMARY */}
              <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
                <div className="space-y-3 text-sm pb-4 border-b border-dashed border-gray-300">
                  <div className="flex justify-between text-gray-600">
                    <span>Thành tiền (Tạm tính):</span>
                    <span className="font-semibold text-gray-800">
                      {formatPrice(subtotal)}
                    </span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>Giảm giá voucher:</span>
                    <span className="font-semibold text-emerald-600">
                      -{formatPrice(voucherDiscount)}
                    </span>
                  </div>

                  <div className="flex justify-between text-gray-600 items-center">
                    <span className="flex items-center">
                      Phí vận chuyển
                      <CircleHelp className="w-3 h-3 text-gray-400 ml-1" />
                    </span>

                    <span className="font-semibold text-emerald-600 uppercase text-xs">
                      {shippingFee === 0
                        ? "Miễn phí"
                        : formatPrice(shippingFee)}
                    </span>
                  </div>
                </div>

                <div className="py-4 border-b border-gray-100">
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm font-bold">
                      Tổng Số Tiền:
                    </span>

                    <div className="text-right">
                      <span className="text-2xl font-black text-[#c92127]">
                        {formatPrice(total)}
                      </span>

                      <p className="text-[11px] text-gray-400">
                        (Đã bao gồm VAT nếu có)
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 bg-amber-50 text-amber-900 border border-amber-200 rounded p-2 text-xs flex items-center justify-between">
                    <span className="flex items-center">
                      <Coins className="w-4 h-4 text-amber-500 mr-1.5" />
                      F-Point tích lũy:
                    </span>
                    <span className="font-bold text-amber-700">
                      +{Math.floor(total / 1000)} điểm
                    </span>
                  </div>
                </div>

                <div className="pt-4 space-y-2">
                  <button
                    onClick={handleCheckout}
                    disabled={selectedItems.length === 0}
                    className="w-full bg-[#c92127] hover:bg-[#a91b20] disabled:bg-gray-300 text-white py-3.5 px-4 rounded-lg font-bold text-base shadow-md uppercase transition flex items-center justify-center gap-2"
                  >
                    <span>THANH TOÁN</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <p className="text-center text-[11px] text-gray-400 italic">
                    Giảm giá trên website chỉ áp dụng cho đơn hàng bán lẻ
                  </p>
                </div>
              </div>

              {/* TRUST */}
              <div className="bg-white p-3.5 rounded-lg border border-gray-200 grid grid-cols-2 gap-3 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>100% Hàng chính hãng</span>
                </div>

                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-blue-600" />
                  <span>Đổi trả trong 30 ngày</span>
                </div>
              </div>
            </div>
          </div>

          {/* RECOMMENDATIONS */}
          <section className="mt-10 bg-white p-5 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-5 bg-[#c92127] rounded-full" />
                <h2 className="text-base md:text-lg font-bold uppercase">
                  Gợi Ý Dành Riêng Cho Bạn
                </h2>
              </div>

              <Link
                to="/"
                className="text-xs font-semibold text-[#c92127]"
              >
                Xem tất cả →
              </Link>
            </div>

            <div className="text-sm text-gray-500">
              Hãy tiếp tục mua sắm để xem thêm sản phẩm phù hợp.
            </div>
          </section>
        </div>
        
      </main>
      
      

      {/* DELETE MODAL */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <Trash2 className="text-red-600" size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-800">
                Xác Nhận Xóa
              </h3>
            </div>

            <p className="text-gray-700 mb-2">
              Bạn có chắc chắn muốn xóa sản phẩm
            </p>

            <p className="text-gray-900 font-semibold mb-6">
              "{deleteModal.product?.name}" khỏi giỏ hàng?
            </p>

            <div className="flex gap-3">
              <button
                onClick={closeDeleteModal}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Hủy
              </button>

              <button
                onClick={() =>
                  handleRemoveProduct(deleteModal.product?._id)
                }
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
      <Footer />
      
    </div>
  );
};

export default CartUser;
