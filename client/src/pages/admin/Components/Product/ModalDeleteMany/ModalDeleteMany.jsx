import { useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';

import { deleteManyProducts } from '../../../../../config/productRequest';
import { toast } from 'react-toastify';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 'calc(100% - 32px)',
    maxWidth: 440,
    bgcolor: 'background.paper',
    borderRadius: '12px',
    boxShadow: 24,
    p: 4,
};

const MAX_PREVIEW = 5;

export default function ModalDeleteManyProduct({
    open,
    setOpen,
    selectedProducts = [], // [{ id, name }]
    onSuccess,
}) {
    const [loading, setLoading] = useState(false);

    const handleClose = () => {
        if (!loading) setOpen(false);
    };

    const handleDeleteMany = async () => {
        const ids = selectedProducts.map((item) => item.id);
        if (ids.length === 0) {
            toast.error('Chưa chọn sản phẩm nào.');
            return;
        }

        try {
            setLoading(true);
            const res = await deleteManyProducts(ids);
            toast.success(res?.message || 'Xóa sản phẩm thành công.');
            setOpen(false);
            onSuccess?.();
        } catch (error) {
            toast.error(
                error?.response?.data?.message ||
                    'Xóa sản phẩm thất bại. Vui lòng thử lại.',
            );
        } finally {
            setLoading(false);
        }
    };

    const preview = selectedProducts.slice(0, MAX_PREVIEW);
    const rest = selectedProducts.length - preview.length;

    return (
        <Modal open={open} onClose={handleClose}>
            <Box sx={style}>
                <Typography variant="h6" component="h2" className="font-semibold text-gray-800">
                    Xóa {selectedProducts.length} sản phẩm đã chọn
                </Typography>

                <Typography sx={{ mt: 2 }} className="text-gray-600" component="div">
                    Bạn có chắc chắn muốn xóa các sản phẩm sau?
                    <ul className="mt-2 list-disc pl-5 text-gray-900">
                        {preview.map((item) => (
                            <li key={item.id} className="font-medium">{item.name}</li>
                        ))}
                        {rest > 0 && (
                            <li className="text-gray-500">... và {rest} sản phẩm khác</li>
                        )}
                    </ul>
                </Typography>

                <Typography variant="body2" className="mt-2 text-red-600">
                    Hành động này không thể khôi phục.
                </Typography>

                <div className="mt-6 flex justify-end gap-3">
                    <Button variant="outlined" color="inherit" onClick={handleClose} disabled={loading}>
                        Hủy
                    </Button>
                    <Button variant="contained" color="error" onClick={handleDeleteMany} disabled={loading}>
                        {loading ? 'Đang xóa...' : `Xóa ${selectedProducts.length} sản phẩm`}
                    </Button>
                </div>
            </Box>
        </Modal>
    );
}