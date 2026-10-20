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
    <Link to={`/hostel/${hostel.id}`} className="block group h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-navy rounded-card">
      <article className="bg-white rounded-card border border-navy/10 overflow-hidden shadow-card hover:shadow-md transition-shadow h-full flex flex-col">
        <div className="relative aspect-[4/3] overflow-hidden bg-mist">
          <img src={hostel.coverImage} alt={hostel.name} className="w-full h-full object-cover" loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=70'; }} />
          <div className="absolute top-3 left-3">
            <span className="inline-flex px-2.5 py-1 rounded-pill text-xs font-medium bg-navy/90 text-white">{categoryLabel}</span>
          </div>
          {user?.role === 'student' && (
            <button onClick={handleFav} className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center ${
              fav ? 'bg-navy text-gold' : 'bg-white/95 text-navy'}`} aria-label={fav ? 'Remove favourite' : 'Save favourite'} aria-pressed={fav}>
              <Heart className={`w-4 h-4 ${fav ? 'fill-current' : ''}`} />
            </button>
          )}
        </div>
        <div className="p-4 flex flex-col flex-1">
          <h3 className="font-display text-xl font-semibold text-navy leading-tight">{hostel.name}</h3>
          <div className="flex items-center gap-1 mt-1 text-sm text-ink"><MapPin className="w-3.5 h-3.5 text-gold" /><span>{hostel.locality}, Kota</span></div>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {tags.slice(0, 4).map(t => (
              <span key={t} className="px-2 py-0.5 rounded-md bg-mist text-[11px] text-navy border border-navy/10">{t}</span>
            ))}
          </div>
          <div className="mt-auto pt-3 flex items-end justify-between gap-3">
            <div>
              <span className="text-lg font-semibold text-navy">₹{minRent.toLocaleString('en-IN')}</span>
              <span className="text-xs text-ink"> / month from</span>
            </div>
            <span className="text-sm font-medium text-blue">View details</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
