
import { useState, useEffect } from 'react';
import { Editor } from '@tinymce/tinymce-react';

import TextField from '@mui/material/TextField';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Button from '@mui/material/Button';

import useAutoSave from '../../../../../../hooks/useAutoSave';
import { requestCreateBlog } from '../../../../../../config/blogRequest';

import { toast } from 'react-toastify';

function AddBlog() {
    const [valueText, setValueText] = useState('');
    const [nameBlog, setNameBlog] = useState('');
    const [img, setImg] = useState(null);
    const [previewImg, setPreviewImg] = useState(null);

    // Tự động lưu nội dung sau 1 giây
    const savedData = useAutoSave(valueText, 1000);

    // Giải phóng URL ảnh preview khi thay ảnh hoặc unmount
    useEffect(() => {
        return () => {
            if (previewImg) {
                URL.revokeObjectURL(previewImg);
            }
        };
    }, [previewImg]);

    const handleEditorChange = (newText) => {
        setValueText(newText);
    };

    // Chọn ảnh
    const handleImageChange = (event) => {
        const file = event.target.files?.[0];

        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Vui lòng chọn file hình ảnh!');
            return;
        }

        setImg(file);
        setPreviewImg(URL.createObjectURL(file));
    };

    // Tạo bài viết
    const handleCreateBlog = async () => {
        try {
            if (!nameBlog.trim()) {
                toast.warning('Vui lòng nhập tiêu đề bài viết!');
                return;
            }

            if (!img) {
                toast.warning('Vui lòng chọn ảnh bài viết!');
                return;
            }

            if (!savedData || savedData === '<p></p>') {
                toast.warning('Vui lòng nhập nội dung bài viết!');
                return;
            }

            const formData = new FormData();

            formData.append('content', valueText);
            formData.append('nameBlog', nameBlog.trim());
            formData.append('image', img);

            const res = await requestCreateBlog(formData);

            toast.success(res.message || 'Tạo bài viết thành công!');

            setValueText('');
            setNameBlog('');
            setImg(null);
            setPreviewImg(null);
        } catch (error) {
            toast.error(
                error?.response?.data?.message ||
                'Có lỗi xảy ra khi tạo bài viết!'
            );
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">

            {/* CONTAINER */}
            <div className="mx-auto max-w-7xl">

                {/* HEADER */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">
                        Thêm bài viết
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Tạo nội dung bài viết mới cho Bookstore.com
                    </p>
                </div>

                {/* MAIN CONTENT */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

                    {/* LEFT - EDITOR */}
                    <div className="rounded-xl bg-white p-4 shadow-sm md:p-6">

                        <h2 className="mb-5 border-b border-gray-100 pb-3 text-lg font-semibold text-gray-800">
                            Nội dung bài viết
                        </h2>

                        {/* IMAGE UPLOAD */}
                        <div className="mb-6">

                            <label className="mb-2 block text-sm font-semibold text-gray-700">
                                Ảnh bài viết
                            </label>

                            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-5 transition hover:border-[#c92127]">

                                {previewImg ? (
                                    <div className="mb-4 w-full">
                                        <img
                                            src={previewImg}
                                            alt="Preview bài viết"
                                            className="mx-auto max-h-64 w-full rounded-lg object-contain"
                                        />
                                    </div>
                                ) : (
                                    <div className="mb-4 flex flex-col items-center text-gray-400">
                                        <CloudUploadIcon
                                            sx={{ fontSize: 48 }}
                                        />

                                        <p className="mt-2 text-sm">
                                            Chưa có ảnh bài viết
                                        </p>
                                    </div>
                                )}

                                <Button
                                    component="label"
                                    variant="contained"
                                    startIcon={<CloudUploadIcon />}
                                    sx={{
                                        backgroundColor: '#c92127',
                                        '&:hover': {
                                            backgroundColor: '#a71920',
                                        },
                                        textTransform: 'none',
                                    }}
                                >
                                    {previewImg ? 'Thay đổi ảnh' : 'Chọn ảnh bài viết'}

                                    <input
                                        type="file"
                                        accept="image/*"
                                        hidden
                                        onChange={handleImageChange}
                                    />
                                </Button>

                                <p className="mt-2 text-xs text-gray-400">
                                    Chỉ chọn một hình ảnh
                                </p>
                            </div>
                        </div>

                        {/* BLOG TITLE */}
                        <div className="mb-6">
                            <TextField
                                value={nameBlog}
                                onChange={(e) => setNameBlog(e.target.value)}
                                fullWidth
                                label="Tiêu đề bài viết"
                                variant="outlined"
                                placeholder="Nhập tiêu đề bài viết..."
                            />
                        </div>

                        {/* TINYMCE EDITOR */}
                        <div className="mb-4">

                            <label className="mb-2 block text-sm font-semibold text-gray-700">
                                Nội dung
                            </label>

                            <Editor
                                value={valueText}
                                onEditorChange={handleEditorChange}
                                apiKey="hfm046cu8943idr5fja0r5l2vzk9l8vkj5cp3hx2ka26l84x"
                                init={{
                                    height: 500,
                                    menubar: true,
                                    plugins:
                                        'anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount',
                                    toolbar:
                                        'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | align lineheight | numlist bullist indent outdent | emoticons charmap | removeformat',
                                    content_style:
                                        'body { font-family:Arial,sans-serif; font-size:14px }',
                                }}
                            />
                        </div>

                    </div>

                    {/* RIGHT - PREVIEW */}
                    <div className="rounded-xl bg-white p-4 shadow-sm md:p-6">

                        <div className="mb-5 flex items-center justify-between border-b border-gray-100 pb-3">
                            <h2 className="text-lg font-semibold text-gray-800">
                                Xem trước bài viết
                            </h2>

                            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
                                Preview
                            </span>
                        </div>

                        {/* PREVIEW IMAGE */}
                        {previewImg && (
                            <div className="mb-5 overflow-hidden rounded-lg">
                                <img
                                    src={previewImg}
                                    alt="Ảnh bài viết"
                                    className="max-h-72 w-full object-cover"
                                />
                            </div>
                        )}

                        {/* PREVIEW TITLE */}
                        <h2 className="mb-4 text-xl font-bold text-gray-800">
                            {nameBlog || 'Tiêu đề bài viết'}
                        </h2>

                        {/* PREVIEW CONTENT */}
                        <div
                            className="prose prose-sm max-w-none break-words text-gray-700"
                            dangerouslySetInnerHTML={{
                                __html: valueText || '<p>Nội dung bài viết sẽ hiển thị ở đây...</p>',
                            }}
                        />

                    </div>

                </div>

                {/* SAVE BUTTON */}
                <div className="mt-6 flex justify-end">

                    <Button
                        onClick={handleCreateBlog}
                        fullWidth
                        variant="contained"
                        sx={{
                            maxWidth: {
                                xs: '100%',
                                sm: '250px',
                            },
                            padding: '12px 24px',
                            backgroundColor: '#c92127',
                            fontWeight: 600,
                            textTransform: 'none',
                            '&:hover': {
                                backgroundColor: '#a71920',
                            },
                        }}
                    >
                        Lưu bài viết
                    </Button>

                </div>

            </div>
        </div>
    );
}

export default AddBlog;
