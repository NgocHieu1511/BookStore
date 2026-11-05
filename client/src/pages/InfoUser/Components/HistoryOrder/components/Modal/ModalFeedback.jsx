import { useState } from 'react';
import { toast } from 'react-toastify';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { Rating, TextField, Button } from '@mui/material';

import { createFeedback } from '../../../../../../config/feedbackRequest';

const MAX_IMAGES = 5;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB / ảnh
const MAX_CONTENT_LENGTH = 70;

const revokeImages = (list) =>
    list.forEach((item) => URL.revokeObjectURL(item.url));

// Props:
// - idPayment: _id của đơn hàng (payment)
// - idProduct: _id của sản phẩm cần đánh giá
// - onSuccess: gọi sau khi đánh giá thành công
function ModalFeedback({
    open,
    setOpen,
    nameProduct,
    idPayment,
    idProduct,
    onSuccess,
}) {
    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [images, setImages] = useState([]); // mỗi phần tử: { file, url }
    const [loading, setLoading] = useState(false);

    const resetForm = () => {
        revokeImages(images);
        setImages([]);
        setRating(0);
        setFeedback('');
    };

    const handleClose = () => {
        if (loading) return; // đang gửi thì không cho đóng
        resetForm();
        setOpen(false);
    };

    const handleChangeImages = (e) => {
        const picked = Array.from(e.target.files || []);
        e.target.value = ''; // để chọn lại được cùng 1 file sau khi xóa

        const valid = [];
        for (const file of picked) {
            if (!file.type.startsWith('image/')) {
                toast.warn(`"${file.name}" không phải file ảnh`);
            } else if (file.size > MAX_IMAGE_SIZE) {
                toast.warn(`"${file.name}" vượt quá 5MB`);
            } else {
                valid.push(file);
            }
        }

        const remaining = MAX_IMAGES - images.length;
        if (valid.length > remaining) {
            toast.warn(`Chỉ được chọn tối đa ${MAX_IMAGES} ảnh!`);
        }

        const added = valid
            .slice(0, remaining)
            .map((file) => ({ file, url: URL.createObjectURL(file) }));
        setImages((prev) => [...prev, ...added]);
    };

    const handleRemoveImage = (index) => {
        URL.revokeObjectURL(images[index].url);
        setImages((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (rating === 0) return toast.warn('Vui lòng chọn số sao đánh giá!');
        if (!feedback.trim())
            return toast.warn('Vui lòng nhập nội dung đánh giá!');

        const formData = new FormData();
        formData.append('paymentId', idPayment);
        formData.append('productId', idProduct);
        formData.append('rating', rating);
        formData.append('content', feedback.trim());
        // Tên field phải trùng với upload.array('imagesFeedback') ở route
        images.forEach(({ file }) => formData.append('imagesFeedback', file));

        try {
            setLoading(true);

            const res = await createFeedback(formData);
            toast.success(res?.message || 'Đánh giá sản phẩm thành công');

            onSuccess?.({ paymentId: idPayment, productId: idProduct });
            resetForm();
            setOpen(false);
        } catch (error) {
            toast.error(
                error?.response?.data?.message ||
                    'Gửi đánh giá thất bại, vui lòng thử lại!',
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal open={open} onClose={handleClose}>
            <div
                className="
                    absolute left-1/2 top-1/2
                    max-h-[90vh] w-[90%] max-w-[500px]
                    -translate-x-1/2 -translate-y-1/2 overflow-y-auto
                    rounded-xl bg-white p-6
                    text-gray-800 shadow-xl outline-none
                "
            >
                {/* Tiêu đề modal */}
                <Typography
                    variant="h6"
                    component="div"
                    className="mb-6 text-center"
                >
                    <h4 className="mb-2 text-xl font-bold">
                        Đánh giá sản phẩm
                    </h4>

                    <span className="inline-block border-b border-gray-300 pb-2 text-sm text-gray-600">
                        {nameProduct}
                    </span>
                </Typography>

                {/* Nội dung đánh giá */}
                <div className="flex flex-col gap-5">
                    {/* Đánh giá số sao */}
                    <div className="flex justify-center">
                        <Rating
                            value={rating}
                            onChange={(e, newValue) => setRating(newValue ?? 0)}
                            size="large"
                        />
                    </div>

                    {/* Nội dung nhận xét */}
                    <TextField
                        label={`Nhập nội dung đánh giá, tối đa ${MAX_CONTENT_LENGTH} ký tự`}
                        multiline
                        rows={4}
                        fullWidth
                        variant="outlined"
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        helperText={`${feedback.length}/${MAX_CONTENT_LENGTH}`}
                        slotProps={{
                            htmlInput: { maxLength: MAX_CONTENT_LENGTH },
                        }}
                    />

                    {/* Chọn ảnh */}
                    <div className="flex flex-col gap-2">
                        <Button
                            variant="outlined"
                            component="label"
                            disabled={loading || images.length >= MAX_IMAGES}
                        >
                            Thêm ảnh ({images.length}/{MAX_IMAGES})
                            <input
                                type="file"
                                hidden
                                multiple
                                accept="image/*"
                                onChange={handleChangeImages}
                            />
                        </Button>

                        {images.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {images.map((item, index) => (
                                    <div key={item.url} className="relative">
                                        <img
                                            src={item.url}
                                            alt={`preview-${index}`}
                                            className="h-16 w-16 rounded object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleRemoveImage(index)
                                            }
                                            disabled={loading}
                                            aria-label="Xoá ảnh"
                                            className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gray-700 text-xs text-white hover:bg-red-600"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Nhóm nút */}
                    <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
                        <Button
                            onClick={handleClose}
                            variant="outlined"
                            disabled={loading}
                            sx={{
                                color: '#555',
                                borderColor: '#ccc',
                            }}
                        >
                            Hủy
                        </Button>

                        <Button
                            onClick={handleSubmit}
                            variant="contained"
                            disabled={loading}
                            sx={{
                                backgroundColor: '#c92127',
                                '&:hover': {
                                    backgroundColor: '#a91b20',
                                },
                            }}
                        >
                            {loading ? 'Đang gửi...' : 'Gửi đánh giá'}
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
}

export default ModalFeedback;