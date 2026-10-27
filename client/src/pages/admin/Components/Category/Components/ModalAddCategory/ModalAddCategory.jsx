import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import { toast } from 'react-toastify';
import { useState } from 'react';
import {createCategory } from '../../../../../../config/categoryRequest';
function ModalAddCategory({ open, setOpen }) {
    //hàm thay đổi trạng thái modal
    const handleClose = () => setOpen(false);
    //state lưu dữ liệu form
    const [valueCategory, setValueCategory] = useState('');
    // Lưu file ảnh người dùng chọn
const [imageCategory, setImageCategory] = useState(null);
    // hàm thực thi khi bấm nút thêm danh mục
    const handleAddCategory = async () => {
        try {
            // Kiểm tra ảnh danh mục
       // Kiểm tra tên danh mục
        if (!valueCategory.trim()) {
            toast.error('Vui lòng nhập tên danh mục!');
            return;
        }

        // Kiểm tra ảnh danh mục
        if (!imageCategory) {
            toast.error('Vui lòng chọn ảnh danh mục!');
            return;
        }

        // Tạo FormData để gửi cả text và file
        const formData = new FormData();

        formData.append('nameCategory', valueCategory.trim());
        formData.append('imageCategory', imageCategory);
            const res = await createCategory(formData);
            toast.success(res.data?.message || 'Category added successfully!');
            setValueCategory('');
            setImageCategory(null);
            handleClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add category.');
        }
    };
    return (
        <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
    >
        <Box
            className="
                absolute left-1/2 top-1/2
                w-[400px] max-w-[calc(100%-32px)]
                -translate-x-1/2 -translate-y-1/2
                rounded-xl bg-white p-6
                shadow-2xl outline-none
            "
        >
            <Typography
                id="modal-modal-title"
                variant="h6"
                component="h2"
                className="font-bold text-gray-800"
            >
                Thêm danh mục
            </Typography>

            <div className="mt-4 flex flex-col gap-4">
                <TextField
                    fullWidth
                    label="Tên danh mục"
                    variant="outlined"
                    value={valueCategory}
                    onChange={(e) =>
                        setValueCategory(e.target.value)
                    }
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCategory();
                        }
                    }}
                />

                {/* Chọn ảnh danh mục */}
                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                        Ảnh danh mục
                    </label>

                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                            setImageCategory(
                                e.target.files?.[0] || null
                            )
                        }
                        className="w-full rounded border p-2"
                    />
                </div>

                {/* Hiển thị ảnh xem trước */}
                {imageCategory && (
                    <img
                        src={URL.createObjectURL(imageCategory)}
                        alt="Ảnh danh mục xem trước"
                        className="h-32 w-32 rounded border object-cover"
                    />
                )}

                <Button
                    onClick={handleAddCategory}
                    fullWidth
                    variant="contained"
                >
                    Thêm danh mục
                </Button>
            </div>
        </Box>
    </Modal>
    );
}
export default ModalAddCategory;