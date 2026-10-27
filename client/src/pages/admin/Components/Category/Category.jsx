import { useEffect, useState } from 'react';
import {
    Plus,
    Pencil,
    Trash2,
    FolderOpen,
    ImageOff,
} from 'lucide-react';

import ModalDeleteCategory from './Components/ModalDeleteCategory/ModalDeleteCategory';
import ModalAddCategory from './Components/ModalAddCategory/ModalAddCategory';
import ModalEditCategory from './Components/ModalEditCategory/ModalEditCategory';

import { listCategory } from '../../../../config/categoryRequest';
import { ToastContainer } from 'react-toastify';

function Category() {
    // Trạng thái mở/đóng modal
    const [open, setOpen] = useState(false);
    const [openAddCategory, setOpenAddCategory] = useState(false);
    const [openEditCategory, setOpenEditCategory] = useState(false);

    // Danh sách danh mục
    const [dataCategory, setDataCategory] = useState([]);
    const [loading, setLoading] = useState(true);

    // Danh mục được chọn để sửa hoặc xóa
    const [dataOneCategory, setDataOneCategory] = useState({});

    // Lấy danh sách danh mục từ API
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                const res = await listCategory();

                console.log('Dữ liệu API trả về:', res);

                // Hỗ trợ nhiều định dạng response API
                const categoriesArray = Array.isArray(res)
                    ? res
                    : Array.isArray(res?.metadata)
                        ? res.metadata
                        : Array.isArray(res?.data)
                            ? res.data
                            : Array.isArray(res?.categories)
                                ? res.categories
                                : [];

                setDataCategory(categoriesArray);
            } catch (error) {
                console.error('Lỗi lấy danh sách danh mục:', error);
                setDataCategory([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        document.title = 'Quản lý danh mục';
    }, [open, openAddCategory, openEditCategory]);

    // Chuẩn hóa dữ liệu
    const rows = dataCategory.map((category) => ({
        id: category._id,
        image: category.imageCategory,
        name: category.nameCategory,
        lengthProduct: category.lengthProduct,
        originalCategory: category,
    }));

    return (
        <div className="min-h-screen w-full bg-gray-50 p-4 md:p-6">
            <ToastContainer position="top-right" autoClose={3000} />

            {/* Header */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        Quản lý danh mục
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Quản lý danh sách danh mục sản phẩm của cửa hàng.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => setOpenAddCategory(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 font-medium text-white shadow-sm transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                    <Plus size={18} />
                    Thêm danh mục
                </button>
            </div>

            {/* Thống kê */}
            <div className="mb-5 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-red-50 p-3 text-red-600">
                        <FolderOpen size={24} />
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">
                            Tổng số danh mục
                        </p>

                        <p className="text-2xl font-bold text-gray-800">
                            {dataCategory.length}
                        </p>
                    </div>
                </div>
            </div>

            {/* Bảng danh mục */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px] border-collapse text-left">
                        <thead>
                            <tr className="border-b border-gray-200 bg-gray-100">
                                <th className="px-5 py-4 text-sm font-semibold text-gray-700">
                                    Ảnh danh mục
                                </th>

                                <th className="px-5 py-4 text-sm font-semibold text-gray-700">
                                    Tên danh mục
                                </th>

                                <th className="px-5 py-4 text-center text-sm font-semibold text-gray-700">
                                    Số lượng sản phẩm
                                </th>

                                <th className="px-5 py-4 text-center text-sm font-semibold text-gray-700">
                                    Hành động
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="px-5 py-12 text-center text-gray-500"
                                    >
                                        Đang tải danh sách danh mục...
                                    </td>
                                </tr>
                            ) : rows.length > 0 ? (
                                rows.map((row) => (
                                    <tr
                                        key={row.id}
                                        className="transition hover:bg-gray-50"
                                    >
                                        {/* Ảnh danh mục */}
                                        <td className="px-5 py-4">
                                            {row.image ? (
                                                <img
                                                    src={row.image}
                                                    alt={row.name || 'Ảnh danh mục'}
                                                    className="h-[70px] w-[70px] rounded-lg border border-gray-200 object-cover"
                                                    onError={(event) => {
                                                        event.currentTarget.style.display = 'none';
                                                        event.currentTarget.nextElementSibling.style.display = 'flex';
                                                    }}
                                                />
                                            ) : null}

                                            <div
                                                className="h-[70px] w-[70px] items-center justify-center rounded-lg bg-gray-100 text-gray-400"
                                                style={{
                                                    display: row.image ? 'none' : 'flex',
                                                }}
                                            >
                                                <ImageOff size={24} />
                                            </div>
                                        </td>

                                        {/* Tên danh mục */}
                                        <td className="px-5 py-4">
                                            <span className="font-medium text-gray-800">
                                                {row.name || 'Chưa có tên'}
                                            </span>
                                        </td>

                                        {/* Số lượng sản phẩm */}
                                        <td className="px-5 py-4 text-center">
                                            <span className="inline-flex min-w-10 items-center justify-center rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                                                {row.lengthProduct ?? 0}
                                            </span>
                                        </td>

                                        {/* Hành động */}
                                        <td className="px-5 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    type="button"
                                                    title="Sửa danh mục"
                                                    onClick={() => {
                                                        setDataOneCategory(row.originalCategory);
                                                        setOpenEditCategory(true);
                                                    }}
                                                    className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-400"
                                                >
                                                    <Pencil size={16} />
                                                    Sửa
                                                </button>

                                                <button
                                                    type="button"
                                                    title="Xóa danh mục"
                                                    onClick={() => {
                                                        setDataOneCategory(row.originalCategory);
                                                        setOpen(true);
                                                    }}
                                                    className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400"
                                                >
                                                    <Trash2 size={16} />
                                                    Xóa
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="px-5 py-12 text-center"
                                    >
                                        <div className="flex flex-col items-center gap-2 text-gray-400">
                                            <FolderOpen size={40} />

                                            <p className="text-sm">
                                                Chưa có danh mục nào
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal xóa danh mục */}
            <ModalDeleteCategory
                open={open}
                setOpen={setOpen}
                dataOneCategory={dataOneCategory}
            />

            {/* Modal thêm danh mục */}
            <ModalAddCategory
                open={openAddCategory}
                setOpen={setOpenAddCategory}
            />

            {/* Modal sửa danh mục */}
            <ModalEditCategory
                open={openEditCategory}
                setOpen={setOpenEditCategory}
                dataOneCategory={dataOneCategory}
            />
        </div>
    );
}

export default Category;