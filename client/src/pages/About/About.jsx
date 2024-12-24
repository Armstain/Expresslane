import { Helmet } from "react-helmet-async";
import { FaTruck, FaUsers, FaChartLine } from "react-icons/fa";

const About = () => {
  return (
    <>
      <Helmet>
        <title>About Us | ExpressLane</title>
      </Helmet>

      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Delivering Excellence Since 2020
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            ExpressLane is revolutionizing parcel delivery with innovative
            technology and exceptional service across Bangladesh.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {[
            { icon: FaTruck, stat: "50K+", label: "Deliveries" },
            { icon: FaUsers, stat: "100+", label: "Team Members" },
            { icon: FaChartLine, stat: "98%", label: "Success Rate" },
          ].map((item, index) => (
            <div
              key={index}
              className="text-center p-8 rounded-xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow"
            >
              <item.icon className="w-12 h-12 mx-auto mb-4 text-blue-500" />
              <h3 className="text-3xl font-bold mb-2">{item.stat}</h3>
              <p className="text-gray-600 dark:text-gray-300">{item.label}</p>
            </div>
          ))}
        </div>

        {/* Content Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Mission & Vision */}
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 p-8 rounded-xl">
              <h2 className="text-2xl font-bold mb-4 text-blue-600 dark:text-blue-400">
                Our Mission
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                To provide fast, reliable, and affordable delivery solutions
                while maintaining the highest standards of customer service and
                technological innovation.
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-700 p-8 rounded-xl">
              <h2 className="text-2xl font-bold mb-4 text-purple-600 dark:text-purple-400">
                Our Vision
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                To become Bangladesh's most trusted and innovative logistics
                partner, setting new standards in the delivery industry.
              </p>
            </div>
          </div>

          {/* Values & Team */}
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-gray-800 dark:to-gray-700 p-8 rounded-xl">
              <h2 className="text-2xl font-bold mb-4 text-green-600 dark:text-green-400">
                Our Values
              </h2>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
                <li>Customer-First Approach</li>
                <li>Innovation & Technology</li>
                <li>Reliability & Punctuality</li>
                <li>Environmental Responsibility</li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-gray-800 dark:to-gray-700 p-8 rounded-xl">
              <h2 className="text-2xl font-bold mb-4 text-orange-600 dark:text-orange-400">
                Join Our Team
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                We're always looking for passionate individuals to join our
                growing team. If you're driven by excellence and innovation,
                we'd love to hear from you.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default About;
