import SlickSlider from "react-slick";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Slider = SlickSlider.default ?? SlickSlider;

// =============================
// Previous Button
// =============================
function PrevArrow({ onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label="Previous slide"
      className="
        absolute
        left-[38px]
        top-1/2
        -translate-y-1/2
        z-30

        w-[56px]
        h-[56px]

        flex
        items-center
        justify-center

        rounded-[12px]

        border
        border-gray-300

        bg-white/90

        text-black

        opacity-0
        group-hover:opacity-100

        transition-all
        duration-300

        hover:bg-black
        hover:text-white
        hover:border-black

        active:scale-95
      "
    >
      <ChevronLeft size={24} strokeWidth={1.8} />
    </button>
  );
}

// =============================
// Next Button
// =============================
function NextArrow({ onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label="Next slide"
      className="
        absolute
        right-[38px]
        top-1/2
        -translate-y-1/2
        z-30

        w-[56px]
        h-[56px]

        flex
        items-center
        justify-center

        rounded-[12px]

        border
        border-gray-300

        bg-white/90

        text-black

        opacity-0
        group-hover:opacity-100

        transition-all
        duration-300

        hover:bg-black
        hover:text-white
        hover:border-black

        active:scale-95
      "
    >
      <ChevronRight size={24} strokeWidth={1.8} />
    </button>
  );
}

function Banner() {
  const slides = [
    {
      badge: "Tuyển chọn",

      title: (
        <>
          Cổ Điển
          <br />
          <span className="italic font-normal">Vượt Thời Gian</span>
        </>
      ),

      description:
        "Những kiệt tác văn học trường tồn cùng năm tháng, chứa đựng những giá trị nhân văn sâu sắc. Dành riêng cho những tâm hồn hoài niệm và yêu cái đẹp.",

      button: "Xem bộ sưu tập",

      image:
        "https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2000&auto=format&fit=crop",
    },

    {
      badge: "Tuyển chọn",

      title: (
        <>
          Mùa Hè
          <br />
          <span className="italic font-normal">Rực Rỡ</span>
        </>
      ),

      description:
        "Khám phá những vùng đất mới và những cuộc phiêu lưu đầy nắng gió qua từng trang sách. The Modern Sanctuary mang đến một mùa hè rực rỡ sắc màu văn chương.",

      button: "Khám phá ngay",

      image:
        "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=2000&auto=format&fit=crop",
    },

    {
      badge: "Tuyển chọn",

      title: (
        <>
          Những
          <br />
          <span className="italic font-normal">Trang Sách</span>
        </>
      ),

      description:
        "Đắm mình trong những câu chuyện đầy cảm hứng và khám phá những thế giới mới qua từng trang sách.",

      button: "Khám phá ngay",

      image:
        "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?q=80&w=2000&auto=format&fit=crop",
    },
  ];

  const settings = {
    dots: true,

    infinite: true,

    speed: 700,

    slidesToShow: 1,

    slidesToScroll: 1,

    autoplay: true,

    autoplaySpeed: 5000,

    pauseOnHover: true,

    arrows: true,

    prevArrow: <PrevArrow />,

    nextArrow: <NextArrow />,

    appendDots: (dots) => (
      <div className="absolute bottom-[36px] left-0 right-0 z-30">
        <ul className="flex justify-center items-center gap-[10px] m-0 p-0">
          {dots}
        </ul>
      </div>
    ),

    customPaging: () => (
      <button
        className="
          block
          w-[8px]
          h-[8px]

          rounded-full

          bg-gray-400

          transition-all
          duration-300

          [&.slick-active]:bg-black
        "
      />
    ),
  };

  return (
    <section className="w-full overflow-hidden">
      <div className="group relative">
        <Slider {...settings}>
          {slides.map((slide, index) => (
            <div key={index}>
              {/* =============================
                  BANNER
              ============================= */}

              <div
                className="
                  relative
                  w-full

                  h-[700px]

                  overflow-hidden

                  bg-white
                "
              >
                {/* =============================
                    BACKGROUND IMAGE
                ============================= */}

                <div
                  className="
                    absolute
                    inset-0

                    bg-cover
                    bg-center

                    scale-[1.02]

                    transition-transform
                    duration-700
                  "
                  style={{
                    backgroundImage: `url("${slide.image}")`,
                  }}
                />

                {/* =============================
                    WHITE OVERLAY
                ============================= */}

                <div
                  className="
                    absolute
                    inset-0

                    bg-white/55
                  "
                />

                {/* =============================
                    LEFT WHITE GRADIENT
                ============================= */}

                <div
                  className="
                    absolute
                    inset-0

                    bg-gradient-to-r

                    from-white
                    from-[0%]

                    via-white/95
                    via-[32%]

                    via-white/55
                    via-[55%]

                    to-transparent
                    to-[85%]
                  "
                />

                {/* =============================
                    CONTENT
                ============================= */}

                <div
                  className="
                    relative
                    z-10

                    h-full

                    flex
                    items-center
                  "
                >
                  {/* Container */}
                  <div
                    className="
                      w-full
                      max-w-[1415px]

                      mx-auto

                      px-6
                    "
                  >
                    <div className="w-[600px]">
                      {/* =============================
                          BADGE
                      ============================= */}

                      <div
                        className="
                          inline-flex
                          items-center

                          px-[18px]
                          py-[8px]

                          rounded-full

                          bg-[#fff7ed]

                          mb-[46px]
                        "
                      >
                        <span
                          className="
                            text-[11px]

                            font-semibold

                            tracking-[0.14em]

                            uppercase

                            text-[#a85b18]
                          "
                        >
                          {slide.badge}
                        </span>
                      </div>

                      {/* =============================
                          TITLE
                      ============================= */}

                      <h1
                        className="
                          font-serif

                          text-[58px]

                          leading-[1.02]

                          tracking-[-0.03em]

                          text-black

                          mb-[42px]
                        "
                      >
                        {slide.title}
                      </h1>

                      {/* =============================
                          DESCRIPTION
                      ============================= */}

                      <p
                        className="
                          w-[600px]

                          text-[17px]

                          leading-[1.65]

                          text-gray-700

                          mb-[52px]
                        "
                      >
                        {slide.description}
                      </p>

                      {/* =============================
                          BUTTON
                      ============================= */}

                      <button
                        className="
                          min-w-[207px]

                          h-[67px]

                          px-[32px]

                          bg-black

                          text-white

                          text-[14px]

                          font-semibold

                          hover:bg-gray-800

                          transition-all
                          duration-300

                          active:scale-[0.98]
                        "
                      >
                        {slide.button}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
}

export default Banner;
