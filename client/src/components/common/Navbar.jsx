import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Utensils, LogOut, LayoutDashboard, Sparkles, Menu, X } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'DONOR': return '/donor';
      case 'NGO': return '/ngo';
      case 'VOLUNTEER': return '/volunteer';
      case 'ADMIN': return '/admin';
      default: return '/';
    }
  };

  return (
    <nav className="glass-panel sticky top-0 z-50 px-4 sm:px-6 py-3.5 shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2.5 sm:space-x-3 group">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-forest-800 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
            <Utensils className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-300" />
          </div>
          <div>
            <div className="font-extrabold text-lg sm:text-xl text-forest-950 tracking-tight flex items-center gap-1.5">
              FoodBridge<span className="text-forest-600">AI</span>
              <span className="hidden xs:inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-forest-800 uppercase tracking-wider">
                Rescue Engine
              </span>
            </div>
            <p className="hidden sm:block text-[11px] text-gray-500 font-medium">Good Food Deserves a Destination</p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center space-x-8 text-sm font-semibold text-gray-600">
          <Link to="/" className="hover:text-forest-700 transition-colors">Home</Link>
          <a href="/#how-it-works" className="hover:text-forest-700 transition-colors">How It Works</a>
          <a href="/#innovation" className="hover:text-forest-700 transition-colors flex items-center gap-1">
            <Sparkles className="w-4 h-4 text-amber-500" /> AI Engine
          </a>
          <a href="/#impact" className="hover:text-forest-700 transition-colors">Impact Analytics</a>
        </div>

        {/* Desktop CTA & Actions */}
        <div className="hidden md:flex items-center space-x-3">
          {user ? (
            <div className="flex items-center space-x-2">
              <Link
                to={getDashboardPath()}
                className="flex items-center space-x-2 bg-forest-800 hover:bg-forest-900 text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition shadow-sm"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard ({user.role})</span>
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-500 hover:text-red-600 transition rounded-lg hover:bg-gray-100"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="text-gray-700 hover:text-forest-800 text-xs sm:text-sm font-semibold px-3 py-2"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-forest-800 hover:bg-forest-900 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition shadow-md hover:shadow-lg"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center space-x-2">
          {user && (
            <Link
              to={getDashboardPath()}
              className="bg-forest-800 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Portal</span>
            </Link>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-gray-600 hover:text-forest-800 hover:bg-gray-100 transition"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden pt-4 pb-3 border-t border-gray-100 mt-3 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex flex-col space-y-2 text-sm font-semibold text-gray-700 px-2">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-gray-50 hover:text-forest-800"
            >
              Home
            </Link>
            <a
              href="/#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-gray-50 hover:text-forest-800"
            >
              How It Works
            </a>
            <a
              href="/#innovation"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-gray-50 hover:text-forest-800 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-500" /> AI Engine
            </a>
          </div>

          <div className="pt-2 border-t border-gray-100 px-2 space-y-2">
            {user ? (
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 font-medium">Logged in as {user.name}</span>
                <button
                  onClick={handleLogout}
                  className="text-xs text-red-600 font-bold flex items-center gap-1 py-1 px-2 rounded-lg hover:bg-red-50"
                >
                  <LogOut className="w-3.5 h-3.5" /> Logout
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 bg-gray-50 text-gray-700 font-bold text-xs rounded-xl border border-gray-200"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 bg-forest-800 text-white font-bold text-xs rounded-xl shadow-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
