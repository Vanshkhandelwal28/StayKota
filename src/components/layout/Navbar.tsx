import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, MapPin, User, LogOut, Heart, Calendar, LayoutDashboard, Shield } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export function Navbar() {
  const { user, logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileOpen(false);
  };
  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-paper/95 backdrop-blur-md border-b border-navy/10">
      <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <Link to="/" className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-full bg-navy flex items-center justify-center text-white text-sm font-semibold font-display">
              S
            </div>
            <span className="text-base font-semibold text-navy tracking-tight">StayKota</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-0.5" aria-label="Primary">
            {[
              ['/', 'Home'],
              ['/explore', 'Explore'],
              ['/how-it-works', 'How it works'],
            ].map(([p, l]) => (
              <Link
                key={p}
                to={p}
                className={`px-3 py-1.5 text-sm rounded-pill focus:outline-none focus:ring-2 focus:ring-navy/30 ${
                  isActive(p) ? 'text-navy font-medium' : 'text-ink hover:text-navy'
                }`}
              >
                {l}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2.5">
            <span className="hidden xl:inline-flex items-center gap-1.5 text-xs text-ink">
              <MapPin className="w-3.5 h-3.5 text-gold" />
              Kota, Rajasthan
            </span>
            {user ? (
              <div className="flex items-center gap-1.5">
                {user.role === 'student' && (
                  <>
                    <Link to="/favourites" className="p-2 text-ink hover:text-navy rounded-full" aria-label="Favourites">
                      <Heart className="w-4 h-4" />
                    </Link>
                    <Link to="/visits" className="p-2 text-ink hover:text-navy rounded-full" aria-label="Visits">
                      <Calendar className="w-4 h-4" />
                    </Link>
                  </>
                )}
                {user.role === 'owner' && (
                  <Link
                    to="/owner"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-navy hover:bg-mist rounded-pill"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                )}
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-navy hover:bg-mist rounded-pill"
                  >
                    <Shield className="w-4 h-4" />
                    Admin
                  </Link>
                )}
                <div className="flex items-center gap-2 pl-2 border-l border-navy/10">
                  <div className="w-7 h-7 rounded-full bg-mist flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-navy" />
                  </div>
                  <span className="hidden lg:inline text-sm font-medium text-navy max-w-[8rem] truncate">{user.name}</span>
                  <button
                    onClick={handleLogout}
                    className="p-1.5 text-ink hover:text-red-600 rounded-full"
                    aria-label="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="inline-flex items-center h-9 px-4 text-sm font-medium text-navy border border-navy/20 rounded-pill hover:bg-mist focus:outline-none focus:ring-2 focus:ring-navy/30"
                >
                  Log in
                </Link>
                <Link
                  to="/explore"
                  className="inline-flex items-center h-9 px-4 text-sm font-medium text-white bg-navy rounded-pill hover:bg-blue focus:outline-none focus:ring-2 focus:ring-navy/40"
                >
                  Find a Hostel
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2 text-navy"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-navy/10 bg-paper px-4 py-3 space-y-1">
          <Link to="/" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-navy">
            Home
          </Link>
          <Link to="/explore" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-navy">
            Explore
          </Link>
          <Link
            to="/how-it-works"
            onClick={() => setMobileOpen(false)}
            className="block px-3 py-2.5 text-sm font-medium text-navy"
          >
            How it works
          </Link>
          {user ? (
            <>
              {user.role === 'student' && (
                <>
                  <Link to="/favourites" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-navy">Favourites</Link>
                  <Link to="/visits" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-navy">Visits</Link>
                </>
              )}
              {user.role === 'owner' && (
                <Link to="/owner" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-navy">Dashboard</Link>
              )}
              {user.role === 'admin' && (
                <Link to="/admin" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-navy">Admin</Link>
              )}
              <button onClick={handleLogout} className="w-full text-left px-3 py-2.5 text-sm font-medium text-red-600">
                Logout
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-2 pt-2">
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="inline-flex items-center justify-center h-10 px-4 text-sm font-medium text-navy border border-navy/20 rounded-pill"
              >
                Log in
              </Link>
              <Link
                to="/explore"
                onClick={() => setMobileOpen(false)}
                className="inline-flex items-center justify-center h-10 px-4 text-sm font-medium text-white bg-navy rounded-pill"
              >
                Find a Hostel
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
