import { Link, NavLink } from 'react-router-dom';
import useAuth from '@/hooks/useAuth.jsx';
import { IoIosNotificationsOutline } from "react-icons/io";
import ModeToggle from '@/components/ModeToggle/ModeToggle.jsx';

const Navbar = () => {

    const { user, logOut } = useAuth();
    const Links = (
        <>
            <li><NavLink className={({ isActive }) => isActive ? 'font-bold' : ''} to="/">Home</NavLink></li>
            <li><NavLink className={({ isActive }) => isActive ? 'font-bold' : ''} to="/dashboard">DashBoard</NavLink></li>
            <li><NavLink className={({ isActive }) => isActive ? 'font-bold' : ''} to="/about">About</NavLink></li>
            <li><NavLink className={({ isActive }) => isActive ? 'font-bold' : ''} to="/contact">Contact</NavLink></li>
        </>
    );

    return (
        <div>
            <div className="navbar bg-base-100 shadow-sm dark:bg-gray-800 dark:text-white">
                <div to="/" className="navbar-start">
                    <div className="dropdown">
                        <Link to="/" tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" /></svg>
                        </Link>
                        <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-20 p-2 shadow bg-base-100 rounded-box w-52">
                            {Links}
                        </ul>
                    </div>
                    <Link to="/" className="btn btn-ghost text-xl">
                        <img height={'200'} width={'200px'} src="https://i.ibb.co/Ksmghct/Picture1.png" alt="" /></Link>
                </div>
                <div className="navbar-center hidden lg:flex">
                    <ul className="menu menu-horizontal px-1">
                        {Links}
                    </ul>
                </div>
                <div className="navbar-end">

                    <ModeToggle className='mr-4' />
                    <div className='mr-4'>
                        <IoIosNotificationsOutline />
                    </div>
                    {user && user.email ? (
                        <div className="dropdown dropdown-end">
                            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar tooltip tooltip-left z-30" data-tip={user.displayName || 'User Profile'}>
                                <div className=" rounded-full">
                                    <img referrerPolicy="no-referrer" alt="User Avatar" src={user?.photoURL || 'https://api.lorem.space/image/face?hash=33791'} />
                                </div>
                            </div>
                            <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-20 p-2 shadow bg-base-100 rounded-box w-52 dark:bg-gray-800 dark:text-white">
                                <li><a>{user.displayName || user.email}</a></li>
                                <li><Link to='/dashboard'> Dashboard</Link></li>
                                <li><a onClick={logOut} >Logout</a></li>
                            </ul>
                        </div>
                    ) : (
                        <>
                            <Link to="/login" className="btn mx-4">Login</Link>

                        </>
                    )}

                </div>
            </div>
        </div>
    );
};

export default Navbar;