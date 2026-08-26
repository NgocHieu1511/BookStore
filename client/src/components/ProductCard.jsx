function ProductCard({ dataItem }) {
  const discount = dataItem?.discountProduct || 0;

  // Giá gốc
  const oldPrice =
    discount > 0
      ? Math.round(dataItem.priceProduct / (1 - discount / 100))
      : null;

  return (
    <div className="w-full bg-white">
      {/* =========================
          IMAGE
      ========================= */}
      <div className="relative h-[198px] w-full overflow-hidden rounded-[5px] bg-gray-100">
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

        {/* =========================
            DISCOUNT
        ========================= */}
        {discount > 0 && (
          <div
            className="
              absolute
              right-[8px]
              top-[8px]
              z-10
              flex
              h-[30px]
              min-w-[52px]
              items-center
              justify-center
              rounded-full
              bg-[#b65300]
              px-[8px]
              text-[14px]
              font-bold
              text-white
            "
          >
            -{discount}%
          </div>
        )}
      </div>

      {/* =========================
          PRODUCT INFO
      ========================= */}
      <div className="px-[5px] pt-[14px]">
        {/* Tên sản phẩm */}
        <h3
          className="
            line-clamp-2
            min-h-[48px]
            text-[18px]
            font-bold
            leading-[24px]
            text-[#172033]
          "
        >
          {dataItem?.nameProduct}
        </h3>

        {/* =========================
            PRICE
        ========================= */}
        <div className="mt-[4px] flex flex-wrap items-center gap-[8px]">
          {/* Giá bán */}
          <span
            className="
              text-[19px]
              font-bold
              leading-[24px]
              text-[#b65300]
            "
          >
            {Number(dataItem?.priceProduct || 0).toLocaleString("vi-VN")}đ
          </span>

          {/* Giá cũ */}
          {oldPrice && (
            <span
              className="
                text-[14px]
                leading-[20px]
                text-gray-400
                line-through
              "
            >
              {oldPrice.toLocaleString("vi-VN")}đ
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
