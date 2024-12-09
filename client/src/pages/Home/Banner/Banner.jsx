import { Input } from "@/components/ui/input";
import { Fade } from "react-awesome-reveal";
import { Link } from "react-router-dom";

const Banner = () => {
  return (
    <div
      className="relative h-[600px] flex items-center justify-center bg-cover bg-center overflow-hidden rounded-xl my-6"
      style={{
        backgroundImage:
          "url('https://i.ibb.co/d6DJv1b/patrick-robert-doyle-AH8z-KXq-FITA-unsplash.jpg')",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50"></div>
      <div className="z-10 text-center max-w-screen-md px-4">
        <Fade direction="down" cascade damping={0.2}>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
            Send Your Parcels with <span className="text-blue-400">Ease</span>{" "}
            and <span className="text-blue-400">Speed</span>
          </h1>
          <p className="text-xl text-gray-200 mb-8">
            Reliable, fast, and affordable delivery services at your fingertips.
          </p>
          <Link to="/dashboard">
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-full text-lg font-semibold transition-all">
              Get Started
            </button>
          </Link>
        </Fade>
      </div>
    </div>
  );
};

export default Banner;
