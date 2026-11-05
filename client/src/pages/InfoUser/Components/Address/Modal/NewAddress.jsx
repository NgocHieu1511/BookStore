import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Stack from '@mui/material/Stack';

import { useEffect, useState } from 'react';

import useDebounce from '../../../../../hooks/useDebounce';
import {
    requestCreateAddress,
    requestSearchAddress,
} from '../../../../../config/userRequest.jsx';

import { toast } from 'react-toastify';

function NewAddress({ open, setOpen, onSuccess  }) {
    const [address, setAddress] = useState([]);
    const [valueSearchAddress, setValueSearchAddress] = useState('');

    const valueSearch = useDebounce(valueSearchAddress, 800);

    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');

    // Đóng modal
    const handleClose = () => {
        setOpen(false);
    };

    // Tìm kiếm địa chỉ sau khi người dùng ngừng gõ
    useEffect(() => {
        // Chỉ tìm khi có từ 3 ký tự trở lên
        if (!valueSearch || valueSearch.trim().length < 3) {
            setAddress([]);
            return;
        }

        let ignore = false; // bỏ qua kết quả của request cũ

        const fetchData = async () => {
            try {
                const res = await requestSearchAddress(valueSearch);

                // Lấy đúng mảng từ response (tuỳ axiosClient đã unwrap hay chưa)
                const list = res?.metadata ?? res?.data?.metadata ?? res;

                if (!ignore) {
                    setAddress(Array.isArray(list) ? list : []);
                }
            } catch (error) {
                console.error('Lỗi tìm kiếm địa chỉ:', error);
                if (!ignore) setAddress([]);
            }
        };

        fetchData();

        return () => {
            ignore = true;
        };
    }, [valueSearch]);

    // Tạo địa chỉ mới
    const handleCreateAddress = async () => {
        const name = fullName.trim();
        const phoneNumber = phone.trim();
        const addressValue = valueSearchAddress.trim();

        // Kiểm tra dữ liệu
        if (!name || !phoneNumber || !addressValue) {
            toast.error('Vui lòng nhập đầy đủ thông tin!');
            return;
        }

        try {
            const data = {
                fullName: name,
                phone: phoneNumber,
                address: addressValue,
            };

            const res = await requestCreateAddress(data);
            // Báo cho component cha cập nhật danh sách
// res.metadata chính là mảng địa chỉ mới từ backend
onSuccess?.(res.metadata);

            toast.success(res.message);

            // Đóng modal
            handleClose();

            // Reset dữ liệu
            setFullName('');
            setPhone('');
            setValueSearchAddress('');
            setAddress([]);
        } catch (error) {
            toast.error(
                error.response?.data?.message || 'Thêm địa chỉ thất bại!'
            );
        }
    };

    return (
        <div className="w-full">
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box
                    className="
                        absolute left-1/2 top-1/2
                        flex w-[calc(100%-32px)]
                        max-w-[600px]
                        -translate-x-1/2 -translate-y-1/2
                        flex-col gap-5
                        rounded-lg bg-white
                        p-5 shadow-2xl sm:p-8
                    "
                >
                    {/* Tiêu đề */}
                    <Typography
                        id="modal-modal-title"
                        variant="h6"
                        component="h2"
                        className="font-bold text-gray-800"
                    >
                        Địa chỉ mới
                    </Typography>

                    {/* Họ tên và số điện thoại */}
                    <div className="flex flex-col gap-4 sm:flex-row">
                        <TextField
                            id="fullName"
                            label="Họ và tên"
                            variant="outlined"
                            fullWidth
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                        />

                        <TextField
                            id="phone"
                            label="Số điện thoại"
                            variant="outlined"
                            fullWidth
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>

                    {/* Tìm kiếm địa chỉ */}
                    <div className="w-full">
                        <Stack spacing={2} className="w-full">
                            <Autocomplete
                                freeSolo
                                id="address-search"
                                disableClearable
                                fullWidth
                                filterOptions={(x) => x} // không lọc lại ở client, dùng kết quả từ server
                                options={(Array.isArray(address)
                                    ? address
                                    : []
                                ).map((option) => option.description)}
                                value={valueSearchAddress}
                                inputValue={valueSearchAddress}
                                onChange={(event, newValue) => {
                                    setValueSearchAddress(newValue || '');
                                }}
                                onInputChange={(event, newValue) => {
                                    setValueSearchAddress(newValue);
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        fullWidth
                                        label="Nhập địa chỉ"
                                        placeholder="Nhập địa chỉ của bạn..."
                                    />
                                )}
                            />
                        </Stack>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3">
                        <Button
                            onClick={handleClose}
                            color="error"
                            variant="contained"
                            sx={{ textTransform: 'none' }}
                        >
                            Huỷ
                        </Button>

                        <Button
                            onClick={handleCreateAddress}
                            variant="contained"
                            sx={{
                                backgroundColor: '#c92127',
                                textTransform: 'none',
                                '&:hover': { backgroundColor: '#a81c22' },
                            }}
                        >
                            Lưu
                        </Button>
                    </div>
                </Box>
            </Modal>
        </div>
    );
}

export default NewAddress;