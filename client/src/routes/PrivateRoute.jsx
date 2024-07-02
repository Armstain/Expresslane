import LoadingSpinner from '@/components/Shared/LoadingSpinner.jsx'
import useAuth from '@/hooks/useAuth.jsx'
import PropTypes from 'prop-types'

import { Navigate, useLocation } from 'react-router-dom'


const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth()
    const location = useLocation()

    if (loading) return <LoadingSpinner />
    if (user) return children
    return <Navigate to='/login' state={location.pathname} replace='true' />
}



export default PrivateRoute