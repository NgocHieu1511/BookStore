import { useRef, useState } from "react";
import { Download, FileDown, FileUp } from "lucide-react";
import { toast } from "react-toastify";

import {
  exportProducts, importProducts, downloadImportTemplate,
} from "../../../../config/productRequest";
import { downloadBlob } from "../../../../utils/downloadFile";

const BTN =
  "inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium " +
  "transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-50";

function ImportExport({ onImported }) {
  const [format, setFormat] = useState("xlsx");
  const [busy, setBusy] = useState(false);
  const [report, setReport] = useState(null);
  const fileRef = useRef(null);

  const run = async (task, errorMessage) => {
    try {
      setBusy(true);
      await task();
    } catch (err) {
      toast.error(err.response?.data?.message || errorMessage);
    } finally {
      setBusy(false);
    }
  };

  const handleExport = () =>
    run(async () => {
      downloadBlob(await exportProducts(format), `products.${format}`);
    }, "Xuất dữ liệu thất bại");

  const handleTemplate = () =>
    run(async () => {
      downloadBlob(await downloadImportTemplate(format), `products-template.${format}`);
    }, "Tải file mẫu thất bại");

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // cho phép chọn lại cùng 1 file
    if (!file) return;

    run(async () => {
      const res = await importProducts(file);
      const { inserted, total, failed } = res.metadata;
      setReport(res.metadata);
      if (failed.length === 0) toast.success(`Đã nhập ${inserted}/${total} sản phẩm`);
      else toast.warning(`Nhập ${inserted}/${total} sản phẩm, ${failed.length} dòng lỗi`);
      if (inserted > 0) onImported?.();
    }, "Nhập dữ liệu thất bại");
  };

  return (
    <div className="mb-4">
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={format}
          onChange={(e) => setFormat(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        >
          <option value="xlsx">Excel (.xlsx)</option>
          <option value="csv">CSV (.csv)</option>
          <option value="json">JSON (.json)</option>
          <option value="xml">XML (.xml)</option>
        </select>

        <button type="button" disabled={busy} onClick={handleExport}
          className={`${BTN} bg-emerald-600 text-white hover:bg-emerald-700`}>
          <Download size={16} /> Xuất dữ liệu
        </button>

        <button type="button" disabled={busy} onClick={() => fileRef.current?.click()}
          className={`${BTN} bg-indigo-600 text-white hover:bg-indigo-700`}>
          <FileUp size={16} /> Nhập từ file
        </button>

        <button type="button" disabled={busy} onClick={handleTemplate}
          className={`${BTN} border border-gray-300 bg-white text-gray-700 hover:bg-gray-50`}>
          <FileDown size={16} /> Tải file mẫu
        </button>

        <input ref={fileRef} type="file" accept=".xlsx,.csv,.json,.xml"
          onChange={handleFile} className="hidden" />
        {busy && <span className="text-sm text-gray-500">Đang xử lý...</span>}
      </div>

      {report?.failed?.length > 0 && (
        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm">
          <p className="mb-2 font-medium text-amber-800">
            {report.failed.length} dòng không được nhập:
          </p>
          <ul className="max-h-48 space-y-1 overflow-auto text-amber-900">
            {report.failed.map((f) => (
              <li key={f.row}>
                Dòng {f.row}{f.name ? ` (${f.name})` : ""}: {f.reason}
              </li>
            ))}
          </ul>
          <button type="button" onClick={() => setReport(null)}
            className="mt-2 text-xs text-amber-700 underline">
            Đóng
          </button>
        </div>
      )}
    </div>
  );
}

export default ImportExport;