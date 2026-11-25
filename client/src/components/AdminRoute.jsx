import { Navigate } from 'react-router-dom';
import cookie from 'js-cookie';
import { useStore } from '../hooks/useStore';

function AdminRoute({ children }) {
    const { dataUser } = useStore();
    const logged = cookie.get('logged');

    // 1. Chưa đăng nhập -> về trang login
    if (!logged) {
        return <Navigate to="/login" replace />;
    }

    // 2. Đã đăng nhập nhưng Provider chưa lấy xong thông tin user -> chờ
    if (!dataUser) {
        return <div style={{ padding: 24 }}>Đang kiểm tra quyền truy cập...</div>;
    }

    // 3. Không phải admin -> đá về trang chủ (hoặc /notfound để ẩn sự tồn tại của trang admin)
    if (!dataUser.user?.isAdmin) {
        return <Navigate to="/notfound" replace />;
    }

    // 4. Là admin -> cho vào
    return children;
}

export default AdminRoute;