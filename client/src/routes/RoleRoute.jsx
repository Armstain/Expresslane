import PropTypes from 'prop-types'
import { Navigate } from 'react-router-dom'
import LoadingSpinner from '@/components/Shared/LoadingSpinner.jsx'
import useRole from '@/hooks/useRole.js'

// UI guard only — the API must still enforce roles on the server
const RoleRoute = ({ roles, children }) => {
    const [role, isLoading] = useRole()

    if (isLoading) return <LoadingSpinner className='min-h-[50vh]' />
    if (roles.includes(role)) return children
    return <Navigate to='/dashboard' replace />
}

RoleRoute.propTypes = {
    roles: PropTypes.arrayOf(PropTypes.string).isRequired,
    children: PropTypes.node,
}

export default RoleRoute
