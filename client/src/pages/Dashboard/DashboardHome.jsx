import { Navigate } from 'react-router-dom'
import LoadingSpinner from '@/components/Shared/LoadingSpinner.jsx'
import useRole from '@/hooks/useRole.js'
import { ROLE_NAV } from '@/components/Dashboard/Sidebar/navigation.js'

// /dashboard has no page of its own; send each role to its first section
const DashboardHome = () => {
    const [role, isLoading] = useRole()

    if (isLoading) return <LoadingSpinner className='min-h-[50vh]' />
    const target = ROLE_NAV[role]?.[0]?.address || '/dashboard/profile'
    return <Navigate to={target} replace />
}

export default DashboardHome
