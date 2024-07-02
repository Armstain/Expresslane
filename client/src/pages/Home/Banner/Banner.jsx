import { Input } from "@/components/ui/input";
import { Fade } from "react-awesome-reveal";

const Banner = () => {
    return (
        <div className="relative h-[500px] flex items-center justify-center bg-cover bg-center overflow-hidden rounded-md" style={{ backgroundImage: "url('https://i.ibb.co/d6DJv1b/patrick-robert-doyle-AH8z-KXq-FITA-unsplash.jpg)" }}>
            <div className="absolute inset-0 bg-black opacity-50"></div>
            <div className="z-10 text-center max-w-screen-md">
                <Fade direction="down" cascade>
                    <h1 className="text-5xl font-extrabold text-white mb-4 shadow-md">Send Your Parcels with Ease and Speed</h1>
                    <p className="text-lg text-gray-300 mb-8">Reliable, fast, and affordable delivery services at your fingertips.</p>
                    <Input
                        type="text"
                        placeholder="Track your parcel..."
                        className="w-full md:w-1/2 mx-auto"
                    />
                </Fade>
            </div>
        </div>
    );
};

export default Banner;
