import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, MapPin, User, LogOut, Heart, Calendar, LayoutDashboard, Shield } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';

export function Navbar() {
  const { user, logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isLanding = location.pathname === '/';
  const handleLogout = () => { logout(); navigate('/'); setMobileOpen(false); };
  const isActive = (path: string) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

  const navLink = (path: string, label: string) => (
    <Link
      key={path}
      to={path}
      className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
        isActive(path)
          ? isLanding
            ? 'text-teal-700 bg-teal-50'
            : 'text-violet-300 bg-violet-500/15'
          : isLanding
            ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            : 'text-slate-400 hover:text-white hover:bg-white/5'
      }`}
    >
      {label}
    </Link>
  );

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isLanding
          ? 'bg-white/95 backdrop-blur-md border-b border-slate-100'
          : 'nav-glass-dark'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold transition-transform duration-300 group-hover:scale-105 ${
                isLanding
                  ? 'bg-teal-600'
                  : 'bg-gradient-to-br from-violet-600 to-violet-500 shadow-lg shadow-violet-500/30'
              }`}
            >
              S
            </div>
            <div className="leading-tight">
              <span className={`text-lg font-bold ${isLanding ? 'text-slate-900' : 'text-white'}`}>
                StayKota
              </span>
              <span className={`hidden sm:block text-[11px] ${isLanding ? 'text-slate-500' : 'text-slate-500'}`}>
                Student stays in Kota
              </span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navLink('/', 'Home')}
            {navLink('/explore', 'Explore')}
            {navLink('/how-it-works', 'Help')}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <div className={`flex items-center gap-1.5 text-sm ${isLanding ? 'text-slate-500' : 'text-slate-400'}`}>
              <MapPin className="w-3.5 h-3.5" />
              <span>Kota, Rajasthan</span>
            </div>
            {user ? (
              <div className="flex items-center gap-2">
                {user.role === 'student' && (
                  <>
                    <Link
                      to="/favourites"
                      className={`p-2 rounded-lg transition-colors ${isLanding ? 'text-slate-500 hover:text-teal-700' : 'text-slate-400 hover:text-violet-300 hover:bg-white/5'}`}
                    >
                      <Heart className="w-4 h-4" />
                    </Link>
                    <Link
                      to="/visits"
                      className={`p-2 rounded-lg transition-colors ${isLanding ? 'text-slate-500 hover:text-teal-700' : 'text-slate-400 hover:text-violet-300 hover:bg-white/5'}`}
                    >
                      <Calendar className="w-4 h-4" />
                    </Link>
                  </>
                )}
                {user.role === 'owner' && (
                  <Link to="/owner">
                    <Button variant={isLanding ? 'ghost' : 'violet'} size="sm">
                      <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </Button>
                  </Link>
                )}
                {user.role === 'admin' && (
                  <Link to="/admin">
                    <Button variant="ghost" size="sm">
                      <Shield className="w-4 h-4" /> Admin
                    </Button>
                  </Link>
                )}
                <div className={`flex items-center gap-2 pl-2 border-l ${isLanding ? 'border-slate-200' : 'border-white/10'}`}>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isLanding ? 'bg-teal-100' : 'bg-violet-500/20'
                    }`}
                  >
                    <User className={`w-4 h-4 ${isLanding ? 'text-teal-700' : 'text-violet-300'}`} />
                  </div>
                  <span className={`text-sm font-medium ${isLanding ? 'text-slate-800' : 'text-slate-200'}`}>
                    {user.name}
                  </span>
                  <button
                    onClick={handleLogout}
                    className={`p-1.5 rounded-lg transition-colors ${isLanding ? 'text-slate-400 hover:text-red-500' : 'text-slate-500 hover:text-red-400 hover:bg-white/5'}`}
                    aria-label="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" size="sm" className={`rounded-full px-4 ${!isLanding ? 'border-violet-500/40 text-violet-300 hover:bg-violet-500/10' : ''}`}>
                    Log in
                  </Button>
                </Link>
                <Link to="/login?role=owner">
                  <Button size="sm" variant={isLanding ? 'primary' : 'violet'} className="rounded-full px-4">
                    List your hostel
                  </Button>
                </Link>
              </>
            )}
          </div>

          <button
            className={`md:hidden p-2 rounded-lg ${isLanding ? '' : 'text-slate-300 hover:bg-white/5'}`}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className={`md:hidden border-t px-4 py-3 space-y-1 animate-slide-up ${isLanding ? 'bg-white border-slate-100' : 'bg-[#12182a] border-violet-500/10'}`}>
          <Link to="/" onClick={() => setMobileOpen(false)} className={`block px-3 py-2.5 font-medium rounded-lg ${isLanding ? '' : 'text-slate-200 hover:bg-white/5'}`}>
            Home
          </Link>
          <Link to="/explore" onClick={() => setMobileOpen(false)} className={`block px-3 py-2.5 font-medium rounded-lg ${isLanding ? '' : 'text-slate-200 hover:bg-white/5'}`}>
            Explore
          </Link>
          {user ? (
            <button onClick={handleLogout} className="w-full text-left px-3 py-2.5 text-red-500 font-medium rounded-lg">
              Logout
            </button>
          ) : (
            <Link to="/login" onClick={() => setMobileOpen(false)}>
              <Button variant="outline" className="w-full rounded-full mt-2">
                Log in
              </Button>
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
