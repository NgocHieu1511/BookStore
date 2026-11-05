import { useEffect, useState } from 'react';

import Button from '@mui/material/Button';

import {
    requestCancelMyPayment,
    requestMyPayments,
} from '../../../../../config/paymentRequest';
import { getMyFeedbacks } from '../../../../../config/feedbackRequest';

import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

import imgEmptyOrder from '../../../../../assets/img/empty-order.png';
import ModalFeedback from './Modal/ModalFeedback';

// Chỉ đơn đã giao tới khách mới được đánh giá
const REVIEWABLE_STATUSES = ['delivered', 'completed'];

function OrderProcessing({ params }) {
    const [dataOrder, setDataOrder] = useState([]);

    const [showModalFeedback, setShowModalFeedback] = useState(false);

    // Sản phẩm đang được đánh giá trong modal
    const [feedbackTarget, setFeedbackTarget] = useState({
        paymentId: '',
        productId: '',
        name: '',
    });

    // Các sản phẩm đã đánh giá, dạng "paymentId_productId"
    const [reviewedKeys, setReviewedKeys] = useState(() => new Set());

    const navigate = useNavigate();

    // Lấy danh sách đơn hàng theo trạng thái (tab)
    const fetchData = async () => {
        try {
            const res = await requestMyPayments(params);

            const list = Array.isArray(res) ? res : res?.metadata;
            const safeList = Array.isArray(list) ? list : [];

            // Chỉ giữ lại đơn có trạng thái khớp với tab hiện tại
            // (bỏ qua nếu tab là "all" hoặc không có params)
            const filtered =
                params && params !== 'all'
                    ? safeList.filter((item) => item.status === params)
                    : safeList;

            setDataOrder(filtered);
        } catch (error) {
            setDataOrder([]);
            toast.error(
                error.response?.data?.message ||
                    'Không thể lấy danh sách đơn hàng!',
            );
        }
    };

    // Gọi API khi trạng thái đơn hàng (tab) thay đổi
    useEffect(() => {
        document.title = 'Đơn hàng của tôi';
        fetchData();
    }, [params]);

    // Lấy danh sách sản phẩm đã đánh giá để ẩn nút "Đánh giá"
    useEffect(() => {
        let ignore = false;

        getMyFeedbacks()
            .then((res) => {
                if (ignore) return;
                const list = Array.isArray(res?.metadata) ? res.metadata : [];
                setReviewedKeys(
                    new Set(
                        list.map((item) => `${item.paymentId}_${item.productId}`),
                    ),
                );
            })
            .catch((error) => console.log(error));

        return () => {
            ignore = true;
        };
    }, []);

    // Hủy đơn hàng
    const handleCancelOrder = async (id) => {
        try {
            const res = await requestCancelMyPayment(id, 'Khách hàng hủy đơn');

            toast.success(res.message);

            await fetchData();
        } catch (error) {
            toast.error(
                error.response?.data?.message || 'Hủy đơn hàng thất bại!',
            );
        }
    };

    // Mở modal đánh giá cho 1 sản phẩm trong đơn hàng
    const onModalFeedback = (paymentId, product) => {
        setFeedbackTarget({
            paymentId,
            productId: product._id,
            name: product.nameProduct,
        });
        setShowModalFeedback(true);
    };

    // Đánh giá thành công: đánh dấu đã đánh giá luôn, không cần gọi lại API
    const handleFeedbackSuccess = ({ paymentId, productId }) => {
        setReviewedKeys((prev) => new Set(prev).add(`${paymentId}_${productId}`));
    };

    return (
        <div className="w-full">
            {/* Không có đơn hàng */}
            {dataOrder.length === 0 && (
                <div className="flex min-h-[300px] flex-col items-center justify-center gap-4 py-10">
                    <img
                        src={imgEmptyOrder}
                        alt="Không có đơn hàng"
                        className="h-[180px] w-[180px] object-contain"
                    />

                    <p className="text-base font-medium text-gray-500">
                        Chưa có đơn hàng
                    </p>
                </div>
            )}

            {/* Danh sách đơn hàng */}
            <div className="flex flex-col gap-5">
                {dataOrder.map((item) => (
                    <div
                        key={item._id}
                        className="w-full overflow-hidden rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                    >
                        {/* Thông tin sản phẩm */}
                        <div className="flex flex-col gap-4">
                            {item.products?.map((p) => {
                                const product = p.productId;

                                return (
                                    <div
                                        key={p._id}
                                        className="flex flex-col gap-4 sm:flex-row"
                                    >
                                        <img
                                            src={
                                                product?.imagesProduct?.[0] ||
                                                imgEmptyOrder
                                            }
                                            alt={product?.nameProduct || 'Sản phẩm'}
                                            className="h-[100px] w-[100px] rounded-lg border border-gray-100 object-cover"
                                        />

                                        <div className="flex flex-1 flex-col gap-2">
                                            <h4 className="text-base font-bold text-gray-800">
                                                {product?.nameProduct ||
                                                    'Sản phẩm không còn tồn tại'}
                                            </h4>

                                            <p className="text-sm text-gray-600">
                                                Số lượng:
                                                <span className="ml-2 font-medium text-gray-800">
                                                    x{p.quantity}
                                                </span>
                                            </p>

                                            {/* Đánh giá từng sản phẩm trong đơn đã giao */}
                                            {REVIEWABLE_STATUSES.includes(
                                                item.status,
                                            ) &&
                                                product?._id &&
                                                (reviewedKeys.has(
                                                    `${item._id}_${product._id}`,
                                                ) ? (
                                                    <span className="text-sm font-medium text-green-600">
                                                        ✓ Bạn đã đánh giá sản phẩm này
                                                    </span>
                                                ) : (
                                                    <div>
                                                        <Button
                                                            size="small"
                                                            variant="contained"
                                                            onClick={() =>
                                                                onModalFeedback(
                                                                    item._id,
                                                                    product,
                                                                )
                                                            }
                                                            sx={{
                                                                backgroundColor:
                                                                    '#c92127',
                                                                textTransform:
                                                                    'none',
                                                                '&:hover': {
                                                                    backgroundColor:
                                                                        '#a81c22',
                                                                },
                                                            }}
                                                        >
                                                            Đánh giá sản phẩm
                                                        </Button>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Thông tin đơn hàng */}
                        <div className="mt-4 flex flex-col gap-2 border-t border-gray-100 pt-4">
                            <p className="text-sm text-gray-600">
                                Tổng tiền:
                                <span className="ml-2 font-semibold text-red-600">
                                    {Number(
                                        item.finalPrice ?? item.totalPrice ?? 0,
                                    ).toLocaleString('vi-VN')}{' '}
                                    VNĐ
                                </span>
                            </p>

                            <p className="text-sm text-gray-600">
                                Địa chỉ:
                                <span className="ml-2 text-gray-800">
                                    {item.address}
                                </span>
                            </p>

                            <p className="text-sm text-gray-600">
                                Thanh toán:
                                <span className="ml-2 font-medium uppercase text-gray-800">
                                    {item.paymentMethod}
                                </span>
                            </p>
                        </div>

                        {/* Các nút thao tác */}
                        <div className="mt-4 flex flex-wrap justify-end gap-3 border-t border-gray-100 pt-4">
                            {/* Nút hủy đơn hàng */}
                            {['pending', 'confirmed'].includes(item.status) && (
                                <Button
                                    variant="contained"
                                    color="error"
                                    onClick={() => handleCancelOrder(item._id)}
                                    sx={{ textTransform: 'none' }}
                                >
                                    Huỷ đơn hàng
                                </Button>
                            )}

                            {/* Nút xem chi tiết sản phẩm */}
                            {params === 'cancelled' && (
                                <Button
                                    variant="contained"
                                    onClick={() =>
                                        navigate(
                                            `/product/${item.products[0]?.productId?._id}`,
                                        )
                                    }
                                    sx={{
                                        backgroundColor: '#c92127',
                                        textTransform: 'none',
                                        '&:hover': {
                                            backgroundColor: '#a81c22',
                                        },
                                    }}
                                >
                                    Chi tiết sản phẩm
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal đánh giá sản phẩm */}
            <ModalFeedback
                open={showModalFeedback}
                setOpen={setShowModalFeedback}
                nameProduct={feedbackTarget.name}
                idPayment={feedbackTarget.paymentId}
                idProduct={feedbackTarget.productId}
                onSuccess={handleFeedbackSuccess}
            />
        </div>
    );
}

export default OrderProcessing;