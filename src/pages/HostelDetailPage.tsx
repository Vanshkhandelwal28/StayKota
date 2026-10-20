import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  MapPin, Heart, Share2, Check, Calendar, Phone,
  Shield, Wifi, Wind, Utensils, Droplets, X, ChevronLeft, ChevronRight,
  Camera, Zap, Car, BookOpen, Eye
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { DEMO_NOTE } from '../data/mockData';
import type { RoomType } from '../types';
import { HostelLocationMap } from '../components/map/HostelLocationMap';

const amenityMeta: Record<string, { icon: React.ReactNode; label: string }> = {
  Meals: { icon: <Utensils className="w-3.5 h-3.5" />, label: 'Meals' },
  WiFi: { icon: <Wifi className="w-3.5 h-3.5" />, label: 'Wi-Fi' },
  Laundry: { icon: <Droplets className="w-3.5 h-3.5" />, label: 'Laundry' },
  CCTV: { icon: <Eye className="w-3.5 h-3.5" />, label: 'CCTV' },
  'Power Backup': { icon: <Zap className="w-3.5 h-3.5" />, label: 'Power backup' },
  'Study Room': { icon: <BookOpen className="w-3.5 h-3.5" />, label: 'Study room' },
  'RO Water': { icon: <Droplets className="w-3.5 h-3.5" />, label: 'RO water' },
  Parking: { icon: <Car className="w-3.5 h-3.5" />, label: 'Parking' },
  AC: { icon: <Wind className="w-3.5 h-3.5" />, label: 'AC' },
  'Hot Water': { icon: <Droplets className="w-3.5 h-3.5" />, label: 'Hot water' },
  Gym: { icon: <Zap className="w-3.5 h-3.5" />, label: 'Gym' },
  Housekeeping: { icon: <Check className="w-3.5 h-3.5" />, label: 'Housekeeping' },
};

const HOUSE_RULES_NOTE = 'House rules are not stored on this demo listing. Ask the owner when you visit.';

export function HostelDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { hostels, user, toggleFavourite, isFavourite, scheduleVisit } = useApp();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const hostel = hostels.find(h => h.id === id && h.status === 'approved');
  const resumeApplied = useRef(false);
  const listedHostelId = useRef<string | null>(null);

  const [selectedRoom, setSelectedRoom] = useState<RoomType | null>(null);
  const [visitDate, setVisitDate] = useState('');
  const [message, setMessage] = useState('');
  const [step, setStep] = useState<'idle' | 'date' | 'confirm' | 'submitting' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [shareCopied, setShareCopied] = useState(false);
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  useEffect(() => {
    if (user) return;
    const target = id ? `/hostel/${id}${searchParams.toString() ? `?${searchParams.toString()}` : ''}` : '/';
    navigate(`/login?role=student&redirect=${encodeURIComponent(target)}`, { replace: true });
  }, [user, id, navigate, searchParams]);

  useEffect(() => {
    if (!user || !hostel) return;
    if (listedHostelId.current !== hostel.id) {
      listedHostelId.current = hostel.id;
      resumeApplied.current = false;
      setStep('idle');
    }
    if (resumeApplied.current) return;
    const available = hostel.roomTypes.filter(r => r.available);
    const roomId = searchParams.get('room');
    const resume = searchParams.get('resumeVisit') === '1';
    const fromQuery = roomId ? available.find(r => r.id === roomId) : undefined;
    if (fromQuery) setSelectedRoom(fromQuery);
    else if (available.length > 0) {
      const sorted = [...available].sort((a, b) => a.rent - b.rent);
      const double = sorted.find(r => r.sharingType === 'double');
      setSelectedRoom(double || sorted[0]);
    }
    if (resume && user?.role !== 'student') return;
    if (resume && user?.role === 'student') setStep('date');
    if (resume || roomId) {
      const next = new URLSearchParams(searchParams);
      next.delete('resumeVisit');
      next.delete('room');
      setSearchParams(next, { replace: true });
    }
    resumeApplied.current = true;
  }, [hostel, user, searchParams, setSearchParams]);

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center animate-fade-in">
        <h1 className="font-display text-2xl font-semibold text-navy">Sign in required</h1>
        <p className="mt-2 text-ink text-sm">Create an account or log in as a student to view hostel details.</p>
        <Link
          to={`/login?role=student&redirect=${encodeURIComponent(id ? `/hostel/${id}` : '/')}`}
          className="mt-6 inline-flex items-center justify-center h-10 px-5 rounded-pill bg-navy text-white text-sm font-medium"
        >
          Go to sign in
        </Link>
      </div>
    );
  }

  if (!hostel) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center animate-fade-in">
        <h1 className="text-2xl font-bold text-slate-900">Hostel not found</h1>
        <p className="mt-2 text-slate-500">This listing may be pending approval or does not exist.</p>
        <Link to="/explore" className="mt-6 inline-block text-navy font-medium hover:underline">← Browse hostels</Link>
      </div>
    );
  }

  const images = hostel.images.length > 0 ? hostel.images : [hostel.coverImage];
  const galleryImages = images.length >= 4 ? images : [...images, ...Array(Math.max(0, 4 - images.length)).fill(hostel.coverImage)];
  const fav = isFavourite(hostel.id);
  const minRent = Math.min(...hostel.roomTypes.map(r => r.rent));
  const depositForSelected = selectedRoom?.deposit;
  const categoryLabel = hostel.category === 'boys' ? 'Boys' : hostel.category === 'girls' ? 'Girls' : 'Co-ed';

  const mostPopularId = useMemo(() => {
    const doubles = hostel.roomTypes.filter(r => r.sharingType === 'double' && r.available);
    if (doubles.length) return doubles.sort((a, b) => a.rent - b.rent)[0].id;
    const avail = hostel.roomTypes.filter(r => r.available);
    return avail.length ? avail.sort((a, b) => a.rent - b.rent)[0].id : null;
  }, [hostel]);

  const openGallery = (index: number) => { setGalleryIndex(index); setGalleryOpen(true); };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: hostel.name, url });
      else { await navigator.clipboard.writeText(url); setShareCopied(true); setTimeout(() => setShareCopied(false), 2000); }
    } catch {
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }
  };

  const startVisitFlow = () => {
    setError('');
    if (!user || user.role !== 'student') {
      const next = `/hostel/${id}?resumeVisit=1${selectedRoom ? `&room=${encodeURIComponent(selectedRoom.id)}` : ''}`;
      navigate(`/login?role=student&redirect=${encodeURIComponent(next)}`);
      return;
    }
    setStep('date');
  };

  const goToConfirm = () => {
    setError('');
    if (!visitDate) { setError('Please select a visit date'); return; }
    if (visitDate < today) { setError('Visit date cannot be in the past'); return; }
    setStep('confirm');
  };

  const submitVisit = () => {
    if (step === 'submitting') return;
    setError('');
    setStep('submitting');
    setTimeout(() => {
      try {
        scheduleVisit({
          hostelId: hostel.id,
          hostelName: hostel.name,
          roomTypeId: selectedRoom?.id,
          roomTypeName: selectedRoom?.name,
          visitDate,
          message: message.trim() || undefined,
        });
        setStep('success');
      } catch {
        setError('Something went wrong. Please try again.');
        setStep('error');
      }
    }, 600);
  };

  const formatDisplayDate = (iso: string) => {
    try {
      return new Date(iso + 'T12:00:00').toLocaleDateString('en-IN', {
        weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
      });
    } catch { return iso; }
  };

  return (
    <div className="animate-fade-in bg-paper min-h-screen">
      <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <nav className="flex items-center gap-1.5 text-sm text-ink mb-4 flex-wrap" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-navy">Home</Link>
          <span aria-hidden>/</span>
          <Link to={`/explore?locality=${encodeURIComponent(hostel.locality)}`} className="hover:text-navy">{hostel.locality}</Link>
          <span aria-hidden>/</span>
          <span className="text-navy font-medium truncate">{hostel.name}</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="font-display text-3xl sm:text-4xl font-semibold text-navy break-words">{hostel.name}</h1>
              <span className="inline-flex px-2.5 py-0.5 rounded-pill text-xs font-medium bg-mist text-navy border border-navy/10">{categoryLabel}</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-sm text-ink flex-wrap">
              <MapPin className="w-4 h-4 flex-shrink-0 text-gold" />
              <span>{hostel.address}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {user?.role === 'student' && (
              <button onClick={() => toggleFavourite(hostel.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-pill border text-sm font-medium transition-colors ${
                  fav ? 'bg-navy border-navy text-gold' : 'bg-white border-navy/15 text-navy hover:border-navy/40'
                }`}>
                <Heart className={`w-4 h-4 ${fav ? 'fill-current' : ''}`} />
                {fav ? 'Saved' : 'Save'}
              </button>
            )}
            <button onClick={handleShare}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-pill border border-navy/15 bg-white text-sm font-medium text-navy hover:border-navy/40">
              <Share2 className="w-4 h-4" />
              {shareCopied ? 'Copied' : 'Share'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 rounded-card overflow-hidden mb-8">
          <button type="button" onClick={() => openGallery(0)}
            className="md:col-span-2 md:row-span-2 relative aspect-[4/3] md:aspect-auto md:min-h-[320px] bg-slate-100 group">
            <img src={galleryImages[0]} alt={hostel.name}
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
              onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80'; }} />
          </button>
          {[1, 2, 3].map((i) => (
            <button key={i} type="button" onClick={() => openGallery(i)}
              className={`relative aspect-[4/3] bg-slate-100 group overflow-hidden ${i === 3 ? 'hidden sm:block' : ''}`}>
              <img src={galleryImages[i] || hostel.coverImage} alt=""
                className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                onError={(e) => { (e.target as HTMLImageElement).src = hostel.coverImage; }} />
              {i === 3 && images.length > 4 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-medium text-sm">
                  <Camera className="w-4 h-4 mr-1.5" />+{images.length - 3} photos
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 !rounded-card !border-navy/10 !shadow-card">
              <h2 className="font-display text-2xl font-semibold text-navy mb-3">About this stay</h2>
              <p className="text-ink leading-7">{hostel.description}</p>
              <p className="mt-3 text-xs text-ink/80">{DEMO_NOTE}</p>

              <h3 className="font-semibold text-navy mt-6 mb-3">Amenities on this listing</h3>
              <div className="flex flex-wrap gap-2">
                {hostel.amenities.map(a => {
                  const meta = amenityMeta[a] || { icon: <Check className="w-3.5 h-3.5" />, label: a };
                  return (
                    <span key={a} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill bg-mist border border-navy/10 text-sm text-navy">
                      {meta.icon}{meta.label}
                    </span>
                  );
                })}
              </div>

              <h3 className="font-semibold text-navy mt-6 mb-3">House rules</h3>
              <p className="text-sm leading-6 text-ink">{HOUSE_RULES_NOTE}</p>
            </Card>

            <Card className="p-6 !rounded-card !border-navy/10 !shadow-card">
              <h2 className="font-display text-2xl font-semibold text-navy mb-1">Rooms and rent</h2>
              <p className="text-sm text-ink mb-5">Monthly rent from the listing. Deposit and extras are separate when the owner entered them.</p>

              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {hostel.roomTypes.map(rt => {
                  const isSelected = selectedRoom?.id === rt.id;
                  const isPopular = rt.id === mostPopularId;
                  return (
                    <div key={rt.id}
                      className={`relative rounded-card border p-4 transition-colors ${
                        isSelected ? 'border-navy bg-mist shadow-card' : 'border-navy/10 bg-white'
                      } ${!rt.available ? 'opacity-60' : ''}`}>
                      {isPopular && rt.available && (
                        <span className="absolute -top-2.5 left-4 px-2.5 py-0.5 rounded-pill bg-gold text-navy text-[10px] font-semibold uppercase tracking-wide">
                          Lowest listed
                        </span>
                      )}
                      <h3 className="font-semibold text-navy text-sm mt-1">{rt.name}</h3>
                      <p className="text-xs text-ink mt-0.5 capitalize">
                        {rt.sharingType} · {rt.capacity} bed{rt.capacity > 1 ? 's' : ''}
                      </p>
                      <div className="mt-3">
                        <span className="text-xl font-semibold text-navy">₹{rt.rent.toLocaleString('en-IN')}</span>
                        <span className="text-xs text-ink">/mo</span>
                      </div>
                      <p className="text-xs mt-1">
                        {rt.available
                          ? <span className="text-emerald-600 font-medium">Available</span>
                          : <span className="text-amber-600 font-medium">Currently full</span>}
                      </p>
                      <Button size="sm" variant={isSelected ? 'primary' : 'outline'} className={`w-full mt-3 rounded-pill ${isSelected ? '!bg-navy hover:!bg-blue !focus:ring-navy' : '!border-navy !text-navy'}`}
                        disabled={!rt.available} onClick={() => setSelectedRoom(rt)}>
                        {isSelected ? 'Selected' : 'Select'}
                      </Button>
                    </div>
                  );
                })}
              </div>

              {selectedRoom && (
                <div className="mt-6 rounded-card bg-mist border border-navy/10 p-5">
                  <h3 className="font-semibold text-navy text-sm mb-3">Price breakup ({selectedRoom.name})</h3>
                  <dl className="space-y-2.5 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-ink">Monthly rent</dt>
                      <dd className="font-medium text-navy">₹{selectedRoom.rent.toLocaleString('en-IN')}</dd>
                    </div>
                    {selectedRoom.included.map(item => (
                      <div key={item} className="flex justify-between">
                        <dt className="text-ink">{item}</dt>
                        <dd className="text-ink">Included</dd>
                      </div>
                    ))}
                    <div className="flex justify-between">
                      <dt className="text-ink">Refundable deposit (one-time)</dt>
                      <dd className="font-medium text-navy">
                        {selectedRoom.deposit > 0 ? `₹${selectedRoom.deposit.toLocaleString('en-IN')}` : 'Not specified'}
                      </dd>
                    </div>
                    {selectedRoom.extraCharges.map(ec => (
                      <div key={ec.name} className="flex justify-between">
                        <dt className="text-ink">{ec.name}{ec.optional ? ' (optional)' : ''}</dt>
                        <dd className="font-medium text-navy">₹{ec.amount.toLocaleString('en-IN')}{ec.optional ? ' / month' : ''}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </Card>

            <Card className="p-6 !rounded-card !border-navy/10 !shadow-card">
              <h2 className="font-display text-2xl font-semibold text-navy mb-1">Hostel location</h2>
              <p className="text-sm text-ink mb-4">{hostel.address}</p>
              <HostelLocationMap hostel={hostel} />
            </Card>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <Card className="p-5 !rounded-card !border-navy/10 !shadow-card">
                {step === 'success' ? (
                  <div className="text-center py-4 animate-fade-in">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4 animate-slide-up">
                      <Check className="w-8 h-8 text-emerald-600" />
                    </div>
                    <p className="text-lg font-bold text-emerald-800">Visit Confirmed</p>
                    <p className="text-sm text-slate-600 mt-2">
                      <strong>{formatDisplayDate(visitDate)}</strong>
                      {selectedRoom && <> · {selectedRoom.name}</>}
                    </p>
                    <p className="text-sm text-slate-500 mt-3 leading-relaxed">
                      Exact visit time will be coordinated with the owner later.
                    </p>
                    <p className="text-xs text-slate-400 mt-4 px-2">
                      This is a <strong>visit request</strong>, not a room reservation or payment.
                      Demo only — nothing was emailed or messaged.
                    </p>
                    <Button variant="outline" className="mt-5 w-full rounded-pill !border-navy !text-navy"
                      onClick={() => { setStep('idle'); setVisitDate(''); setMessage(''); }}>
                      Request another visit
                    </Button>
                    <Link to="/visits" className="block mt-3 text-sm text-navy font-medium hover:underline">
                      View my visits
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="flex items-baseline justify-between gap-2 mb-1">
                      <span className="text-2xl font-semibold text-navy">₹{minRent.toLocaleString('en-IN')}</span>
                      <span className="text-sm text-ink">/ month from</span>
                    </div>
                    {depositForSelected != null && depositForSelected > 0 && (
                      <p className="text-xs text-ink mb-4">Deposit from ₹{depositForSelected.toLocaleString('en-IN')} (selected room)</p>
                    )}
                    {(!depositForSelected || depositForSelected === 0) && <p className="text-xs text-ink mb-4">Select a room for deposit details</p>}

                    {step === 'idle' && (
                      <Button className="w-full rounded-pill !bg-navy hover:!bg-blue" onClick={startVisitFlow}>
                        <Calendar className="w-4 h-4 mr-2" />
                        Request a visit
                      </Button>
                    )}

                    {step === 'date' && (
                      <div className="space-y-3 animate-fade-in">
                        <label className="block text-sm font-medium text-navy">Preferred visit date</label>
                        <input
                          type="date"
                          min={today}
                          value={visitDate}
                          onChange={(e) => setVisitDate(e.target.value)}
                          className="w-full h-10 px-3 rounded-card border border-navy/15 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20"
                        />
                        <label className="block text-sm font-medium text-navy mt-2">Message to owner (optional)</label>
                        <textarea
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          rows={3}
                          placeholder="Any questions or preferred time window…"
                          className="w-full px-3 py-2 rounded-card border border-navy/15 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 resize-none"
                        />
                        {error && <p className="text-sm text-red-600">{error}</p>}
                        <div className="flex gap-2 pt-1">
                          <Button variant="outline" className="flex-1 rounded-pill !border-navy !text-navy" onClick={() => setStep('idle')}>Back</Button>
                          <Button className="flex-1 rounded-pill !bg-navy hover:!bg-blue" onClick={goToConfirm}>Continue</Button>
                        </div>
                      </div>
                    )}

                    {step === 'confirm' && (
                      <div className="space-y-3 animate-fade-in">
                        <p className="text-sm text-ink">Confirm visit for <strong className="text-navy">{formatDisplayDate(visitDate)}</strong>
                          {selectedRoom && <> · {selectedRoom.name}</>}?</p>
                        {message.trim() && <p className="text-xs text-ink/80 bg-mist p-2 rounded-card">{message}</p>}
                        {error && <p className="text-sm text-red-600">{error}</p>}
                        <div className="flex gap-2">
                          <Button variant="outline" className="flex-1 rounded-pill !border-navy !text-navy" onClick={() => setStep('date')}>Back</Button>
                          <Button className="flex-1 rounded-pill !bg-navy hover:!bg-blue" onClick={submitVisit}>Confirm visit</Button>
                        </div>
                      </div>
                    )}

                    {(step === 'submitting' || step === 'error') && (
                      <div className="py-6 text-center">
                        {step === 'submitting' && <p className="text-sm text-ink">Sending request…</p>}
                        {step === 'error' && (
                          <>
                            <p className="text-sm text-red-600 mb-3">{error || 'Something went wrong'}</p>
                            <Button className="rounded-pill !bg-navy" onClick={() => setStep('confirm')}>Try again</Button>
                          </>
                        )}
                      </div>
                    )}
                  </>
                )}
              </Card>

              <Card className="p-5 !rounded-card !border-navy/10 !shadow-card">
                <h3 className="font-semibold text-navy text-sm mb-3">Owner contact</h3>
                <p className="text-sm text-ink leading-relaxed">
                  Contact details are shared after a visit is confirmed in this demo.
                  Use the visit request flow above.
                </p>
                <div className="mt-3 flex items-center gap-2 text-sm text-ink">
                  <Phone className="w-4 h-4 text-gold" />
                  <span>Shown after confirmation</span>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {galleryOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" role="dialog" aria-modal="true">
          <button type="button" onClick={() => setGalleryOpen(false)}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2" aria-label="Close gallery">
            <X className="w-6 h-6" />
          </button>
          <button type="button" onClick={() => setGalleryIndex((i) => (i - 1 + galleryImages.length) % galleryImages.length)}
            className="absolute left-4 text-white/80 hover:text-white p-2" aria-label="Previous">
            <ChevronLeft className="w-8 h-8" />
          </button>
          <img src={galleryImages[galleryIndex]} alt="" className="max-h-[85vh] max-w-[90vw] object-contain" />
          <button type="button" onClick={() => setGalleryIndex((i) => (i + 1) % galleryImages.length)}
            className="absolute right-4 text-white/80 hover:text-white p-2" aria-label="Next">
            <ChevronRight className="w-8 h-8" />
          </button>
          <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-1.5">
            {galleryImages.map((_, i) => (
              <button key={i} type="button" onClick={() => setGalleryIndex(i)}
                className={`w-2 h-2 rounded-full ${i === galleryIndex ? 'bg-white' : 'bg-white/40'}`} aria-label={`Photo ${i + 1}`} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
