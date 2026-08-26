import { Search, ShoppingCart, UserRound } from "lucide-react";
import { useState } from "react";

function Header() {
  const [active, setActive] = useState("Fiction");

  const menus = ["Fiction", "Non-Fiction", "History", "Art"];

  return (
    <header className="w-full sticky top-0 z-50 border-b border-gray-300 bg-white shadow-sm">
      <nav className="max-w-[1280px] mx-auto h-20 px-10 flex items-center justify-between">
        {/* Logo + Menu */}
        <div className="flex items-center gap-10">
          {/* Logo */}
          <a
            href="#"
            className="font-serif text-[24px] font-bold text-black whitespace-nowrap"
          >
            The Bookstore
          </a>

          {/* Menu */}
          <div className="hidden md:flex items-center gap-8">
            {menus.map((menu) => (
              <a
                key={menu}
                href="#"
                onClick={() => setActive(menu)}
                className={`
                  text-[14px]
                  font-semibold
                  transition-colors
                  pb-1
                  ${
                    active === menu
                      ? "text-black border-b-2 border-black"
                      : "text-gray-500 hover:text-orange-600 border-b-2 border-transparent"
                  }
                `}
              >
                {menu}
              </a>
            ))}
          </div>
        </div>

        {/* Search + Cart + User */}
        <div className="flex items-center gap-6">
          {/* Search */}
          <div
            className="
              hidden
              lg:flex
              items-center
              bg-[#eff4ff]
              px-4
              py-2
              rounded-full
              border
              border-gray-300
              focus-within:border-black
              transition-all
            "
          >
            <Search size={20} strokeWidth={2} className="text-gray-600" />

            <input
              type="text"
              placeholder="Tìm kiếm tựa sách..."
              className="
                bg-transparent
                border-none
                outline-none
                focus:ring-0
                text-[14px]
                w-48
                ml-2
                text-gray-700
                placeholder:text-gray-500
              "
            />
          </div>

          {/* Cart */}
          <button
            className="
              text-black
              hover:text-orange-600
              transition-all
              active:scale-95
            "
          >
            <ShoppingCart size={24} strokeWidth={2} />
          </button>

          {/* User */}
          <button
            className="
              text-black
              hover:text-orange-600
              transition-all
              active:scale-95
            "
          >
            <UserRound size={24} strokeWidth={2} />
          </button>
        </div>
      </nav>
    </header>
  );
}

export default Header;
