import { lazy } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import Main from '../layouts/Main.jsx'
import Home from '../pages/Home/Home.jsx'
import ErrorPage from '../pages/ErrorPage.jsx'
import Login from '../pages/Login/Login.jsx'
import SignUp from '../pages/SignUp/SignUp.jsx'
import DashboardLayout from '../layouts/DashboardLayout.jsx'
import PrivateRoute from './PrivateRoute.jsx'
import RoleRoute from './RoleRoute.jsx'

// Secondary pages load on demand to keep the landing page bundle small
const About = lazy(() => import('@/pages/About/About.jsx'))
const Contact = lazy(() => import('@/pages/Contact/Contact.jsx'))
const DashboardHome = lazy(() => import('@/pages/Dashboard/DashboardHome.jsx'))
const Statistics = lazy(() => import('@/pages/Dashboard/Common/Statistics.jsx'))
const Profile = lazy(() => import('@/pages/Dashboard/Common/Profile.jsx'))
const Overview = lazy(() => import('@/pages/Dashboard/User/Overview.jsx'))
const BookParcel = lazy(() => import('@/pages/Dashboard/User/BookParcel.jsx'))
const MyParcels = lazy(() => import('@/pages/Dashboard/User/MyParcels.jsx'))
const DeliveryList = lazy(() => import('@/pages/Dashboard/DeliveryMen/DeliveryList.jsx'))
const Reviews = lazy(() => import('@/pages/Dashboard/DeliveryMen/Reviews.jsx'))
const AllUsers = lazy(() => import('@/components/Dashboard/Admin/AllUsers.jsx'))
const AllParcels = lazy(() => import('@/components/Dashboard/Admin/AllParcels.jsx'))
const AllDeliveryMen = lazy(() => import('@/components/Dashboard/Admin/AllDeliveryMen.jsx'))

const withRole = (roles, element) => <RoleRoute roles={roles}>{element}</RoleRoute>

export const router = createBrowserRouter([
    {
        path: '/',
        element: <Main />,
        errorElement: <ErrorPage />,
        children: [
            { index: true, element: <Home /> },
            { path: 'about', element: <About /> },
            { path: 'contact', element: <Contact /> },
        ],
    },
    { path: '/login', element: <Login /> },
    { path: '/signup', element: <SignUp /> },
    {
        path: '/dashboard',
        element: (
            <PrivateRoute>
                <DashboardLayout />
            </PrivateRoute>
        ),
        errorElement: <ErrorPage />,
        children: [
            { index: true, element: <DashboardHome /> },
            { path: 'profile', element: <Profile /> },
            // customer
            { path: 'overview', element: withRole(['user'], <Overview />) },
            { path: 'book-parcel', element: withRole(['user'], <BookParcel />) },
            { path: 'my-parcels', element: withRole(['user'], <MyParcels />) },
            // delivery partner
            { path: 'my-deliveries', element: withRole(['DeliveryMen'], <DeliveryList />) },
            { path: 'my-reviews', element: withRole(['DeliveryMen'], <Reviews />) },
            // admin
            { path: 'statistics', element: withRole(['admin'], <Statistics />) },
            { path: 'all-parcels', element: withRole(['admin'], <AllParcels />) },
            { path: 'all-users', element: withRole(['admin'], <AllUsers />) },
            { path: 'delivery-men', element: withRole(['admin'], <AllDeliveryMen />) },
        ],
    },
])
