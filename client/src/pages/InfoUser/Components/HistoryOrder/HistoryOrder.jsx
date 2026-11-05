import { useState } from 'react';
import OrderProcessing from './Components/OrderProcessing';
import { ToastContainer } from 'react-toastify';

const listHeader = [
    { name: 'Đang xử lý', params: 'pending' },
    { name: 'Đã xác nhận', params: 'confirmed' },
    { name: 'Đã giao', params: 'delivered' },
    { name: 'Hoàn thành', params: 'completed' },
    { name: 'Đã huỷ', params: 'cancelled' },
];

function HistoryOrder() {
    const [type, setType] = useState(0);
    const [params, setParams] = useState('pending');

    return (
        <div className="w-full">
            <ToastContainer />

            {/* Tiêu đề */}
            <h4 className="mb-5 text-xl font-bold text-gray-800">
                Đơn hàng của tôi
            </h4>

            {/* Danh sách trạng thái đơn hàng */}
            <div className="flex w-full flex-wrap border-b border-gray-200">
                {listHeader.map((item, index) => (
                    <div
                        onClick={() => {
                            setType(index);
                            setParams(item.params);
                        }}
                        className="cursor-pointer px-4 py-3"
                        key={index}
                    >
                        <p
                            className={`text-sm font-medium transition-colors duration-200 ${
                                type === index
                                    ? 'border-b-2 border-red-600 pb-3 text-red-600'
                                    : 'border-b-2 border-transparent pb-3 text-gray-600 hover:text-red-600'
                            }`}
                        >
                            {item.name}
                        </p>
                    </div>
                ))}
            </div>

            {/* Nội dung đơn hàng */}
            <div className="mt-5 w-full">
                <OrderProcessing params={params} />
            </div>
        </div>
    );
}

export default HistoryOrder;