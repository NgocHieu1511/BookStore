import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { Editor } from '@tinymce/tinymce-react';
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';

import {
    createProduct,
    updateProduct,
} from '../../../../../config/productRequest';
import { listCategory } from '../../../../../config/categoryRequest';
import useDebounce from '../../../../../hooks/useDebounce';

const VisuallyHiddenInput = (props) => (
    <input {...props} className="sr-only" />
);

const getImageUrl = (image) => {
    if (!image) return '';
    if (
        typeof image === 'string' &&
        (image.startsWith('http://') || image.startsWith('https://'))
    ) {
        return image;
    }
    return `${import.meta.env.VITE_URL_IMAGE}/uploads/products/${image}`;
};

function AddProduct({ dataOneProduct, setTypeBack, setDataOneProduct }) {
    const [images, setImages] = useState([]); // File mới chọn
    const [previewImages, setPreviewImages] = useState([]); // Ảnh hiển thị UI

    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [discount, setDiscount] = useState(0); // THÊM STATE DISCOUNT DÀNH CHO BẮT BUỘC BACKEND
    const [quantity, setQuantity] = useState('');
    const [description, setDescription] = useState('');

    const [company, setCompany] = useState('');
    const [publicationDate, setPublicationDate] = useState('');
    const [type, setType] = useState(1);
    const [size, setSize] = useState('');
    const [page, setPage] = useState('');
    const [publishingHouse, setPublishingHouse] = useState('');

    const [valueCategory, setValueCategory] = useState('');
    const [selectCategory, setSelectCategory] = useState(null);
    const [dataCategory, setDataCategory] = useState([]);

    const valueSearchCategory = useDebounce(valueCategory, 500);

    // Fetch Danh mục
    const fetchData = async () => {
        try {
            const res = await listCategory(valueSearchCategory);
            const categories = Array.isArray(res)
                ? res
                : Array.isArray(res?.data)
                ? res.data
                : Array.isArray(res?.metadata)
                ? res.metadata
                : [];
            setDataCategory(categories);
        } catch (error) {
            console.error('Lỗi lấy danh mục:', error);
            setDataCategory([]);
        }
    };

    useEffect(() => {
        fetchData();
    }, [valueSearchCategory]);

    // Chọn ảnh mới
    const handleFileChange = (event) => {
        const files = Array.from(event.target.files || []);
        if (files.length === 0) return;

        setImages((prev) => [...prev, ...files]);

        const newPreviewUrls = files.map((file) => ({
            url: URL.createObjectURL(file),
            file: file,
            isNew: true,
        }));

        setPreviewImages((prev) => [...prev, ...newPreviewUrls]);
    };

    // Xóa ảnh khỏi danh sách xem trước
    const handleRemoveImage = (indexToRemove) => {
        const imageToRemove = previewImages[indexToRemove];

        if (imageToRemove.isNew) {
            setImages((prev) => prev.filter((f) => f !== imageToRemove.file));
        }

        setPreviewImages((prev) => prev.filter((_, index) => index !== indexToRemove));
    };

    // Load data khi Sửa
    useEffect(() => {
        if (!dataOneProduct?._id && !dataOneProduct?.id) {
            setName('');
            setPrice('');
            setDiscount(0);
            setQuantity('');
            setDescription('');
            setCompany('');
            setPublicationDate('');
            setType(1);
            setSize('');
            setPage('');
            setPublishingHouse('');
            setImages([]);
            setPreviewImages([]);
            setSelectCategory(null);
            return;
        }

        setName(dataOneProduct?.nameProduct ?? dataOneProduct?.name ?? '');
        setPrice(dataOneProduct?.priceProduct ?? dataOneProduct?.price ?? '');
        setDiscount(dataOneProduct?.discountProduct ?? 0);
        setQuantity(dataOneProduct?.stockProduct ?? dataOneProduct?.quantity ?? '');
        setDescription(dataOneProduct?.descriptionProduct ?? dataOneProduct?.description ?? '');

        const metadata = dataOneProduct?.metadata || {};
        setCompany(metadata?.company ?? '');
        setPublicationDate(metadata?.publicationDate ?? '');
        setType(metadata?.type ?? 1);
        setSize(metadata?.size ?? '');
        setPage(metadata?.page ?? '');
        setPublishingHouse(metadata?.publishingHouse ?? '');

        const categoryObj = dataOneProduct?.categoryProduct;
        if (typeof categoryObj === 'object' && categoryObj !== null) {
            setSelectCategory(categoryObj);
        } else if (categoryObj) {
            const found = dataCategory.find((c) => c._id === categoryObj);
            setSelectCategory(found || { _id: categoryObj, nameCategory: '' });
        }

        const oldImages = dataOneProduct?.imagesProduct || dataOneProduct?.images || [];
        if (Array.isArray(oldImages)) {
            const imageUrls = oldImages.map((image) => {
                const rawUrl = typeof image === 'object' ? (image?.url || image?.path || image?.filename || '') : image;
                return {
                    url: getImageUrl(rawUrl),
                    raw: rawUrl,
                    isNew: false,
                };
            }).filter((item) => !!item.url);

            setPreviewImages(imageUrls);
            setImages([]);
        }
    }, [dataOneProduct]);

    // Thêm sản phẩm
    const handleAddProduct = async () => {
        try {
            if (!name.trim()) return toast.error('Vui lòng nhập tên sản phẩm');
            if (!price) return toast.error('Vui lòng nhập giá sản phẩm');
            if (!quantity) return toast.error('Vui lòng nhập số lượng');
            if (!description.trim()) return toast.error('Vui lòng nhập mô tả');
            if (!selectCategory?._id) return toast.error('Vui lòng chọn danh mục');
            if (images.length === 0) return toast.error('Vui lòng chọn ít nhất một ảnh');

            const metadata = { company, publicationDate, type, size, page, publishingHouse };
            const formData = new FormData();

            formData.append('nameProduct', name.trim());
            formData.append('priceProduct', price);
            
            // QUAN TRỌNG: Gửi discountProduct (Backend yêu cầu bắt buộc)
            formData.append('discountProduct', discount !== '' ? discount : 0);
            
            formData.append('stockProduct', quantity);
            formData.append('descriptionProduct', description);
            formData.append('categoryProduct', selectCategory._id);
            formData.append('metadata', JSON.stringify(metadata));

            images.forEach((image) => formData.append('imagesProduct', image));

            const res = await createProduct(formData);
            toast.success(res?.message || 'Thêm sản phẩm thành công');

            // Reset
            setName('');
            setPrice('');
            setDiscount(0);
            setQuantity('');
            setDescription('');
            setCompany('');
            setPublicationDate('');
            setType(1);
            setSize('');
            setPage('');
            setPublishingHouse('');
            setImages([]);
            setPreviewImages([]);
            setSelectCategory(null);
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
        }
    };

    // Cập nhật sản phẩm
    const handleEditProduct = async () => {
        try {
            const productId = dataOneProduct?._id || dataOneProduct?.id;
            if (!productId) return toast.error('Không tìm thấy ID sản phẩm');
            if (!name.trim()) return toast.error('Vui lòng nhập tên sản phẩm');
            if (!price) return toast.error('Vui lòng nhập giá sản phẩm');
            if (!quantity) return toast.error('Vui lòng nhập số lượng');
            if (!selectCategory?._id) return toast.error('Vui lòng chọn danh mục');

            const metadata = { company, publicationDate, type, size, page, publishingHouse };
            const formData = new FormData();

            formData.append('id', productId);
            formData.append('nameProduct', name.trim());
            formData.append('priceProduct', price);
            
            // QUAN TRỌNG: Gửi discountProduct & oldImagesProduct (Backend updateProduct yêu cầu bắt buộc)
            formData.append('discountProduct', discount !== '' ? discount : 0);

            const oldImagesToKeep = previewImages
                .filter((item) => !item.isNew)
                .map((item) => item.raw);
            formData.append('oldImagesProduct', JSON.stringify(oldImagesToKeep));

            formData.append('stockProduct', quantity);
            formData.append('descriptionProduct', description);
            formData.append('categoryProduct', selectCategory._id);
            formData.append('metadata', JSON.stringify(metadata));

            images.forEach((image) => {
                if (image instanceof File) formData.append('imagesProduct', image);
            });

            const res = await updateProduct(formData);
            toast.success(res?.message || 'Cập nhật sản phẩm thành công');

            setDataOneProduct({});
            setTypeBack(0);
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
        }
    };

    const isEditMode = Boolean(dataOneProduct?._id || dataOneProduct?.id);

    return (
        <div className="w-full p-4 md:p-6 text-gray-800">
            <ToastContainer />
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.6fr)_minmax(300px,1fr)] gap-6 items-start">
                
                {/* FORM INPUT */}
                <div className="min-w-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <TextField
                            label="Tên sản phẩm *"
                            variant="outlined"
                            onChange={(e) => setName(e.target.value)}
                            value={name}
                            fullWidth
                        />

                        <TextField
                            label="Giá sản phẩm *"
                            variant="outlined"
                            type="number"
                            onChange={(e) => setPrice(e.target.value)}
                            value={price}
                            fullWidth
                        />

                        <TextField
                            label="Giảm giá (%) *"
                            variant="outlined"
                            type="number"
                            onChange={(e) => setDiscount(e.target.value)}
                            value={discount}
                            fullWidth
                        />

                        <TextField
                            label="Số lượng sản phẩm *"
                            variant="outlined"
                            type="number"
                            onChange={(e) => setQuantity(e.target.value)}
                            value={quantity}
                            fullWidth
                        />

                        <TextField
                            label="Công ty phát hành"
                            variant="outlined"
                            onChange={(e) => setCompany(e.target.value)}
                            value={company}
                            fullWidth
                        />

                       <TextField
    variant="outlined"
    label="Ngày xuất bản"
    type="date"
    slotProps={{
        inputLabel: {
            shrink: true,
        },
    }}
    onChange={(e) => setPublicationDate(e.target.value)}
    value={publicationDate}
    fullWidth
/>

                        <FormControl fullWidth>
                            <InputLabel id="type-label">Loại bìa</InputLabel>
                            <Select
                                labelId="type-label"
                                label="Loại bìa"
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                            >
                                <MenuItem value={1}>Bìa cứng</MenuItem>
                                <MenuItem value={2}>Bìa mềm</MenuItem>
                            </Select>
                        </FormControl>

                        <TextField
                            label="Kích thước"
                            variant="outlined"
                            onChange={(e) => setSize(e.target.value)}
                            value={size}
                            fullWidth
                        />

                        <TextField
                            label="Số trang"
                            variant="outlined"
                            type="number"
                            onChange={(e) => setPage(e.target.value)}
                            value={page}
                            fullWidth
                        />

                        <TextField
                            label="Nhà xuất bản"
                            variant="outlined"
                            onChange={(e) => setPublishingHouse(e.target.value)}
                            value={publishingHouse}
                            fullWidth
                        />

                        {/* Danh mục */}
                        <Autocomplete
                            disablePortal
                            options={dataCategory}
                            getOptionLabel={(option) => option?.nameCategory || ''}
                            value={selectCategory}
                            onChange={(event, newValue) => setSelectCategory(newValue)}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Danh mục *"
                                    onChange={(e) => setValueCategory(e.target.value)}
                                />
                            )}
                            fullWidth
                        />
                    </div>

                    {/* Editor Mô tả */}
                    <div className="mt-6 w-full min-w-0">
                        <Editor
                            apiKey="hfm046cu8943idr5fja0r5l2vzk9l8vkj5cp3hx2ka26l84x"
                            init={{
                                height: 350,
                                plugins: 'anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount',
                                toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | align lineheight | numlist bullist indent outdent | emoticons charmap | removeformat',
                            }}
                            onEditorChange={(content) => setDescription(content)}
                            value={description}
                        />
                    </div>
                </div>

                {/* ẢNH */}
                <div className="w-full min-w-0 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <h3 className="text-md font-semibold mb-3">Hình ảnh sản phẩm</h3>
                    
                    {previewImages.length > 0 ? (
                        <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto p-1">
                            {previewImages.map((img, index) => (
                                <div key={index} className="relative group rounded-lg border border-gray-200 p-1 bg-gray-50">
                                    <img
                                        src={img.url}
                                        alt={`Product ${index + 1}`}
                                        className="h-32 w-full rounded-lg object-contain"
                                    />
                                    <IconButton
                                        size="small"
                                        color="error"
                                        onClick={() => handleRemoveImage(index)}
                                        className="!absolute top-1 right-1 !bg-white/80 hover:!bg-white shadow"
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex h-48 items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 text-gray-400">
                            Chưa chọn ảnh nào
                        </div>
                    )}

                    <Button
                        component="label"
                        variant="outlined"
                        fullWidth
                        sx={{ mt: 2 }}
                        startIcon={<CloudUploadIcon />}
                    >
                        Tải ảnh lên
                        <VisuallyHiddenInput
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            multiple
                        />
                    </Button>
                </div>
            </div>

            {/* BUTTON SUBMIT */}
            <Button
                fullWidth
                variant="contained"
                size="large"
                sx={{ mt: 4 }}
                onClick={isEditMode ? handleEditProduct : handleAddProduct}
            >
                {isEditMode ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm'}
            </Button>
        </div>
    );
}

export default AddProduct;