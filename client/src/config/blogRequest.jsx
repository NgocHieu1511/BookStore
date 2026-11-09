
import request from "./request";

const apiBlog = "/api/blogs";

// Tạo bài viết
export const requestCreateBlog = async (data) => {
    const res = await request.post(
        `${apiBlog}/create`,
        data
    );

    return res.data;
};

// Lấy danh sách bài viết
export const requestGetBlogs = async () => {
    const res = await request.get(
        `${apiBlog}/list`
    );

    return res.data;
};

// Lấy chi tiết một bài viết
export const requestGetOneBlog = async (params) => {
    const res = await request.get(
        `${apiBlog}/get-one-blog`,
        { params }
    );

    return res.data;
};

// Xóa bài viết
export const requestDeleteBlog = async (idBlog) => {
    const res = await request.delete(
        `${apiBlog}/delete`,
        {
            params: {
                idBlog
            }
        }
    );

    return res.data;
};
