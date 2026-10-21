import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Check,
  ImageOff, LockKeyhole, MapPin, ShieldCheck, Star, Users, Utensils, Wifi, Droplets,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { distanceKm, formatDistance, getCampus, getMatchingRooms, monthlyTotal } from '../lib/discovery';
import '../styles/hostel-preview.css';

const money = (amount: number) => '₹' + amount.toLocaleString('en-IN');

export function HostelPreviewPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { hostels, user } = useApp();
  const hostel = hostels.find(item => item.id === id && item.status === 'approved');
  const campus = getCampus(searchParams.get('campus'));
  const availableRooms = hostel ? getMatchingRooms(hostel) : [];
  const roomId = searchParams.get('room');
  const selectedRoom = availableRooms.find(room => room.id === roomId)
    || availableRooms.find(room => room.sharingType === 'double') || availableRooms[0];
  const [imageFailed, setImageFailed] = useState(false);
  const authenticated = Boolean(user && user.role !== 'visitor');

  if (!hostel) {
    return (
      <section className="hostel-preview-missing">
        <MapPin size={36} />
        <h1>This stay is not available.</h1>
        <p>The listing may be pending review or no longer published.</p>
        <Link to={`/explore?campus=${campus.id}`}>Back to explore <ArrowUpRight size={15} /></Link>
      </section>
    );
  }

  const distance = distanceKm(hostel, campus);
  const demo = hostel.location?.status === 'demo';
  const detailsPath = `/hostel/${hostel.id}?campus=${campus.id}${selectedRoom ? `&room=${selectedRoom.id}` : ''}`;
  const loginPath = `/login?role=student&redirect=${encodeURIComponent(detailsPath)}`;
  const category = hostel.category === 'co-ed' ? 'Co-ed stay' : hostel.category === 'girls' ? 'Girls hostel' : 'Boys hostel';
  const sharingTypes = [...new Set(hostel.roomTypes.filter(r => r.available).map(r => r.sharingType))];
  const startingPrice = availableRooms.length
    ? Math.min(...availableRooms.map(r => monthlyTotal(r)))
    : (hostel.roomTypes[0] ? monthlyTotal(hostel.roomTypes[0]) : null);

  return (
    <div className="hostel-preview">
      <div className="hostel-preview-shell">
        <nav className="hostel-preview-crumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span aria-hidden="true">›</span>
          <Link to={`/explore?campus=${campus.id}`}>Hostels</Link>
          <span aria-hidden="true">›</span>
          <span>{hostel.locality}</span>
          <span aria-hidden="true">›</span>
          <span aria-current="page">{hostel.name}</span>
        </nav>

        <Link className="hostel-preview-back" to={`/explore?campus=${campus.id}`}>
          <ArrowLeft size={15} /> Nearby stays
        </Link>

        <div className="hostel-preview-hero">
          <div className="hostel-preview-media">
            {hostel.coverImage && !imageFailed ? (
              <img
                src={hostel.coverImage}
                alt={`${hostel.photography === 'property' ? 'Cover photo' : 'Illustrative cover photo'} of ${hostel.name}`}
                fetchPriority="high"
                decoding="async"
                onError={() => setImageFailed(true)}
              />
            ) : (
              <div className="hostel-preview-image-fallback">
                <ImageOff size={36} />
                <strong>Cover photo unavailable</strong>
                <span>Book a visit to confirm rooms and photos in person.</span>
              </div>
            )}
            <span className="hostel-preview-badge">{category.replace(' hostel', '').replace(' stay', '')}</span>
          </div>

          <aside className="hostel-preview-card">
            <p className="hostel-preview-eyebrow">
              <Star size={13} /> PREMIUM HOSTEL
            </p>
            <h1>{hostel.name}</h1>
            <p className="hostel-preview-loc"><MapPin size={15} /> {hostel.locality}, Kota</p>

            <div className="hostel-preview-tags">
              {sharingTypes.map(t => (
                <span key={t}>
                  <Users size={13} />
                  {t === 'single' ? 'Single Sharing' : t === 'double' ? 'Double Sharing' : t === 'triple' ? 'Triple Sharing' : t}
                </span>
              ))}
              {hostel.amenities.includes('Meals') && <span><Utensils size={13} /> Mess</span>}
              {hostel.amenities.includes('WiFi') && <span><Wifi size={13} /> Wi-Fi</span>}
              {hostel.amenities.includes('Laundry') && <span><Droplets size={13} /> Laundry</span>}
            </div>

            {startingPrice !== null && (
              <p className="hostel-preview-price">
                <strong>{money(startingPrice)}</strong>
                <span>/ month from{selectedRoom ? ` · ${selectedRoom.name}` : ''}</span>
              </p>
            )}

            <div className="hostel-preview-campus">
              <span><BookOpen size={18} /></span>
              <div>
                <strong>{campus.institute} · {campus.name}</strong>
                <p>
                  {formatDistance(distance)}
                  {distance !== null ? ` · ${demo || campus.location.status === 'demo' ? 'demo ' : ''}straight-line estimate` : ''}
                </p>
              </div>
            </div>

            <div className="hostel-preview-unlock">
              <div className="hostel-preview-unlock-heading">
                <span><LockKeyhole size={17} /></span>
                <div>
                  <strong>{authenticated ? 'Your next step, all in one place.' : 'Get the complete picture.'}</strong>
                  <p>
                    {authenticated
                      ? 'Explore this hostel’s rooms, photos and book a visit with instant confirmation.'
                      : 'Log in or create an account to see full hostel details and book a visit.'}
                  </p>
                </div>
              </div>
              <ul>
                <li><Check size={14} /> Room options & full cost breakdown</li>
                <li><Check size={14} /> Photo gallery, facilities & house rules</li>
                <li><Check size={14} /> Book a visit (instant confirmation)</li>
              </ul>
              {authenticated ? (
                <Link className="hostel-preview-cta" to={detailsPath}>
                  See full details <ArrowRight size={16} />
                </Link>
              ) : (
                <Link className="hostel-preview-cta" to={loginPath}>
                  Continue to full details <ArrowRight size={16} />
                </Link>
              )}
            </div>

            <p className="hostel-preview-note">
              <ShieldCheck size={15} />
              {demo
                ? 'Demo listing · book a visit to confirm the address, room and price in person.'
                : 'Book a visit to confirm the entrance, availability and total costs in person. A visit is not a room reservation.'}
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}
