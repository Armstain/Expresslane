import { createBrowserRouter } from 'react-router-dom'
import Main from '../layouts/Main'
import Home from '../pages/Home/Home'
import ErrorPage from '../pages/ErrorPage'
import Login from '@/pages/Login/Login.jsx'
import SignUp from '@/pages/SignUp/SignUp.jsx'
import DashboardLayout from '@/layouts/DashboardLayout.jsx'
import BookParcel from '@/pages/Dashboard/User/BookParcel.jsx'
import Statistics from '@/pages/Dashboard/Common/Statistics.jsx'
import MyParcels from '@/pages/Dashboard/User/MyParcels.jsx'
import Profile from '@/pages/Dashboard/Common/Profile.jsx'
import AllUsers from '@/components/Dashboard/Admin/AllUsers.jsx'
import DeliveryList from '@/pages/Dashboard/DeliveryMen/DeliveryList.jsx'
import Reviews from '@/pages/Dashboard/DeliveryMen/Reviews.jsx'
import AllParcels from '@/components/Dashboard/Admin/AllParcels.jsx'
import AllDeliveryMen from '@/components/Dashboard/Admin/AllDeliveryMen.jsx'
import About from '@/pages/About/About.jsx'
import Contact from '@/pages/Contact/Contact.jsx'
import PrivateRoute from './PrivateRoute.jsx'


export const router = createBrowserRouter([
    {
        path: '/',
        element: <Main />,
        errorElement: <ErrorPage />,
        children: [
            {
                path: '/',
                element: <Home />,
            },
            {
                path: '/about',
                element: <About></About>
            },
            {
                path: '/contact',
                element: <Contact></Contact>
            }

        ],
    },
    { path: '/login', element: <Login></Login> },
    { path: '/signup', element: <SignUp></SignUp> },
    {
        path: '/dashboard',
        element: <DashboardLayout></DashboardLayout>,
        children: [
            {
                path: 'statistics',
                element: <PrivateRoute><Statistics></Statistics></PrivateRoute>
            },
            {
                path: 'book-parcel',
                element: <PrivateRoute><BookParcel></BookParcel></PrivateRoute>
            },
            {
                path: 'my-parcels',
                element: <PrivateRoute><MyParcels></MyParcels></PrivateRoute>
            },
            {
                path: 'all-parcels',
                element: <PrivateRoute><AllParcels></AllParcels></PrivateRoute>
            },
            {
                path: 'profile',
                element: <PrivateRoute><Profile></Profile></PrivateRoute>
            },
            {
                path: 'all-users',
                element: <PrivateRoute> <AllUsers></AllUsers></PrivateRoute>
            },
            {
                path: 'delivery-men',
                element: <PrivateRoute><AllDeliveryMen></AllDeliveryMen></PrivateRoute>
            },
            {
                path: 'my-deliveries',
                element: <PrivateRoute><DeliveryList></DeliveryList></PrivateRoute>
            },
            {
                path: 'my-reviews',
                element: <PrivateRoute><Reviews></Reviews></PrivateRoute>
            },

        ]
    }
])

