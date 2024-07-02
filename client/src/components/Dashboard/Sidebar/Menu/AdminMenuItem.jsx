import React from 'react';
import MenuItem from './MenuItem.jsx';
import { IoIosStats } from "react-icons/io";
import { FaUsers } from "react-icons/fa6";
import { AiFillProduct } from "react-icons/ai";
import { TbTruckDelivery } from "react-icons/tb";
const AdminMenuItem = () => {
    return (
        <>
            <MenuItem label='Statistics' address='statistics' icon={IoIosStats}></MenuItem>
            <MenuItem label='All Users' address='all-users' icon={FaUsers}></MenuItem>
            <MenuItem label='All Parcels' address='all-parcels' icon={AiFillProduct}></MenuItem>
            <MenuItem label='All DeliveryMen' address='delivery-men' icon={TbTruckDelivery}></MenuItem>

        </>
    );
};

export default AdminMenuItem;