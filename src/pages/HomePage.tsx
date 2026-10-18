import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, IndianRupee, Users, FileText, Phone, GraduationCap, ArrowRight, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { HostelCard } from '../components/hostel/HostelCard';
import { LOCALITIES } from '../data/mockData';
import type { SharingType } from '../types';

export function HomePage() {
  const { hostels } = useApp();
  const navigate = useNavigate();
  const [locality, setLocality] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [sharing, setSharing] = useState<SharingType | ''>('');

  const approved = hostels.filter(h => h.status === 'approved');
  const featured = approved.slice(0, 3);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    const params = new URLSearchParams();
    if (locality) params.set('locality', locality);
    if (maxBudget) params.set('maxBudget', maxBudget);
    if (sharing) params.set('sharing', sharing);
    navigate(`/explore?${params.toString()}`);
  };

  return (
    <div className="animate-fade-in">
      <section className="relative bg-navy overflow-hidden" aria-labelledby="hero-heading">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(23,106,150,0.35),_transparent_55%)] pointer-events-none" />
        <div className="relative max-w-page mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-14 lg:pt-16 lg:pb-20">
          <div className="grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] gap-10 lg:gap-12 items-center">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-gold">
                Kota · Hostels and PGs
              </p>
              <h1
                id="hero-heading"
                className="mt-4 font-display text-[2.4rem] sm:text-5xl lg:text-[3.4rem] font-semibold leading-[1.08] tracking-tight text-white"
              >
                Find your{' '}
                <em className="not-italic text-gold italic font-semibold">stay</em>
                <br className="hidden sm:block" />
                {' '}in Kota.
              </h1>
              <p className="mt-5 max-w-md text-[15px] sm:text-base leading-7 text-white/75">
                Discover hostels and PGs near coaching hubs. Filter by locality, budget and sharing, then request a visit.
              </p>

              <form
                onSubmit={handleSearch}
                className="mt-8 bg-white rounded-xl p-3 shadow-card"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <label className="block">
                    <span className="sr-only">Locality</span>
                    <span className="relative block">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink pointer-events-none" />
                      <select
                        value={locality}
                        onChange={(e) => setLocality(e.target.value)}
                        className="w-full h-11 pl-9 pr-2 rounded-lg text-sm text-navy bg-mist border border-transparent focus:outline-none focus:ring-2 focus:ring-navy"
                      >
                        <option value="">Locality</option>
                        {LOCALITIES.map((l) => (
                          <option key={l} value={l}>{l}</option>
                        ))}
                      </select>
                    </span>
                  </label>
                  <label className="block">
                    <span className="sr-only">Monthly budget</span>
                    <span className="relative block">
                      <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink pointer-events-none" />
                      <select
                        value={maxBudget}
                        onChange={(e) => setMaxBudget(e.target.value)}
                        className="w-full h-11 pl-9 pr-2 rounded-lg text-sm text-navy bg-mist border border-transparent focus:outline-none focus:ring-2 focus:ring-navy"
                      >
                        <option value="">Budget</option>
                        <option value="5000">Under ₹5,000</option>
                        <option value="8000">Under ₹8,000</option>
                        <option value="12000">Under ₹12,000</option>
                      </select>
                    </span>
                  </label>
                  <label className="block">
                    <span className="sr-only">Sharing type</span>
                    <span className="relative block">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink pointer-events-none" />
                      <select
                        value={sharing}
                        onChange={(e) => setSharing(e.target.value as SharingType | '')}
                        className="w-full h-11 pl-9 pr-2 rounded-lg text-sm text-navy bg-mist border border-transparent focus:outline-none focus:ring-2 focus:ring-navy"
                      >
                        <option value="">Sharing</option>
                        <option value="single">Single</option>
                        <option value="double">Double</option>
                        <option value="triple">Triple</option>
                      </select>
                    </span>
                  </label>
                </div>
                <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-2">
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-pill bg-navy hover:bg-blue text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy"
                  >
                    <Search className="w-4 h-4" />
                    Explore Hostels
                  </button>
                  <Link
                    to="/login?role=owner"
                    className="inline-flex items-center justify-center h-11 px-3 text-sm font-medium text-navy/80 hover:text-navy underline-offset-4 hover:underline"
                  >
                    List your property
                  </Link>
                </div>
              </form>
            </div>

            <div className="relative flex justify-center lg:justify-end">
              <div className="relative w-full max-w-md">
                <div className="absolute -inset-3 rounded-card bg-gold/15 blur-sm" aria-hidden />
                <div className="relative rounded-card overflow-hidden shadow-card border border-white/10 rotate-2 hover:rotate-0 transition-transform duration-500 ease-out">
                  <img
                    src="https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=900&q=80"
                    alt="Student room in a Kota hostel"
                    className="w-full aspect-[4/5] object-cover"
                    width={900}
                    height={1125}
                  />
                  <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-navy/80 to-transparent">
                    <p className="text-xs text-white/90">Demo room photo · listings from StayKota catalogue</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-6" aria-label="Popular localities">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-ink mr-1">Popular:</span>
          {LOCALITIES.slice(0, 6).map((l, i) => (
            <Link
              key={l}
              to={`/explore?locality=${encodeURIComponent(l)}`}
              className={`px-3.5 py-1.5 rounded-pill text-sm font-medium focus:outline-none focus:ring-2 focus:ring-navy/30 ${
                i === 0
                  ? 'bg-navy text-white'
                  : 'bg-white text-ink border border-navy/10 hover:border-navy/30'
              }`}
            >
              {l}
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-sm text-teal-600 font-medium mb-1">Handpicked for this admission season</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Featured hostels near coaching hubs</h2>
          </div>
          <Link to="/explore" className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-teal-700">View all stays <ArrowRight className="w-4 h-4" /></Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((h, i) => (
            <div key={h.id} className="animate-slide-up" style={{ animationDelay: `${i * 0.08}s` }}>
              <HostelCard hostel={h} />
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid sm:grid-cols-3 gap-5">
          {[
            { icon: <FileText className="w-5 h-5" />, title: 'Transparent rent breakup', desc: 'Monthly rent, deposit and extras shown separately. No hidden charges.' },
            { icon: <Phone className="w-5 h-5" />, title: 'Direct owner contact', desc: 'Request a visit in one step. No middlemen, no commission.' },
            { icon: <GraduationCap className="w-5 h-5" />, title: 'Built for students', desc: 'Filters for sharing type, mess and coaching distance.' },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-md transition-shadow">
              <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-4">{item.icon}</div>
              <h3 className="font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-1.5 text-sm text-slate-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { num: '01', title: 'Search & compare', desc: 'Filter by budget, locality and sharing.' },
            { num: '02', title: 'Request a visit', desc: 'Pick a date. Owner confirms on call.' },
            { num: '03', title: 'Visit the room', desc: 'Check room, mess and washrooms.' },
            { num: '04', title: 'Move in', desc: 'Pay deposit with receipt.' },
          ].map(s => (
            <div key={s.num} className="bg-white rounded-2xl border border-slate-100 p-5 relative overflow-hidden">
              <span className="absolute top-4 right-4 text-3xl font-bold text-slate-100">{s.num}</span>
              <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center mb-3 text-slate-600"><Check className="w-4 h-4" /></div>
              <h3 className="font-semibold text-slate-900 text-sm">{s.title}</h3>
              <p className="mt-1 text-xs text-slate-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
