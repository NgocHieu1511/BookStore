import { useEffect, useState } from 'react';
import Context from './Context';
import { requestAuth } from '../config/userRequest';
import { io } from 'socket.io-client'; 
import cookie from 'js-cookie';
import { requestGetCart } from '../config/cartRequest';

export function Provider({ children }) {
    const [dataUser, setDataUser] = useState(null);
    const [cart, setCart] = useState({});
    const [socket, setSocket] = useState(null);              // THÊM

    const logged = cookie.get('logged');

    const fetchAuth = async () => {
        const res = await requestAuth();
        setDataUser(res.metadata);
    };

    const getCart = async () => {
        const res = await requestGetCart();
        setCart(res.metadata);
    };

    useEffect(() => {
        if (logged) {
            fetchAuth();
            getCart();
        }
    }, [logged]);
    const userId = dataUser?.user?._id;
    useEffect(() => {
        if (!userId) return;
        const s = io(import.meta.env.VITE_API_URL, {
            withCredentials: true,
            transports: ['websocket'],
        });
        setSocket(s);
        return () => {
            s.disconnect();
            setSocket(null);
        };
    }, [userId]);

    return <Context.Provider value={{ dataUser, cart, getCart, socket }}>{children}</Context.Provider>;
}