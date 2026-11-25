import request from "./request";
const apiProduct = "/api/product";
export const listProducts = async () => {
  const res = await request.get(`${apiProduct}/list`);
  return res.data;
};
export const productDetail = async (idProduct) => {
  const res = await request.get(`${apiProduct}/detail/${idProduct}`);
  return res.data;
};
// Thêm sản phẩm
export const createProduct = async (formData) => {
const res = await request.post(`${apiProduct}/create`, formData);
return res.data;
};

// Cập nhật sản phẩm
export const updateProduct = async (idProduct, formData) => {
    const res = await request.put(`${apiProduct}/update/${idProduct}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return res.data;
};

// Xóa sản phẩm
export const deleteProduct = async (idProduct) => {
const res = await request.delete(`${apiProduct}/delete/${idProduct}`);
return res.data;};

// Lấy danh sách sản phẩm theo danh mục
export const getProductsByCategory = async (idCategory) => {
const res = await request.get(`${apiProduct}/list/${idCategory}`);
return res.data;
};
export const searchProducts = async (params, signal) => {
  const res = await request.get(`${apiProduct}/search`, { params, signal });
  return res.data; // dữ liệu nằm ở res.data.metadata
};
export const getBestSeller = async (categoryId) => {
  const res = await request.get(`${apiProduct}/best-seller`, {
    params: { category: categoryId || undefined, limit: 5 },
  });
  return res.data;
};
// Xóa nhiều sản phẩm (ids: mảng _id)
export const deleteManyProducts = async (ids) => {
  const res = await request.post(`${apiProduct}/delete-many`, { ids });
  return res.data;
};
export const exportProducts = async (format) => {
  const res = await request.get(`${apiProduct}/export`, {
    params: { format },
    responseType: "blob",
  });
  return res.data;
};

export const downloadImportTemplate = async (format) => {
  const res = await request.get(`${apiProduct}/import-template`, {
    params: { format },
    responseType: "blob",
  });
  return res.data;
};

export const importProducts = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await request.post(`${apiProduct}/import`, formData, { timeout: 120000 });
  return res.data;
};
export const listProductsAdmin = async (params) => {
  const res = await request.get(`${apiProduct}/admin/list`, { params });
  return res.data;
};