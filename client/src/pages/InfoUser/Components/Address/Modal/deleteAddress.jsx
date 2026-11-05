import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';

import { requestDeleteAddress } from '../../../../../config/userRequest.jsx';
import { toast } from 'react-toastify';

function ModalDeleteAddress({ open, setOpen, dataAddress }) {
    // Đóng modal
    const handleClose = () => setOpen(false);

    // Xóa địa chỉ
    const handleDeleteAddress = async () => {
        try {
            const res = await requestDeleteAddress(dataAddress._id);

            toast.success(res.message);

            handleClose();

            // Tải lại trang sau khi xóa thành công
            window.location.reload();
        } catch (error) {
            toast.error(
                error.response?.data?.message || 'Xóa địa chỉ thất bại!'
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
                className="absolute left-1/2 top-1/2 w-[calc(100%-32px)] max-w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-2xl outline-none"
            >
                {/* Nội dung xác nhận */}
                <Typography
                    id="modal-modal-description"
                    component="div"
                    className="text-base text-gray-800"
                >
                    <p className="font-medium">
                        Bạn có chắc muốn xoá địa chỉ này?
                    </p>

                    <p className="mt-3 break-words text-sm font-medium text-[#ff424e]">
                        {dataAddress.address}
                    </p>
                </Typography>

                {/* Các nút hành động */}
                <div className="mt-5 flex justify-end gap-3">
                    <Button
                        onClick={handleClose}
                        variant="contained"
                        color="error"
                        sx={{
                            textTransform: 'none',
                        }}
                    >
                        Huỷ
                    </Button>

                    <Button
                        onClick={handleDeleteAddress}
                        variant="contained"
                        sx={{
                            backgroundColor: '#c92127',
                            textTransform: 'none',
                            '&:hover': {
                                backgroundColor: '#a81c22',
                            },
                        }}
                    >
                        Xoá
                    </Button>
                </div>
            </Box>
        </Modal>
    );
}

export default ModalDeleteAddress;