import { Outlet } from 'react-router-dom'
import Navbar from '../components/Shared/Navbar/Navbar.jsx'
import Footer from '@/components/Shared/Footer/Footer.jsx'


const Main = () => {
    return (
        <div>
            <Navbar></Navbar>
            <div className='pt-24 min-h-[calc(100vh-68px)]'>
                <Outlet />
            </div>
            <Footer></Footer>
        </div>
    )
}

export default Main