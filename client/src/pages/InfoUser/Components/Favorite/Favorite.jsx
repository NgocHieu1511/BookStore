import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import { useEffect, useState } from 'react';
import { requestGetHeartProductUser } from '../../../../config/userRequest.jsx';
import { Button } from '@mui/material';

import { useNavigate } from 'react-router-dom';

function Favorite() {
    const [dataHeartProduct, setDataHeartProduct] = useState([]);

    const navigate = useNavigate();

    // Lấy danh sách sản phẩm yêu thích từ API
   useEffect(() => {
    const fetchData = async () => {
        const res = await requestGetHeartProductUser();
        console.log('heart detail:', res);
        console.log(JSON.stringify(res.metadata[0], null, 2));

        // Lấy đúng mảng, tùy backend trả về dạng nào
        const list = Array.isArray(res) ? res : res?.data || res?.metadata || [];
        setDataHeartProduct(list);
    };

    fetchData();
    
}, []);

    // Tạo dữ liệu cho từng dòng trong bảng
    function createData(id, name, image, category, price, discount) {
    return { id, name, image, category, price, discount };
}

const rows = dataHeartProduct.map((item) =>
    createData(
        item._id,
        item.nameProduct,
        item.image,
          item.category || 'Đang cập nhật',
        Number(item.priceProduct || 0),
        Number(item.discountProduct || 0)
    )
);

    return (
        <div className="w-full">
            {/* Tiêu đề */}
            <h4 className="mb-5 text-xl font-bold text-gray-800">
                Danh sách sản phẩm yêu thích
            </h4>

            {/* Bảng danh sách sản phẩm */}
            <div className="pt-5">
                <TableContainer
                    component={Paper}
                    className="overflow-x-auto rounded-lg shadow-md"
                >
                    <Table
                        sx={{ minWidth: 650 }}
                        aria-label="favorite products table"
                    >
                        {/* Header của bảng */}
                        <TableHead>
                            <TableRow className="bg-gray-100">
                                <TableCell className="font-bold">
                                    Tên sản phẩm
                                </TableCell>

                                <TableCell align="center" className="font-bold">
                                    Ảnh
                                </TableCell>

                                <TableCell align="center" className="font-bold">
                                    Danh mục
                                </TableCell>

                                <TableCell align="center" className="font-bold">
                                    Giá
                                </TableCell>

                                <TableCell align="center" className="font-bold">
                                    Hành động
                                </TableCell>
                            </TableRow>
                        </TableHead>

                        {/* Body của bảng */}
                        <TableBody>
                            {rows.length > 0 ? (
                                rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        className="transition-colors hover:bg-gray-50"
                                    >
                                        {/* Tên sản phẩm */}
                                        <TableCell
                                            component="th"
                                            scope="row"
                                            className="max-w-[250px] font-medium text-gray-800"
                                        >
                                            {row.name}
                                        </TableCell>

                                        {/* Ảnh sản phẩm */}
                                        <TableCell align="center">
                                            <img
    className="mx-auto h-[100px] w-[100px] rounded-lg object-cover"
    src={row.image}
    alt={row.name}
/>
                                        </TableCell>

                                        {/* Danh mục */}
                                        <TableCell
                                            align="center"
                                            className="text-gray-600"
                                        >
                                            {row.category}
                                        </TableCell>

                                        {/* Giá sản phẩm */}
                                        <TableCell
                                            align="center"
                                            className="whitespace-nowrap font-semibold text-red-600"
                                        >
                                            {row.price.toLocaleString('vi-VN')} VNĐ
                                        </TableCell>

                                        {/* Nút chi tiết */}
                                        <TableCell align="center">
                                            <Button
                                                onClick={() =>
                                                    navigate(`/product/${row.id}`)
                                                }
                                                variant="contained"
                                                sx={{
                                                    backgroundColor: '#c92127',
                                                    textTransform: 'none',
                                                    '&:hover': {
                                                        backgroundColor: '#a81c22',
                                                    },
                                                }}
                                            >
                                                Chi tiết
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        align="center"
                                        className="py-10 text-gray-500"
                                    >
                                        Chưa có sản phẩm yêu thích
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>
        </div>
    );
}

export default Favorite;