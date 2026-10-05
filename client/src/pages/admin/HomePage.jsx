
import { useEffect } from 'react';

import Message from './Components/Messages/Message';
import Order from './Components/Order/Order';
import HomeProducts from './Components/Product/HomeProducts';
import HomeDiscount from './Components/Discounts/HomeDiscount';
import Category from './Components/Category/Category';
import DiscountProduct from './Components/DiscountProduct/DiscountProduct';
import ControllerUser from './Components/Users/User';
import Blog from './Components/Blog/Blog';
import Dashboard from './DashBoard';

function HomePage({ type }) {
    useEffect(() => {
        document.title = 'Trang chủ';
    }, []);

    return (
        <div className="w-full">
            {type === 2 ? (
                <HomeProducts />
            ) : type === 3 ? (
                <HomeDiscount />
            ) : type === 6 ? (
                <Message />
            ) : type === 1 ? (
                <Order />
            ) : type === 7 ? (
                <Category />
            ) : type === 8 ? (
                <DiscountProduct />
            ) : type === 4 ? (
                <ControllerUser />
            ) : type === 0 ? (
                <Dashboard />
            ) : type === 5 ? (
                <Blog />
            ) : null}
        </div>
    );
}

export default HomePage;

