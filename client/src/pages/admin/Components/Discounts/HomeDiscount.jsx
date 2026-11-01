
    import { useEffect, useState } from 'react';

    import Table from '@mui/material/Table';
    import TableBody from '@mui/material/TableBody';
    import TableCell from '@mui/material/TableCell';
    import TableContainer from '@mui/material/TableContainer';
    import TableHead from '@mui/material/TableHead';
    import TableRow from '@mui/material/TableRow';
    import Paper from '@mui/material/Paper';
    import Button from '@mui/material/Button';

    import { ToastContainer, toast } from 'react-toastify';

    import { listCoupon } from '../../../../config/couponRequest';

    import AddDisCount from './AddDiscount/AddDiscount';
    import ModalDelete from './ModalDeleteDiscount/Modal';

    function HomeDiscount() {
        const [dataDiscount, setDataDiscount] = useState([]);
        const [open, setOpen] = useState(false);

        const [openDelete, setOpenDelete] = useState(false);
        const [dataOneDiscount, setDataOneDiscount] = useState({});

        // Lấy danh sách mã giảm giá
        // Lấy danh sách mã giảm giá
    const fetchData = async () => {
        try {
            const res = await listCoupon();

            console.log('Danh sách mã giảm giá:', res);
            console.log('Metadata:', res?.metadata);

            // API trả về mảng mã giảm giá trong metadata
            const coupons = Array.isArray(res?.metadata)
                ? res.metadata
                : Array.isArray(res?.data)
                ? res.data
                : Array.isArray(res)
                    ? res
                    : [];

            setDataDiscount(coupons);
        } catch (error) {
            console.error('Lỗi lấy danh sách mã giảm giá:', error);

            toast.error(
                error.response?.data?.message ||
                    'Không thể tải danh sách mã giảm giá!',
            );
        }
    };

        // Tải dữ liệu khi mở trang
        useEffect(() => {
            document.title = 'Quản lý mã giảm giá';
            fetchData();
        }, []);

        // Chuyển dữ liệu API thành dữ liệu hiển thị trong bảng
        const rows = dataDiscount.map((item) => ({
            id: item._id, 
            nameCoupon: item.nameCoupon,
            discount: item.discount,
            quantity: item.quantity,
            startDate: item.startDate,
            endDate: item.endDate,
            minPrice: item.minPrice,
        }));

        // Chuyển ngày tháng sang định dạng Việt Nam
        const convertToVietnamDate = (dateString) => {
            if (!dateString) return '';

            const date = new Date(dateString);

            if (Number.isNaN(date.getTime())) {
                return 'Ngày không hợp lệ';
            }

            return date.toLocaleDateString('vi-VN', {
                timeZone: 'Asia/Ho_Chi_Minh',
            });
        };

        // Định dạng tiền Việt Nam
        const formatCurrency = (amount) => {
            return new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
            }).format(amount ?? 0);
        };

        // Chọn mã giảm giá để xóa
        const handleOpenDelete = (row) => {
            setDataOneDiscount(row);
            setOpenDelete(true);
        };

        return (
            <div className="min-h-screen bg-gray-50 p-4 md:p-6">
                <ToastContainer position="top-right" autoClose={3000} />

                {/* Tiêu đề và nút thêm mã giảm giá */}
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="text-xl font-bold text-gray-800 md:text-2xl">
                        Quản lý mã giảm giá
                    </h1>

                    <Button
                        variant="contained"
                        onClick={() => setOpen((prev) => !prev)}
                        sx={{ textTransform: 'none' }}
                    >
                        {open ? 'Quay lại' : 'Thêm mã giảm giá'}
                    </Button>
                </div>

                {/* Bảng danh sách hoặc form thêm mã */}
                {open ? (
                    <div className="rounded-xl bg-white p-4 shadow-sm">
                        <AddDisCount />
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                        <TableContainer component={Paper} elevation={0}>
                            <Table
                                sx={{ minWidth: 900 }}
                                aria-label="Bảng quản lý mã giảm giá"
                            >
                                <TableHead>
                                    <TableRow className="bg-gray-100">
                                        <TableCell>
                                            <span className="font-semibold text-gray-700">
                                                Tên mã giảm giá
                                            </span>
                                        </TableCell>

                                        <TableCell align="center">
                                            <span className="font-semibold text-gray-700">
                                                Phần trăm giảm
                                            </span>
                                        </TableCell>

                                        <TableCell align="center">
                                            <span className="font-semibold text-gray-700">
                                                Số lượng
                                            </span>
                                        </TableCell>

                                        <TableCell align="center">
                                            <span className="font-semibold text-gray-700">
                                                Ngày bắt đầu
                                            </span>
                                        </TableCell>

                                        <TableCell align="center">
                                            <span className="font-semibold text-gray-700">
                                                Ngày kết thúc
                                            </span>
                                        </TableCell>

                                        <TableCell align="center">
                                            <span className="font-semibold text-gray-700">
                                                Đơn tối thiểu
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
                                    {rows.length > 0 ? (
                                        rows.map((row) => (
                                            <TableRow
                                                key={row.id}
                                                hover
                                                sx={{
                                                    '&:last-child td, &:last-child th': {
                                                        border: 0,
                                                    },
                                                }}
                                            >
                                                <TableCell
                                                    component="th"
                                                    scope="row"
                                                >
                                                    <span className="font-medium text-gray-800">
                                                        {row.nameCoupon}
                                                    </span>
                                                </TableCell>

                                                <TableCell align="center">
                                                    {row.discount}%
                                                </TableCell>

                                                <TableCell align="center">
                                                    {row.quantity}
                                                </TableCell>

                                                <TableCell align="center">
                                                    {convertToVietnamDate(
                                                        row.startDate,
                                                    )}
                                                </TableCell>

                                                <TableCell align="center">
                                                    {convertToVietnamDate(
                                                        row.endDate,
                                                    )}
                                                </TableCell>

                                                <TableCell align="center">
                                                    {formatCurrency(row.minPrice)}
                                                </TableCell>

                                                <TableCell align="center">
                                                    <Button
                                                        color="error"
                                                        variant="contained"
                                                        size="small"
                                                        onClick={() =>
                                                            handleOpenDelete(row)
                                                        }
                                                        sx={{
                                                            textTransform: 'none',
                                                        }}
                                                    >
                                                        Xóa
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell
                                                colSpan={7}
                                                align="center"
                                                sx={{ py: 5 }}
                                            >
                                                <span className="text-gray-500">
                                                    Chưa có mã giảm giá nào
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </div>
                )}

                {/* Modal xác nhận xóa */}
                <ModalDelete
                    open={openDelete}
                    setOpen={setOpenDelete}
                    dataOneDiscount={dataOneDiscount}
                    onDeleted={fetchData}
                />
            </div>
        );
    }

    export default HomeDiscount;
