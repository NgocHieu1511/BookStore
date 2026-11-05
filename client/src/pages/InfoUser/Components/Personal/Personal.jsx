
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

import {
    Camera,
    Lock,
    Phone,
    Trash2,
    Mail,
} from 'lucide-react';

import { useStore } from '../../../../hooks/useStore';
import { useEffect, useState } from 'react';
import { requestEditUser } from '../../../../config/userRequest';
import { toast, ToastContainer } from 'react-toastify';

function Personal() {
    const { dataUser } = useStore();
    console.log('dataUser', dataUser);
    const user = dataUser?.user;

    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [previewImage, setPreviewImage] = useState(null);
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);

    // Lấy thông tin người dùng
useEffect(() => {
    if (user) {
        setFullName(user.fullName || '');
        setPhone(String(user.phone || ''));
        setEmail(user.email || '');
    }
}, [dataUser]);

    // Xem trước ảnh đại diện
    const handlePreviewImage = (e) => {
        const file = e.target.files[0];

        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Vui lòng chọn file hình ảnh!');
            return;
        }

        setImage(file);

        const fileReader = new FileReader();

        fileReader.onload = () => {
            setPreviewImage(fileReader.result);
        };

        fileReader.readAsDataURL(file);
    };

    // Cập nhật thông tin người dùng
    const handleEditUser = async () => {
    if (!fullName.trim()) {
        toast.error('Vui lòng nhập họ và tên!');
        return;
    }

    if (!/^0\d{9}$/.test(phone)) {
        toast.error('Số điện thoại phải gồm đúng 10 chữ số!');
        return;
    }

    setLoading(true);

    const form = new FormData();

    form.append('fullName', fullName);
    form.append('phone', phone);
    form.append('email', email);

    if (image) {
        form.append('avatar', image);
    }

    try {
        const res = await requestEditUser(form);

        toast.success(res.message);

        setTimeout(() => {
            window.location.reload();
        }, 2000);
    } catch (error) {
        toast.error(
            error.response?.data?.message ||
            'Cập nhật thông tin thất bại!'
        );
    } finally {
        setLoading(false);
    }
};

    if (!user) {
        return (
            <div className="flex justify-center items-center py-10">
                <p className="text-gray-500">
                    Đang tải thông tin người dùng...
                </p>
            </div>
        );
    }

    return (
        <div className="w-full p-4 md:p-6 bg-white rounded-xl shadow-sm">
            <ToastContainer />

            <h4 className="text-xl font-semibold text-gray-800 mb-6">
                Thông tin cá nhân
            </h4>

            <div className="flex flex-col lg:flex-row gap-8">

                {/* Avatar */}
                <div className="flex flex-col items-center lg:w-48 shrink-0">
                    <div className="relative w-36 h-36">
                        <img
                            src={
                                previewImage ||
                                user?.avatar ||
                                '/images/default-avatar.png'
                                  }
                               alt={user?.fullName || 'Avatar'}
                               className="w-full h-full rounded-full object-cover border-4 border-gray-100"
                               />

                        <input
                            onChange={handlePreviewImage}
                            type="file"
                            id="file"
                            accept="image/*"
                            className="hidden"
                        />

                      <label
    htmlFor="file"
    className="absolute bottom-1 right-1 flex items-center justify-center w-10 h-10 bg-red-600 text-white rounded-full cursor-pointer hover:bg-red-700 transition shadow-md"
>
    <Camera size={18} />
</label>
                    </div>

                    <p className="mt-3 text-sm font-medium text-gray-700">
                        {user?.fullName}
                    </p>

                    <p className="text-xs text-gray-400">
                        Ảnh đại diện
                    </p>
                </div>

                {/* Nội dung thông tin */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Thông tin liên hệ và bảo mật */}
                    <div className="space-y-6">

                        {/* Liên hệ */}
                        <div className="border border-gray-200 rounded-lg p-4">
                            <h4 className="font-semibold text-gray-800 mb-4">
                                Số điện thoại và Email
                            </h4>

                            <div className="flex items-center gap-3 mb-4">
                                <Phone size={16} className="text-gray-500" />

                                <span className="text-sm text-gray-700">
                                    {phone
                                        ? `${phone}`
                                        : 'Chưa cập nhật'}
                                </span>
                            </div>

                            <div className="flex items-center gap-3">
                                <Mail size={16} className="text-gray-500" />

                                <span className="text-sm text-gray-700 break-all">
                                    {email}
                                </span>
                            </div>
                        </div>

                        {/* Bảo mật */}
                        <div className="border border-gray-200 rounded-lg p-4">
                            <h4 className="font-semibold text-gray-800 mb-4">
                                Bảo mật
                            </h4>

                            <div className="flex items-center justify-between gap-3 mb-4">
                                <div className="flex items-center gap-3">
                                    <Lock size={16} className="text-gray-500" />

                                    <p className="text-sm text-gray-700">
                                        Đổi mật khẩu
                                    </p>
                                </div>

                                <Button variant="outlined" size="small">
                                    Cập nhật
                                </Button>
                            </div>

                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <Trash2 size={16} className="text-gray-500" />

                                    <p className="text-sm text-gray-700">
                                        Yêu cầu xóa tài khoản
                                    </p>
                                </div>

                                <Button variant="outlined" size="small">
                                    Yêu cầu
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Form chỉnh sửa */}
                    <div className="flex flex-col gap-5">

                        <TextField
                            value={fullName}
                            fullWidth
                            label="Họ và tên"
                            variant="outlined"
                            onChange={(e) =>
                                setFullName(e.target.value)
                            }
                        />

                        <TextField
    value={phone}
    fullWidth
    label="Số điện thoại"
    variant="outlined"
    onChange={(e) => {
        const value = e.target.value.replace(/\D/g, '');

        // Chỉ cho phép nhập tối đa 10 chữ số
        if (value.length <= 10) {
            setPhone(value);
        }
    }}
/>

                       

                        <Button
                            onClick={handleEditUser}
                            fullWidth
                            variant="contained"
                            disabled={loading}
                            sx={{
                                backgroundColor: '#c92127',
                                '&:hover': {
                                    backgroundColor: '#a91b20',
                                },
                                padding: '10px',
                            }}
                        >
                            {loading ? 'Đang cập nhật...' : 'Lưu thay đổi'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Personal;
