import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  Sparkles,
  Compass,
  ShieldCheck,
  Building2,
  BarChart3,
  Bell,
  Settings,
  Search,
  ChevronDown,
  Menu,
  X,
  LogOut,
  UtensilsCrossed,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const DashboardLayout = ({ children, title, subtitle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Modern navigation items directly matching the target UI design
  const navItems = [
    { to: '/donor', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/donor/create', label: 'Post a Donation', icon: PlusCircle },
    { to: '/donor/matches', label: 'AI Match Engine', icon: Sparkles },
    { to: '/donor/rescues', label: 'Rescue Route Planner', icon: Compass },
    { to: '/donor/safety', label: 'Food Safety Center', icon: ShieldCheck },
    { to: '/ngo', label: 'NGO Network', icon: Building2 },
    { to: '/admin', label: 'Impact Analytics', icon: BarChart3 },
    { to: '/donor/activity', label: 'Alerts & Activity', icon: Bell, badge: 3 },
    { to: '/donor/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F4F6F5] flex flex-col md:flex-row font-sans text-slate-800">
      {/* ============================================================== */}
      {/* LEFT SIDEBAR (Dark Emerald / Forest Green matching the image)  */}
      {/* ============================================================== */}
      <aside className="hidden md:flex flex-col justify-between w-64 bg-[#0B3B24] text-white shrink-0 sticky top-0 h-screen select-none z-30 shadow-xl overflow-hidden">
        {/* Top: Logo & Brand */}
        <div className="p-5 pb-2">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-[#14532D] border border-emerald-500/30 flex items-center justify-center text-emerald-300 shadow-sm group-hover:scale-105 transition-transform">
              <UtensilsCrossed className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="font-extrabold text-lg text-white tracking-tight flex items-center">
                FoodBridge<span className="text-emerald-400 font-black">AI</span>
              </div>
              <div className="text-[11px] text-emerald-300/80 font-medium -mt-0.5 tracking-wide">
                Smart Surplus Food Rescue
              </div>
            </div>
          </Link>
        </div>

        {/* Center: Navigation Links */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                    isActive
                      ? 'bg-[#18633B] text-white shadow-sm font-bold'
                      : 'text-emerald-100/75 hover:bg-[#114A2D] hover:text-white'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-emerald-300 group-hover:text-emerald-200 transition-colors" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-extrabold flex items-center justify-center shadow-xs">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Bottom Illustrated Leaf Card matching the target UI */}
        <div className="p-4 pt-1">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#114A2D] to-[#0A301D] border border-emerald-600/30 p-4 text-center">
            {/* Illustrated Sprout Graphic */}
            <div className="w-12 h-12 mx-auto mb-2 relative flex items-center justify-center">
              <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-md"></div>
              <div className="w-10 h-10 rounded-full bg-emerald-900/60 border border-emerald-400/40 flex items-center justify-center text-xl">
                🌱
              </div>
            </div>
            <div className="text-xs font-extrabold text-white leading-tight">
              Less Food Waste
            </div>
            <div className="text-[11px] font-medium text-emerald-300/90 mt-0.5">
              More Happy Plates
            </div>
          </div>
        </div>
      </aside>

      {/* ============================================================== */}
      {/* MOBILE HEADER (for screens < md)                               */}
      {/* ============================================================== */}
      <div className="md:hidden bg-[#0B3B24] text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-md">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#14532D] flex items-center justify-center text-emerald-300">
            <UtensilsCrossed className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm tracking-tight">FoodBridgeAI</span>
        </Link>
        <button
          onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
          className="p-1.5 rounded-lg bg-[#14532D] text-emerald-200 hover:text-white"
        >
          {mobileDrawerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileDrawerOpen && (
        <div className="md:hidden bg-[#0B3B24] border-t border-emerald-900 px-4 py-3 space-y-1 sticky top-[53px] z-40 text-white animate-in slide-in-from-top-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMobileDrawerOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold ${
                    isActive ? 'bg-[#18633B] text-white' : 'text-emerald-100/80 hover:bg-[#114A2D]'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 text-emerald-300" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
          <div className="pt-2 border-t border-emerald-800/60 flex items-center justify-between">
            <span className="text-xs text-emerald-200/80">{user?.name}</span>
            <button
              onClick={handleLogout}
              className="text-xs text-red-300 hover:text-red-200 font-bold flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* RIGHT MAIN CONTAINER                                           */}
      {/* ============================================================== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOP BAR matching target UI (Greeting, Search Bar, Notifications, Profile) */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 sm:px-6 py-3 sticky top-0 z-20 flex items-center justify-between gap-4">
          {/* Greeting message */}
          <div className="flex items-center gap-2.5">
            <span className="text-2xl animate-bounce">👋</span>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight flex items-center gap-1.5">
                Good Afternoon, {user?.name ? user.name.split(' ')[0] : 'Nitin'}! 👏
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
                Every meal saved makes a difference.
              </p>
            </div>
          </div>

          {/* Search bar, Notification Bell & User profile */}
          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="hidden lg:flex items-center relative w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Search donations, NGOs, or locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-full text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                className="w-8 h-8 rounded-full border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-600 transition relative"
                aria-label="View notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center">
                  3
                </span>
              </button>
            </div>

            {/* User Profile Pill with avatar & role */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2.5 pl-1.5 pr-2 py-1 rounded-full hover:bg-slate-50 border border-transparent hover:border-slate-200 transition text-left"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-xs overflow-hidden">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'N'}
                </div>
                <div className="hidden sm:block leading-tight">
                  <div className="text-xs font-bold text-slate-800 truncate max-w-[120px]">
                    {user?.name || 'Nitin Kumar Pandey'}
                  </div>
                  <div className="text-[10px] text-slate-400 capitalize font-medium">
                    {user?.role ? user.role.toLowerCase() : 'Donor'}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {/* Profile Dropdown */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50 text-xs animate-in fade-in slide-in-from-top-2">
                  <div className="px-3.5 py-2 border-b border-slate-100">
                    <p className="font-bold text-slate-800 truncate">{user?.name || 'Nitin Kumar'}</p>
                    <p className="text-[10px] text-slate-400 truncate">{user?.email || 'canteen@college.edu'}</p>
                  </div>
                  <Link
                    to="/donor"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="block px-3.5 py-2 hover:bg-slate-50 font-medium text-slate-700"
                  >
                    Dashboard Overview
                  </Link>
                  <Link
                    to="/donor/create"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="block px-3.5 py-2 hover:bg-slate-50 font-medium text-slate-700"
                  >
                    Post a Donation
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3.5 py-2 hover:bg-red-50 text-red-600 font-bold flex items-center gap-1.5 border-t border-slate-100 mt-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* PAGE CONTENT CONTAINER */}
        <main className="flex-1 p-3 sm:p-5 md:p-6 w-full max-w-[1600px] mx-auto">
          {children}
        </main>

        {/* Global Micro-footer matching screenshot bottom green banner */}
        <footer className="px-6 py-2.5 bg-white border-t border-slate-200/70 text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
            <span>🌱</span> Real Time. Smart Matching. Greater Impact.
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span>🤝</span> Together for a Hunger-Free Tomorrow
          </div>
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;
