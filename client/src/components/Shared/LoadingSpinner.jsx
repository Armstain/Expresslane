import { TbFidgetSpinner } from 'react-icons/tb';

const LoadingSpinner = ({ size = 40 }) => {
    return (
        <div className="flex justify-center items-center w-full h-full">
            <TbFidgetSpinner className={`animate-spin text-blue-500 h-${size} w-${size}`} />
        </div>
    );
};

export default LoadingSpinner;
