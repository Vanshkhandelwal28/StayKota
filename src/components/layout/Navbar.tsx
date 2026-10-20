import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, MapPin, User, LogOut, Heart, Calendar, LayoutDashboard, Shield, Phone } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { phoneHref } from '../../config/contact';

function StayKotaWordmark({ className = '' }: { className?: string }) {
  return (
    <Link to="/" className={`inline-flex items-center justify-center ${className}`} aria-label="StayKota home">
      <span className="font-display text-[clamp(1.75rem,3.2vw,3.25rem)] font-semibold tracking-[0.02em] text-[#1265A1] leading-none">
        StayK
        <span className="relative inline-block">
          o
          <span
            className="absolute left-1/2 -translate-x-1/2 -top-[0.28em] w-[0.72em] h-[0.28em] border-t-[2.5px] border-[#1265A1] rounded-t-[50%]"
            aria-hidden
          />
        </span>
        ta
      </span>
    </Link>
  );
}

export function Navbar() {
  const { user, logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const tel = phoneHref();

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileOpen(false);
  };
  const isActive = (path: string) => location.pathname === path;

  const callUs = (
    <a
      href={tel || '#contact'}
      onClick={(e) => {
        if (!tel) {
          e.preventDefault();
          window.alert('Call number will be added soon. Use WhatsApp or Log in for now.');
        }
      }}
      className="inline-flex items-center gap-2 h-10 sm:h-11 px-4 sm:px-5 rounded-full bg-[#F5A91F] text-[#073B55] text-sm font-semibold shadow-sm hover:bg-[#e39a12] focus:outline-none focus:ring-2 focus:ring-[#F5A91F]/40"
    >
      <Phone className="w-4 h-4" aria-hidden />
      Call Us
    </a>
  );

  return (
    <header className="sticky top-0 z-50 bg-[#F7F8F7] border-b border-navy/5">
      <div className="relative max-w-[90rem] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-[4.5rem] sm:h-[5.5rem] lg:h-[6.25rem]">
          <div className="flex items-center gap-2.5 sm:gap-3 z-10 min-w-0">
            <button
              type="button"
              className="p-2 text-[#073B55] hover:bg-black/5 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy/30"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Open menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
            <div className="hidden sm:block">{callUs}</div>
          </div>

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
            <StayKotaWordmark />
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5 z-10">
            {user ? (
              <div className="hidden md:flex items-center gap-1.5">
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
                  <Link to="/owner" className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-navy hover:bg-mist rounded-pill">
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                )}
                {user.role === 'admin' && (
                  <Link to="/admin" className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-navy hover:bg-mist rounded-pill">
                    <Shield className="w-4 h-4" />
                    Admin
                  </Link>
                )}
                <div className="flex items-center gap-2 pl-2 border-l border-navy/10">
                  <div className="w-7 h-7 rounded-full bg-mist flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-navy" />
                  </div>
                  <span className="hidden lg:inline text-sm font-medium text-navy max-w-[8rem] truncate">{user.name}</span>
                  <button onClick={handleLogout} className="p-1.5 text-ink hover:text-red-600 rounded-full" aria-label="Logout">
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <Link
                  to="/explore"
                  className="hidden sm:inline-flex items-center gap-1.5 h-10 sm:h-11 px-4 rounded-full border border-[#073B55]/25 text-[#073B55] text-sm font-medium hover:bg-white focus:outline-none focus:ring-2 focus:ring-navy/30"
                >
                  <MapPin className="w-4 h-4" aria-hidden />
                  Find a Location
                </Link>
                <Link
                  to="/explore"
                  className="inline-flex items-center h-10 sm:h-11 px-4 sm:px-5 rounded-full bg-[#073B55] text-white text-sm font-semibold hover:bg-[#0a4d6e] focus:outline-none focus:ring-2 focus:ring-navy/40"
                >
                  Book a Visit
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-navy/10 bg-[#F7F8F7] px-4 sm:px-8 py-4 shadow-card">
          <div className="max-w-[90rem] mx-auto space-y-1">
            <div className="sm:hidden mb-3">{callUs}</div>
            {[
              ['/', 'Home'],
              ['/explore', 'Explore'],
              ['/how-it-works', 'How it works'],
            ].map(([p, l]) => (
              <Link
                key={p}
                to={p}
                onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2.5 text-sm font-medium rounded-lg ${
                  isActive(p) ? 'bg-mist text-navy' : 'text-navy hover:bg-mist'
                }`}
              >
                {l}
              </Link>
            ))}
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
              <div className="pt-2 flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex items-center justify-center h-11 px-4 text-sm font-medium text-navy border border-navy/20 rounded-full"
                >
                  Log in
                </Link>
                <Link
                  to="/explore"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex items-center justify-center h-11 px-4 text-sm font-semibold text-white bg-[#073B55] rounded-full sm:hidden"
                >
                  Find a Location
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
