
import { useEffect, useState } from 'react';
import SlideBar from './SlideBar';
import HomePage from './HomePage';

function Dashboard() {
    // Thay đổi tiêu đề trang trên trình duyệt
    useEffect(() => {
        document.title = 'Quản trị admin';
    }, []);

    // Kiểm tra và chuyển theme từ light sang dark
    useEffect(() => {
        const localStore = localStorage.getItem('theme');

        if (localStore === 'light') {
            localStorage.setItem('theme', 'dark');
            window.location.reload();
        }
    }, []);

    // Quản lý chức năng đang được chọn trên Sidebar
    const [type, setType] = useState(0);

    return (
        <div className="flex min-h-screen w-full bg-gray-100">
            {/* Sidebar bên trái */}
            <div className="w-64 shrink-0">
                <SlideBar type={type} setType={setType} />
            </div>

            {/* Nội dung chính bên phải */}
            <div className="flex-1 min-w-0 p-6">
                <HomePage type={type} />
            </div>
        </div>
    );
}

export default Dashboard;

