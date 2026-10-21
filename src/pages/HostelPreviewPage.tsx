import { useState, type SyntheticEvent } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ArrowUpRight, BedDouble, BookOpen, Check, ImageOff, LockKeyhole, MapPin, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CAMPUSES } from '../data/campuses';
import { distanceKm, formatDistance, getCampus, getMatchingRooms, monthlyTotal } from '../lib/discovery';
import '../styles/hostel-preview.css';

const money = (amount: number) => '₹' + amount.toLocaleString('en-IN');

export function HostelPreviewPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
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

  return (
    <div className="hostel-preview">
      <div className="hostel-preview-shell">
        <Link className="hostel-preview-back" to={`/explore?campus=${campus.id}`}><ArrowLeft size={15} /> Nearby stays</Link>
        <div className="hostel-preview-media">
          {hostel.coverImage && !imageFailed ? <img src={hostel.coverImage} alt={`${hostel.photography === 'property' ? 'Cover photo' : 'Illustrative cover photo'} of ${hostel.name}`} fetchPriority="high" decoding="async" onError={() => setImageFailed(true)}/> : <div className="hostel-preview-image-fallback"><ImageOff size={36}/><strong>Cover photo unavailable</strong><span>Book a visit to confirm rooms and photos in person.</span></div>}
        </div>
        <header className="hostel-preview-header">
          <p className="hostel-preview-eyebrow">{hostel.category === 'co-ed' ? 'Co-ed stay' : hostel.category === 'girls' ? 'Girls hostel' : 'Boys hostel'}</p>
          <h1>{hostel.name}</h1>
          <p><MapPin size={15} /> {hostel.locality}, Kota</p>
          {selectedRoom && <p className="hostel-preview-price"><strong>{money(monthlyTotal(selectedRoom))}</strong> <span>/ student / month · {selectedRoom.name}</span></p>}
        </header>
        <div className="hostel-preview-campus"><span><BookOpen size={19}/></span><div><strong>{campus.institute} · {campus.name}</strong><p>{formatDistance(distance)}{distance !== null ? ` · ${demo || campus.location.status === 'demo' ? 'demo ' : ''}straight-line estimate` : ''}</p></div></div>
        <div className="hostel-preview-unlock"><div className="hostel-preview-unlock-heading"><span><LockKeyhole size={17}/></span><div><strong>{authenticated ? 'Your next step, all in one place.' : 'Get the complete picture.'}</strong><p>{authenticated ? 'Explore this hostel’s rooms, photos and visit options.' : 'Log in or create an account to see full hostel details.'}</p></div></div>
          <ul><li><Check size={14}/>Room options & full cost breakdown</li><li><Check size={14}/>Photo gallery, facilities & house rules</li><li><Check size={14}/>Book a visit (instant confirmation)</li></ul>
          {authenticated ? (
            <Link className="hostel-preview-cta" to={detailsPath}>See full details <ArrowRight size={16} /></Link>
          ) : (
            <Link className="hostel-preview-cta" to={loginPath}>Continue to full details <ArrowRight size={16} /></Link>
          )}
        </div>
        <p className="hostel-preview-note"><ShieldCheck size={15}/>{demo ? 'Demo listing · book a visit to confirm the address, room and price in person.' : 'Book a visit to confirm the entrance, availability and total costs in person.'}</p>
      </div>
    </div>
  );
}
