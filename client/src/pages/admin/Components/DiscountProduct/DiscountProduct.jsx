import { useCallback, useEffect, useState } from "react";
import { Button, DatePicker, InputNumber, Table, Popconfirm } from "antd";
import { ToastContainer, toast } from "react-toastify";
import { listProducts } from "../../../../config/productRequest";
import { getFlashSale, createFlashSale, deleteFlashSale } from "../../../../config/flashSaleRequest";

const money = (n) => Number(n).toLocaleString("vi-VN") + " đ";

export default function DiscountProduct() {
  const [all, setAll] = useState([]);
  const [running, setRunning] = useState([]);
  const [selected, setSelected] = useState([]);
  const [discount, setDiscount] = useState(20);
  const [dateEnd, setDateEnd] = useState(null);

  const load = useCallback(async () => {
    const [p, f] = await Promise.all([listProducts(), getFlashSale()]);
    setAll(p.metadata || []);
    setRunning(f.metadata || []);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    try {
      const res = await createFlashSale({
        productIds: selected,
        discount,
        dateEnd: dateEnd?.toISOString(),
      });
      toast.success(res.message);
      setSelected([]);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await deleteFlashSale(id);
      toast.success(res.message);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  return (
    <section className="w-full space-y-6">
      <ToastContainer position="top-right" autoClose={3000} />
      <h1 className="text-2xl font-semibold">Quản lý Flash Sale</h1>

      {/* Tạo mới */}
      <div className="space-y-3 rounded-lg bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <InputNumber min={1} max={99} value={discount} onChange={setDiscount} addonAfter="%" />
          <DatePicker showTime value={dateEnd} onChange={setDateEnd} placeholder="Thời gian kết thúc" />
          <Button
            type="primary"
            disabled={!selected.length || !dateEnd || !discount}
            onClick={handleCreate}
          >
            Tạo flash sale ({selected.length} sách)
          </Button>
        </div>
        <Table
          size="small"
          rowKey="_id"
          dataSource={all}
          pagination={{ pageSize: 8 }}
          rowSelection={{ selectedRowKeys: selected, onChange: setSelected }}
          columns={[
            { title: "Tên sách", dataIndex: "nameProduct" },
            { title: "Giá gốc", dataIndex: "priceProduct", render: money },
            { title: "Tồn kho", dataIndex: "stockProduct" },
          ]}
        />
      </div>

      {/* Đang chạy */}
      <div className="rounded-lg bg-white p-4 shadow-sm">
        <h2 className="mb-3 font-semibold">Đang flash sale</h2>
        <Table
          size="small"
          rowKey="_id"
          dataSource={running}
          pagination={false}
          columns={[
            { title: "Tên sách", dataIndex: "nameProduct" },
            { title: "Giá gốc", dataIndex: "priceProduct", render: money },
            { title: "Giảm", dataIndex: "discountProduct", render: (v) => `${v}%` },
            { title: "Giá flash sale", dataIndex: "finalPrice", render: money },
            { title: "Kết thúc", dataIndex: "dateEnd", render: (v) => new Date(v).toLocaleString("vi-VN") },
            {
              title: "",
              render: (_, r) => (
                <Popconfirm title="Gỡ khỏi flash sale?" onConfirm={() => handleDelete(r._id)}>
                  <Button danger size="small">Gỡ</Button>
                </Popconfirm>
              ),
            },
          ]}
        />
      </div>
    </section>
  );
}