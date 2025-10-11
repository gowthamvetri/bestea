import React from 'react';
import { Link } from 'react-router-dom';
import { FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer */}
      <div className="py-12">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Company Info */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">B</span>
                </div>
                <span className="text-2xl font-bold font-serif">BESTEA</span>
              </div>
              <p className="text-gray-400 mb-4">
                Premium Assam tea blended in Tamil Nadu. From our gardens to your cup, 
                we bring you the finest tea experience.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                  <span className="w-5 h-5 bg-green-600 text-white text-xs flex items-center justify-center rounded">f</span>
                </a>
                <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                  <span className="w-5 h-5 bg-pink-600 text-white text-xs flex items-center justify-center rounded">i</span>
                </a>
                <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                  <span className="w-5 h-5 bg-green-500 text-white text-xs flex items-center justify-center rounded">t</span>
                </a>
                <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                  <span className="w-5 h-5 bg-red-600 text-white text-xs flex items-center justify-center rounded">y</span>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link to="/shop" className="text-gray-400 hover:text-white transition-colors">Shop</Link></li>
                <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/recipes" className="text-gray-400 hover:text-white transition-colors">Recipes</Link></li>
                <li><Link to="/blog" className="text-gray-400 hover:text-white transition-colors">Blog</Link></li>
                <li><Link to="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>

            {/* Customer Service */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Customer Service</h4>
              <ul className="space-y-2">
                <li><Link to="/orders" className="text-gray-400 hover:text-white transition-colors">Track Order</Link></li>
                <li><Link to="/shipping" className="text-gray-400 hover:text-white transition-colors">Shipping Info</Link></li>
                <li><Link to="/returns" className="text-gray-400 hover:text-white transition-colors">Returns</Link></li>
                <li><Link to="/faq" className="text-gray-400 hover:text-white transition-colors">FAQ</Link></li>
                <li><Link to="/support" className="text-gray-400 hover:text-white transition-colors">Support</Link></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <FaPhone className="text-green-400 flex-shrink-0" />
                  <div>
                    <p className="text-gray-400">8000587288</p>
                    <p className="text-gray-400">9500595929</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <FaEnvelope className="text-green-400 flex-shrink-0" />
                  <p className="text-gray-400">bestea@gmail.com</p>
                </div>
                <div className="flex items-start space-x-3">
                  <FaMapMarkerAlt className="text-green-400 flex-shrink-0 mt-1" />
                  <p className="text-gray-400">Tamil Nadu, India</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-800 py-6">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {currentYear} BESTEA. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/privacy-policy" className="text-gray-400 hover:text-white text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms-conditions" className="text-gray-400 hover:text-white text-sm transition-colors">
                Terms & Conditions
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
