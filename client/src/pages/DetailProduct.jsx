import Header from "../components/Header";
import Footer from "../components/Footer";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { productDetail } from "../config/productRequest";

import {
  ShoppingCart,
  Truck,
  RotateCcw,
  Gift,
  Minus,
  Plus,
  Zap,
} from "lucide-react";
import { useStore } from "../hooks/useStore";
// import { requestAddToCart } from "../config/cartRequest";

function DetailProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const { dataUser } = useStore();

  // ==============================
  // LẤY CHI TIẾT SẢN PHẨM
  // ==============================
  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        setLoading(true);

        const res = await productDetail(id);

        console.log("Product detail:", res);

        setProduct(res?.metadata?.product || res?.metadata || res?.data || res);
      } catch (error) {
        console.error("Lỗi lấy chi tiết sản phẩm:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProductDetail();
    }
  }, [id]);

  // ==============================
  // LOADING
  // ==============================
  if (loading) {
    return (
      <>
        <Header />

        <div className="flex min-h-[500px] items-center justify-center">
          <div className="text-lg text-gray-500">Đang tải sản phẩm...</div>
        </div>

        <Footer />
      </>
    );
  }

  // ==============================
  // KHÔNG TÌM THẤY SẢN PHẨM
  // ==============================
  if (!product) {
    return (
      <>
        <Header />

        <div className="flex min-h-[500px] items-center justify-center">
          <p className="text-lg text-gray-500">Không tìm thấy sản phẩm</p>
        </div>

        <Footer />
      </>
    );
  }

  const images = Array.isArray(product?.imagesProduct)
    ? product.imagesProduct
    : [];

  const name = product?.nameProduct || "Chưa có tên";

  const price = Number(product?.priceProduct || 0);

  const discount = Number(product?.discountProduct || 0);

  const stock = Number(product?.stockProduct || 0);

  const description = product?.descriptionProduct || "";

  const metadata = product?.metadata || {};

  // Giá gốc trước khi giảm
  const oldPrice =
    discount > 0 ? Math.round(price / (1 - discount / 100)) : null;

  // ==============================
  // TĂNG GIẢM SỐ LƯỢNG
  // ==============================

  const increaseQuantity = () => {
    setQuantity((prev) => Math.min(prev + 1, stock));
  };

  const decreaseQuantity = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };
  const onLogin = () => {
    navigate("/login");
  };
  // const handleAddToCart = async () => {
  //       try {
  //           const data = {
  //               productId: id,
  //               quantity,
  //           };
  //           const res = await requestAddToCart(data);
  //           await fetchProductDetail();
  //           await getCart();
  //           message.success(res.message);
  //       } catch (error) {
  //           message.error(error.response.data.message);
  //       }
  //   };

  return (
    <div className="bg-[#f2f4f5] min-h-screen">
      {/* HEADER */}
      <header>
        <Header />
      </header>

      {/* BREADCRUMB */}
      <div className="mx-auto max-w-[1230px] px-4 py-4 text-sm text-gray-500">
        <span className="cursor-pointer hover:text-[#c92127]">Trang chủ</span>

        <span className="mx-2">&gt;</span>

        <span className="cursor-pointer hover:text-[#c92127]">Sản phẩm</span>

        <span className="mx-2">&gt;</span>

        <span className="text-gray-700">{name}</span>
      </div>

      {/* MAIN */}
      <main className="mx-auto max-w-[1230px] px-4 pb-10">
        {/* PRODUCT MAIN */}
        <div className="mb-6 flex flex-col gap-8 rounded-lg bg-white p-6 shadow-sm md:flex-row">
          {/* ==============================
              LEFT - IMAGES
          ============================== */}

          <div className="flex w-full flex-col items-center md:w-5/12">
            {/* MAIN IMAGE */}
            <div className="relative mb-4 flex h-[400px] w-full items-center justify-center overflow-hidden rounded-md border border-gray-100 p-4">
              {images.length > 0 ? (
                <img
                  src={images[selectedImage]}
                  alt={name}
                  className="h-full max-h-full w-full object-contain"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400">
                  Không có hình ảnh
                </div>
              )}

              {/* DISCOUNT */}
              {discount > 0 && (
                <span className="absolute left-4 top-4 rounded bg-red-100 px-2 py-1 text-xs font-bold text-red-600">
                  FLASH SALE
                </span>
              )}
            </div>

            {/* THUMBNAILS */}
            {images.length > 0 && (
              <div className="mb-6 flex w-full flex-wrap justify-center gap-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`h-20 w-16 overflow-hidden rounded border-2 p-1 ${
                      selectedImage === index
                        ? "border-[#c92127]"
                        : "border-gray-200 hover:border-[#c92127]"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      className="h-full w-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* BUTTONS */}
            {!dataUser && !dataUser?._id ? (
              <div className="w-full px-2">
                <button
                  onClick={onLogin}
                  type="button"
                  className="
        w-full
        rounded-lg
        border-2
        border-gray-300
        bg-gray-100
        px-6
        py-3
        text-sm
        font-semibold
        text-gray-600
        shadow-sm
        transition-all
        duration-200
        hover:border-[#c92127]
        hover:bg-red-50
        hover:text-[#c92127]
        active:scale-[0.98]
      "
                >
                  Vui lòng đăng nhập để mua hàng
                </button>
              </div>
            ) : (
              <div className="flex w-full gap-4 px-2">
                <button
                  disabled={stock <= 0}
                  className="
                  flex flex-1
                  items-center
                  justify-center
                  gap-2
                  rounded
                  border-2
                  border-[#c92127]
                  py-3
                  font-bold
                  text-[#c92127]
                  transition
                  hover:bg-red-50
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
                >
                  <ShoppingCart size={20} />
                  Thêm vào giỏ
                </button>

                <button
                  disabled={stock <= 0}
                  className="
                  flex-1
                  rounded
                  bg-[#c92127]
                  py-3
                  font-bold
                  text-white
                  transition
                  hover:bg-red-700
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
                >
                  Mua ngay
                </button>
              </div>
            )}

            {/* POLICY */}
            <div className="mt-6 w-full px-2 text-sm text-gray-700">
              <p className="mb-3 font-bold">
                Chính sách ưu đãi của Bookstore.com
              </p>

              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <Truck size={20} className="flex-shrink-0 text-green-600" />

                  <span>
                    <b>Thời gian giao hàng:</b> Giao nhanh và uy tín
                  </span>
                </li>

                <li className="flex items-start gap-2">
                  <RotateCcw
                    size={20}
                    className="flex-shrink-0 text-blue-500"
                  />

                  <span>
                    <b>Chính sách đổi trả:</b> Đổi trả miễn phí toàn quốc
                  </span>
                </li>

                <li className="flex items-start gap-2">
                  <Gift size={20} className="flex-shrink-0 text-orange-500" />

                  <span>
                    <b>Chính sách khách sỉ:</b> Ưu đãi khi mua số lượng lớn
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* ==============================
              RIGHT - PRODUCT INFO
          ============================== */}

          <div className="w-full md:w-7/12">
            {/* PRODUCT NAME */}
            <h1 className="mb-3 text-2xl font-normal leading-tight text-[#333]">
              {name}
            </h1>

            {/* BASIC INFO */}
            <div className="mb-4 grid grid-cols-1 gap-y-2 text-sm text-gray-700 sm:grid-cols-2">
              <div>
                Tác giả:{" "}
                <span className="font-bold">
                  {metadata?.author || "Đang cập nhật"}
                </span>
              </div>

              <div>
                Nhà xuất bản:{" "}
                <span className="font-bold">
                  {metadata?.publishingHouse || "Đang cập nhật"}
                </span>
              </div>

              <div>
                Nhà cung cấp:{" "}
                <span className="font-bold text-blue-600">
                  {metadata?.publisher || "Đang cập nhật"}
                </span>
              </div>

              <div>
                Hình thức bìa:{" "}
                <span className="font-bold">
                  {metadata?.coverType || "Đang cập nhật"}
                </span>
              </div>
            </div>

            {/* STOCK */}
            <div className="mb-4 text-sm">
              {stock > 0 ? (
                <span className="font-medium text-green-600">
                  Còn hàng: {stock} sản phẩm
                </span>
              ) : (
                <span className="font-medium text-red-600">Hết hàng</span>
              )}
            </div>

            {/* RATING */}
            <div className="mb-4 flex items-center gap-4 text-sm text-gray-500">
              <div className="flex text-yellow-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star}>★</span>
                ))}
              </div>

              <span>(0 đánh giá)</span>
            </div>

            {/* FLASH SALE */}
            {discount > 0 && (
              <div className="mb-4 overflow-hidden rounded-md border border-red-100 bg-red-50">
                <div className="flex items-center justify-between bg-gradient-to-r from-red-600 to-red-400 px-4 py-2 text-white">
                  <div className="flex items-center gap-2 text-xl font-bold italic">
                    <Zap size={22} fill="currentColor" />
                    FLASH SALE
                  </div>

                  <span className="rounded bg-black/30 px-2 py-1 text-xs">
                    ĐANG GIẢM GIÁ
                  </span>
                </div>

                <div className="p-3">
                  <p className="text-sm text-gray-600">
                    Sản phẩm đang được giảm {discount}%
                  </p>
                </div>
              </div>
            )}

            {/* PRICE */}
            <div className="mb-2 flex items-end gap-3">
              <span className="text-3xl font-bold text-[#c92127]">
                {price.toLocaleString("vi-VN")} đ
              </span>

              {oldPrice && (
                <span className="text-lg text-gray-400 line-through">
                  {oldPrice.toLocaleString("vi-VN")} đ
                </span>
              )}

              {discount > 0 && (
                <span className="rounded bg-[#c92127] px-2 py-1 text-xs font-bold text-white">
                  -{discount}%
                </span>
              )}
            </div>

            <p className="mb-6 cursor-pointer text-sm italic text-blue-600 hover:underline">
              Chính sách khuyến mãi trên chỉ áp dụng tại Bookstore.com &gt;
            </p>

            {/* SHIPPING */}
            <div className="mb-6 rounded-md border border-gray-200 p-4">
              <h3 className="mb-3 border-b pb-2 text-base font-bold">
                Thông tin vận chuyển
              </h3>

              <div className="mb-3 text-sm">
                Giao hàng đến <span className="font-bold">Địa chỉ của bạn</span>
                <button className="ml-2 text-blue-500 hover:underline">
                  Thay đổi
                </button>
              </div>

              <div className="flex items-start gap-3">
                <Truck
                  size={24}
                  className="mt-0.5 flex-shrink-0 text-green-600"
                />

                <div>
                  <p className="text-sm font-bold">Giao hàng tiêu chuẩn</p>

                  <p className="text-sm text-gray-500">
                    Dự kiến giao{" "}
                    <span className="font-bold text-gray-700">2 - 5 ngày</span>
                  </p>
                </div>
              </div>
            </div>

            {/* PROMOTION */}
            <div className="mb-6 border-b border-gray-100 pb-6">
              <div className="mb-3 flex items-center gap-2 text-sm">
                <span className="font-bold">Ưu đãi liên quan</span>

                <span className="cursor-pointer text-blue-500 hover:underline">
                  Xem thêm &gt;
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="rounded border border-blue-200 bg-blue-50 px-2 py-1 text-xs text-blue-700">
                  🎟 Giảm ngay 100k
                </span>

                <span className="rounded border border-blue-200 bg-blue-50 px-2 py-1 text-xs text-blue-700">
                  🎟 Giảm ngay 50k
                </span>

                <span className="rounded border border-pink-200 bg-pink-50 px-2 py-1 text-xs text-pink-700">
                  🎁 Hộp quà tặng
                </span>
              </div>
            </div>

            {/* QUANTITY */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold">Số lượng:</span>

              <div className="flex h-9 w-28 overflow-hidden rounded border border-gray-300">
                <button
                  onClick={decreaseQuantity}
                  disabled={stock <= 0}
                  className="flex flex-1 items-center justify-center bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                >
                  <Minus size={16} />
                </button>

                <input
                  type="text"
                  value={quantity}
                  readOnly
                  className="w-12 border-none p-0 text-center text-sm focus:ring-0"
                />

                <button
                  onClick={increaseQuantity}
                  disabled={stock <= 0 || quantity >= stock}
                  className="flex flex-1 items-center justify-center bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ==============================
            THÔNG TIN CHI TIẾT
        ============================== */}

        <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold">Thông tin chi tiết</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-gray-100">
                  <th className="w-[200px] py-3 text-left font-normal text-gray-500">
                    Mã sản phẩm
                  </th>

                  <td className="py-3">{product?._id}</td>
                </tr>

                <tr className="border-b border-gray-100">
                  <th className="py-3 text-left font-normal text-gray-500">
                    Tên sản phẩm
                  </th>

                  <td className="py-3">{name}</td>
                </tr>

                <tr className="border-b border-gray-100">
                  <th className="py-3 text-left font-normal text-gray-500">
                    Nhà xuất bản
                  </th>

                  <td className="py-3">
                    {metadata?.publishingHouse || "Đang cập nhật"}
                  </td>
                </tr>

                <tr className="border-b border-gray-100">
                  <th className="py-3 text-left font-normal text-gray-500">
                    Tác giả
                  </th>

                  <td className="py-3">
                    {metadata?.author || "Đang cập nhật"}
                  </td>
                </tr>

                <tr className="border-b border-gray-100">
                  <th className="py-3 text-left font-normal text-gray-500">
                    Hình thức bìa
                  </th>

                  <td className="py-3">
                    {metadata?.coverType || "Đang cập nhật"}
                  </td>
                </tr>

                <tr className="border-b border-gray-100">
                  <th className="py-3 text-left font-normal text-gray-500">
                    Tồn kho
                  </th>

                  <td className="py-3">{stock}</td>
                </tr>

                <tr>
                  <th className="py-3 text-left font-normal text-gray-500">
                    Danh mục
                  </th>

                  <td className="py-3">
                    {product?.categoryProduct?.name ||
                      product?.categoryProduct ||
                      "Đang cập nhật"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ==============================
            MÔ TẢ SẢN PHẨM
        ============================== */}

        <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold">Mô tả sản phẩm</h2>

          <div className="text-sm leading-relaxed text-gray-700">
            <p className="mb-3 font-bold">{name}</p>

            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{
                __html: description || "Chưa có mô tả sản phẩm.",
              }}
            />
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer>
        <Footer />
      </footer>
    </div>
  );
}

export default DetailProduct;
