
import {
  House,
  FileText,
  MessageCircle,
  ShoppingCart,
  Layers,
  Tag,
  Users,
  BookOpen,
  Percent,
} from "lucide-react";

function SlideBar({ setType, type }) {
  // Danh sách chức năng trong Sidebar
  const menuItems = [
    {
      id: 0,
      title: "Trang Chủ",
      icon: House,
    },
    {
      id: 1,
      title: "Đơn Hàng",
      icon: FileText,
    },
    {
      id: 6,
      title: "Tin Nhắn",
      icon: MessageCircle,
    },
    {
      id: 2,
      title: "Sản Phẩm",
      icon: ShoppingCart,
    },
    {
      id: 7,
      title: "Danh mục",
      icon: Layers,
    },
    {
      id: 3,
      title: "Mã Giảm Giá",
      icon: Tag,
    },
    {
      id: 8,
      title: "Giảm Giá Sản Phẩm",
      icon: Percent,
    },
    {
      id: 4,
      title: "Người Dùng",
      icon: Users,
    },
    {
      id: 5,
      title: "Bài Viết",
      icon: BookOpen,
    },
  ];

  // Xử lý khi chọn menu
  const onType = (id) => {
    setType(id);
  };

  return (
    <aside className="min-h-screen h-full w-full border-r border-gray-200 bg-white shadow-sm">
      {/* Tiêu đề */}
      <div className="border-b border-gray-200 px-6 py-6">
        <h2 className="text-xl font-bold text-gray-800">
          Admin BookStore
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Quản lý hệ thống
        </p>
      </div>

      {/* Danh sách chức năng */}
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = type === item.id;

            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onType(item.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-red-50 text-red-600"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <Icon
                    size={20}
                    strokeWidth={isActive ? 2.5 : 2}
                    className={
                      isActive
                        ? "shrink-0 text-red-600"
                        : "shrink-0 text-gray-500"
                    }
                  />

                  <span>{item.title}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}

export default SlideBar;