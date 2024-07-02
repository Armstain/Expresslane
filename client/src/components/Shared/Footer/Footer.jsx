'use client'

import { Facebook } from "lucide-react";
import { BsFacebook, BsInstagram, BsTwitter } from "react-icons/bs";
import { Link } from "react-router-dom";

const Footer = () => {
    return (
        <footer className="bg-gray-800 text-white mt-12">
            <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="md:flex md:items-center md:justify-between">
                    <div className="flex justify-center space-x-6 md:order-2">
                        {/* Social Media Links (replace with your actual links) */}
                        <Link href="#" className="text-gray-400 hover:text-white">
                            <span className="sr-only">Facebook</span>
                            <BsFacebook></BsFacebook>
                        </Link>
                        <Link href="#" className="text-gray-400 hover:text-white">
                            <span className="sr-only">Instagram</span>
                            <BsInstagram></BsInstagram>
                        </Link>
                        <Link href="#" className="text-gray-400 hover:text-white">
                            <span className="sr-only">Twitter</span>
                            <BsTwitter></BsTwitter>
                        </Link>
                    </div>

                    <div className="mt-8 md:mt-0 md:order-1">
                        <p className="text-center text-base text-gray-400">
                            &copy; {new Date().getFullYear()} ExpressLane. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
