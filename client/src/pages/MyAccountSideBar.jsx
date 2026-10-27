import { NavLink } from "react-router-dom";
import { useStore } from "../hooks/useStore";

function MyAccountSidebar() {

    const{dataUser} = useStore();
        console.log("Thông tin người dùng:", dataUser);


    

    return (
        <aside className="bg-white rounded-lg shadow-sm overflow-hidden">

            {/* Thông tin user */}
            <div className="p-5 border-b">

                <div className="w-20 h-20 mx-auto rounded-full bg-gray-200 flex items-center justify-center text-3xl">
                    👤
                </div>

                <h2 className="text-center font-semibold text-lg mt-3">
                {dataUser?.user?.fullName || "Người dùng"}
                </h2>

                <p className="text-center text-gray-500 text-sm mt-1">
                    Thành viên
                </p>

            </div>


            {/* Menu */}
            <div className="py-2">

                {/* Nhóm thông tin tài khoản */}
                <div>

                    <div className="px-5 py-3 font-semibold text-gray-800">
                        Thông tin tài khoản
                    </div>

                    <NavLink
                        to="/account/my-profile"
                        className={({ isActive }) =>
                            `block px-8 py-3 text-sm transition
                            ${
                                isActive
                                    ? "text-red-600 bg-red-50 border-r-4 border-red-600 font-medium"
                                    : "text-gray-700 hover:bg-gray-50"
                            }`
                        }
                    >
                        Hồ sơ cá nhân
                    </NavLink>


                    <NavLink
                        to="/account/my-address"
                        className={({ isActive }) =>
                            `block px-8 py-3 text-sm transition
                            ${
                                isActive
                                    ? "text-red-600 bg-red-50 border-r-4 border-red-600 font-medium"
                                    : "text-gray-700 hover:bg-gray-50"
                            }`
                        }
                    >
                        Sổ địa chỉ
                    </NavLink>


                    <NavLink
                        to="/account/my-password"
                        className={({ isActive }) =>
                            `block px-8 py-3 text-sm transition
                            ${
                                isActive
                                    ? "text-red-600 bg-red-50 border-r-4 border-red-600 font-medium"
                                    : "text-gray-700 hover:bg-gray-50"
                            }`
                        }
                    >
                        Đổi mật khẩu
                    </NavLink>


                    


                  

                </div>


                {/* Đơn hàng */}
                <NavLink
                    to="/account/my-orders"
                    className={({ isActive }) =>
                        `block px-5 py-4 font-medium transition
                        ${
                            isActive
                                ? "text-red-600 bg-red-50 border-r-4 border-red-600"
                                : "text-gray-800 hover:bg-gray-50"
                        }`
                    }
                >
                     Đơn hàng của tôi
                </NavLink>



            </div>

        </aside>
    );
}

export default MyAccountSidebar;