import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Heart } from 'lucide-react';
import type { Hostel } from '../../types';
import { useApp } from '../../context/AppContext';

interface HostelCardProps { hostel: Hostel; }

export function HostelCard({ hostel }: HostelCardProps) {
  const { user, toggleFavourite, isFavourite } = useApp();
  const fav = isFavourite(hostel.id);
  const minRent = Math.min(...hostel.roomTypes.map(r => r.rent));
  const availableRooms = hostel.roomTypes.filter(r => r.available);

  const handleFav = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (user?.role === 'student') toggleFavourite(hostel.id);
  };

  const categoryLabel = hostel.category === 'boys' ? 'Boys' : hostel.category === 'girls' ? 'Girls' : 'Co-ed';
  const tags: string[] = [];
  if (availableRooms[0]) tags.push(availableRooms[0].sharingType.charAt(0).toUpperCase() + availableRooms[0].sharingType.slice(1) + ' sharing');
  if (hostel.amenities.includes('Meals')) tags.push('Mess');
  if (hostel.amenities.includes('WiFi')) tags.push('Wi-Fi');
  if (hostel.amenities.includes('Laundry')) tags.push('Laundry');

  return (
    <Link to={`/hostel/${hostel.id}`} className="block group h-full">
      <article className="surface-card card-glow overflow-hidden h-full flex flex-col bg-[#161d33] border border-violet-500/15 rounded-2xl">
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-900">
          <img
            src={hostel.coverImage}
            alt={hostel.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=70'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#161d33] via-transparent to-transparent opacity-80" />
          <div className="absolute top-3 left-3">
            <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-violet-600/90 text-white backdrop-blur-sm shadow-lg shadow-violet-500/30">
              {categoryLabel}
            </span>
          </div>
          {user?.role === 'student' && (
            <button
              onClick={handleFav}
              className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${
                fav
                  ? 'bg-red-500 text-white shadow-lg shadow-red-500/40'
                  : 'bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm'
              }`}
              aria-label="Favourite"
            >
              <Heart className={`w-4 h-4 ${fav ? 'fill-current' : ''}`} />
            </button>
          )}
        </div>
        <div className="p-4 flex flex-col flex-1">
          <h3 className="font-semibold text-slate-100 text-[15px] group-hover:text-violet-300 transition-colors duration-300">
            {hostel.name}
          </h3>
          <div className="flex items-center gap-1 mt-1 text-sm text-slate-400">
            <MapPin className="w-3.5 h-3.5 text-violet-400/80" />
            <span>{hostel.locality}, Kota</span>
          </div>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {tags.slice(0, 4).map(t => (
              <span
                key={t}
                className="px-2 py-0.5 rounded-md bg-violet-500/10 text-[11px] text-violet-200/90 border border-violet-500/20"
              >
                {t}
              </span>
            ))}
          </div>
          <div className="mt-auto pt-3 flex items-center justify-between">
            <div>
              <span className="text-lg font-bold text-white">₹{minRent.toLocaleString()}</span>
              <span className="text-xs text-slate-400">/month onwards</span>
            </div>
            <span className="text-sm font-medium text-violet-400 group-hover:text-violet-300 group-hover:underline transition-colors">
              View details →
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
