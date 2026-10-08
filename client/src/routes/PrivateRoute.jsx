import PropTypes from 'prop-types'
import { Navigate, useLocation } from 'react-router-dom'
import LoadingSpinner from '@/components/Shared/LoadingSpinner.jsx'
import useAuth from '@/hooks/useAuth.jsx'

const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth()
    const location = useLocation()

    if (loading) return <LoadingSpinner fullScreen />
    if (user) return children
    return <Navigate to='/login' state={location.pathname} replace />
}

PrivateRoute.propTypes = {
    children: PropTypes.node,
}

export default PrivateRoute
