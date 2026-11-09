
import Button from '@mui/material/Button';

import AddBlog from './Components/AddBlog/AddBlog';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import { ToastContainer, toast } from 'react-toastify';
import { useEffect, useState } from 'react';

import {
    requestDeleteBlog,
    requestGetBlogs,
} from '../../../../config/blogRequest.jsx';

import TimeAgo from '../../../../utils/TimeAgo.jsx';

function Blog() {
    const [type, setType] = useState(0);
    const [dataBlog, setDataBlog] = useState([]);
    const [loading, setLoading] = useState(false);

    // Lấy danh sách bài viết
    const fetchData = async () => {
        try {
            setLoading(true);

            const res = await requestGetBlogs();

            setDataBlog(Array.isArray(res) ? res : res?.data || res?.metadata || []);
        } catch (error) {
            toast.error(
                error?.response?.data?.message ||
                'Không thể lấy danh sách bài viết!'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Xóa bài viết
    const handleDeleteBlog = async (idBlog) => {
        const confirmDelete = window.confirm(
            'Bạn có chắc chắn muốn xóa bài viết này không?'
        );

        if (!confirmDelete) return;

        try {
            const res = await requestDeleteBlog(idBlog);

            toast.success(res.message || 'Xóa bài viết thành công!');

            await fetchData();
        } catch (error) {
            toast.error(
                error?.response?.data?.message ||
                'Xóa bài viết thất bại!'
            );
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">

            <ToastContainer position="top-right" autoClose={3000} />

            <div className="mx-auto max-w-7xl">

                {/* HEADER */}
                <div className="mb-6 flex flex-col gap-4 rounded-xl bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">

                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            Quản lý bài viết
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Quản lý và cập nhật các bài viết trên Bookstore.com
                        </p>
                    </div>

                    <Button
                        variant="contained"
                        onClick={() => setType(type === 0 ? 1 : 0)}
                        sx={{
                            backgroundColor: '#c92127',
                            padding: '10px 20px',
                            fontWeight: 600,
                            textTransform: 'none',
                            '&:hover': {
                                backgroundColor: '#a71920',
                            },
                        }}
                    >
                        {type === 0 ? 'Thêm bài viết' : 'Quay lại'}
                    </Button>

                </div>

                {/* CONTENT */}
                {type === 0 ? (

                    <div className="overflow-hidden rounded-xl bg-white shadow-sm">

                        {/* TABLE HEADER */}
                        <div className="border-b border-gray-100 px-5 py-4">
                            <h2 className="text-lg font-semibold text-gray-800">
                                Danh sách bài viết
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Tổng cộng {dataBlog.length} bài viết
                            </p>
                        </div>

                        {/* TABLE */}
                        <TableContainer
                            component={Paper}
                            elevation={0}
                            sx={{ borderRadius: 0 }}
                        >
                            <Table
                                sx={{ minWidth: 650 }}
                                aria-label="blog table"
                            >

                                <TableHead>
                                    <TableRow
                                        sx={{
                                            backgroundColor: '#f9fafb',
                                        }}
                                    >
                                        <TableCell>
                                            <span className="font-bold text-gray-700">
                                                Tên bài viết
                                            </span>
                                        </TableCell>

                                        <TableCell align="center">
                                            <span className="font-bold text-gray-700">
                                                Ảnh
                                            </span>
                                        </TableCell>

                                        <TableCell align="center">
                                            <span className="font-bold text-gray-700">
                                                Ngày đăng
                                            </span>
                                        </TableCell>

                                        <TableCell align="center">
                                            <span className="font-bold text-gray-700">
                                                Hành động
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                </TableHead>

                                <TableBody>

                                    {loading ? (

                                        <TableRow>
                                            <TableCell colSpan={4} align="center">
                                                <div className="py-10 text-gray-500">
                                                    Đang tải dữ liệu...
                                                </div>
                                            </TableCell>
                                        </TableRow>

                                    ) : dataBlog.length === 0 ? (

                                        <TableRow>
                                            <TableCell colSpan={4} align="center">
                                                <div className="py-10 text-gray-400">
                                                    Chưa có bài viết nào
                                                </div>
                                            </TableCell>
                                        </TableRow>

                                    ) : (

                                        dataBlog.map((blog) => (

                                            <TableRow
                                                key={blog._id}
                                                hover
                                                sx={{
                                                    '&:last-child td, &:last-child th': {
                                                        border: 0,
                                                    },
                                                }}
                                            >

                                                {/* NAME */}
                                                <TableCell
                                                    component="th"
                                                    scope="row"
                                                >
                                                    <span className="font-medium text-gray-800">
                                                        {blog.nameBlog}
                                                    </span>
                                                </TableCell>

                                                {/* IMAGE */}
                                                <TableCell align="center">
                                                    <img
                                                        className="mx-auto h-20 w-20 rounded-lg border border-gray-100 object-cover"
                                                        src={
                                                            blog.image?.startsWith('http')
                                                                ? blog.image
                                                                : `${import.meta.env.VITE_URL_IMAGE}/uploads/blogs/${blog.image}`
                                                        }
                                                        alt={blog.nameBlog || 'Ảnh bài viết'}
                                                    />
                                                </TableCell>

                                                {/* CREATED AT */}
                                                <TableCell align="center">
                                                    <span className="text-sm text-gray-500">
                                                        <TimeAgo
                                                            createdAt={blog.createdAt}
                                                        />
                                                    </span>
                                                </TableCell>

                                                {/* ACTION */}
                                                <TableCell align="center">
                                                    <Button
                                                        onClick={() =>
                                                            handleDeleteBlog(blog._id)
                                                        }
                                                        color="error"
                                                        variant="contained"
                                                        size="small"
                                                        sx={{
                                                            textTransform: 'none',
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        Xóa bài viết
                                                    </Button>
                                                </TableCell>

                                            </TableRow>

                                        ))

                                    )}

                                </TableBody>
                            </Table>
                        </TableContainer>

                    </div>

                ) : (

                    /* ADD BLOG */
                    <AddBlog />

                )}

            </div>
        </div>
    );
}

export default Blog;
