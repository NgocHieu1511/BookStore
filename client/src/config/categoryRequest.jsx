
import request from "./request";

const apiCategory = "/api/category";

// Lấy danh sách danh mục
export const listCategory = async () => {
  const res = await request.get(`${apiCategory}/list`);
  return res.data;
};

// Thêm danh mục
export const createCategory = async (formData) => {
  const res = await request.post(
    `${apiCategory}/create`,
    formData
  );
  return res.data;
};

// Cập nhật danh mục
export const updateCategory = async (id, formData) => {
  const res = await request.put(
    `${apiCategory}/update/${id}`,
    formData
  );
  return res.data;
};

// Xóa danh mục
export const deleteCategory = async (id) => {
  const res = await request.delete(
    `${apiCategory}/delete/${id}`
  );
  return res.data;
};