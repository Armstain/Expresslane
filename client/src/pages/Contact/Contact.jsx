import { useTheme } from "@/components/theme-provider.jsx";
import { useState } from "react";
import { FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";
import { Helmet } from "react-helmet-async";

const Contact = () => {
  const { theme } = useTheme();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", { name, email, message });
  };

  return (
    <>
      <Helmet>
        <title>Contact Us | ExpressLane</title>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 py-12">
        <div className="container mx-auto px-4">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Get in Touch
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Have questions? We'd love to hear from you. Send us a message and
              we'll respond as soon as possible.
            </p>
          </div>

          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Input */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200"
                  >
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 
                                                 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100
                                                 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 
                                                 transition-all duration-200"
                    required
                  />
                </div>

                {/* Email Input */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200"
                  >
                    Your Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 
                                                 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100
                                                 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 
                                                 transition-all duration-200"
                    required
                  />
                </div>

                {/* Message Textarea */}
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200"
                  >
                    Your Message
                  </label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows="5"
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 
                                                 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100
                                                 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 
                                                 transition-all duration-200"
                    required
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 
                                             hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg
                                             transform transition-all duration-300 hover:scale-[1.02] focus:outline-none 
                                             focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                >
                  Send Message
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              {/* Contact Cards */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 transform transition-all duration-300 hover:scale-[1.02]">
                <div className="flex items-center space-x-4 mb-6">
                  <FaEnvelope className="w-6 h-6 text-blue-500" />
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                    Email Us
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  support@expresslane.com
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  business@expresslane.com
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 transform transition-all duration-300 hover:scale-[1.02]">
                <div className="flex items-center space-x-4 mb-6">
                  <FaPhone className="w-6 h-6 text-blue-500" />
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                    Call Us
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  +880 1234567890
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  +880 1987654321
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 transform transition-all duration-300 hover:scale-[1.02]">
                <div className="flex items-center space-x-4 mb-6">
                  <FaMapMarkerAlt className="w-6 h-6 text-blue-500" />
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                    Visit Us
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  123 Express Lane,
                  <br />
                  Dhaka, Bangladesh
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Contact;
