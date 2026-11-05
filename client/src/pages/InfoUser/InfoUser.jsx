
import Header from '../../components/Header';

import { useEffect, useState } from 'react';

import {
    User,
    Gift,
    Heart,
    MapPin,
} from 'lucide-react';

import Personal from './Components/Personal/Personal';
import HistoryOrder from './Components/HistoryOrder/HistoryOrder';
import Address from './Components/Address/Address';
import Favorite from './Components/Favorite/Favorite';

import { useNavigate, useLocation } from 'react-router-dom';

import { useStore } from '../../hooks/useStore';

// Danh sách chức năng của trang tài khoản
const listController = [
    {
        name: 'Thông tin tài khoản',
        icon: User,
        path: 'customer',
    },
    {
        name: 'Quản lý đơn hàng',
        icon: Gift,
        path: 'order',
    },
    {
        name: 'Sản phẩm yêu thích',
        icon: Heart,
        path: 'favorite',
    },
    {
        name: 'Sổ địa chỉ',
        icon: MapPin,
        path: 'address',
    },
];

function InfoUser() {
    // Quản lý chức năng đang được chọn
    const [type, setType] = useState(0);

    // Lấy thông tin người dùng từ store
    const { dataUser } = useStore();
    console.log('dataUser', dataUser);

    // Hook điều hướng trang
    const navigate = useNavigate();

    // Lấy thông tin URL hiện tại từ React Router
    const location = useLocation();

    // Cập nhật tiêu đề và chức năng khi URL thay đổi
    useEffect(() => {
        document.title = 'Tài khoản của tôi';

        switch (location.pathname) {
            case '/customer':
                setType(0);
                break;

            case '/order':
                setType(1);
                break;

            case '/favorite':
                setType(2);
                break;

            case '/address':
                setType(3);
                break;

            default:
                break;
        }
    }, [location.pathname]);

    return (
        <div className="min-h-screen w-full bg-gray-100">

            {/* Header của website */}
            <header>
                <Header />
            </header>

            {/* Nội dung chính */}
            <main className="mx-auto flex w-full max-w-[1200px] flex-col gap-5 px-4 py-6 md:flex-row md:px-6">

                {/* Khu vực bên trái */}
                <div className="w-full md:w-[280px] md:shrink-0">

                    {/* Thông tin người dùng */}
                    <div className="flex items-center gap-4 rounded-lg bg-white p-4 text-gray-800 shadow-sm">

                        {/* Ảnh đại diện */}
                        <img
                            src={dataUser?.user?.avatar || "https://salt.tikicdn.com/desktop/img/avatar.png"}
                            alt="Ảnh đại diện người dùng"
                            className="h-14 w-14 rounded-full object-cover"
                        />

                        {/* Tên người dùng */}
                        <div className="flex min-w-0 flex-col">
                            <p className="text-sm text-gray-500">
                                Tài khoản của
                            </p>

                            <span className="truncate text-base font-semibold">
                                {dataUser?.user?.fullName}
                            </span>
                        </div>
                    </div>

                    {/* Danh sách chức năng */}
                    <div className="mt-4 rounded-lg bg-white p-2 shadow-sm">

                        <ul className="flex flex-col gap-1">

                            {listController.map((item, index) => (
                                <li
                                    key={item.path}
                                    onClick={() => {
                                        // Chuyển sang trang tương ứng
                                        navigate(`/${item.path}`);

                                        // Cập nhật chức năng đang chọn
                                        setType(index);
                                    }}
                                    className={`flex cursor-pointer items-center gap-3 rounded-md px-4 py-3 text-sm transition-colors ${
                                        type === index
                                            ? 'bg-red-50 font-semibold text-red-600'
                                            : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    {/* Icon chức năng */}
                                    <item.icon
                                        size={20}
                                        strokeWidth={1.8}
                                    />

                                    {/* Tên chức năng */}
                                    <span>{item.name}</span>
                                </li>
                            ))}

                        </ul>
                    </div>
                </div>

                {/* Khu vực bên phải */}
                <div className="min-h-[400px] w-full min-w-0 flex-1 rounded-lg bg-white p-4 text-gray-800 shadow-sm md:p-6">

                    {/* Hiển thị component tương ứng với chức năng */}
                    {type === 0 ? (
                        <Personal />
                    ) : type === 1 ? (
                        <HistoryOrder />
                    ) : type === 2 ? (
                        <Favorite />
                    ) : type === 3 ? (
                        <Address />
                    ) : (
                        <></>
                    )}
                </div>
            </main>
        </div>
    );
}

export default InfoUser;
