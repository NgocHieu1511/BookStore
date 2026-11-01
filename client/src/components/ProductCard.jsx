import { Link } from "react-router-dom";

function ProductCard({ dataItem }) {


// Phần trăm giảm giá
const discount = dataItem?.discountProduct || 0;

// Giá gốc: giá nhập từ Admin
const oldPrice = Number(dataItem?.priceProduct || 0);

// Giá khuyến mại
const salePrice =
  discount > 0
    ? Math.round(oldPrice * (1 - discount / 100))
    : oldPrice;

// Số lượng đã bán
// Số lượng đã bán
const soldQuantity = dataItem?.countBuy || 0;

// Tính % thanh tiến trình
const soldPercent = Math.min((soldQuantity / 500) * 100, 100);

  return (
    <div
      className="
        relative
        flex
        flex-col
        gap-2
        rounded-lg
        bg-white
        p-3
        shadow-sm
        transition-shadow
        duration-200
        hover:shadow-md
      "
    >
      {/* =========================
          DISCOUNT
      ========================= */}
      {discount > 0 && (
        <span
          className="
            absolute
            right-0
            top-0
            z-10
            rounded-bl-lg
            rounded-tr-lg
            bg-[#c92127]
            px-2
            py-1
            text-[13px]
            font-bold
            text-white
          "
        >
          -{discount}%
        </span>
      )}

      {/* =========================
          IMAGE
      ========================= */}
      <div
        className="
          aspect-[3/4]
          w-full
          overflow-hidden
          rounded
          bg-[#f2f4f5]
        "
      >
        <img
          src={dataItem?.imagesProduct?.[1]}
          alt={dataItem?.nameProduct || "Product"}
          className="
            h-full
            w-full
            object-cover
            transition-transform
            duration-300
            hover:scale-105
          "
        />
      </div>

      {/* =========================
          PRODUCT NAME
      ========================= */}
      <Link
        to={`/product/${dataItem?._id}`}
        className="
          mt-2
          h-10
          line-clamp-2
          text-[14px]
          font-normal
          leading-5
          text-[#191c1d]
          hover:text-[#c92127]
        "
      >
        {dataItem?.nameProduct}
      </Link>

     {/* =========================
    PRICE
========================= */}
<div className="mt-2 flex flex-col">

  {/* Giá khuyến mại */}
  <span
    className="
      text-[18px]
      font-bold
      leading-6
      text-[#c92127]
    "
  >
    {salePrice.toLocaleString("vi-VN")} đ
  </span>

  {/* Giá gốc */}
  {discount > 0 && (
    <span
      className="
        text-sm
        leading-5
        text-[#5c403d]
        line-through
      "
    >
      {oldPrice.toLocaleString("vi-VN")} đ
    </span>
  )}

</div>

      {/* =========================
          SOLD PROGRESS
      ========================= */}
      <div
        className="
          relative
          mt-2
          flex
          h-4
          w-full
          items-center
          overflow-hidden
          rounded-full
          bg-[#FFD6D6]
        "
      >
        {/* Progress */}
        <div
          className="
            absolute
            left-0
            top-0
            h-full
            rounded-full
            bg-[#c92127]
            transition-all
            duration-300
          "
          style={{
            width: `${soldPercent}%`,
          }}
        />

        {/* Text */}
        <span
          className="
            absolute
            inset-0
            flex
            items-center
            justify-center
            text-[10px]
            font-bold
            text-white
          "
        >
          Đã bán {soldQuantity}
        </span>
      </div>
    </div>
  );
}

export default ProductCard;
