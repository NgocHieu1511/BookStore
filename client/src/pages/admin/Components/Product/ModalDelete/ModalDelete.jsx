
import { useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';

import { deleteProduct } from '../../../../../config/productRequest';
import { toast } from 'react-toastify';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 'calc(100% - 32px)',
    maxWidth: 400,
    bgcolor: 'background.paper',
    borderRadius: '12px',
    boxShadow: 24,
    p: 4,
};

export default function ModalDeleteProduct({
    open,
    setOpen,
    dataOneProduct,
}) {
    const [loading, setLoading] = useState(false);

    const handleClose = () => {
        if (!loading) {
            setOpen(false);
        }
    };

    const handleDeleteProduct = async () => {
        const productId =
            dataOneProduct?._id || dataOneProduct?.id;

        if (!productId) {
            toast.error('Không tìm thấy ID sản phẩm.');
            return;
        }

        try {
            setLoading(true);

            const res = await deleteProduct(productId);

            toast.success(
                res?.message || 'Xóa sản phẩm thành công.'
            );

            setOpen(false);
        } catch (error) {
            console.error('Lỗi xóa sản phẩm:', error);

            toast.error(
                error?.response?.data?.message ||
                'Xóa sản phẩm thất bại. Vui lòng thử lại.'
            );
        } finally {
            setLoading(false);
        }
    };

    const productName =
        dataOneProduct?.nameProduct ||
        dataOneProduct?.name ||
        'Sản phẩm này';

    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-delete-product-title"
            aria-describedby="modal-delete-product-description"
        >
            <Box sx={style}>
                {/* Tiêu đề */}
                <Typography
                    id="modal-delete-product-title"
                    variant="h6"
                    component="h2"
                    className="font-semibold text-gray-800"
                >
                    Xóa sản phẩm
                </Typography>

                {/* Nội dung */}
                <Typography
                    id="modal-delete-product-description"
                    sx={{ mt: 2 }}
                    className="text-gray-600"
                >
                    Bạn có chắc chắn muốn xóa sản phẩm{' '}
                    <span className="font-semibold text-gray-900">
                        "{productName}"
                    </span>
                    ?
                </Typography>

                <Typography
                    variant="body2"
                    className="mt-2 text-red-600"
                >
                    Hành động này có thể không khôi phục được.
                </Typography>

                {/* Nút thao tác */}
                <div className="mt-6 flex justify-end gap-3">
                    <Button
                        variant="outlined"
                        color="inherit"
                        onClick={handleClose}
                        disabled={loading}
                        className="normal-case"
                    >
                        Hủy
                    </Button>

                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleDeleteProduct}
                        disabled={loading}
                        className="normal-case"
                    >
                        {loading ? 'Đang xóa...' : 'Xóa sản phẩm'}
                    </Button>
                </div>
            </Box>
        </Modal>
    );
}
