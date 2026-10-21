import { safeAppPath } from '../lib/hostel-navigation';
import { locationLabel } from '../lib/location-status';
import { useEffect, useId, useRef, useState, type ReactNode, type SyntheticEvent, type FormEvent } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, ArrowUpRight, BedDouble, BookOpen, Calendar, Check, Star,
  CheckCircle2, ChevronLeft, ChevronRight, Droplets, Flag, Heart,
  Info, MapPin, Share2, ShieldCheck, Users, Utensils, Wifi, Wind, X, Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CurvedPhotoGallery, GalleryImage } from '../components/hostel/CurvedPhotoGallery';
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
const imageFallback = (event: SyntheticEvent<HTMLImageElement>) => {
  if (!event.currentTarget.src.endsWith('/images/room-shared.webp')) event.currentTarget.src = '/images/room-shared.webp';
};

const amenityIcons: Record<string, ReactNode> = {
  WiFi: <Wifi />, AC: <Wind />, Meals: <Utensils />, Laundry: <Droplets />,
  'Study Room': <BookOpen />, 'Power Backup': <Zap />, 'Hot Water': <Droplets />,
  'RO Water': <Droplets />, CCTV: <ShieldCheck />,
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
  const receiptHeading = useRef<HTMLHeadingElement>(null);
  const [shareState, setShareState] = useState<'idle' | 'copied' | 'manual'>('idle');
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('Incorrect price or availability');
  const [reportSaved, setReportSaved] = useState(false);
  const [reportError, setReportError] = useState('');

  useEffect(() => {
    setGalleryOpen(false);
    setGalleryIndex(0);
    setVisitOpen(false);
    setReceipt(null);
    setShareState('idle');
  }, [id]);
  useEffect(() => {
    if (user?.role === 'student' && searchParams.get('request') === 'visit' && selectedRoom) {
      setVisitOpen(true);
      const params = new URLSearchParams(searchParams);
      params.delete('request');
      setSearchParams(params, { replace: true });
    }
  }, [user?.role, searchParams, selectedRoom, setSearchParams]);
  useEffect(() => { if (receipt) receiptHeading.current?.focus(); }, [receipt]);
  useEffect(() => {
    if (shareState !== 'copied') return;
    const timeout = window.setTimeout(() => setShareState('idle'), 3500);
    return () => window.clearTimeout(timeout);
  }, [shareState]);
  useEffect(() => {
    if (!galleryOpen) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      setGalleryIndex(index => (index + (event.key === 'ArrowRight' ? 1 : -1) + galleryImages.length) % galleryImages.length);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [galleryOpen, galleryImages.length]);

  if (!hostel) return (
    <section className="detail-not-found">
      <MapPin size={40} strokeWidth={1.3} />
      <p className="detail-eyebrow">A DIFFERENT TURN</p>
      <h1>This stay isn’t on the map.</h1>
      <p>The listing may be unavailable or awaiting review. Let’s find another room near your campus.</p>
      <Link className="detail-primary" to={'/explore?campus=' + campus.id}><ArrowLeft size={17} /> Explore hostels</Link>
    </section>
  );

  const saved = isFavourite(hostel.id);
  const distance = distanceKm(hostel, campus);
  const category = hostel.category === 'co-ed' ? 'Co-ed stay' : hostel.category === 'girls' ? 'Girls hostel' : 'Boys hostel';
  const illustrative = hostel.photography !== 'property';
  const galleryPhotos = galleryImages.map((src, index) => ({ src, label: hostel.photoCaptions?.[src] || `Property photo ${index + 1}`, alt: `${illustrative ? 'Illustrative' : 'Property'} photo: ${hostel.photoCaptions?.[src] || `view ${index + 1}`} at ${hostel.name}` }));
  const review = hostel.reviews && Number.isFinite(hostel.reviews.rating) && hostel.reviews.rating >= 0 && hostel.reviews.rating <= 5 && hostel.reviews.count > 0 ? hostel.reviews : null;
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

  return (
    <div className="detail-page">
      <div className="detail-shell">
        <nav className="detail-breadcrumb" aria-label="Breadcrumb">
          <Link to={safeAppPath(searchParams.get('returnTo'), '/explore?campus=' + campus.id)}><ArrowLeft size={15} /> {searchParams.get('returnTo')?.startsWith('/map') ? 'Back to Kota map' : 'Back to nearby stays'}</Link>
          <span aria-hidden="true">/</span><span>{hostel.name}</span>
        </nav>

        <div className="detail-context-bar"><label><BookOpen size={16}/><span className="sr-only">Choose coaching campus</span><select aria-label="Choose coaching campus" value={campus.id} onChange={event => { const params = new URLSearchParams(searchParams); params.set('campus', event.target.value); setSearchParams(params, { replace: true }); }}>{CAMPUSES.map(item => <option key={item.id} value={item.id}>{item.institute} · {item.name}</option>)}</select></label><Link to={`/explore?campus=${campus.id}`}>Browse nearby stays <ArrowUpRight size={14}/></Link></div>
        <CurvedPhotoGallery key={hostel.id} photos={galleryPhotos} name={hostel.name} illustrative={illustrative} onOpen={index => { setGalleryIndex(index); setGalleryOpen(true); }}/>

        <header className="detail-heading">
          <div>
            <div className="detail-heading__top"><span className="detail-eyebrow">A LITTLE CLOSER TO YOUR NEXT CHAPTER</span><span className="detail-category">{category}</span></div>
            <h1>{hostel.name}</h1>
            <p><MapPin size={16} /> {hostel.locality}, Kota <span className="detail-heading__dot">·</span> <a href="#detail-location">See neighbourhood <ArrowUpRight size={14} /></a></p>
          </div>
          <div className="detail-heading__actions">
            <button type="button" className={'detail-outline' + (saved ? ' is-saved' : '')} onClick={handleSave} aria-pressed={saved}><Heart size={17} fill={saved ? 'currentColor' : 'none'} />{saved ? 'Saved' : 'Save stay'}</button>
            <button type="button" className="detail-outline" onClick={handleShare}><Share2 size={17} />{shareState === 'copied' ? 'Link copied' : 'Share'}</button>
          </div>
        </header>
        {shareState === 'copied' && <p className="detail-notice" role="status">Link copied. Share this room with a parent or friend.</p>}
        {shareState === 'manual' && <div className="detail-share-fallback" role="status"><label htmlFor="detail-share-link">Copy this link to share your selected room</label><input id="detail-share-link" value={window.location.href} readOnly onFocus={event => event.target.select()} /></div>}

        <div className="detail-summary-row"><div className="detail-summary-price">{selectedRoom ? <><strong>{money(monthlyTotal(selectedRoom))}</strong><span>/ student / month<small>{selectedRoom.name} · fixed total · deposit separate</small></span></> : <strong>Ask about availability</strong>}</div><div className="detail-summary-trust">{review ? <span><Star size={15}/>{review.rating.toFixed(1)} · {review.count} reviews</span> : <span>No reviews supplied</span>}<span>{locationLabel(hostel)} · availability needs confirmation</span></div></div>
        <div className="detail-summary-actions"><button type="button" className="detail-primary" disabled={!selectedRoom} onClick={startVisit}><Calendar size={17}/>Book a visit <ArrowUpRight size={16}/></button><a className="detail-outline" href="#detail-rooms">View details</a><small>Students book a visit only — direct owner contact is not available. A visit is not a room reservation.</small></div>

        <div className="detail-campus-strip">
          <span className="detail-campus-strip__icon"><MapPin size={21} /></span>
          <div><span className="detail-eyebrow">YOUR DAILY COMMUTE</span><p><strong>{formatDistance(distance)}</strong> from {campus.institute} · {campus.name}<span>{hostel.location?.status === 'demo' || campus.location.status === 'demo' ? 'Illustrative straight-line distance · demo locations' : 'Straight-line estimate · confirm the walking route'}</span></p></div>
        </div>

        <div className="detail-columns">
          <div className="detail-main">
            <section className="detail-section" id="detail-rooms" aria-labelledby="room-heading">
              <div className="detail-section__heading"><div><p className="detail-eyebrow">FIND YOUR FIT</p><h2 id="room-heading">One hostel. Your kind of room.</h2></div><span className="detail-tiny-note">Per student / month</span></div>
              <p className="detail-section__intro">A little privacy or a little company? Choose a room to see its full monthly cost.</p>
              <div className="detail-room-options">
                {hostel.roomTypes.map(room => <button key={room.id} type="button" disabled={!room.available} onClick={() => viewRoom(room)} aria-pressed={selectedRoom?.id === room.id} className={'detail-room-option' + (selectedRoom?.id === room.id ? ' is-selected' : '')}>
                  <span className="detail-room-option__icon"><BedDouble size={25} strokeWidth={1.3} />{selectedRoom?.id === room.id && <span><Check size={12} /></span>}</span>
                  <span className="detail-room-option__name">{room.name}</span>
                  <strong>{money(monthlyTotal(room))}<small>/month</small></strong>
                  <span className={'detail-room-option__availability' + (!room.available ? ' is-full' : '')}>{room.available ? hostel.location?.status === 'demo' ? 'Available in demo' : 'Confirm availability' : 'Currently full'}</span>
                </button>)}
              </div>
              {selectedRoom && (
                <div className="detail-room-detail">
                  <RoomShowcase room={selectedRoom} />
                  <RoomPrice room={selectedRoom} electricity={hostel.electricityPolicy} notes={hostel.extraChargesNote} />
                </div>
              )}
            </section>

            <section className="detail-section" id="detail-about">
              <p className="detail-eyebrow">ABOUT THIS STAY</p>
              <h2>What life feels like here</h2>
              <p className="detail-about">{hostel.description}</p>
              {hostel.houseRules && hostel.houseRules.length > 0 && (
                <ul className="detail-rules">{hostel.houseRules.map(rule => <li key={rule}><Check size={14} />{rule}</li>)}</ul>
              )}
            </section>

            <section className="detail-section" id="detail-amenities">
              <p className="detail-eyebrow">FACILITIES</p>
              <h2>Included for everyday life</h2>
              <div className="detail-amenities">{hostel.amenities.map(item => <span key={item}>{amenityIcons[item] || <ShieldCheck />}<span>{amenityLabel(item)}</span></span>)}</div>
            </section>

            <section className="detail-section" id="detail-location">
              <p className="detail-eyebrow">NEIGHBOURHOOD</p>
              <h2>Where you will be</h2>
              <p>{hostel.address}</p>
              <HostelProximityMap hostel={hostel} campus={campus} />
            </section>

            <section className="detail-contact-banner" aria-label="Arrange your hostel visit">
              <div>
                <h2>See it before you settle.</h2>
                <p>Book a visit to confirm the room, entrance and costs. Direct owner contact is not available — students book visits only.</p>
              </div>
              <div>
                <button type="button" className="detail-primary" disabled={!selectedRoom} onClick={startVisit}>Book a visit <ArrowUpRight size={16}/></button>
              </div>
            </section>
          </div>

          <aside className="detail-aside">
            <div className="detail-enquiry">
              <div className="detail-enquiry__symbol"><BedDouble size={24} strokeWidth={1.2} /></div>
              {selectedRoom ? (
                <>
                  <h2>{selectedRoom.name}</h2>
                  <p className="detail-enquiry__price">{money(monthlyTotal(selectedRoom))}<span>/ month</span></p>
                  <p className="detail-enquiry__unit">Fixed charges per student. Electricity separate.</p>
                  <RoomPrice room={selectedRoom} electricity={hostel.electricityPolicy} />
                  <button type="button" className="detail-primary detail-primary--full" onClick={startVisit}><Calendar size={18} /> Book a visit <ArrowUpRight size={17} /></button>
                  <p className="detail-enquiry__disclaimer">A visit is not a room reservation.</p>
                </>
              ) : (
                <>
                  <h2>Full for now.</h2>
                  <p className="detail-about">There are no available room options at this stay.</p>
                  <Link to={'/explore?campus=' + campus.id} className="detail-primary detail-primary--full">Find another stay <ArrowUpRight size={17} /></Link>
                </>
              )}
              <div className="detail-enquiry__footer"><ShieldCheck size={19} /><p>Visit first. Ask questions.<br /><strong>Choose with confidence.</strong></p></div>
            </div>
          </aside>
        </div>
      </div>

      {selectedRoom && <div className="detail-mobile-bar"><div><span>{selectedRoom.name}</span><strong>{money(monthlyTotal(selectedRoom))}<small>/mo</small></strong></div><button type="button" className="detail-primary" onClick={startVisit}>Book a visit <ArrowUpRight size={17} /></button></div>}

      <DetailDialog open={galleryOpen} onClose={() => setGalleryOpen(false)} title={hostel.name + ' · photos'} gallery>
        <div className="detail-lightbox">
          <div className="detail-lightbox__image">{galleryOpen && galleryPhotos.length > 0 && <GalleryImage key={galleryIndex} photo={galleryPhotos[galleryIndex % galleryPhotos.length]} eager errorHint="Close and reopen the photo to retry."/>}</div>
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
        {reportSaved ? <div className="detail-receipt"><CheckCircle2 size={40} /><h3>Report saved on this device.</h3><p>Thanks for helping improve the sample listing. This demo does not send reports to a moderation team.</p><button type="button" className="detail-primary" onClick={() => setReportOpen(false)}>Back to the hostel</button></div> : <form className="detail-visit-form" onSubmit={saveReport}><p className="detail-form-intro">What should be checked on {hostel.name}?</p><div className="detail-form-field"><label htmlFor="report-reason">Reason</label><select id="report-reason" value={reportReason} onChange={event => setReportReason(event.target.value)}><option>Incorrect price or availability</option><option>Photos or address do not match</option><option>Unclear or unexpected charges</option><option>Other listing information</option></select></div><p className="detail-form-demo"><Info size={15} /> Reports are saved locally in this frontend demo.</p>{reportError && <p role="alert" className="detail-form-error">{reportError}</p>}<button className="detail-primary detail-primary--full" type="submit">Save report <Flag size={16} /></button></form>}
      </DetailDialog>
    </div>
  );
}
