


import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';

import { deleteCoupon } from '../../../../../config/couponRequest';
import { toast } from 'react-toastify';

export default function ModalDelete({
    open,
    setOpen,
    dataOneDiscount,
    onDeleted
}) {
    // Đóng modal
    const handleClose = () => {
        setOpen(false);
    };

    // Xóa mã giảm giá
    const handleDeleteDiscount = async () => {
        try {
            const res = await deleteCoupon(dataOneDiscount.id);

            toast.success(res.message);
            handleClose();
            onDeleted?.();   // ✅ tải lại danh sách
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                    'Xóa mã giảm giá thất bại!'
            );
        }
    };

    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box
                className="absolute left-1/2 top-1/2 w-[400px] max-w-[calc(100%-32px)] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-2xl outline-none"
            >
                {/* Tiêu đề */}
                <Typography
                    id="modal-modal-title"
                    variant="h6"
                    component="h2"
                    className="font-semibold text-gray-900"
                >
                    Xóa mã giảm giá: {dataOneDiscount.name}
                </Typography>

                {/* Nội dung xác nhận */}
                <Typography
                    id="modal-modal-description"
                    component="p"
                    className="mt-4 text-sm text-gray-600"
                >
                    Bạn có chắc chắn muốn xóa mã giảm giá này không?
                </Typography>

                {/* Các nút thao tác */}
                <div className="mt-6 flex justify-end gap-3">
                    <Button
                        variant="outlined"
                        onClick={handleClose}
                        sx={{
                            textTransform: 'none',
                            borderColor: '#d1d5db',
                            color: '#374151',
                        }}
                    >
                        Hủy
                    </Button>

                    <Button
                        color="error"
                        variant="contained"
                        onClick={handleDeleteDiscount}
                        sx={{ textTransform: 'none' }}
                    >
                        Xóa mã giảm giá
                    </Button>
                </div>
            </Box>
        </Modal>
    );
}
