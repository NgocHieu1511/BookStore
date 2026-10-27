
import { useEffect, useState } from "react";
import SlideBar from "./SlideBar";
import HomePage from "./HomePage";

function Dashboard() {
  const [type, setType] = useState(0);

  useEffect(() => {
    document.title = "Quản trị Admin | BookStore";
  }, []);

  return (
    <div className="flex min-h-screen w-full bg-[#f8fafb]">
      {/* Sidebar */}
      <aside className="w-64 shrink-0">
        <SlideBar type={type} setType={setType} />
      </aside>

      {/* Nội dung trang */}
      <main className="min-w-0 flex-1">
        <HomePage type={type} />
      </main>
    </div>
  );
}

export default Dashboard;