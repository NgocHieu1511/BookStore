
import { ToastContainer, toast } from 'react-toastify';
import { Button, TextField } from '@mui/material';
import { useState } from 'react';

import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateField } from '@mui/x-date-pickers/DateField';

import { createCoupon } from '../../../../../config/couponRequest';

function AddCoupon() {
    const [nameCoupon, setNameCoupon] = useState('');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [discount, setDiscount] = useState('');
    const [quantity, setQuantity] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [loading, setLoading] = useState(false);

    // Xử lý ngày bắt đầu
    const handleDateChange = (newValue) => {
        setStartDate(
            newValue && newValue.isValid() ? newValue : null
        );
    };

    // Xử lý ngày kết thúc
    const handleDateChange1 = (newValue) => {
        setEndDate(
            newValue && newValue.isValid() ? newValue : null
        );
    };

    // Tạo mã giảm giá
    const handleAddCoupon = async () => {
        if (!nameCoupon.trim()) {
            toast.error('Vui lòng nhập tên mã giảm giá');
            return;
        }

        if (
            discount === '' ||
            !Number.isFinite(Number(discount)) ||
            Number(discount) <= 0 ||
            Number(discount) > 100
        ) {
            toast.error('Phần trăm giảm giá phải lớn hơn 0 và không quá 100');
            return;
        }

        if (
            quantity === '' ||
            !Number.isInteger(Number(quantity)) ||
            Number(quantity) <= 0
        ) {
            toast.error('Số lượng mã giảm giá phải là số nguyên lớn hơn 0');
            return;
        }

        if (
            minPrice === '' ||
            !Number.isFinite(Number(minPrice)) ||
            Number(minPrice) < 0
        ) {
            toast.error('Giá trị đơn hàng tối thiểu không hợp lệ');
            return;
        }

        if (!startDate || !endDate) {
            toast.error('Vui lòng chọn ngày bắt đầu và ngày kết thúc');
            return;
        }

        if (endDate.isBefore(startDate, 'day')) {
            toast.error('Ngày kết thúc không được trước ngày bắt đầu');
            return;
        }

        // Dữ liệu khớp với model coupon
        const data = {
            nameCoupon: nameCoupon.trim(),
            discount: Number(discount),
            quantity: Number(quantity),
            startDate: startDate.startOf('day').toISOString(),
            endDate: endDate.endOf('day').toISOString(),
            minPrice: Number(minPrice),
        };

        try {
            setLoading(true);

            const res = await createCoupon(data);

            toast.success(res.message || 'Tạo mã giảm giá thành công');

            // Reset form
            setNameCoupon('');
            setStartDate(null);
            setEndDate(null);
            setDiscount('');
            setQuantity('');
            setMinPrice('');
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                'Có lỗi xảy ra khi tạo mã giảm giá'
            );
        } finally {
            setLoading(false);
        }
    };

    // Style chung cho Material UI
    const textFieldSx = {
        '& .MuiOutlinedInput-root': {
            '& fieldset': {
                borderColor: '#d1d5db',
            },
            '&:hover fieldset': {
                borderColor: '#9ca3af',
            },
            '&.Mui-focused fieldset': {
                borderColor: '#c92127',
            },
        },
        '& .MuiInputLabel-root.Mui-focused': {
            color: '#c92127',
        },
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <ToastContainer position="top-right" autoClose={3000} />

            <main className="mx-auto max-w-3xl">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">
                        Tạo mã giảm giá
                    </h1>

                    <p className="mt-2 text-sm text-gray-500">
                        Nhập thông tin để tạo chương trình khuyến mãi mới.
                    </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:p-8">
                    <div className="flex flex-col gap-6">
                        {/* Tên mã */}
                        <TextField
                            sx={textFieldSx}
                            label="Tên mã giảm giá"
                            fullWidth
                            value={nameCoupon}
                            onChange={(e) => setNameCoupon(e.target.value)}
                            placeholder="Ví dụ: SALE20"
                        />

                        {/* Phần trăm giảm */}
                        <TextField
                            sx={textFieldSx}
                            label="Phần trăm giảm giá (%)"
                            fullWidth
                            type="number"
                            value={discount}
                            onChange={(e) => setDiscount(e.target.value)}
                            slotProps={{
                                htmlInput: { min: 1, max: 100 },
                            }}
                        />

                        {/* Số lượng coupon */}
                        <TextField
                            sx={textFieldSx}
                            label="Số lượng mã giảm giá"
                            fullWidth
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            slotProps={{
                                htmlInput: { min: 1, step: 1 },
                            }}
                        />

                        {/* Giá trị đơn hàng tối thiểu */}
                        <TextField
                            sx={textFieldSx}
                            label="Giá trị đơn hàng tối thiểu (VNĐ)"
                            fullWidth
                            type="number"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                            slotProps={{
                                htmlInput: { min: 0 },
                            }}
                        />

                        {/* Ngày bắt đầu và kết thúc */}
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <DemoContainer
                                    components={['DateField']}
                                    sx={{ width: '100%' }}
                                >
                                    <DateField
                                        label="Ngày bắt đầu"
                                        format="DD/MM/YYYY"
                                        value={startDate}
                                        onChange={handleDateChange}
                                        fullWidth
                                        sx={textFieldSx}
                                    />
                                </DemoContainer>

                                <DemoContainer
                                    components={['DateField']}
                                    sx={{ width: '100%' }}
                                >
                                    <DateField
                                        label="Ngày kết thúc"
                                        format="DD/MM/YYYY"
                                        value={endDate}
                                        onChange={handleDateChange1}
                                        fullWidth
                                        minDate={startDate || undefined}
                                        sx={textFieldSx}
                                    />
                                </DemoContainer>
                            </div>
                        </LocalizationProvider>
                    </div>

                    {/* Nút tạo */}
                    <div className="mt-8">
                        <Button
                            onClick={handleAddCoupon}
                            fullWidth
                            variant="contained"
                            disabled={loading}
                            sx={{
                                py: 1.5,
                                backgroundColor: '#c92127',
                                fontWeight: 600,
                                textTransform: 'none',
                                '&:hover': {
                                    backgroundColor: '#a51b20',
                                },
                                '&.Mui-disabled': {
                                    backgroundColor: '#d1d5db',
                                    color: '#6b7280',
                                },
                            }}
                        >
                            {loading ? 'Đang tạo mã...' : 'Tạo mã giảm giá'}
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default AddCoupon;
