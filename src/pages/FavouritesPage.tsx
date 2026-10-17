import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { HostelCard } from '../components/hostel/HostelCard';

export function FavouritesPage() {
  const { user, hostels, favourites } = useApp();

  if (!user || user.role !== 'student') {
    return (
      <div className="app-dark min-h-[50vh] max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-slate-400">Please login as a student to view favourites.</p>
        <Link to="/login?role=student" className="mt-4 inline-block text-violet-400 font-medium">Login</Link>
      </div>
    );
  }

  const favHostels = hostels.filter(h =>
    favourites.some(f => f.hostelId === h.id && f.studentId === user.id) && h.status === 'approved'
  );

  return (
    <div className="app-dark min-h-[70vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
        <h1 className="text-2xl font-bold text-white mb-2">Your Favourites</h1>
        <p className="text-slate-400 mb-8">{favHostels.length} saved hostel{favHostels.length !== 1 ? 's' : ''}</p>

        {favHostels.length === 0 ? (
          <div className="text-center py-20 surface-card">
            <Heart className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No favourites yet</p>
            <Link to="/explore" className="mt-4 inline-block text-violet-400 font-medium">Browse hostels</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {favHostels.map((h, i) => (
              <div key={h.id} className="animate-slide-up" style={{ animationDelay: `${i * 0.06}s`, opacity: 0 }}>
                <HostelCard hostel={h} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
