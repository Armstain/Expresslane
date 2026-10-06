import PropTypes from 'prop-types'
import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'

const MenuItem = ({ label, address, icon: Icon, onNavigate }) => {
    return (
        <NavLink
            to={address}
            end
            onClick={onNavigate}
            className={({ isActive }) =>
                cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                )
            }
        >
            <Icon className='h-[18px] w-[18px]' aria-hidden='true' />
            <span>{label}</span>
        </NavLink>
    )
}

MenuItem.propTypes = {
    label: PropTypes.string,
    address: PropTypes.string,
    icon: PropTypes.elementType,
    onNavigate: PropTypes.func,
}

export default MenuItem
