import React, { useEffect, useMemo, useState } from "react";
import {
  Search, Bell, MessageCircle, Cloud, UserRound, ChevronDown, LayoutDashboard,
  BookOpen, Tags, Truck, Users, TicketPercent, Settings, Download, GripVertical,
  FolderTree, ChevronUp, FolderOpen, Eye, EyeOff, AlertTriangle, CheckCircle2,
  Menu, Store, ToggleRight, X, Edit3, Trash2, PlusSquare, ChevronLeft,
  ChevronRight, Upload, Home, PlusCircle, RefreshCw, BarChart3
} from "lucide-react";

const initialCategories = [
  { id: 1, name: "Sách Trong Nước", slug: "sach-trong-nuoc", level: 1, parent: "", count: 8450, mega: true, home: true, active: true },
  { id: 2, name: "Văn Học", slug: "van-hoc", level: 2, parent: "Sách Trong Nước", count: 2840, mega: true, home: false, active: true },
  { id: 3, name: "Tiểu Thuyết & Truyện Dài", slug: "tieu-thuyet", level: 3, parent: "Văn Học", count: 1420, mega: false, home: false, active: true },
  { id: 4, name: "Kinh Tế & Khởi Nghiệp", slug: "kinh-te-khoi-nghiep", level: 2, parent: "Sách Trong Nước", count: 1950, mega: true, home: true, active: true },
  { id: 5, name: "Foreign Books (Ngoại Văn)", slug: "foreign-books", level: 1, parent: "", count: 3820, mega: true, home: true, active: true },
  { id: 6, name: "Lịch Tết & Quà Xuân", slug: "lich-tet-qua-xuan", level: 1, parent: "", count: 118, mega: false, home: false, active: false }
];

const navItems = [
  [LayoutDashboard, "Tổng quan"], [BookOpen, "Quản lý sản phẩm", "2.4k"],
  [Tags, "Quản lý danh mục", null, true], [Truck, "Quản lý đơn hàng", "18"],
  [Users, "Khách hàng"], [TicketPercent, "Mã giảm giá & Flash Sale"]
];
const fmt = (n) => Number(n || 0).toLocaleString("vi-VN");

export default function CategoryManagement() {
  const [categories, setCategories] = useState(initialCategories);
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("");
  const [status, setStatus] = useState("");
  const [position, setPosition] = useState("");
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [treeOpen, setTreeOpen] = useState(true);
  const [notice, setNotice] = useState("");

  const filtered = useMemo(() => categories.filter((c) => {
    const q = search.trim().toLowerCase();
    const found = !q || [c.name, c.slug, `CAT-${String(c.id).padStart(2, "0")}`].some((v) => v.toLowerCase().includes(q));
    return found && (!level || String(c.level) === level) &&
      (!status || (status === "active" ? c.active : !c.active)) &&
      (!position || (position === "menu" ? c.mega : c.home));
  }), [categories, search, level, status, position]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);
  const activeCount = categories.filter((c) => c.active).length;
  const hiddenCount = categories.length - activeCount;
  const bookCount = categories.reduce((sum, c) => sum + Number(c.count || 0), 0);

  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [page, totalPages]);

  const openCreate = () => { setEditing(null); setDrawerOpen(true); };
  const openEdit = (category) => { setEditing(category); setDrawerOpen(true); };
  const toggleSelected = (id) => setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  const bulkSetActive = (active) => {
    if (!selected.length) return setNotice("Vui lòng chọn ít nhất một danh mục.");
    setCategories((prev) => prev.map((c) => selected.includes(c.id) ? { ...c, active } : c));
    setNotice(`Đã ${active ? "bật hiển thị" : "ẩn"} ${selected.length} danh mục.`);
  };
  const deleteOne = (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa danh mục này?")) return;
    setCategories((prev) => prev.filter((c) => c.id !== id));
    setSelected((prev) => prev.filter((x) => x !== id));
    setNotice("Đã xóa danh mục.");
  };
  const deleteSelected = () => {
    if (!selected.length) return setNotice("Vui lòng chọn danh mục cần xóa.");
    if (!window.confirm(`Xóa ${selected.length} danh mục đã chọn?`)) return;
    setCategories((prev) => prev.filter((c) => !selected.includes(c.id)));
    setSelected([]);
    setNotice("Đã xóa các danh mục đã chọn.");
  };
  const saveCategory = (form) => {
    const parent = form.parent || "";
    const parentCategory = categories.find((c) => c.name === parent);
    const slug = form.slug.trim() || form.name.trim().toLowerCase().normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const data = { id: editing?.id ?? Date.now(), name: form.name.trim(), slug,
      level: parent ? Math.min((parentCategory?.level || 1) + 1, 3) : 1, parent,
      count: editing?.count ?? 0, mega: !!form.mega, home: !!form.home, active: !!form.active };
    setCategories((prev) => editing ? prev.map((c) => c.id === editing.id ? data : c) : [...prev, data]);
    setDrawerOpen(false);
    setNotice(editing ? "Đã cập nhật danh mục." : "Đã thêm danh mục mới.");
  };

  return <div className="min-h-screen bg-[#f8fafb] text-[#191c1d]">
    <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-[#e1e3e4] bg-white max-[850px]:w-[70px]">
      <div className="flex h-16 items-center gap-2 border-b border-[#e1e3e4] px-5 max-[850px]:justify-center max-[850px]:px-2">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#a30014] text-white"><BookOpen size={20}/></div>
        <div className="max-[850px]:hidden"><strong className="block text-[17px] text-[#a30014]">Bookstore.com</strong><small className="text-[10px] font-bold tracking-widest text-[#5c6468]">ADMIN PORTAL</small></div>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-[#5c6468] max-[850px]:hidden">Kinh doanh & Vận hành</p>
        <nav className="space-y-1">{navItems.map(([Icon, label, badge, active]) => <button key={label} type="button" className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-xs max-[850px]:justify-center ${active ? "bg-[#c92127] font-bold text-white" : "text-[#5c6468] hover:bg-[#f2f4f5]"}`}><span className="flex items-center gap-3"><Icon size={19}/><span className="max-[850px]:hidden">{label}</span></span>{badge && <span className="rounded-full bg-[#f2f4f5] px-2 py-0.5 text-[10px] text-[#191c1d] max-[850px]:hidden">{badge}</span>}</button>)}</nav>
        <p className="mb-2 mt-6 px-3 text-[10px] font-bold uppercase tracking-wider text-[#5c6468] max-[850px]:hidden">Phân tích & Cấu hình</p>
        <nav className="space-y-1"><SideButton icon={<BarChart3 size={19}/>} text="Báo cáo doanh thu"/><SideButton icon={<Settings size={19}/>} text="Cài đặt hệ thống"/></nav>
      </div>
      <div className="m-3 flex gap-2 border-t border-[#e1e3e4] pt-3 text-[#a30014] max-[850px]:justify-center"><CheckCircle2 size={19}/><div className="max-[850px]:hidden"><strong className="block text-[11px]">BookStore Admin</strong><small className="text-[10px] text-[#5c6468]">Quản lý cửa hàng</small></div></div>
    </aside>

    <div className="pl-64 max-[850px]:pl-[70px]">
      <header className="fixed left-64 right-0 top-0 z-20 flex h-16 items-center justify-between border-b border-[#e1e3e4] bg-white px-6 max-[850px]:left-[70px] max-[600px]:px-3">
        <div className="flex h-10 w-[380px] items-center gap-2 rounded-lg bg-[#f2f4f5] px-3 max-[600px]:w-[170px]"><Search size={19} className="text-[#5c6468]"/><input className="w-full bg-transparent text-xs outline-none" placeholder="Tìm kiếm danh mục..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}/></div>
        <div className="flex items-center gap-1"><TopButton icon={<Bell size={20}/>} dot/><TopButton icon={<MessageCircle size={20}/>} hideSmall/><TopButton icon={<Cloud size={20}/>} hideSmall/><span className="mx-2 h-6 w-px bg-[#e1e3e4] max-[600px]:hidden"/><div className="flex items-center gap-2"><div className="grid h-8 w-8 place-items-center rounded-full bg-[#a30014] text-white"><UserRound size={18}/></div><div className="max-[850px]:hidden"><strong className="block text-xs">Quản trị viên</strong><small className="block text-[10px] text-[#5c6468]">Admin BookStore</small></div><ChevronDown size={17} className="max-[850px]:hidden"/></div></div>
      </header>

      <main className="px-6 pb-8 pt-[88px] max-[600px]:px-3">
        <div className="mb-6 flex items-end justify-between gap-4 max-[850px]:flex-col max-[850px]:items-start">
          <div><div className="mb-2 flex flex-wrap items-center gap-2 text-[11px] text-[#5c6468]"><Home size={15}/> Trang chủ <span>/</span> Quản trị hệ thống <span>/</span><b className="text-[#191c1d]">Quản lý danh mục</b></div><div className="flex items-center gap-2 max-[600px]:flex-col max-[600px]:items-start"><h1 className="text-[29px] font-bold max-[600px]:text-2xl">Quản Lý Danh Mục Sách</h1><span className="rounded-full bg-[#ffdad6] px-2.5 py-1 text-[10px] font-bold text-[#410003]">Tổng cộng {categories.length} danh mục</span></div><p className="mt-1 text-xs text-[#5c6468]">Theo dõi, phân loại và quản lý danh mục sản phẩm của cửa hàng.</p></div>
          <div className="flex flex-wrap gap-2"><ActionButton icon={<Download size={17}/>} text="Xuất CSV" onClick={() => exportCSV(filtered)}/><ActionButton icon={<RefreshCw size={17}/>} text="Làm mới bộ lọc" onClick={() => { setSearch(""); setLevel(""); setStatus(""); setPosition(""); setPage(1); }}/><button type="button" onClick={openCreate} className="flex h-10 items-center gap-2 rounded-lg bg-[#c92127] px-4 text-xs font-bold text-white hover:bg-[#a30014]"><PlusCircle size={19}/> Thêm danh mục</button></div>
        </div>
        {notice && <div className="mb-4 flex items-center justify-between rounded-lg border border-[#cdebd6] bg-[#effaf2] px-4 py-2.5 text-xs text-[#08733a]"><span>{notice}</span><button type="button" onClick={() => setNotice("")}><X size={15}/></button></div>}

        <div className="mb-[18px] grid grid-cols-4 gap-4 max-[1200px]:grid-cols-2 max-[600px]:grid-cols-1">
          <Stat label="Tổng danh mục" value={categories.length} note="danh mục" text="Tất cả cấp danh mục" icon={<Tags/>}/>
          <Stat label="Đang hiển thị" value={activeCount} note={`${categories.length ? Math.round(activeCount/categories.length*100) : 0}%`} text="Đang công khai" icon={<Eye/>} blue/>
          <Stat label="Đang ẩn" value={hiddenCount} note="tạm khóa" text="Không hiển thị công khai" icon={<EyeOff/>} gray/>
          <Stat label="Sản phẩm phân loại" value={fmt(bookCount)} note="sản phẩm" text="Tổng theo danh mục mẫu" icon={<BookOpen/>}/>
        </div>

        <div className="mb-[22px] flex items-center justify-between gap-4 rounded-xl bg-white p-4 shadow-sm max-[1200px]:flex-col max-[1200px]:items-start">
          <div className="flex w-full flex-wrap items-center gap-2"><div className="flex h-10 min-w-[220px] max-w-[380px] flex-1 items-center gap-2 rounded-lg bg-[#f2f4f5] px-3"><Search size={18} className="text-[#5c6468]"/><input className="w-full bg-transparent text-xs outline-none" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Tên danh mục, slug, mã ID..."/></div>
            <FilterSelect value={level} onChange={(e) => { setLevel(e.target.value); setPage(1); }}><option value="">Tất cả các cấp</option><option value="1">Cấp 1 - Gốc</option><option value="2">Cấp 2 - Phân nhóm</option><option value="3">Cấp 3 - Chi tiết</option></FilterSelect>
            <FilterSelect value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}><option value="">Tất cả trạng thái</option><option value="active">Hiển thị</option><option value="inactive">Đang ẩn</option></FilterSelect>
            <FilterSelect value={position} onChange={(e) => { setPosition(e.target.value); setPage(1); }}><option value="">Vị trí hiển thị</option><option value="menu">Mega Menu</option><option value="home">Trang chủ nổi bật</option></FilterSelect>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2 text-[10px] text-[#5c6468]"><span>Đã chọn ({selected.length}):</span><SmallAction onClick={() => bulkSetActive(true)} icon={<Eye size={15}/>} text="Bật hiện"/><SmallAction onClick={() => bulkSetActive(false)} icon={<EyeOff size={15}/>} text="Ẩn"/><SmallAction danger onClick={deleteSelected} icon={<Trash2 size={15}/>} text="Xóa"/></div>
        </div>

        <div className="grid grid-cols-12 items-start gap-[22px] max-[1200px]:grid-cols-1">
          <div className="col-span-4"><CategoryTree categories={categories} open={treeOpen} setOpen={setTreeOpen} onSelect={(name) => { setSearch(name); setPage(1); }} onCreate={openCreate}/>
            <div className="mt-4 rounded-xl bg-white p-4 shadow-sm"><h3 className="mb-3 flex items-center gap-2 text-base font-bold"><BarChart3 size={19} className="text-[#00557c]"/> Gợi ý quản lý</h3><Insight icon={<AlertTriangle size={18}/>} title="Kiểm tra danh mục đang ẩn">Đảm bảo danh mục theo mùa vụ được bật lại đúng thời điểm.</Insight><Insight icon={<CheckCircle2 size={18}/>} title="Tối ưu tên và slug">Dùng tên rõ ràng, slug ngắn gọn để khách hàng dễ tìm kiếm.</Insight></div>
          </div>
          <div className="col-span-8 overflow-hidden rounded-xl bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-[#e1e3e4] p-4"><h2 className="text-base font-bold">Danh Sách Danh Mục <span className="ml-2 rounded bg-[#eceeef] px-2 py-1 text-[10px] font-normal text-[#5c6468]">{filtered.length} kết quả</span></h2><button type="button" className="rounded-lg p-2 text-[#5c6468] hover:bg-[#f2f4f5]" onClick={() => setNotice("Danh sách đã được cập nhật theo bộ lọc hiện tại.")}><RefreshCw size={18}/></button></div>
            <div className="overflow-x-auto"><table className="w-full min-w-[900px] border-collapse text-[11px]">
              <thead className="bg-[#f2f4f5] text-left text-[10px] text-[#5c6468]"><tr><th className="w-10 p-3 text-center"><input aria-label="Chọn tất cả" type="checkbox" checked={visible.length > 0 && visible.every((c) => selected.includes(c.id))} onChange={(e) => setSelected(e.target.checked ? visible.map((c) => c.id) : [])}/></th><th className="p-3">STT</th><th className="p-3">Tên danh mục</th><th className="p-3">Cấp</th><th className="p-3">Danh mục cha</th><th className="p-3">Số sản phẩm</th><th className="p-3">Vị trí</th><th className="p-3">Trạng thái</th><th className="p-3">Thao tác</th></tr></thead>
              <tbody>{visible.map((c, i) => <tr key={c.id} className={`border-b border-[#e1e3e4] hover:bg-[#f8fafb] ${!c.active ? "opacity-60" : ""}`}>
                <td className="p-3 text-center"><input aria-label={`Chọn ${c.name}`} type="checkbox" checked={selected.includes(c.id)} onChange={() => toggleSelected(c.id)}/></td><td className="p-3 text-center font-bold text-[#5c6468]">#{(page-1)*pageSize+i+1}</td>
                <td className="p-3"><div className={`flex items-center gap-2 ${c.level===2?"pl-2":c.level===3?"pl-5":""}`}><div className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${c.level===1?"bg-[#ffdad6] text-[#a30014]":"bg-[#eceeef] text-[#5c6468]"}`}>{c.level===3?"↳":<BookOpen size={18}/>}</div><div><b className="block whitespace-nowrap text-[11px]">{c.name}</b><small className="block whitespace-nowrap text-[9px] text-[#5c6468]">slug: {c.slug} · ID: CAT-{String(c.id).padStart(2,"0")}</small></div></div></td>
                <td className="p-3"><LevelBadge level={c.level}/></td><td className="p-3">{c.parent || "— Không có —"}</td><td className="p-3 text-right font-bold">{fmt(c.count)}</td>
                <td className="p-3"><div className="flex gap-1">{c.mega&&<span className="rounded bg-[#cae6ff] px-2 py-1 text-[9px] font-bold text-[#004b6f]">Mega</span>}{c.home&&<span className="rounded bg-[#f9daec] px-2 py-1 text-[9px] font-bold text-[#56404f]">Home</span>}{!c.mega&&!c.home&&<span className="rounded bg-[#eceeef] px-2 py-1 text-[9px] text-[#5c6468]">—</span>}</div></td>
                <td className="p-3"><Status active={c.active}/></td><td className="p-3"><div className="flex justify-center gap-1"><IconButton title="Thêm mục con" icon={<PlusSquare size={17}/>} onClick={() => { setEditing(null); setDrawerOpen(true); }}/><IconButton title="Chỉnh sửa" icon={<Edit3 size={17}/>} onClick={() => openEdit(c)}/><IconButton title="Xóa" icon={<Trash2 size={17}/>} onClick={() => deleteOne(c.id)} danger/></div></td>
              </tr>)}{!visible.length&&<tr><td colSpan="9" className="p-10 text-center text-[#5c6468]">Không tìm thấy danh mục phù hợp.</td></tr>}</tbody>
            </table></div>
            <div className="flex items-center justify-between gap-3 p-4 text-[10px] text-[#5c6468] max-[600px]:flex-col max-[600px]:items-start"><div className="flex items-center gap-1">Hiển thị <select aria-label="Số dòng mỗi trang" className="rounded bg-[#f2f4f5] px-2 py-1" value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}><option value="10">10 dòng</option><option value="20">20 dòng</option><option value="50">50 dòng</option></select> trên <b>{filtered.length}</b> danh mục</div><div className="flex gap-1"><PageButton disabled={page===1} onClick={() => setPage((p)=>p-1)} icon={<ChevronLeft size={17}/}/>{Array.from({length:totalPages},(_,i)=>i+1).slice(0,5).map((p)=><button type="button" key={p} onClick={()=>setPage(p)} className={`h-8 w-8 rounded-lg ${page===p?"bg-[#c92127] font-bold text-white":"hover:bg-[#f2f4f5]"}`}>{p}</button>)}<PageButton disabled={page===totalPages} onClick={() => setPage((p)=>p+1)} icon={<ChevronRight size={17}/}/></div></div>
          </div>
        </div>
      </main>
    </div>
    {drawerOpen && <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setDrawerOpen(false)}/>}
    <CategoryDrawer open={drawerOpen} category={editing} categories={categories} onClose={() => setDrawerOpen(false)} onSave={saveCategory}/>
  </div>;
}

function exportCSV(data) {
  const rows = [["ID","Tên danh mục","Slug","Cấp","Danh mục cha","Số sản phẩm","Mega Menu","Trang chủ","Trạng thái"], ...data.map(c => [c.id,c.name,c.slug,c.level,c.parent,c.count,c.mega?"Có":"Không",c.home?"Có":"Không",c.active?"Hiển thị":"Đang ẩn"])];
  const csv = rows.map(row => row.map(v => `"${String(v ?? "").replace(/"/g,'""')}"`).join(",")).join("\r\n");
  const blob = new Blob(["\uFEFF"+csv], {type:"text/csv;charset=utf-8;"});
  const url = URL.createObjectURL(blob); const a = document.createElement("a");
  a.href=url; a.download="danh-sach-danh-muc.csv"; a.click(); URL.revokeObjectURL(url);
}
function SideButton({icon,text}) { return <button type="button" className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs text-[#5c6468] hover:bg-[#f2f4f5] max-[850px]:justify-center">{icon}<span className="max-[850px]:hidden">{text}</span></button>; }
function TopButton({icon,dot,hideSmall}) { return <button type="button" className={`relative rounded-lg p-2 text-[#5c6468] hover:bg-[#f2f4f5] ${hideSmall?"max-[600px]:hidden":""}`}>{icon}{dot&&<i className="absolute right-1 top-1 h-2 w-2 rounded-full border-2 border-white bg-[#c92127]"/>}</button>; }
function ActionButton({icon,text,onClick}) { return <button type="button" onClick={onClick} className="flex h-10 items-center gap-2 rounded-lg bg-white px-4 text-xs font-bold shadow-sm hover:bg-[#f2f4f5]">{icon}{text}</button>; }
function SmallAction({icon,text,onClick,danger}) { return <button type="button" onClick={onClick} className={`flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-[10px] ${danger?"bg-[#ffdad6] text-[#93000a]":"bg-[#f2f4f5] text-[#5c6468]"}`}>{icon}{text}</button>; }
function FilterSelect({children,...props}) { return <select {...props} className="h-10 rounded-lg bg-[#f2f4f5] px-3 text-xs outline-none">{children}</select>; }
function Stat({label,value,note,text,icon,blue,gray}) { return <div className="flex min-h-[132px] items-center justify-between rounded-xl bg-white p-5 shadow-sm"><div><p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[#5c6468]">{label}</p><div className="flex flex-wrap items-baseline gap-2 text-[28px] font-bold">{value}<small className={`text-[10px] ${blue?"text-[#00557c]":gray?"text-[#5c6468]":"text-[#a30014]"}`}>{note}</small></div><span className="text-[11px] text-[#5c6468]">{text}</span></div><div className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${blue?"bg-[#cae6ff] text-[#00557c]":gray?"bg-[#eceeef] text-[#5c6468]":"bg-[#ffdad6] text-[#a30014]"}`}>{React.cloneElement(icon,{size:25})}</div></div>; }
function CategoryTree({categories,open,setOpen,onSelect,onCreate}) {
  const roots = categories.filter(c=>c.level===1);
  return <div className="rounded-xl bg-white p-4 shadow-sm"><div className="flex items-center justify-between border-b border-[#e1e3e4] pb-3"><h2 className="flex items-center gap-2 text-[17px] font-bold"><FolderTree size={21} className="text-[#a30014]"/> Cây danh mục</h2><div className="flex gap-1"><button type="button" className="p-1 text-[#5c6468]" onClick={()=>setOpen(true)}><ChevronDown size={18}/></button><button type="button" className="p-1 text-[#5c6468]" onClick={()=>setOpen(false)}><ChevronUp size={18}/></button></div></div><p className="my-3 text-[11px] leading-relaxed text-[#5c6468]">Chọn danh mục để lọc danh sách bên cạnh.</p>
    {open&&<div className="space-y-1">{roots.map(node=>{const children=categories.filter(c=>c.parent===node.name);return <div key={node.id} className="overflow-hidden rounded-lg bg-[#f2f4f5]"><button type="button" onClick={()=>onSelect(node.name)} className="flex w-full items-center justify-between gap-2 p-2.5 text-left hover:bg-[#eceeef]"><span className="flex min-w-0 items-center gap-2"><FolderOpen size={19}/><b className="truncate text-xs">{node.name}</b></span><span className="rounded-full bg-white px-2 py-1 text-[10px] text-[#5c6468]">{fmt(node.count)}</span></button>{children.map(child=><button type="button" key={child.id} onClick={()=>onSelect(child.name)} className="flex w-full items-center justify-between gap-2 bg-white px-4 py-2 text-left hover:bg-[#f8fafb]"><span className="flex min-w-0 items-center gap-1.5"><span className="text-[#9aa0a3]">↳</span><span className="truncate text-[11px]">{child.name}</span></span><span className="text-[10px] text-[#5c6468]">{fmt(child.count)}</span></button>)}</div>;})}</div>}
    <button type="button" onClick={onCreate} className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[#cda8a5] text-[11px] font-bold text-[#a30014]"><FolderOpen size={17}/> Tạo danh mục mới</button></div>;
}
function Insight({icon,title,children}) { return <div className="mt-2 flex gap-2 rounded-lg bg-[#f2f4f5] p-2.5"><span className="text-[#a30014]">{icon}</span><div><b className="text-[11px]">{title}</b><p className="m-0 mt-1 text-[10px] leading-relaxed text-[#5c6468]">{children}</p></div></div>; }
function LevelBadge({level}) { return <span className={`rounded-full px-2 py-1 text-[9px] font-bold ${level===1?"bg-[#a30014] text-white":level===2?"bg-[#f9daec] text-[#56404f]":"bg-[#eceeef] text-[#5c6468]"}`}>{level===1?"Gốc (C1)":`Cấp ${level}`}</span>; }
function Status({active}) { return <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2 py-1 text-[9px] font-bold ${active?"bg-[#d9f7e3] text-[#08733a]":"bg-[#eceeef] text-[#5c6468]"}`}><i className={`mr-1.5 h-1.5 w-1.5 rounded-full ${active?"bg-[#079444]":"bg-[#777]"}`}/>{active?"Hiển thị":"Đang ẩn"}</span>; }
function IconButton({icon,title,onClick,danger}) { return <button type="button" title={title} onClick={onClick} className={`rounded p-1.5 text-[#5c6468] hover:bg-[#f2f4f5] ${danger?"hover:bg-[#ffdad6] hover:text-[#ba1a1a]":"hover:text-[#a30014]"}`}>{icon}</button>; }
function PageButton({icon,...props}) { return <button type="button" {...props} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-[#f2f4f5] disabled:opacity-40">{icon}</button>; }

function CategoryDrawer({open,category,categories,onClose,onSave}) {
  const [form,setForm] = useState({});
  useEffect(()=>{setForm({name:category?.name||"",parent:category?.parent||"",slug:category?.slug||"",mega:category?.mega??true,home:category?.home??false,active:category?.active??true});},[category,open]);
  const update=(key,value)=>setForm(prev=>({...prev,[key]:value}));
  const submit=()=>{if(!form.name?.trim()) return window.alert("Vui lòng nhập tên danh mục.");if(form.parent===form.name.trim()) return window.alert("Danh mục không thể là danh mục cha của chính nó.");onSave(form);};
  const parentOptions=categories.filter(c=>c.level<3&&c.id!==category?.id);
  return <aside className={`fixed right-0 top-0 z-50 flex h-screen w-[560px] max-w-full flex-col bg-white shadow-2xl transition-transform duration-300 ${open?"translate-x-0":"translate-x-full"}`} aria-hidden={!open}>
    <div className="flex items-center justify-between border-b border-[#e1e3e4] bg-[#f2f4f5] p-5"><div className="flex gap-2.5"><div className="grid h-9 w-9 place-items-center rounded-lg bg-[#c92127] text-white"><Edit3 size={20}/></div><div><h2 className="m-0 text-base font-bold">{category?"Chỉnh sửa danh mục":"Thêm danh mục mới"}</h2><p className="m-0 mt-1 text-[10px] text-[#5c6468]">Cập nhật thông tin và vị trí hiển thị.</p></div></div><button type="button" onClick={onClose} className="rounded-full p-1.5 text-[#5c6468] hover:bg-[#eceeef]"><X size={20}/></button></div>
    <div className="flex-1 overflow-y-auto p-5">
      <DrawerSection title="1. Thông tin cơ bản"><Field label="Tên danh mục *"><input value={form.name||""} onChange={e=>update("name",e.target.value)} placeholder="Ví dụ: Văn học, Kinh tế..."/></Field><Field label="Danh mục cha"><select value={form.parent||""} onChange={e=>update("parent",e.target.value)}><option value="">Danh mục gốc (Cấp 1)</option>{parentOptions.map(p=><option key={p.id} value={p.name}>{p.name}</option>)}</select></Field><Field label="Đường dẫn tĩnh (Slug)"><input value={form.slug||""} onChange={e=>update("slug",e.target.value)} placeholder="Tự tạo nếu để trống"/></Field></DrawerSection>
      <DrawerSection title="2. Biểu tượng & Banner"><div className="flex gap-3.5"><div className="grid h-20 w-20 shrink-0 place-items-center rounded-xl border border-dashed border-[#cda8a5] bg-[#f2f4f5] text-[#a30014]"><BookOpen size={30}/><small className="text-[8px] text-[#5c6468]">Ảnh danh mục</small></div><div><b className="text-[11px]">Ảnh minh họa danh mục</b><div className="my-2"><button type="button" onClick={()=>window.alert("Cần kết nối API upload ảnh của dự án để bật chức năng này.")} className="flex h-8 items-center gap-1 rounded-md bg-[#eceeef] px-2.5 text-[10px] font-bold"><Upload size={15}/> Tải ảnh lên</button></div><p className="m-0 text-[9px] text-[#5c6468]">Có thể kết nối API upload ảnh sau.</p></div></div></DrawerSection>
      <DrawerSection title="3. Vị trí hiển thị & trạng thái"><Toggle icon={<Menu/>} title="Hiển thị trên Mega Menu" text="Cho phép xuất hiện trong thanh điều hướng." checked={!!form.mega} onChange={v=>update("mega",v)}/><Toggle icon={<Store/>} title="Danh mục nổi bật trang chủ" text="Đánh dấu để hiển thị tại trang chủ." checked={!!form.home} onChange={v=>update("home",v)}/><Toggle icon={<ToggleRight/>} title="Kích hoạt hiển thị" text="Tắt để ẩn danh mục khỏi giao diện công khai." checked={!!form.active} onChange={v=>update("active",v)}/></DrawerSection>
    </div>
    <div className="flex items-center justify-between gap-2 border-t border-[#e1e3e4] bg-white p-4"><button type="button" onClick={onClose} className="h-10 rounded-lg bg-[#f2f4f5] px-4 text-[11px] font-bold">Hủy bỏ</button><button type="button" onClick={submit} className="h-10 rounded-lg bg-[#c92127] px-5 text-[11px] font-bold text-white hover:bg-[#a30014]">{category?"Lưu thay đổi":"Tạo danh mục"}</button></div>
  </aside>;
}
function DrawerSection({title,children}) { return <section className="mb-[18px] border-b border-[#e1e3e4] pb-[18px] last:border-0"><h4 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-[#a30014]">{title}</h4>{children}</section>; }
function Field({label,children}) { return <label className="mb-3 block"><b className="mb-1.5 block text-[11px]">{label}</b>{React.cloneElement(children,{className:`${children.props.className||""} h-10 w-full rounded-lg border-0 bg-[#f2f4f5] px-3 text-xs outline-none focus:bg-white focus:ring-2 focus:ring-[#c92127]`})}</label>; }
function Toggle({icon,title,text,checked,onChange}) { return <label className="mb-2 flex cursor-pointer items-center gap-2.5 rounded-lg bg-[#f2f4f5] p-3"><span className="text-[#a30014]">{React.cloneElement(icon,{size:20})}</span><span className="flex-1"><b className="block text-[10px]">{title}</b><small className="mt-0.5 block text-[9px] text-[#5c6468]">{text}</small></span><input type="checkbox" checked={checked} onChange={e=>onChange(e.target.checked)} className="h-4 w-4 accent-[#c92127]"/></label>; }
