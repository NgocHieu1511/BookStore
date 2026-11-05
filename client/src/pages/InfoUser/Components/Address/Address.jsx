import { useState } from 'react';

import Button from '@mui/material/Button';

import NewAddress from './Modal/NewAddress';
import { useStore } from '../../../../hooks/useStore';

import { ToastContainer } from 'react-toastify';
import ModalDeleteAddress from './Modal/deleteAddress';

function Address() {
    const [open, setOpen] = useState(false);

    const [openDeleteAddress, setOpenDeleteAddress] = useState(false);

    const [dataAddress, setDataAddress] = useState({});

    const { dataUser, fetchAuth } = useStore();

    return (
        <div className="w-full">
            <ToastContainer />

            {/* Header */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <h4 className="text-xl font-bold text-gray-800">
                    Địa chỉ của tôi
                </h4>

                <Button
                    onClick={() => setOpen(true)}
                    size="small"
                    variant="contained"
                    sx={{
                        backgroundColor: '#c92127',
                        textTransform: 'none',
                        '&:hover': {
                            backgroundColor: '#a81c22',
                        },
                    }}
                >
                    Thêm địa chỉ mới
                </Button>
            </div>

            {/* Danh sách địa chỉ */}
            <div className="flex flex-col gap-4">
                {dataUser?.user?.addressDefault?.map((address) => (
                    <div
                        key={address._id}
                        className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 text-gray-800 shadow-sm transition-colors sm:flex-row sm:items-center sm:justify-between"
                    >
                        {/* Thông tin địa chỉ */}
                        <div className="flex-1">
                            {/* Họ tên và số điện thoại */}
                            <div className="mb-2 flex flex-wrap items-center gap-3">
                                <h4 className="text-base font-semibold">
                                    {address.fullName}
                                </h4>

                                <span className="text-sm text-gray-500">
                                    {address.phone}
                                </span>
                            </div>

                            {/* Địa chỉ */}
                            <p className="text-sm leading-6 text-gray-600">
                                {address.address}
                            </p>
                        </div>

                        {/* Nút xóa địa chỉ */}
                        <div className="flex shrink-0">
                            <button
                                type="button"
                                onClick={() => {
                                    setDataAddress(address);
                                    setOpenDeleteAddress(true);
                                }}
                                className="cursor-pointer rounded-md px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
                            >
                                Xoá địa chỉ
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal thêm địa chỉ */}
            <NewAddress
                open={open}
                setOpen={setOpen}
                onSuccess={fetchAuth}
            />

            {/* Modal xóa địa chỉ */}
            <ModalDeleteAddress
                open={openDeleteAddress}
                setOpen={setOpenDeleteAddress}
                dataAddress={dataAddress}
                onSuccess={fetchAuth}
            />
        </div>
    );
}

export default Address;