import { safeAppPath } from '../lib/hostel-navigation';
import { locationLabel } from '../lib/location-status';
import { useEffect, useId, useRef, useState, type ReactNode, type SyntheticEvent, type FormEvent } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, ArrowUpRight, BedDouble, BookOpen, Calendar, Check, Star,
  CheckCircle2, ChevronLeft, ChevronRight, Droplets, Flag,
  Info, MapPin, Share2, ShieldCheck, Users, Utensils, Wifi, Wind, X, Zap, GraduationCap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { GalleryImage } from '../components/hostel/CurvedPhotoGallery';
import { HostelHeroGallery } from '../components/hostel/HostelHeroGallery';
import { HostelProximityMap } from '../components/hostel/HostelProximityMap';
import { RoomShowcase } from '../components/hostel/RoomShowcase';
import { CAMPUSES } from '../data/campuses';
import { distanceKm, formatDistance, getCampus, getMatchingRooms, monthlyTotal } from '../lib/discovery';
import type { RoomType, VisitRequest } from '../types';
import '../styles/detail.css';

const money = (amount: number) => '₹' + amount.toLocaleString('en-IN');
const localToday = () => {
  const now = new Date();
  return now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
};
const readableDate = (value: string) => new Date(value + 'T12:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

const amenityIcons: Record<string, ReactNode> = {
  WiFi: <Wifi size={18} />, AC: <Wind size={18} />, Meals: <Utensils size={18} />, Laundry: <Droplets size={18} />,
  'Study Room': <BookOpen size={18} />, 'Power Backup': <Zap size={18} />, 'Hot Water': <Droplets size={18} />,
  'RO Water': <Droplets size={18} />, CCTV: <ShieldCheck size={18} />,
};
const amenityLabel = (value: string) => ({ WiFi: 'Wi-Fi', Meals: 'Mess facility', CCTV: 'CCTV', 'Study Room': 'Study space' }[value] || value);

function DetailDialog({ open, onClose, title, children, gallery = false }: {
  open: boolean; onClose: () => void; title: string; children: ReactNode; gallery?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [open]);
  return (
    <dialog ref={ref} className={'detail-dialog' + (gallery ? ' detail-dialog--gallery' : '')}
      aria-labelledby={titleId} onCancel={event => { event.preventDefault(); onClose(); }} onClose={onClose}
      onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="detail-dialog__inner">
        <div className="detail-dialog__header">
          <h2 id={titleId}>{title}</h2>
          <button type="button" className="detail-icon-button" onClick={onClose} aria-label="Close dialog"><X size={20} /></button>
        </div>
        {children}
      </div>
    </dialog>
  );
}

function RoomPrice({ room, electricity, notes }: { room: RoomType; electricity?: string; notes?: string }) {
  const mandatory = room.extraCharges.filter(charge => !charge.optional);
  const optional = room.extraCharges.filter(charge => charge.optional);
  return (
    <div className="detail-price">
      <div className="detail-price__label">PER STUDENT · PER MONTH</div>
      <dl>
        <div><dt>Room rent</dt><dd>{money(room.rent)}</dd></div>
        {mandatory.map((charge, index) => <div key={charge.name + index}><dt>{charge.name}</dt><dd>{money(charge.amount)}</dd></div>)}
        <div className="detail-price__total"><dt>Fixed monthly total</dt><dd>{money(monthlyTotal(room))}</dd></div>
        <div><dt>Electricity</dt><dd>{electricity || 'Confirm charging policy with owner'}</dd></div>
        <div className="detail-price__deposit"><dt>Security deposit <small>One-time · confirm refund terms</small></dt><dd>{money(room.deposit)}</dd></div>
      </dl>
      {room.included.length > 0 && <p className="detail-price__included"><Check size={14} /> Included in rent: {room.included.map(amenityLabel).join(', ')}</p>}
      {optional.length > 0 && <p className="detail-price__optional">Optional: {optional.map(charge => charge.name + ' ' + money(charge.amount) + '/month').join(' · ')}. Not included in the fixed total.</p>}
      {notes && <p className="detail-price__optional">{notes}</p>}
    </div>
  );
}

export function HostelDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { hostels, user, toggleFavourite, isFavourite, scheduleVisit } = useApp();
  const hostel = hostels.find(item => item.id === id && item.status === 'approved');
  const campus = getCampus(searchParams.get('campus'));
  const availableRooms = hostel ? getMatchingRooms(hostel) : [];
  const roomId = searchParams.get('room');
  const selectedRoom = availableRooms.find(room => room.id === roomId)
    || availableRooms.find(room => room.sharingType === 'double') || availableRooms[0];
  const galleryImages = hostel ? [...new Set([hostel.coverImage, ...hostel.images].filter(Boolean))] : [];

  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [visitOpen, setVisitOpen] = useState(false);
  const [visitDate, setVisitDate] = useState('');
  const [visitError, setVisitError] = useState('');
  const [receipt, setReceipt] = useState<VisitRequest | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const [shareState, setShareState] = useState<'idle' | 'copied' | 'manual'>('idle');
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('Incorrect price or availability');
  const [reportSaved, setReportSaved] = useState(false);
  const [reportError, setReportError] = useState('');
  const [aboutExpanded, setAboutExpanded] = useState(false);
  const receiptHeading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    setGalleryOpen(false);
    setGalleryIndex(0);
    setVisitOpen(false);
    setReceipt(null);
    setShareState('idle');
    setAboutExpanded(false);
  }, [id]);

  useEffect(() => {
    if (user?.role === 'student' && searchParams.get('request') === 'visit' && selectedRoom) {
      setVisitOpen(true);
    }
  }, [user?.role, searchParams, selectedRoom]);

  useEffect(() => {
    if (receipt && receiptHeading.current) receiptHeading.current.focus();
  }, [receipt]);

  if (!hostel) {
    return (
      <section className="detail-missing">
        <MapPin size={36} />
        <h1>This stay isn’t on the map.</h1>
        <p>The listing may be unavailable or awaiting review. Let’s find another room near your campus.</p>
        <Link className="detail-primary" to={'/explore?campus=' + campus.id}><ArrowLeft size={17} /> Explore hostels</Link>
      </section>
    );
  }

  const saved = isFavourite(hostel.id);
  const distance = distanceKm(hostel, campus);
  const category = hostel.category === 'co-ed' ? 'Co-ed' : hostel.category === 'girls' ? 'Girls' : 'Boys';
  const categoryLabel = hostel.category === 'co-ed' ? 'Co-ed stay' : hostel.category === 'girls' ? 'Girls hostel' : 'Boys hostel';
  const illustrative = hostel.photography !== 'property';
  const galleryPhotos = galleryImages.map((src, index) => ({
    src,
    label: hostel.photoCaptions?.[src] || `Property photo ${index + 1}`,
    alt: `${illustrative ? 'Illustrative' : 'Property'} photo: ${hostel.photoCaptions?.[src] || `view ${index + 1}`} at ${hostel.name}`,
  }));
  const review = hostel.reviews && Number.isFinite(hostel.reviews.rating) && hostel.reviews.rating >= 0 && hostel.reviews.rating <= 5 && hostel.reviews.count > 0 ? hostel.reviews : null;
  const sharingTypes = [...new Set(hostel.roomTypes.filter(r => r.available).map(r => r.sharingType))];
  const sharingLabels = sharingTypes.map(t => t === 'single' ? 'Single Sharing' : t === 'double' ? 'Double Sharing' : t === 'triple' ? 'Triple Sharing' : t);
  const startingPrice = availableRooms.length
    ? Math.min(...availableRooms.map(r => monthlyTotal(r)))
    : (hostel.roomTypes[0] ? monthlyTotal(hostel.roomTypes[0]) : null);
  const topAmenities = hostel.amenities.slice(0, 5);
  const aboutLong = (hostel.description?.length || 0) > 180;

  const viewRoom = (room: RoomType) => {
    if (!room.available) return;
    const params = new URLSearchParams(searchParams);
    params.set('campus', campus.id);
    params.set('room', room.id);
    setSearchParams(params, { replace: true });
  };
  const loginRedirect = (request = false) => {
    const params = new URLSearchParams(searchParams);
    params.set('campus', campus.id);
    if (selectedRoom) params.set('room', selectedRoom.id);
    if (request) params.set('request', 'visit');
    navigate('/login?role=student&redirect=' + encodeURIComponent('/hostel/' + hostel.id + '?' + params.toString()));
  };
  const startVisit = () => {
    if (!selectedRoom) return;
    if (user?.role !== 'student') { loginRedirect(true); return; }
    setReceipt(null);
    setVisitDate('');
    setVisitError('');
    submittingRef.current = false;
    setVisitOpen(true);
  };
  const handleSave = () => user?.role === 'student' ? toggleFavourite(hostel.id) : loginRedirect();
  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: hostel.name + ' · StayKota', url }); return; }
      catch (error) { if (error instanceof DOMException && error.name === 'AbortError') return; }
    }
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(url);
      setShareState('copied');
    } catch { setShareState('manual'); }
  };
  const submitVisit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submittingRef.current) return;
    setVisitError('');
    if (!selectedRoom || !selectedRoom.available) { setVisitError('Choose an available room before booking a visit.'); return; }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(visitDate) || visitDate < localToday()) { setVisitError('Choose today or a future date for your visit.'); return; }
    if (!user || user.role !== 'student') { setVisitError('Sign in as a student to book a visit.'); return; }
    submittingRef.current = true;
    setSubmitting(true);
    try {
      const request = scheduleVisit({
        hostelId: hostel.id,
        hostelName: hostel.name,
        roomTypeId: selectedRoom.id,
        roomTypeName: selectedRoom.name,
        visitDate,
        studentPhone: user.phone || undefined,
        consentAt: new Date().toISOString(),
      });
      setReceipt(request);
    } catch (error) {
      setVisitError(error instanceof Error ? error.message : 'We couldn’t book this visit. Please try again.');
      submittingRef.current = false;
    } finally { setSubmitting(false); }
  };
  const saveReport = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setReportError('');
    try {
      const value = localStorage.getItem('staykota_reports');
      const existing: unknown = value ? JSON.parse(value) : [];
      const reports = Array.isArray(existing) ? existing : [];
      localStorage.setItem('staykota_reports', JSON.stringify([{
        id: 'report-' + Date.now(), hostelId: hostel.id, hostelName: hostel.name,
        reason: reportReason, reporter: user?.name || 'Visitor', createdAt: new Date().toISOString(), status: 'open',
      }, ...reports]));
      setReportSaved(true);
    } catch { setReportError('Your browser could not save this report. Please try again.'); }
  };

  const nearbyCampuses = CAMPUSES
    .map(c => ({ campus: c, km: distanceKm(hostel, c) }))
    .filter(item => item.km !== null)
    .sort((a, b) => (a.km ?? 99) - (b.km ?? 99))
    .slice(0, 5);

  return (
    <div className="detail-page">
      <div className="detail-shell">
        <nav className="detail-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span aria-hidden="true">›</span>
          <Link to={safeAppPath(searchParams.get('returnTo'), '/explore?campus=' + campus.id)}>Hostels</Link>
          <span aria-hidden="true">›</span>
          <Link to={'/explore?campus=' + campus.id}>{hostel.locality}</Link>
          <span aria-hidden="true">›</span>
          <span aria-current="page">{hostel.name}</span>
        </nav>

        <div className="detail-hero">
          <HostelHeroGallery
            photos={galleryPhotos}
            name={hostel.name}
            categoryLabel={category}
            saved={saved}
            onSave={handleSave}
            showSave
          />

          <aside className="detail-summary-card">
            <p className="detail-summary-card__eyebrow">
              <Star size={14} strokeWidth={2} /> PREMIUM HOSTEL
            </p>
            <h1 className="detail-summary-card__title">{hostel.name}</h1>
            <p className="detail-summary-card__loc">
              <MapPin size={16} /> {hostel.locality}, Kota
            </p>

            <div className="detail-summary-card__tags">
              {sharingLabels.map(label => (
                <span key={label} className="detail-tag"><Users size={14} /> {label}</span>
              ))}
              {hostel.amenities.includes('Meals') && <span className="detail-tag"><Utensils size={14} /> Mess</span>}
              {hostel.amenities.includes('WiFi') && <span className="detail-tag"><Wifi size={14} /> Wi-Fi</span>}
              {hostel.amenities.includes('Laundry') && <span className="detail-tag"><Droplets size={14} /> Laundry</span>}
            </div>

            {startingPrice !== null && (
              <p className="detail-summary-card__price">
                <strong>{money(startingPrice)}</strong>
                <span>/ month from</span>
              </p>
            )}

            <div className="detail-summary-card__actions">
              <a className="detail-primary detail-primary--full" href="#detail-rooms">View details <ArrowUpRight size={16} /></a>
              <button type="button" className="detail-outline detail-outline--full" disabled={!selectedRoom} onClick={startVisit}>
                <Calendar size={16} /> Book a visit
              </button>
            </div>

            <p className="detail-summary-card__note">
              Students book a visit only — not a room reservation. {locationLabel(hostel)}.
            </p>

            <div className="detail-summary-card__meta">
              {review ? (
                <span><Star size={14} /> {review.rating.toFixed(1)} · {review.count} reviews</span>
              ) : (
                <span>No reviews supplied</span>
              )}
              <button type="button" className="detail-text-btn" onClick={handleShare}>
                <Share2 size={14} /> {shareState === 'copied' ? 'Copied' : 'Share'}
              </button>
            </div>
            {shareState === 'manual' && (
              <div className="detail-share-fallback" role="status">
                <label htmlFor="detail-share-link">Copy this link</label>
                <input id="detail-share-link" value={window.location.href} readOnly onFocus={e => e.target.select()} />
              </div>
            )}
          </aside>
        </div>

        <div className="detail-quick-strip" role="list">
          <div className="detail-quick-item" role="listitem">
            <BedDouble size={20} strokeWidth={1.5} />
            <div>
              <span className="detail-quick-label">Room Types</span>
              <strong>{hostel.roomTypes.map(r => r.name.replace(/ Occupancy| Sharing/g, '')).join(' & ') || '—'}</strong>
            </div>
          </div>
          <div className="detail-quick-item" role="listitem">
            <Utensils size={20} strokeWidth={1.5} />
            <div>
              <span className="detail-quick-label">Food</span>
              <strong>{hostel.amenities.includes('Meals') ? 'Mess Included' : 'Confirm with visit'}</strong>
            </div>
          </div>
          <div className="detail-quick-item" role="listitem">
            <Wifi size={20} strokeWidth={1.5} />
            <div>
              <span className="detail-quick-label">Amenities</span>
              <strong>{topAmenities.map(amenityLabel).slice(0, 3).join(', ') || '—'}</strong>
            </div>
          </div>
          <div className="detail-quick-item" role="listitem">
            <Users size={20} strokeWidth={1.5} />
            <div>
              <span className="detail-quick-label">Sharing Type</span>
              <strong>{sharingLabels.join(' / ') || '—'}</strong>
            </div>
          </div>
          <div className="detail-quick-item" role="listitem">
            <ShieldCheck size={20} strokeWidth={1.5} />
            <div>
              <span className="detail-quick-label">Gender</span>
              <strong>{categoryLabel}</strong>
            </div>
          </div>
        </div>

        <div className="detail-campus-strip">
          <span className="detail-campus-strip__icon"><MapPin size={20} /></span>
          <div>
            <span className="detail-eyebrow">YOUR DAILY COMMUTE</span>
            <p>
              <strong>{formatDistance(distance)}</strong> from {campus.institute} · {campus.name}
              <span>
                {hostel.location?.status === 'demo' || campus.location.status === 'demo'
                  ? 'Illustrative straight-line distance · demo locations'
                  : 'Straight-line estimate · confirm the walking route'}
              </span>
            </p>
          </div>
          <label className="detail-campus-select">
            <span className="sr-only">Choose coaching campus</span>
            <select
              aria-label="Choose coaching campus"
              value={campus.id}
              onChange={event => {
                const params = new URLSearchParams(searchParams);
                params.set('campus', event.target.value);
                setSearchParams(params, { replace: true });
              }}
            >
              {CAMPUSES.map(item => (
                <option key={item.id} value={item.id}>{item.institute} · {item.name}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="detail-body">
          <div className="detail-main">
            <section className="detail-section" id="detail-about">
              <h2 className="detail-section__title">About this hostel</h2>
              <p className={'detail-about' + (aboutLong && !aboutExpanded ? ' is-clamped' : '')}>
                {hostel.description}
              </p>
              {aboutLong && (
                <button type="button" className="detail-readmore" onClick={() => setAboutExpanded(v => !v)}>
                  {aboutExpanded ? 'Show less' : 'Read more'}
                </button>
              )}
              {hostel.houseRules && hostel.houseRules.length > 0 && (
                <ul className="detail-highlights">
                  {hostel.houseRules.slice(0, aboutExpanded ? undefined : 3).map(rule => (
                    <li key={rule}><Check size={15} strokeWidth={2.5} /> {rule}</li>
                  ))}
                </ul>
              )}
            </section>

            <section className="detail-section" id="detail-rooms" aria-labelledby="room-heading">
              <div className="detail-section__heading">
                <h2 id="room-heading" className="detail-section__title">Room types & pricing</h2>
                <span className="detail-tiny-note">Per student / month</span>
              </div>
              <p className="detail-section__intro">Choose a room to see its full monthly cost. Deposit is separate.</p>
              <div className="detail-room-options">
                {hostel.roomTypes.map(room => (
                  <button
                    key={room.id}
                    type="button"
                    disabled={!room.available}
                    onClick={() => viewRoom(room)}
                    aria-pressed={selectedRoom?.id === room.id}
                    className={'detail-room-option' + (selectedRoom?.id === room.id ? ' is-selected' : '')}
                  >
                    <span className="detail-room-option__icon">
                      <BedDouble size={22} strokeWidth={1.4} />
                      {selectedRoom?.id === room.id && <span><Check size={11} /></span>}
                    </span>
                    <span className="detail-room-option__name">{room.name}</span>
                    <strong>{money(monthlyTotal(room))}<small>/month</small></strong>
                    <span className={'detail-room-option__availability' + (!room.available ? ' is-full' : '')}>
                      {room.available ? (hostel.location?.status === 'demo' ? 'Available in demo' : 'Confirm availability') : 'Currently full'}
                    </span>
                  </button>
                ))}
              </div>
              {selectedRoom && (
                <div className="detail-room-detail">
                  <RoomShowcase capacity={selectedRoom.capacity} />
                  <RoomPrice room={selectedRoom} electricity={hostel.electricityPolicy} notes={hostel.extraChargesNote} />
                </div>
              )}
            </section>

            <section className="detail-section" id="detail-amenities">
              <h2 className="detail-section__title">Amenities & facilities</h2>
              <div className="detail-amenities">
                {hostel.amenities.map(item => (
                  <span key={item} className="detail-amenity-chip">
                    {amenityIcons[item] || <ShieldCheck size={18} />}
                    <span>{amenityLabel(item)}</span>
                  </span>
                ))}
              </div>
            </section>

            <section className="detail-section" id="detail-location">
              <h2 className="detail-section__title">Hostel location</h2>
              <p className="detail-address">{hostel.address}</p>
              <HostelProximityMap hostel={hostel} campus={campus} />
            </section>

            <section className="detail-contact-banner" aria-label="Arrange your hostel visit">
              <div>
                <h2>See it before you settle.</h2>
                <p>Book a visit to confirm the room, entrance and costs. Direct owner contact is not available — students book visits only.</p>
              </div>
              <button type="button" className="detail-primary" disabled={!selectedRoom} onClick={startVisit}>
                Book a visit <ArrowUpRight size={16} />
              </button>
            </section>
          </div>

          <aside className="detail-side">
            <div className="detail-nearby-card">
              <h3><GraduationCap size={18} /> Nearby coaching institutes</h3>
              <ul>
                {nearbyCampuses.map(({ campus: c, km }) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => {
                        const params = new URLSearchParams(searchParams);
                        params.set('campus', c.id);
                        setSearchParams(params, { replace: true });
                      }}
                    >
                      <span>{c.institute}{c.name !== c.institute ? ` (${c.name})` : ''}</span>
                      <em>{formatDistance(km)}</em>
                    </button>
                  </li>
                ))}
              </ul>
              <Link to={'/explore?campus=' + campus.id} className="detail-nearby-link">
                View all institutes <ArrowUpRight size={14} />
              </Link>
            </div>

            <div className="detail-enquiry">
              {selectedRoom ? (
                <>
                  <h3>{selectedRoom.name}</h3>
                  <p className="detail-enquiry__price">{money(monthlyTotal(selectedRoom))}<span>/ month</span></p>
                  <p className="detail-enquiry__unit">Fixed charges per student. Electricity separate.</p>
                  <button type="button" className="detail-primary detail-primary--full" onClick={startVisit}>
                    <Calendar size={17} /> Book a visit
                  </button>
                  <p className="detail-enquiry__disclaimer">A visit is not a room reservation.</p>
                </>
              ) : (
                <>
                  <h3>Full for now</h3>
                  <p className="detail-about">No available room options at this stay.</p>
                  <Link to={'/explore?campus=' + campus.id} className="detail-primary detail-primary--full">
                    Find another stay
                  </Link>
                </>
              )}
            </div>

            <button type="button" className="detail-report-link" onClick={() => { setReportOpen(true); setReportSaved(false); }}>
              <Flag size={14} /> Report listing issue
            </button>
          </aside>
        </div>
      </div>

      {selectedRoom && (
        <div className="detail-mobile-bar">
          <div>
            <span>{selectedRoom.name}</span>
            <strong>{money(monthlyTotal(selectedRoom))}<small>/mo</small></strong>
          </div>
          <button type="button" className="detail-primary" onClick={startVisit}>
            Book a visit <ArrowUpRight size={16} />
          </button>
        </div>
      )}

      <DetailDialog open={galleryOpen} onClose={() => setGalleryOpen(false)} title={hostel.name + ' · photos'} gallery>
        <div className="detail-lightbox">
          <div className="detail-lightbox__image">
            {galleryOpen && galleryPhotos.length > 0 && (
              <GalleryImage key={galleryIndex} photo={galleryPhotos[galleryIndex % galleryPhotos.length]} eager errorHint="Close and reopen the photo to retry." />
            )}
          </div>
          <div className="detail-lightbox__controls">
            <button type="button" className="detail-icon-button" aria-label="Previous photo" disabled={galleryImages.length < 2} onClick={() => setGalleryIndex(index => (index - 1 + galleryImages.length) % galleryImages.length)}><ChevronLeft /></button>
            <span>{galleryIndex + 1} / {galleryImages.length || 1} <small>{illustrative ? 'Illustrative sample photos' : 'Property photos'}</small></span>
            <button type="button" className="detail-icon-button" aria-label="Next photo" disabled={galleryImages.length < 2} onClick={() => setGalleryIndex(index => (index + 1) % galleryImages.length)}><ChevronRight /></button>
          </div>
        </div>
      </DetailDialog>

      <DetailDialog open={visitOpen} onClose={() => setVisitOpen(false)} title={receipt ? 'Visit booked' : 'Book a visit'}>
        {receipt ? (
          <div className="detail-receipt">
            <div className="detail-receipt__icon detail-receipt__icon--success" aria-hidden="true">
              <CheckCircle2 size={40} strokeWidth={1.5} color="#059669" />
            </div>
            <p className="detail-eyebrow">CONFIRMED</p>
            <h3 ref={receiptHeading} tabIndex={-1}>Visit successfully booked</h3>
            <p>Your visit is confirmed for <strong>{readableDate(receipt.visitDate)}</strong>.</p>
            <div className="detail-receipt__summary">
              <strong>{hostel.name}</strong>
              {receipt.roomTypeName && <span>{receipt.roomTypeName}</span>}
              <span><Calendar size={16} /> {readableDate(receipt.visitDate)}</span>
              <small>Reference: {receipt.id}</small>
              <span className="detail-status detail-status--confirmed">
                <CheckCircle2 size={14} /> Confirmed · {readableDate(receipt.visitDate)}
              </span>
            </div>
            <div className="detail-info">
              <Info size={18} />
              <p>
                This books a visit only — not a room or payment. Your name and phone from your student profile were used automatically.
                When the backend is live, the hostel will see this confirmed visit on their dashboard.
              </p>
            </div>
            <Link className="detail-primary detail-primary--full" to="/dashboard?tab=visits" onClick={() => setVisitOpen(false)}>
              View my visits <ArrowUpRight size={17} />
            </Link>
            <button className="detail-text-link" type="button" onClick={() => setVisitOpen(false)}>Keep exploring this stay</button>
          </div>
        ) : (
          <form className="detail-visit-form" onSubmit={submitVisit}>
            <p className="detail-form-intro">
              Pick a date and confirm. Your name{user?.phone ? ' and phone' : ''} from your student profile will be attached automatically — no extra fields to fill.
            </p>
            <div className="detail-form-field">
              <label htmlFor="visit-date">Visit date</label>
              <input
                id="visit-date"
                name="visitDate"
                type="date"
                min={localToday()}
                required
                value={visitDate}
                onChange={event => { setVisitDate(event.target.value); setVisitError(''); }}
              />
              <small>Date only. A confirmed visit is not a room reservation.</small>
            </div>
            <p className="detail-form-demo">
              <Info size={15} /> Booking as <strong>{user?.name || 'student'}</strong>
              {user?.phone ? <> · {user.phone}</> : null}
              . Profile details are not shown as editable fields here.
            </p>
            {visitError && <p role="alert" className="detail-form-error">{visitError}</p>}
            <button type="submit" className="detail-primary detail-primary--full" disabled={submitting || !selectedRoom}>
              {submitting ? 'Booking…' : 'Confirm visit booking'}
              <ArrowUpRight size={17} />
            </button>
            <p className="detail-enquiry__disclaimer">Confirmed instantly. Not a room reservation or payment.</p>
          </form>
        )}
      </DetailDialog>

      <DetailDialog open={reportOpen} onClose={() => setReportOpen(false)} title="Help keep the details accurate">
        {reportSaved ? (
          <div className="detail-receipt">
            <CheckCircle2 size={40} />
            <h3>Report saved on this device.</h3>
            <p>Thanks for helping improve the sample listing. This demo does not send reports to a moderation team.</p>
            <button type="button" className="detail-primary" onClick={() => setReportOpen(false)}>Back to the hostel</button>
          </div>
        ) : (
          <form className="detail-visit-form" onSubmit={saveReport}>
            <p className="detail-form-intro">What should be checked on {hostel.name}?</p>
            <div className="detail-form-field">
              <label htmlFor="report-reason">Reason</label>
              <select id="report-reason" value={reportReason} onChange={event => setReportReason(event.target.value)}>
                <option>Incorrect price or availability</option>
                <option>Photos or address do not match</option>
                <option>Unclear or unexpected charges</option>
                <option>Other listing information</option>
              </select>
            </div>
            <p className="detail-form-demo"><Info size={15} /> Reports are saved locally in this frontend demo.</p>
            {reportError && <p role="alert" className="detail-form-error">{reportError}</p>}
            <button className="detail-primary detail-primary--full" type="submit">Save report <Flag size={16} /></button>
          </form>
        )}
      </DetailDialog>
    </div>
  );
}
