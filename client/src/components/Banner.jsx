import SlickSlider from "react-slick";
import { ChevronLeft, ChevronRight } from "lucide-react";
import mainBanner1 from "../assets/img/mainBanner1.png";
import mainBanner2 from "../assets/img/mainBanner2.png";
import mainBanner3 from "../assets/img/mainBanner3.png";
import extraBanner1 from "../assets/img/extraBanner1.png";
import extraBanner2 from "../assets/img/extraBanner2.png";

const Slider = SlickSlider.default ?? SlickSlider;

// ========================================
// Previous Arrow
// ========================================
function PrevArrow({ onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label="Previous slide"
      className="
        absolute
        left-4
        top-1/2
        -translate-y-1/2
        z-20

        w-10
        h-10

        flex
        items-center
        justify-center

        rounded-full

        bg-white/85
        text-gray-800

        shadow-md

        transition-all
        duration-200

        hover:bg-white
        hover:scale-105

        active:scale-95
      "
    >
      <ChevronLeft size={22} strokeWidth={2} />
    </button>
  );
}

// ========================================
// Next Arrow
// ========================================
function NextArrow({ onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label="Next slide"
      className="
        absolute
        right-4
        top-1/2
        -translate-y-1/2
        z-20

        w-10
        h-10

        flex
        items-center
        justify-center

        rounded-full

        bg-white/85
        text-gray-800

        shadow-md

        transition-all
        duration-200

        hover:bg-white
        hover:scale-105

        active:scale-95
      "
    >
      <ChevronRight size={22} strokeWidth={2} />
    </button>
  );
}

// ========================================
// Banner
// ========================================
function Banner() {
  // ========================================
  // ẢNH SAU NÀY BẠN CHỈ CẦN THAY URL
  // ========================================
  const slides = [
    {
      image: mainBanner1,
      alt: "Banner 1",
    },
    {
      image: mainBanner2,
      alt: "Banner 2",
    },
    {
      image: mainBanner3,
      alt: "Banner 3",
    },
  ];

  // ========================================
  // Banner phụ bên phải
  // ========================================
  const subBanners = [
    {
      image: extraBanner1,
      alt: "Banner phụ 1",
    },
    {
      image: extraBanner2,
      alt: "Banner phụ 2",
    },
  ];

  const settings = {
    dots: true,

    infinite: true,

    speed: 500,

    slidesToShow: 1,

    slidesToScroll: 1,

    autoplay: true,

    autoplaySpeed: 4000,

    pauseOnHover: true,

    arrows: true,

    prevArrow: <PrevArrow />,

    nextArrow: <NextArrow />,

    appendDots: (dots) => (
      <div
        className="
          absolute
          bottom-4
          left-0
          right-0
          z-20
        "
      >
        <ul
          className="
            flex
            justify-center
            items-center
            gap-2
            m-0
            p-0
          "
        >
          {dots}
        </ul>
      </div>
    ),

    customPaging: () => (
      <button
        className="
          w-[10px]
          h-[10px]

          rounded-full

          bg-white/70

          transition-all
          duration-200

          [&.slick-active]:bg-[#c92127]
          [&.slick-active]:scale-110
        "
      />
    ),
  };

  return (
    <section className="w-full">
      <div
        className="
          w-full
          max-w-[1230px]
          mx-auto

          px-3
          md:px-0
        "
      >
        {/* ========================================
            HERO GRID
        ======================================== */}
        <div
          className="
            grid
            grid-cols-1
            md:grid-cols-12

            gap-4
          "
        >
          {/* ========================================
              MAIN BANNER
          ======================================== */}
          <section
            className="
              md:col-span-8

              relative

              h-[300px]
              md:h-[400px]

              overflow-hidden

              rounded-xl

              bg-white

              shadow-sm
            "
          >
            <Slider {...settings}>
              {slides.map((slide, index) => (
                <div key={index}>
                  <div
                    className="
                      relative

                      w-full
                      h-[300px]
                      md:h-[400px]

                      overflow-hidden

                      bg-gray-100
                    "
                  >
                    {slide.image ? (
                      <img
                        src={slide.image}
                        alt={slide.alt}
                        className="
                          w-full
                          h-full

                          object-cover
                        "
                      />
                    ) : (
                      /* ====================================
                         PLACEHOLDER KHI CHƯA CÓ ẢNH
                      ==================================== */
                      <div
                        className="
                          w-full
                          h-full

                          flex
                          items-center
                          justify-center

                          bg-gradient-to-r
                          from-gray-100
                          to-gray-200
                        "
                      >
                        <div className="text-center">
                          <div
                            className="
                              text-[#c92127]
                              text-[28px]
                              md:text-[40px]
                              font-black
                              italic
                            "
                          >
                            BOOKSTORE.COM
                          </div>

                          <p
                            className="
                              mt-2
                              text-gray-500
                              text-sm
                              md:text-base
                            "
                          >
                            Banner chính
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </Slider>
          </section>

          {/* ========================================
              SUB BANNERS
          ======================================== */}
          <section
            className="
              md:col-span-4

              flex
              flex-col

              gap-4
            "
          >
            {subBanners.map((banner, index) => (
              <a
                href="#"
                key={index}
                className="
                  block

                  w-full

                  h-[142px]
                  md:h-[192px]

                  overflow-hidden

                  rounded-xl

                  bg-white

                  shadow-sm

                  transition-all
                  duration-300

                  hover:shadow-md
                  hover:-translate-y-[1px]
                "
              >
                {banner.image ? (
                  <img
                    src={banner.image}
                    alt={banner.alt}
                    className="
                      w-full
                      h-full

                      object-cover

                      transition-transform
                      duration-500

                      hover:scale-[1.02]
                    "
                  />
                ) : (
                  <div
                    className="
                      w-full
                      h-full

                      flex
                      items-center
                      justify-center

                      bg-gray-100
                    "
                  >
                    <div className="text-center">
                      <div
                        className="
                          text-[#c92127]
                          text-[20px]
                          md:text-[26px]
                          font-black
                          italic
                        "
                      >
                        BOOKSTORE.COM
                      </div>

                      <p
                        className="
                          mt-1
                          text-gray-500
                          text-xs
                        "
                      >
                        Banner phụ {index + 1}
                      </p>
                    </div>
                  </div>
                )}
              </a>
            ))}
          </section>
        </div>
      </div>
    </section>
  );
}

export default Banner;
