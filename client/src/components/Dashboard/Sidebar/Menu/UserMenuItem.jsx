import React from 'react';
import MenuItem from './MenuItem.jsx';
import { AiFillProduct } from "react-icons/ai";
import { MdOutlineBookmark } from "react-icons/md";

const UserMenuItem = () => {
    return (
        <>
            {/* Book a parcel*/}
            <MenuItem label='Book a Parcel' address='book-parcel' icon={MdOutlineBookmark}></MenuItem>

            {/* My Parcels */}
            <MenuItem label='My Parcels' address='my-parcels' icon={AiFillProduct}></MenuItem>
        </>
    );
};

export default UserMenuItem;