import { Suspense, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from '../components/Shared/Navbar/Navbar.jsx'
import Footer from '@/components/Shared/Footer/Footer.jsx'
import LoadingSpinner from '@/components/Shared/LoadingSpinner.jsx'

const Main = () => {
    const { pathname, hash } = useLocation()

    // Jump to in-page anchors like /#pricing, otherwise start new pages at the top
    useEffect(() => {
        if (hash) {
            const target = document.getElementById(hash.slice(1))
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' })
                return
            }
        }
        window.scrollTo(0, 0)
    }, [pathname, hash])

    return (
        <div className='flex min-h-screen flex-col'>
            <Navbar />
            <main className='flex-1'>
                <Suspense fallback={<LoadingSpinner className='min-h-[60vh]' />}>
                    <Outlet />
                </Suspense>
            </main>
            <Footer />
        </div>
    )
}

export default Main
