
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import { listProductsAdmin } from '../../../../config/productRequest';
import ProductFilter from './ProductFilter';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';

import AddProduct from './AddProduct/AddProduct';
import ModalDeleteProduct from './ModalDelete/ModalDelete';
import ModalDeleteManyProduct from './ModalDeleteMany/ModalDeleteMany';
import PaginationPage from '../../../../components/Pagination/Pagination';
import ImportExport from './ImportExport';

function HomeProducts() {
    const [dataProducts, setDataProducts] = useState([]);
    const [pageProduct, setPageProduct] = useState(1);
    const [open, setOpen] = useState(false);
    const [dataOneProduct, setDataOneProduct] = useState({});
    const [searchParams] = useSearchParams();
    const [type, setType] = useState(0);
    const [selectedIds, setSelectedIds] = useState([]); // id các sản phẩm được tick
    const [openMany, setOpenMany] = useState(false); // modal xóa nhiều

    // Lấy danh sách sản phẩm từ API
 const fetchData = async () => {
    try {
        // Toàn bộ bộ lọc + page đang nằm trên URL, gửi thẳng lên server
        const params = Object.fromEntries(
            [...searchParams.entries()].filter(([, value]) => value !== ''),
        );
        const res = await listProductsAdmin({ ...params, limit: 10 });

        setDataProducts(res?.metadata?.products || []);
        setPageProduct(res?.metadata?.pagination?.totalPages || 1);
    } catch (error) {
        console.error('Lỗi lấy danh sách sản phẩm:', error);
        setDataProducts([]);
    }
};

    useEffect(() => {
        document.title = 'Quản lý sản phẩm';
        fetchData();
    }, [open, type, searchParams]);

    // Định dạng tiền Việt Nam
    const formatPrice = (price) => {
        return `${(Number(price) || 0).toLocaleString('vi-VN')} VNĐ`;
    };

    // Chuyển dữ liệu API thành dữ liệu hiển thị trên bảng
    const rows = dataProducts.map((product) => ({
        id: product._id,
        img: product.imagesProduct?.[0] || '',
        name: product.nameProduct || '',
        price: Number(product.priceProduct) || 0,
        discount: Number(product.discountProduct) || 0,
        stock: Number(product.stockProduct) || 0,
        countBuy: Number(product.countBuy) || 0,

        // Hỗ trợ trường hợp API đã populate categoryProduct
        category:
            product.categoryProduct?.nameCategory ||
            product.categoryProduct?.name ||
            product.nameCategory ||
            'Chưa phân loại',

        // Giữ lại sản phẩm gốc để truyền cho form sửa và modal xóa
        originalProduct: product,
    }));

    // ===== Chọn bằng checkbox =====
    const allChecked = rows.length > 0 && selectedIds.length === rows.length;
    const someChecked = selectedIds.length > 0 && !allChecked;

    const handleToggleOne = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
        );
    };

    const handleToggleAll = (checked) => {
        setSelectedIds(checked ? rows.map((row) => row.id) : []);
    };

    const selectedProducts = rows
        .filter((row) => selectedIds.includes(row.id))
        .map((row) => ({ id: row.id, name: row.name }));

    return (
        <div className="min-h-screen w-full bg-gray-50 p-4 md:p-6">
            {/* Tiêu đề */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-white p-4 shadow-sm">
                <h1 className="text-xl font-semibold text-gray-800">
                    Quản lý sản phẩm
                </h1>
                <ImportExport onImported={fetchData} />

                <Button
                    variant="contained"
                    onClick={() => {
                        if (type === 0) {
                            setDataOneProduct({});
                            setType(1);
                        } else {
                            setDataOneProduct({});
                            setType(0);
                        }
                    }}
                >

                    {type === 0 ? 'Thêm sản phẩm' : 'Quay lại'}
                </Button>
            </div>

            {/* Danh sách hoặc form thêm/sửa */}
            {/* Bộ lọc */}
            {type === 0 && <ProductFilter />}
            {type === 0 ? (
                <div className="overflow-hidden rounded-xl bg-white shadow-sm">
                    {/* Thanh thao tác khi có sản phẩm được chọn */}
                    {selectedIds.length > 0 && (
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-red-100 bg-red-50 px-4 py-3">
                            <span className="text-sm text-gray-700">
                                Đã chọn{' '}
                                <b className="text-red-600">
                                    {selectedIds.length}
                                </b>{' '}
                                sản phẩm
                            </span>

                            <div className="flex gap-2">
                                <Button
                                    size="small"
                                    color="inherit"
                                    onClick={() => setSelectedIds([])}
                                >
                                    Bỏ chọn
                                </Button>
                                <Button
                                    size="small"
                                    variant="contained"
                                    color="error"
                                    onClick={() => setOpenMany(true)}
                                >
                                    Xóa đã chọn ({selectedIds.length})
                                </Button>
                            </div>
                        </div>
                    )}

                    <TableContainer component={Paper} elevation={0}>
                        <Table sx={{ minWidth: 900 }} aria-label="Danh sách sản phẩm">
                            <TableHead>
                                <TableRow>
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            checked={allChecked}
                                            indeterminate={someChecked}
                                            onChange={(e) =>
                                                handleToggleAll(e.target.checked)
                                            }
                                            disabled={rows.length === 0}
                                            inputProps={{
                                                'aria-label': 'Chọn tất cả sản phẩm',
                                            }}
                                        />
                                    </TableCell>

                                    <TableCell>Ảnh</TableCell>

                                    <TableCell align="center">
                                        Tên sản phẩm
                                    </TableCell>

                                    <TableCell align="center">
                                        Danh mục
                                    </TableCell>

                                    <TableCell align="center">
                                        Giá
                                    </TableCell>

                                    <TableCell align="center">
                                        Giảm giá (%)
                                    </TableCell>

                                    <TableCell align="center">
                                        Tồn kho
                                    </TableCell>

                                    <TableCell align="center">
                                        Đã bán
                                    </TableCell>

                                    <TableCell align="center">
                                        Hành động
                                    </TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {rows.length > 0 ? (
                                    rows.map((row) => (
                                        <TableRow
                                            key={row.id}
                                            hover
                                            selected={selectedIds.includes(row.id)}
                                        >
                                            {/* Checkbox chọn */}
                                            <TableCell padding="checkbox">
                                                <Checkbox
                                                    checked={selectedIds.includes(
                                                        row.id,
                                                    )}
                                                    onChange={() =>
                                                        handleToggleOne(row.id)
                                                    }
                                                    inputProps={{
                                                        'aria-label': `Chọn ${row.name}`,
                                                    }}
                                                />
                                            </TableCell>

                                            {/* Ảnh sản phẩm */}
                                            <TableCell>
                                                {row.img ? (
                                                    
                                                   <img
                                                   src={row.img}
                                                   alt={row.name}
                                                   className="h-20 w-16 rounded-lg object-cover"
                                                      />
                                                ) : (
                                                    <div className="flex h-20 w-16 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400">
                                                        Không có ảnh
                                                    </div>
                                                )}
                                            </TableCell>

                                            {/* Tên */}
                                            <TableCell align="center">
                                                <span className="font-medium text-gray-800">
                                                    {row.name}
                                                </span>
                                            </TableCell>

                                            {/* Danh mục */}
                                            <TableCell align="center">
                                                <span className="text-gray-600">
                                                    {row.category}
                                                </span>
                                            </TableCell>

                                            {/* Giá gốc */}
                                            <TableCell align="center">
                                                <span className="font-semibold text-red-600">
                                                    {formatPrice(row.price)}
                                                </span>
                                            </TableCell>

                                            {/* Mức giảm giá */}
                                            <TableCell align="center">
                                                <span className="text-orange-600">
                                                    {row.discount}%
                                                </span>
                                            </TableCell>

                                            {/* Số lượng tồn kho */}
                                            <TableCell align="center">
                                                <span
                                                    className={`font-medium ${
                                                        row.stock > 0
                                                            ? 'text-green-600'
                                                            : 'text-red-600'
                                                    }`}
                                                >
                                                    {row.stock}
                                                </span>
                                            </TableCell>

                                            {/* Số lượng đã bán */}
                                            <TableCell align="center">
                                                <span className="text-gray-700">
                                                    {row.countBuy}
                                                </span>
                                            </TableCell>

                                            {/* Sửa / Xóa */}
                                            <TableCell align="center">
                                                <div className="flex flex-col items-center gap-2">
                                                    <Button
                                                        variant="contained"
                                                        size="small"
                                                        onClick={() => {
                                                            setDataOneProduct(
                                                                row.originalProduct,
                                                            );
                                                            setType(1);
                                                        }}
                                                    >
                                                        Sửa
                                                    </Button>

                                                    <Button
                                                        variant="contained"
                                                        color="error"
                                                        size="small"
                                                        onClick={() => {
                                                            setDataOneProduct(
                                                                row.originalProduct,
                                                            );
                                                            setOpen(true);
                                                        }}
                                                    >
                                                        Xóa
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={9} align="center">
                                            <div className="py-10 text-gray-500">
                                                Không có sản phẩm
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </div>
            ) : (
                <AddProduct
                    dataOneProduct={dataOneProduct}
                    setTypeBack={setType}
                    setDataOneProduct={setDataOneProduct}
                />
            )}

            {/* Modal xóa */}
            <ModalDeleteProduct
                open={open}
                setOpen={setOpen}
                dataOneProduct={dataOneProduct}
            />

            {/* Modal xóa nhiều */}
            <ModalDeleteManyProduct
                open={openMany}
                setOpen={setOpenMany}
                selectedProducts={selectedProducts}
                onSuccess={() => {
                    setSelectedIds([]);
                    fetchData();
                }}
            />

            {/* Phân trang */}
            {type === 0 && (
                <div className="mt-6 flex justify-center">
                    <PaginationPage totalPages={pageProduct} />
                </div>
            )}
        </div>
    );
}

export default HomeProducts;
