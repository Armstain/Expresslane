
import { useTheme } from '@/components/theme-provider.jsx';
import { useState } from 'react';


const Contact = () => {
    const { theme } = useTheme();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form submitted:', { name, email, message });
    };

    return (
        <div className={`container mx-auto mt-12 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
            <h1 className="text-3xl font-bold mb-8">Contact Us</h1>

            <form onSubmit={handleSubmit} className={`bg-white rounded-lg p-8 shadow-md dark:bg-gray-800 dark:shadow-none ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                {/* Name Input */}
                <div className="mb-4">
                    <label htmlFor="name" className="block text-sm font-bold mb-2">Your Name</label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={`shadow appearance-none border rounded w-full py-2 px-3  leading-tight focus:outline-none focus:shadow-outline ${theme === 'dark' ? 'dark:bg-gray-700 dark:border-gray-600 dark:text-white' : 'bg-white border-gray-300'}`}
                        required
                    />
                </div>
                {/* Email Input */}
                <div className="mb-4">
                    <label htmlFor="email" className="block text-sm font-bold mb-2">Your Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`shadow appearance-none border rounded w-full py-2 px-3  leading-tight focus:outline-none focus:shadow-outline ${theme === 'dark' ? 'dark:bg-gray-700 dark:border-gray-600 dark:text-white' : 'bg-white border-gray-300'}`}
                        required
                    />
                </div>

                {/* Message Textarea */}
                <div className="mb-4">
                    <label htmlFor="message" className="block text-sm font-bold mb-2">Your Message</label>
                    <textarea
                        id="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className={`shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline ${theme === 'dark' ? 'dark:bg-gray-700 dark:border-gray-600 dark:text-white' : 'bg-white border-gray-300'}`}
                        required
                    />
                </div>

                {/* Submit Button */}
                <button type="submit" className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${theme === 'dark' ? 'dark:bg-blue-600 dark:hover:bg-blue-800' : ''}`}>
                    Send Message
                </button>

                {/* Other Ways to Reach Us */}
                <div className="mt-8">
                    <h2 className="text-xl font-semibold mb-4">Other Ways to Reach Us</h2>
                    {/* Add your contact details here (phone, address, etc.) */}
                    <p>Email: support@expresslane.com</p>
                    <p>Phone: +880 1234567890</p>
                </div>
            </form>
        </div>
    );
};

export default Contact;
