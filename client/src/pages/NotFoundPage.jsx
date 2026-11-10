
import Header from '../components/Header';
import Button from '@mui/material/Button';

import imgNotFound from '../assets/img/notfound.png';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function NotFoundPage() {
    const navigate = useNavigate();

    useEffect(() => {
        document.title = 'Không tìm thấy trang yêu cầu | 404 Error';
    }, []);

    return (
        <div className="min-h-screen flex flex-col bg-white">
            {/* Header */}
            <header className="w-full">
                <Header />
            </header>

            {/* Main */}
            <main className="flex flex-1 flex-col items-center justify-center px-4 py-10">
                {/* Ảnh 404 */}
                <img
                    src={imgNotFound}
                    alt="404"
                    className="w-full max-w-[450px] h-auto object-contain"
                />

                {/* Thông báo */}
                <p className="mt-6 mb-6 text-center text-lg font-medium text-gray-700">
                    Trang bạn đang tìm kiếm không tồn tại
                </p>

                {/* Button */}
                <Button
                    onClick={() => navigate('/')}
                    variant="contained"
                    sx={{
                        textTransform: 'none',
                        padding: '10px 24px',
                        borderRadius: '8px',
                        fontWeight: 600,
                    }}
                >
                    Tiếp tục mua sắm
                </Button>
            </main>
        </div>
    );
}

export default NotFoundPage;
