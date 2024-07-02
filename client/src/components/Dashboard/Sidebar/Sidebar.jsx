import { useState } from 'react'
import { GrLogout } from 'react-icons/gr'
import { FcSettings } from 'react-icons/fc'
import { BsFingerprint, BsFillHouseAddFill } from 'react-icons/bs'
import { GrUserAdmin } from 'react-icons/gr'
import { MdHomeWork } from 'react-icons/md'
import { AiOutlineBars } from 'react-icons/ai'
import { BsGraphUp } from 'react-icons/bs'
import { NavLink } from 'react-router-dom'
import useAuth from '../../../hooks/useAuth'
import { Link } from 'react-router-dom'
import useRole from '@/hooks/useRole.js'
import MenuItem from './Menu/MenuItem.jsx'
import DeliveryMenuItem from './Menu/DeliveryMenuItem.jsx'
import UserMenuItem from './Menu/UserMenuItem.jsx'
import AdminMenuItem from './Menu/AdminMenuItem.jsx'

const Sidebar = () => {
    const { logOut } = useAuth()
    const [isActive, setActive] = useState(false)
    const [role, isLoading] = useRole()
    console.log(role);

    // Sidebar Responsive Handler
    const handleToggle = () => {
        setActive(!isActive)
    }
    return (
        <>
            {/* Small Screen Navbar */}
            <div className='bg-gray-100 text-gray-800 flex justify-between md:hidden dark:bg-gray-800'>
                <div>
                    <div className='block cursor-pointer p-4 font-bold'>
                        <Link to='/'>
                            <img
                                // className='hidden md:block'
                                src='https://i.ibb.co/Ksmghct/Picture1.png'
                                alt='logo'
                                width='300'
                                height='300'
                            />
                        </Link>
                    </div>
                </div>

                <button
                    onClick={handleToggle}
                    className='mobile-menu-button p-4 focus:outline-none focus:bg-gray-200 dark:focus:bg-gray-700'
                >
                    <AiOutlineBars size={20} className='h-5 w-5 dark: text-white' />
                </button>
            </div>

            {/* Sidebar */}
            <div
                className={`z-10 md:fixed flex flex-col justify-between overflow-x-hidden bg-gray-100 dark:bg-gray-800  w-64 space-y-6 px-2 py-4 absolute inset-y-0 left-0 transform ${isActive && '-translate-x-full'
                    }  md:translate-x-0  transition duration-200 ease-in-out`}
            >
                <div>
                    <div>
                        <div className='w-full hidden md:flex px-4 py-2 shadow-lg rounded-lg justify-center items-center bg-blue-100 mx-auto'>
                            <Link to='/'>
                                <img
                                    // className='hidden md:block'
                                    src='https://i.ibb.co/Ksmghct/Picture1.png'
                                    alt='ExpressLane'
                                    width='300'
                                    height='300'
                                />
                            </Link>
                        </div>
                    </div>

                    {/* Nav Items */}
                    <div className='flex flex-col justify-between flex-1 mt-6 '>
                        {/* Conditional toggle button here.. */}

                        {/*  Menu Items */}
                        <nav>
                            {/* Statistics */}


                            {role === 'user' && <UserMenuItem className='dark:text-white'></UserMenuItem>}

                            {/* ----Delivery Men---- */}


                            {role === 'DeliveryMen' && <DeliveryMenuItem></DeliveryMenuItem>}

                            {/* ----Admin---- */}

                            {role === 'admin' && <AdminMenuItem ></AdminMenuItem>}








                        </nav>
                    </div>
                </div>

                <div>
                    <hr />

                    {/* Profile Menu */}
                    <MenuItem label='Profile' address='profile' icon={FcSettings}></MenuItem>
                    <button
                        onClick={logOut}
                        className='flex w-full items-center px-4 py-2 mt-5 text-gray-600 hover:bg-gray-300   hover:text-gray-700 transition-colors duration-300 transform'
                    >
                        <GrLogout className='w-5 h-5' />

                        <span className='mx-4 font-medium dark:text-white'>Logout</span>
                    </button>
                </div>
            </div>
        </>
    )
}

export default Sidebar