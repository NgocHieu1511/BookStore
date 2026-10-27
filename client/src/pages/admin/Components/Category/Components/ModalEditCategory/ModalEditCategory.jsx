import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';

import { useState, useEffect } from 'react';
import { updateCategory } from '../../../../../../config/categoryRequest';
import { toast } from 'react-toastify';

function ModalEditCategory({
    open,
    setOpen,
    dataOneCategory,
}) {
    // State lưu tên danh mục
    const [valueCategory, setValueCategory] = useState('');

    // State lưu ảnh mới được chọn
    const [imageCategory, setImageCategory] = useState(null);

    // State lưu đường dẫn ảnh hiện tại
    const [oldImageCategory, setOldImageCategory] = useState('');

    // Cập nhật dữ liệu khi mở modal sửa danh mục
    useEffect(() => {
        if (open && dataOneCategory) {
            setValueCategory(dataOneCategory.nameCategory || '');
            setOldImageCategory(dataOneCategory.imageCategory || '');
            setImageCategory(null);
        }
    }, [open, dataOneCategory]);

    // Đóng modal
    const handleClose = () => {
        setOpen(false);
    };

    // Xử lý sửa danh mục
    const handleEditCategory = async () => {
        if (!valueCategory.trim()) {
            toast.error('Vui lòng nhập tên danh mục!');
            return;
        }

        try {
            // Tạo FormData để gửi tên và ảnh
            const formData = new FormData();

            formData.append('nameCategory', valueCategory.trim());

            // Gửi ID danh mục
            formData.append(
                'id',
                dataOneCategory._id || dataOneCategory.id
            );

            // Chỉ gửi ảnh khi người dùng chọn ảnh mới
            if (imageCategory) {
                formData.append('imageCategory', imageCategory);
            }

            // Gọi API cập nhật danh mục
            const res = await updateCategory(formData);

            toast.success(
                res.data?.message || 'Sửa danh mục thành công!'
            );

            setImageCategory(null);
            handleClose();
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                'Sửa danh mục thất bại!'
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
                    absolute left-1/2 top-1/2
                    w-[400px] max-w-[calc(100%-32px)]
                    -translate-x-1/2 -translate-y-1/2
                    rounded-xl bg-white p-6
                    shadow-2xl outline-none
                    max-h-[90vh] overflow-y-auto
                "
            >
                <Typography
                    id="modal-modal-title"
                    variant="h6"
                    component="h2"
                    className="font-bold text-gray-800"
                >
                    Sửa danh mục: {valueCategory}
                </Typography>

                <div
                    id="modal-modal-description"
                    className="mt-4 flex flex-col gap-4"
                >
                    {/* Nhập tên danh mục */}
                    <TextField
                        fullWidth
                        label="Tên danh mục"
                        variant="outlined"
                        value={valueCategory}
                        onChange={(e) =>
                            setValueCategory(e.target.value)
                        }
                    />

                    {/* Hiển thị ảnh hiện tại hoặc ảnh mới */}
                    <div>
                        <Typography
                            variant="subtitle2"
                            className="mb-2"
                        >
                            Ảnh danh mục
                        </Typography>

                        {(imageCategory || oldImageCategory) && (
                            <img
                                src={
                                    imageCategory
                                        ? URL.createObjectURL(imageCategory)
                                        : oldImageCategory
                                }
                                alt="Ảnh danh mục"
                                className="
                                    mb-3 h-32 w-32
                                    rounded-lg border
                                    object-cover
                                "
                            />
                        )}

                        {/* Chọn ảnh mới */}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                setImageCategory(
                                    e.target.files?.[0] || null
                                );
                            }}
                            className="
                                block w-full rounded-lg
                                border border-gray-300 p-2
                                text-sm
                            "
                        />

                        <Typography
                            variant="caption"
                            className="mt-1 block text-gray-500"
                        >
                            Không chọn ảnh mới nếu muốn giữ ảnh hiện tại.
                        </Typography>
                    </div>

                    {/* Các nút chức năng */}
                    <div className="flex gap-3">
                        <Button
                            onClick={handleClose}
                            fullWidth
                            variant="outlined"
                            color="inherit"
                        >
                            Hủy
                        </Button>

                        <Button
                            onClick={handleEditCategory}
                            fullWidth
                            variant="contained"
                        >
                            Lưu thay đổi
                        </Button>
                    </div>
                </div>
            </Box>
        </Modal>
    );
}

export default ModalEditCategory;