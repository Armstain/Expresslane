
import { useState } from "react";
import { Helmet } from "react-helmet-async";


const About = () => {
    const [openTab, setOpenTab] = useState(1);


    return (

        <div className="container mx-auto mt-12">
            <h1 className="text-3xl font-bold mb-8">About ExpressLane</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column - Our Story */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg shadow-lg">
                    <div className="p-8 text-white">
                        <h2 className="text-2xl font-semibold mb-4">Our Story</h2>
                        <p>
                            ExpressLane was founded in [Year] with a simple goal: to make parcel delivery fast, reliable, and affordable for everyone. We started small, but our dedication to exceptional service and innovative solutions quickly set us apart.
                        </p>
                        <p className="mt-4">
                            Today, we're proud to be one of the leading parcel delivery companies in [Your Region/Country]. We've built a network that spans [Number] cities, and we're constantly expanding our reach to serve even more customers.
                        </p>
                    </div>
                </div>

                {/* Middle Column - Our Mission */}
                <div className="bg-gradient-to-r from-orange-400 to-red-500 rounded-lg shadow-lg">
                    <div className="p-8 text-white">
                        <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
                        <p>
                            Our mission is to revolutionize the way people send and receive parcels. We believe that delivery should be a seamless experience, and we're committed to using technology and exceptional customer service to make that a reality.
                        </p>
                    </div>
                </div>

                {/* Right Column - Our Team */}
                <div className="bg-gradient-to-r from-green-400 to-teal-500 rounded-lg shadow-lg">
                    <div className="p-8 text-white">
                        <h2 className="text-2xl font-semibold mb-4">Our Team</h2>
                        <p>
                            We're a team of passionate individuals who are dedicated to making ExpressLane the best it can be. Our diverse team brings together expertise in logistics, technology, customer service, and more.
                        </p>
                        <p className="mt-4">
                            We're always looking for talented individuals to join our team. If you're passionate about delivery and want to make a difference, we'd love to hear from you!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;
