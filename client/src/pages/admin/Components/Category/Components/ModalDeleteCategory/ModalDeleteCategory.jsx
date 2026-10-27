
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';

import {deleteCategory} from '../../../../../../config/categoryRequest';
import { toast } from 'react-toastify';

function ModalDeleteCategory({
    open,
    setOpen,
    dataOneCategory,
}) {
    // Đóng modal
    const handleClose = () => setOpen(false);

    // Xử lý xóa danh mục
    const handleDeleteCategory = async () => {
        try {
            const res = await deleteCategory(
                dataOneCategory.id
            );

            handleClose();
            toast.success(res.message);
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                'Xóa danh mục thất bại!'
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
                className="
                    absolute
                    left-1/2
                    top-1/2
                    w-[400px]
                    max-w-[calc(100%-32px)]
                    -translate-x-1/2
                    -translate-y-1/2
                    rounded-xl
                    bg-white
                    p-6
                    shadow-2xl
                    outline-none
                "
            >
                {/* Tiêu đề modal */}
                <Typography
                    id="modal-modal-title"
                    variant="h6"
                    component="h2"
                    className="font-bold text-gray-800"
                >
                    Xóa danh mục
                </Typography>

                {/* Nội dung cảnh báo */}
                <Typography
                    id="modal-modal-description"
                    component="p"
                    className="mt-4 font-semibold text-red-600"
                >
                    Lưu ý: Khi bạn xóa danh mục, tất cả các sản phẩm
                    trong danh mục cũng sẽ bị xóa.
                </Typography>

                {/* Nút xác nhận xóa */}
                <div className="mt-5 flex justify-end gap-3">
                    <Button
                        variant="outlined"
                        color="inherit"
                        onClick={handleClose}
                    >
                        Hủy
                    </Button>

                    <Button
                        color="error"
                        variant="contained"
                        onClick={handleDeleteCategory}
                    >
                        Vẫn xóa danh mục
                    </Button>
                </div>
            </Box>
        </Modal>
    );
}

export default ModalDeleteCategory;
