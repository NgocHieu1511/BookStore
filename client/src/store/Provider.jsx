import { useEffect, useState } from "react";
import Context from "./Context";
import { requestAuth } from "../config/userRequest";
import cookie from "js-cookie";

export function Provider({ children }) {
  const [dataUser, setDataUser] = useState(null);
  const logged = cookie.get('logged');

  useEffect(() => {
    // Khai báo hàm trực tiếp trong useEffect
    const fetchAuth = async () => {
      try {
        const res = await requestAuth();
        setDataUser(res.metadata);
      } catch (error) {
        console.error("Lỗi xác thực:", error);
      }
    };

    if (logged) {
      fetchAuth();
    }
  }, [logged]); // Mảng dependency chỉ cần 'logged'

  return <Context.Provider value={{ dataUser }}>{children}</Context.Provider>;
}