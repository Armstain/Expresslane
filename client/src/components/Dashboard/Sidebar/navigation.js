import {
    BarChart3,
    Bike,
    MessageSquareText,
    Package,
    PackagePlus,
    Truck,
    Users,
} from 'lucide-react'

// Sidebar links and default landing page for each role
export const ROLE_NAV = {
    user: [
        { label: 'Book a parcel', address: '/dashboard/book-parcel', icon: PackagePlus },
        { label: 'My parcels', address: '/dashboard/my-parcels', icon: Package },
    ],
    DeliveryMen: [
        { label: 'My deliveries', address: '/dashboard/my-deliveries', icon: Truck },
        { label: 'My reviews', address: '/dashboard/my-reviews', icon: MessageSquareText },
    ],
    admin: [
        { label: 'Statistics', address: '/dashboard/statistics', icon: BarChart3 },
        { label: 'All parcels', address: '/dashboard/all-parcels', icon: Package },
        { label: 'All users', address: '/dashboard/all-users', icon: Users },
        { label: 'Delivery men', address: '/dashboard/delivery-men', icon: Bike },
    ],
}

export const ROLE_LABEL = {
    user: 'Customer',
    DeliveryMen: 'Delivery partner',
    admin: 'Administrator',
}
