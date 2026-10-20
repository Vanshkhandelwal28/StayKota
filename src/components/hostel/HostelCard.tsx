import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Heart, ArrowRight, Users, Utensils, Wifi, Droplets } from 'lucide-react';
import type { Hostel } from '../../types';
import { useApp } from '../../context/AppContext';

interface HostelCardProps { hostel: Hostel; }

export function HostelCard({ hostel }: HostelCardProps) {
  const { user, toggleFavourite, isFavourite } = useApp();
  const fav = isFavourite(hostel.id);
  const minRent = Math.min(...hostel.roomTypes.map(r => r.rent));
  const availableRooms = hostel.roomTypes.filter(r => r.available);

  const handleFav = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (user?.role === 'student') toggleFavourite(hostel.id);
  };

  const categoryLabel = hostel.category === 'boys' ? 'Boys' : hostel.category === 'girls' ? 'Girls' : 'Co-ed';

  const amenityChips: { key: string; label: string; icon: React.ReactNode }[] = [];
  if (availableRooms[0]) {
    const st = availableRooms[0].sharingType;
    amenityChips.push({
      key: 'share',
      label: `${st.charAt(0).toUpperCase()}${st.slice(1)} sharing`,
      icon: <Users className="w-3 h-3" aria-hidden />,
    });
  }
  if (hostel.amenities.includes('Meals')) {
    amenityChips.push({ key: 'mess', label: 'Mess', icon: <Utensils className="w-3 h-3" aria-hidden /> });
  }
  if (hostel.amenities.includes('WiFi')) {
    amenityChips.push({ key: 'wifi', label: 'Wi-Fi', icon: <Wifi className="w-3 h-3" aria-hidden /> });
  }
  if (hostel.amenities.includes('Laundry')) {
    amenityChips.push({ key: 'laundry', label: 'Laundry', icon: <Droplets className="w-3 h-3" aria-hidden /> });
  }

  return (
    <Link
      to={`/hostel/${hostel.id}`}
      className="block group h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#073B55] focus-visible:ring-offset-2 rounded-[1.25rem]"
    >
      <article className="bg-white rounded-[1.25rem] border border-[#E1E7EA] overflow-hidden shadow-[0_6px_22px_rgba(7,59,85,0.06)] hover:shadow-[0_12px_32px_rgba(7,59,85,0.11)] hover:-translate-y-0.5 transition-[box-shadow,transform] duration-300 h-full flex flex-col motion-reduce:transform-none">
        <div className="relative aspect-[16/10] overflow-hidden bg-[#F4F6F7]">
          <img
            src={hostel.coverImage}
            alt={hostel.name}
            className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            loading="lazy"
            width={640}
            height={400}
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=70';
            }}
          />
          <div className="absolute top-3.5 left-3.5">
            <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-[#073B55]/92 text-white backdrop-blur-sm">
              {categoryLabel}
            </span>
          </div>
          {user?.role === 'student' && (
            <button
              type="button"
              onClick={handleFav}
              className={`absolute top-3.5 right-3.5 w-9 h-9 rounded-full flex items-center justify-center shadow-sm transition-colors ${
                fav ? 'bg-[#073B55] text-[#F5A91F]' : 'bg-white/95 text-[#607386] hover:text-[#073B55]'
              }`}
              aria-label={fav ? 'Remove favourite' : 'Save favourite'}
              aria-pressed={fav}
            >
              <Heart className={`w-4 h-4 ${fav ? 'fill-current' : ''}`} />
            </button>
          )}
        </div>

        <div className="px-4 pt-3.5 pb-4 flex flex-col flex-1">
          <h3 className="font-display text-[1.2rem] sm:text-[1.3rem] font-semibold text-[#073B55] leading-snug break-words">
            {hostel.name}
          </h3>
          <div className="flex items-center gap-1.5 mt-1 text-[14px] text-[#607386]">
            <MapPin className="w-3.5 h-3.5 text-[#F5A91F] shrink-0" aria-hidden />
            <span>{hostel.locality}, Kota</span>
          </div>

          {amenityChips.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {amenityChips.slice(0, 4).map((t) => (
                <span
                  key={t.key}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#F0F4F7] text-[11px] text-[#176A96] border border-[#E1E7EA]"
                >
                  {t.icon}
                  {t.label}
                </span>
              ))}
            </div>
          )}

          <div className="mt-auto pt-3.5 flex items-center justify-between gap-2">
            <div className="flex items-baseline gap-1 min-w-0">
              <span className="text-[1.2rem] sm:text-[1.3rem] font-semibold text-[#073B55] tracking-tight">
                ₹{minRent.toLocaleString('en-IN')}
              </span>
              <span className="text-[12px] text-[#607386] whitespace-nowrap">/ month from</span>
            </div>
            <span className="inline-flex items-center gap-1 h-8 px-3 rounded-full border border-[#073B55]/20 text-[12px] font-semibold text-[#073B55] shrink-0 group-hover:bg-[#073B55] group-hover:text-white group-hover:border-[#073B55] transition-colors">
              View details
              <ArrowRight className="w-3.5 h-3.5" aria-hidden />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
