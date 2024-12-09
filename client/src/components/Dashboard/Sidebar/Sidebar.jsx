import { useState } from "react";
import { GrLogout } from "react-icons/gr";
import { FcSettings } from "react-icons/fc";
import { BsFingerprint, BsFillHouseAddFill } from "react-icons/bs";
import { GrUserAdmin } from "react-icons/gr";
import { MdHomeWork } from "react-icons/md";
import { AiOutlineBars } from "react-icons/ai";
import { BsGraphUp } from "react-icons/bs";
import { NavLink } from "react-router-dom";
import useAuth from "../../../hooks/useAuth";
import { Link } from "react-router-dom";
import useRole from "@/hooks/useRole.js";
import MenuItem from "./Menu/MenuItem.jsx";
import DeliveryMenuItem from "./Menu/DeliveryMenuItem.jsx";
import UserMenuItem from "./Menu/UserMenuItem.jsx";
import AdminMenuItem from "./Menu/AdminMenuItem.jsx";

const Sidebar = () => {
  const { logOut } = useAuth();
  const [isActive, setActive] = useState(false);
  const [role, isLoading] = useRole();

  // Sidebar Responsive Handler
  const handleToggle = () => {
    setActive(!isActive);
  };

  return (
    <>
      {/* Small Screen Navbar */}
      <div className="bg-white shadow-md text-gray-800 flex justify-between md:hidden dark:bg-gray-800 sticky top-0 z-30">
        <div className="p-2">
          <Link to="/" className="block">
            <img
              src="https://i.ibb.co/Ksmghct/Picture1.png"
              alt="logo"
              className="h-12 w-auto"
            />
          </Link>
        </div>

        <button
          onClick={handleToggle}
          className="p-4 focus:outline-none hover:bg-gray-100 rounded-md dark:hover:bg-gray-700 transition-colors"
        >
          <AiOutlineBars className="h-5 w-5 dark:text-white" />
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`z-40 md:fixed flex flex-col justify-between overflow-x-hidden bg-white dark:bg-gray-800 w-72 space-y-6 px-2 py-4 absolute inset-y-0 left-0 transform ${
          isActive && "-translate-x-full"
        } md:translate-x-0 transition duration-200 ease-in-out shadow-lg`}
      >
        <div>
          {/* Logo */}
          <div className="w-full hidden md:flex px-4 py-2 rounded-lg justify-center items-center mx-auto">
            <Link to="/" className="flex items-center justify-center">
              <img
                src="https://i.ibb.co/Ksmghct/Picture1.png"
                alt="ExpressLane"
                className="h-16 w-auto"
              />
            </Link>
          </div>

          {/* Nav Items */}
          <div className="flex flex-col flex-1 mt-6">
            <nav className="space-y-2">
              {role === "user" && (
                <div className="space-y-2">
                  <UserMenuItem className="transition-colors duration-200"></UserMenuItem>
                </div>
              )}

              {role === "DeliveryMen" && (
                <div className="space-y-2">
                  <DeliveryMenuItem></DeliveryMenuItem>
                </div>
              )}

              {role === "admin" && (
                <div className="space-y-2">
                  <AdminMenuItem></AdminMenuItem>
                </div>
              )}
            </nav>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="space-y-2">
          <hr className="border-gray-200 dark:border-gray-700" />

          {/* Profile Menu */}
          <MenuItem
            label="Profile"
            address="profile"
            icon={FcSettings}
            className="hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          />

          {/* Logout Button */}
          <button
            onClick={logOut}
            className="flex w-full items-center px-4 py-2 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors duration-200 dark:text-gray-300 dark:hover:bg-red-900/20 dark:hover:text-red-500"
          >
            <GrLogout className="w-5 h-5" />
            <span className="mx-4 font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
