import { Link } from 'react-router-dom';
import { authService } from '../services/auth';
import { useEffect, useState } from 'react';

export const Navigation = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = await authService.isAuthenticated();
      setIsAuthenticated(isAuth);
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    await authService.logout();
  };

  return (
    <nav className="bg-gray-900/50 backdrop-blur-sm fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl">📹</span>
              <span className="text-xl font-semibold text-white">ScreenCast</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-gray-300 hover:text-white px-3 py-2">
              Home
            </Link>
            <Link to="/about" className="text-gray-300 hover:text-white px-3 py-2">
              About
            </Link>
            <Link to="/contact" className="text-gray-300 hover:text-white px-3 py-2">
              Contact
            </Link>
            
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="text-gray-300 hover:text-white px-3 py-2 flex items-center space-x-1"
              >
                <span>Disconnect</span>
                <span className="text-sm">↗</span>
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </nav>
  );
}; 