import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle,
  MenuItem, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TextField,
} from "@mui/material";
import { Eye, EyeOff, MessageSquareReply, Search, Trash2 } from "lucide-react";
import { toast } from "react-toastify";

import {
  getAllFeedback, hideFeedback, replyFeedback, deleteFeedback,
} from "../../../../config/feedbackRequest";
import PaginationPage from "../../../../components/Pagination/Pagination";

const LIMIT = 10;

// Các class Tailwind dùng chung cho button
const BTN_BASE =
  "inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg font-medium " +
  "transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 " +
  "active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100";

const BTN = {
  primary: `${BTN_BASE} bg-indigo-600 px-4 py-2 text-sm text-white shadow-sm hover:bg-indigo-700 focus-visible:ring-indigo-500`,
  secondary: `${BTN_BASE} border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 focus-visible:ring-gray-400`,
  reply: `${BTN_BASE} bg-indigo-50 px-3 py-1.5 text-xs text-indigo-700 hover:bg-indigo-100 focus-visible:ring-indigo-400`,
  hide: `${BTN_BASE} bg-amber-50 px-3 py-1.5 text-xs text-amber-700 hover:bg-amber-100 focus-visible:ring-amber-400`,
  show: `${BTN_BASE} bg-emerald-50 px-3 py-1.5 text-xs text-emerald-700 hover:bg-emerald-100 focus-visible:ring-emerald-400`,
  danger: `${BTN_BASE} bg-rose-50 px-3 py-1.5 text-xs text-rose-700 hover:bg-rose-100 focus-visible:ring-rose-400`,
};

function Feedback() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get("page"), 10) || 1;
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({ rating: "", isHidden: "", replied: "" });
  const [keyword, setKeyword] = useState(""); // nội dung đang gõ
  const [search, setSearch] = useState("");   // nội dung đã áp dụng khi bấm Tìm

  const [replyTarget, setReplyTarget] = useState(null);
  const [replyText, setReplyText] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      // bỏ các filter rỗng để không gửi ?rating=&replied=
      const params = Object.fromEntries(
        Object.entries({ page, limit: LIMIT, search, ...filters }).filter(([, v]) => v !== ""),
      );
      const res = await getAllFeedback(params);
      setItems(res.metadata.feedbacks);
      setTotalPages(res.metadata.pagination.totalPages || 1);
    } catch (err) {
      toast.error(err.response?.data?.message || "Không thể tải danh sách đánh giá");
    } finally {
      setLoading(false);
    }
  }, [page, search, filters]);

  useEffect(() => {
    document.title = "Quản lý đánh giá";
    fetchData();
  }, [fetchData]);

const resetPage = () => {
  const next = new URLSearchParams(searchParams);
  next.delete("page");
  setSearchParams(next);
};

const changeFilter = (key) => (e) => {
  resetPage();
  setFilters((prev) => ({ ...prev, [key]: e.target.value }));
};

const handleSearch = () => {
  resetPage();
  setSearch(keyword.trim());
};

  const handleToggleHide = async (item) => {
    try {
      const res = await hideFeedback(item._id, !item.isHidden);
      toast.success(res.message);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Thao tác thất bại");
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm("Xóa vĩnh viễn đánh giá này? Nếu chỉ muốn che, hãy dùng nút Ẩn.")) return;
    try {
      const res = await deleteFeedback(item._id);
      toast.success(res.message);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Xóa thất bại");
    }
  };

  const openReply = (item) => {
    setReplyTarget(item);
    setReplyText(item.adminReply?.content || "");
  };

  const submitReply = async () => {
    try {
      const res = await replyFeedback(replyTarget._id, replyText);
      toast.success(res.message);
      setReplyTarget(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gửi phản hồi thất bại");
    }
  };




  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <h1 className="text-2xl font-bold text-gray-800">Quản lý đánh giá</h1>
      <p className="mb-5 mt-1 text-sm text-gray-500">
        Xem, trả lời, ẩn hoặc xóa đánh giá của khách hàng
      </p>

      {/* Bộ lọc */}
      <div className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-white p-4">
        <TextField
          size="small"
          label="Tìm theo nội dung"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <button type="button" onClick={handleSearch} className={BTN.primary}>
          <Search size={16} />
          Tìm
        </button>

        <TextField select size="small" label="Số sao" value={filters.rating}
          onChange={changeFilter("rating")} sx={{ minWidth: 120 }}>
          <MenuItem value="">Tất cả</MenuItem>
          {[5, 4, 3, 2, 1].map((s) => (
            <MenuItem key={s} value={String(s)}>{s} sao</MenuItem>
          ))}
        </TextField>

        <TextField select size="small" label="Hiển thị" value={filters.isHidden}
          onChange={changeFilter("isHidden")} sx={{ minWidth: 130 }}>
          <MenuItem value="">Tất cả</MenuItem>
          <MenuItem value="false">Đang hiện</MenuItem>
          <MenuItem value="true">Đã ẩn</MenuItem>
        </TextField>

        <TextField select size="small" label="Phản hồi" value={filters.replied}
          onChange={changeFilter("replied")} sx={{ minWidth: 150 }}>
          <MenuItem value="">Tất cả</MenuItem>
          <MenuItem value="false">Chưa trả lời</MenuItem>
          <MenuItem value="true">Đã trả lời</MenuItem>
        </TextField>
      </div>

      {/* Bảng */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex justify-center p-10"><CircularProgress /></div>
        ) : items.length === 0 ? (
          <p className="p-10 text-center text-gray-500">Không có đánh giá nào</p>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Khách hàng</TableCell>
                  <TableCell>Sản phẩm</TableCell>
                  <TableCell>Nội dung</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell align="right">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item._id} hover>
                    <TableCell>
                      <p className="font-medium">{item.userId?.fullName || "Đã xóa tài khoản"}</p>
                      <p className="text-xs text-gray-500">{item.userId?.email}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(item.createdAt).toLocaleDateString("vi-VN")}
                      </p>
                    </TableCell>

                    <TableCell sx={{ maxWidth: 200 }}>
                      <div className="flex items-center gap-2">
                        {item.productId?.imagesProduct?.[0] && (
                          <img src={item.productId.imagesProduct[0]} alt=""
                            className="h-12 w-9 rounded object-cover" />
                        )}
                        <span className="line-clamp-2 text-sm">
                          {item.productId?.nameProduct || "Sản phẩm đã bị xóa"}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell sx={{ maxWidth: 320 }}>
                      <div className="text-yellow-400">
                        {"★".repeat(item.rating)}{"☆".repeat(5 - item.rating)}
                      </div>
                      <p className="text-sm">{item.content}</p>
                      {item.imagesFeedback?.length > 0 && (
                        <div className="mt-2 flex gap-1">
                          {item.imagesFeedback.map((url) => (
                            <a key={url} href={url} target="_blank" rel="noreferrer">
                              <img src={url} alt="" className="h-12 w-12 rounded object-cover" />
                            </a>
                          ))}
                        </div>
                      )}
                      {item.adminReply?.content && (
                        <p className="mt-2 rounded bg-blue-50 p-2 text-sm text-blue-800">
                          <b>Shop:</b> {item.adminReply.content}
                        </p>
                      )}
                    </TableCell>

                    <TableCell>
                      <Chip size="small" label={item.isHidden ? "Đã ẩn" : "Đang hiện"}
                        color={item.isHidden ? "default" : "success"} />
                    </TableCell>

                    <TableCell align="right">
                      <div className="flex flex-wrap justify-end gap-2">
                        <button type="button" onClick={() => openReply(item)} className={BTN.reply}>
                          <MessageSquareReply size={14} />
                          {item.adminReply?.content ? "Sửa trả lời" : "Trả lời"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleHide(item)}
                          className={item.isHidden ? BTN.show : BTN.hide}
                        >
                          {item.isHidden ? <Eye size={14} /> : <EyeOff size={14} />}
                          {item.isHidden ? "Hiện" : "Ẩn"}
                        </button>
                        <button type="button" onClick={() => handleDelete(item)} className={BTN.danger}>
                          <Trash2 size={14} />
                          Xóa
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </div>

      {totalPages > 1 && <PaginationPage totalPages={totalPages} />}

      {/* Hộp thoại trả lời */}
      <Dialog open={!!replyTarget} onClose={() => setReplyTarget(null)} fullWidth maxWidth="sm">
        <DialogTitle>Phản hồi đánh giá</DialogTitle>
        <DialogContent>
          <p className="mb-3 rounded bg-gray-50 p-3 text-sm text-gray-600">
            {replyTarget?.content}
          </p>
          <TextField
            autoFocus fullWidth multiline minRows={3}
            label="Nội dung phản hồi"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            helperText={`${replyText.length}/300`}
            slotProps={{ htmlInput: { maxLength: 300 } }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <button type="button" onClick={() => setReplyTarget(null)} className={BTN.secondary}>
            Hủy
          </button>
          <button
            type="button"
            onClick={submitReply}
            disabled={!replyText.trim()}
            className={BTN.primary}
          >
            Gửi phản hồi
          </button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default Feedback;