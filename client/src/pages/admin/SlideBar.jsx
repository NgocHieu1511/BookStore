
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import {
    faBlog,
    faCartPlus,
    faFile,
    faHome,
    faLayerGroup,
    faMessage,
    faTag,
    faUser,
} from '@fortawesome/free-solid-svg-icons';

function SlideBar({ setType, type }) {
    // Danh sách các chức năng trong Sidebar
    const menuItems = [
        {
            id: 0,
            title: 'Trang Chủ',
            icon: faHome,
        },
        {
            id: 1,
            title: 'Đơn Hàng',
            icon: faFile,
        },
        {
            id: 6,
            title: 'Tin Nhắn',
            icon: faMessage,
        },
        {
            id: 2,
            title: 'Sản Phẩm',
            icon: faCartPlus,
        },
        {
            id: 7,
            title: 'Danh mục',
            icon: faLayerGroup,
        },
        {
            id: 3,
            title: 'Mã Giảm Giá',
            icon: faTag,
        },
        {
            id: 8,
            title: 'Giảm Giá Sản Phẩm',
            icon: faTag,
        },
        {
            id: 4,
            title: 'Người Dùng',
            icon: faUser,
        },
        {
            id: 5,
            title: 'Bài Viết',
            icon: faBlog,
        },
    ];

    // Xử lý khi người dùng chọn menu
    const onType = (index) => {
        setType(index);
    };

    return (
        <div className="h-full min-h-screen w-full bg-white border-r border-gray-200 shadow-sm">
            {/* Tiêu đề Sidebar */}
            <div className="px-6 py-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800">
                    Admin BookStore
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                    Quản lý hệ thống
                </p>
            </div>

            {/* Danh sách menu */}
            <div className="p-4">
                <ul className="space-y-2">
                    {menuItems.map((item) => (
                        <li key={item.id}>
                            <button
                                type="button"
                                onClick={() => onType(item.id)}
                                className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition-all duration-200
                                    ${
                                        type === item.id
                                            ? 'bg-red-50 text-red-600'
                                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                    }`}
                            >
                                {/* Icon */}
                                <FontAwesomeIcon
                                    icon={item.icon}
                                    className={`w-5 text-center text-base ${
                                        type === item.id
                                            ? 'text-red-600'
                                            : 'text-gray-500'
                                    }`}
                                />

                                {/* Tên chức năng */}
                                <span>{item.title}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default SlideBar;

