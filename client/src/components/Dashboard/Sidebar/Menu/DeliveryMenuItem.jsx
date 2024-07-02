import MenuItem from './MenuItem'
import { MdDeliveryDining } from "react-icons/md";
import { MdReviews } from "react-icons/md";

const DeliveryMenuItem = () => {
    return (
        <>
            <MenuItem icon={MdDeliveryDining} label='My Deliveries' address='my-deliveries' />
            <MenuItem icon={MdReviews} label='My Reviews' address='my-reviews' />

        </>
    );
};

export default DeliveryMenuItem;