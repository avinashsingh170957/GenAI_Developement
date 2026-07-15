import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-primary-600 shadow-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 text-white font-bold text-xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6M9 8h1m4 12H7a2 2 0 01-2-2V6a2 2 0 012-2h5.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V18a2 2 0 01-2 2z" />
            </svg>
            PDF Portal
          </Link>

          {user && (
            <div className="flex items-center gap-4">
              <span className="hidden sm:inline text-primary-50 text-sm">
                {user.name} <span className="uppercase text-xs bg-white/20 px-2 py-0.5 rounded ml-1">{user.role}</span>
              </span>
              <button
                onClick={handleLogout}
                className="bg-white text-primary-700 hover:bg-gray-100 font-medium px-4 py-1.5 rounded-md text-sm transition"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
