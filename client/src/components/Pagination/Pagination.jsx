
import Pagination from '@mui/material/Pagination';
import { useNavigate, useLocation } from 'react-router-dom';

function PaginationPage({ totalPages }) {
    const navigate = useNavigate();
    const location = useLocation();

    // Lấy tham số page từ URL, mặc định là trang 1
    const searchParams = new URLSearchParams(location.search);
    const currentPage = parseInt(searchParams.get('page'), 10) || 1;

    // Xử lý khi người dùng chuyển trang
    const handleChange = (event, value) => {
        searchParams.set('page', value);
        navigate(`${location.pathname}?${searchParams.toString()}`);
    };

    return (
        <div className="flex w-full justify-center py-4">
            <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handleChange}
                variant="outlined"
                shape="rounded"
            />
        </div>
    );
}

export default PaginationPage;
