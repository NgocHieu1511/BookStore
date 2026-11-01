
import { useEffect, useState } from 'react';
import {
    Alert,
    Button,
    Chip,
    CircularProgress,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from '@mui/material';

import { requestGetAllUser } from '../../../../config/userRequest';

function ControllerUser() {
    // Danh sách người dùng
    const [dataUser, setDataUser] = useState([]);

    // Trạng thái tải dữ liệu
    const [loading, setLoading] = useState(true);

    // Lỗi khi gọi API
    const [error, setError] = useState('');

    // Lấy danh sách người dùng từ backend
    const [total, setTotal] = useState(0);

const fetchData = async () => {
    try {
        setLoading(true);
        setError('');

        const res = await requestGetAllUser({ page: 1, limit: 100 });

        const users = Array.isArray(res?.metadata?.users)
            ? res.metadata.users
            : [];

        setDataUser(users);
        setTotal(res?.metadata?.pagination?.total ?? users.length);
    } catch (err) {
        console.error('Lỗi lấy danh sách người dùng:', err);
        setError(
            err.response?.data?.message ||
                'Không thể tải danh sách người dùng.',
        );
    } finally {
        setLoading(false);
    }
};

    // Tải danh sách khi component được mở
    useEffect(() => {
        document.title = 'Quản lý người dùng';
        fetchData();
    }, []);

    // Định dạng ngày đăng ký
    const formatDate = (date) => {
        if (!date) return 'Chưa có thông tin';

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return 'Không hợp lệ';
        }

        return parsedDate.toLocaleDateString('vi-VN', {
            timeZone: 'Asia/Ho_Chi_Minh',
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            {/* Tiêu đề */}
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        Quản lý người dùng
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Danh sách tài khoản trong hệ thống BookStore
                    </p>
                </div>

                <Button
                    variant="contained"
                    onClick={fetchData}
                    disabled={loading}
                    sx={{ textTransform: 'none' }}
                >
                    Làm mới danh sách
                </Button>
            </div>

            {/* Thống kê */}
            <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <p className="text-sm text-gray-500">
                        Tổng số tài khoản
                    </p>

                    <p className="mt-2 text-2xl font-bold text-gray-800">
                        {total}
                    </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <p className="text-sm text-gray-500">
                        Số tài khoản Admin
                    </p>

                    <p className="mt-2 text-2xl font-bold text-blue-600">
                        {
                            dataUser.filter((user) => user.isAdmin)
                                .length
                        }
                    </p>
                </div>
            </div>

            {/* Bảng người dùng */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-200 px-4 py-4">
                    <h2 className="font-semibold text-gray-800">
                        Danh sách người dùng
                    </h2>
                </div>

                {error && (
                    <div className="p-4">
                        <Alert
                            severity="error"
                            action={
                                <Button
                                    color="inherit"
                                    size="small"
                                    onClick={fetchData}
                                >
                                    Thử lại
                                </Button>
                            }
                        >
                            {error}
                        </Alert>
                    </div>
                )}

                {loading ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-12">
                        <CircularProgress size={32} />

                        <p className="text-sm text-gray-500">
                            Đang tải danh sách người dùng...
                        </p>
                    </div>
                ) : (
                    <TableContainer component={Paper} elevation={0}>
                        <Table
                            sx={{ minWidth: 700 }}
                            aria-label="Danh sách người dùng"
                        >
                            <TableHead>
                                <TableRow className="bg-gray-50">
                                    <TableCell>
                                        <span className="font-semibold text-gray-700">
                                            STT
                                        </span>
                                    </TableCell>

                                    <TableCell>
                                        <span className="font-semibold text-gray-700">
                                            Họ và tên
                                        </span>
                                    </TableCell>

                                    <TableCell>
                                        <span className="font-semibold text-gray-700">
                                            Email
                                        </span>
                                    </TableCell>

                                    <TableCell align="center">
                                        <span className="font-semibold text-gray-700">
                                            Vai trò
                                        </span>
                                    </TableCell>

                                    <TableCell align="center">
                                        <span className="font-semibold text-gray-700">
                                            Ngày tạo
                                        </span>
                                    </TableCell>

                                    <TableCell align="center">
                                        <span className="font-semibold text-gray-700">
                                            Hành động
                                        </span>
                                    </TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {dataUser.length > 0 ? (
                                    dataUser.map((user, index) => (
                                        <TableRow
                                            key={user._id}
                                            hover
                                            sx={{
                                                '&:last-child td, &:last-child th':
                                                    {
                                                        border: 0,
                                                    },
                                            }}
                                        >
                                            <TableCell>
                                                {index + 1}
                                            </TableCell>

                                            <TableCell>
                                                <span className="font-medium text-gray-800">
                                                    {user.fullName ||
                                                        'Chưa cập nhật'}
                                                </span>
                                            </TableCell>

                                            <TableCell>
                                                {user.email || 'Chưa có email'}
                                            </TableCell>

                                            <TableCell align="center">
                                                <Chip
                                                    label={
                                                        user.isAdmin
                                                            ? 'Admin'
                                                            : 'Người dùng'
                                                    }
                                                    color={
                                                        user.isAdmin
                                                            ? 'primary'
                                                            : 'default'
                                                    }
                                                    size="small"
                                                />
                                            </TableCell>

                                            <TableCell align="center">
                                                {formatDate(user.createdAt)}
                                            </TableCell>

                                            <TableCell align="center">
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    color="primary"
                                                    onClick={() => {
                                                        console.log(
                                                            'ID người dùng:',
                                                            user._id,
                                                        );
                                                    }}
                                                    sx={{
                                                        textTransform: 'none',
                                                    }}
                                                >
                                                    Chi tiết
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            align="center"
                                            sx={{ py: 6 }}
                                        >
                                            <p className="text-gray-500">
                                                Chưa có người dùng nào.
                                            </p>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </div>
        </div>
    );
}

export default ControllerUser;
