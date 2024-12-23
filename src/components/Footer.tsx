import React from 'react';
import { Link } from 'react-router-dom';
import { Camera } from 'lucide-react';

export const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Camera className="h-8 w-8 text-blue-400" />
              <span className="font-bold text-xl">ScreenCast</span>
            </div>
            <p className="text-gray-400">
              Record and share your screen effortlessly with our lightweight browser-based tool.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" onClick={scrollToTop} className="text-gray-400 hover:text-white">Home</Link></li>
              <li><Link to="/about" onClick={scrollToTop} className="text-gray-400 hover:text-white">About</Link></li>
              <li><Link to="/contact" onClick={scrollToTop} className="text-gray-400 hover:text-white">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link to="/privacy" onClick={scrollToTop} className="text-gray-400 hover:text-white">Privacy Policy</Link></li>
              <li><Link to="/terms" onClick={scrollToTop} className="text-gray-400 hover:text-white">Terms of Service</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-2 text-gray-400">
              <li>support@screencast.com</li>
              <li>1-800-SCREEN-CAST</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} ScreenCast. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};