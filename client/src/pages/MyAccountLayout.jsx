import { Outlet } from "react-router-dom";
import MyAccountSidebar from "./MyAccountSideBar";
import Header from "../components/Header";
import Footer from "../components/Footer";

function MyAccountLayout() {
    return (
        <div className="min-h-screen bg-gray-100">

            {/* Header */}

            <Header />

            {/* Nội dung Account */}
            <div className="max-w-[1200px] mx-auto px-4 py-6">

                <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-5">

                    {/* Sidebar bên trái */}
                    <MyAccountSidebar />

                    {/* Nội dung bên phải */}
                    <main>
                        <Outlet />
                    </main>

                </div>

            </div>
            <Footer />

        </div>
    );
}

export default MyAccountLayout;