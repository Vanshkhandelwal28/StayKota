import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, IndianRupee, Users, FileText, Phone, GraduationCap, ArrowRight, Check, BookOpen } from 'lucide-react';
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

      <section className="bg-gold text-navy" aria-label="What StayKota helps with">
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <ul className="flex flex-col sm:flex-row sm:flex-wrap sm:justify-between gap-2 sm:gap-6 text-sm font-medium">
            <li>Rent, deposit and extras listed separately</li>
            <li>Search by locality, budget and sharing</li>
            <li>Request a visit date from the listing</li>
          </ul>
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

      <section className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-gold">From the demo catalogue</p>
            <h2 className="mt-1 font-display text-3xl sm:text-4xl font-semibold text-navy">Hostels near coaching areas</h2>
          </div>
          <Link to="/explore" className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-navy">
            View all stays <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((h, i) => (
            <div key={h.id} className="animate-slide-up" style={{ animationDelay: `${i * 0.08}s` }}>
              <HostelCard hostel={h} />
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-12" aria-labelledby="benefits-heading">
        <h2 id="benefits-heading" className="font-display text-3xl sm:text-4xl font-semibold text-navy">
          What you can check before a visit
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-6 text-ink">
          StayKota is for students looking at hostels and PGs in Kota. Listings show only what the owner entered.
        </p>
        <div className="mt-6 grid sm:grid-cols-3 gap-4">
          {[
            { icon: <FileText className="w-5 h-5" />, title: 'Rent shown in parts', desc: 'Monthly rent, deposit and extra charges appear separately when the listing includes them.' },
            { icon: <Phone className="w-5 h-5" />, title: 'Visit request', desc: 'Pick a date on the listing. The owner follows up to confirm a time.' },
            { icon: <GraduationCap className="w-5 h-5" />, title: 'Student filters', desc: 'Narrow results by locality, budget and room sharing.' },
          ].map((item) => (
            <article key={item.title} className="bg-white rounded-card border border-navy/10 shadow-card overflow-hidden">
              <div
                className="h-2 bg-[repeating-linear-gradient(90deg,#073b55_0_10px,#e7b43b_10px_14px,#176a96_14px_22px)]"
                aria-hidden
              />
              <div className="p-5">
                <div className="w-10 h-10 rounded-lg bg-mist text-navy flex items-center justify-center mb-4">{item.icon}</div>
                <h3 className="font-semibold text-navy">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-6 text-ink">{item.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 pb-4" aria-labelledby="living-heading">
        <h2 id="living-heading" className="font-display text-3xl sm:text-4xl font-semibold text-navy">
          Practical notes for Kota
        </h2>
        <div className="mt-6 grid md:grid-cols-3 gap-4">
          {[
            { icon: <BookOpen className="w-5 h-5" />, title: 'Near coaching areas', desc: 'Popular chips jump to Talwandi, Landmark and other localities already in the catalogue.' },
            { icon: <GraduationCap className="w-5 h-5" />, title: 'Sharing that fits study hours', desc: 'Single, double and triple options are filters, not a promise that every hostel has each type.' },
            { icon: <MapPin className="w-5 h-5" />, title: 'See the room first', desc: 'A visit request is not a booking and does not reserve a bed.' },
          ].map((item) => (
            <article key={item.title} className="rounded-card bg-mist border border-navy/10 p-5">
              <div className="w-10 h-10 rounded-full bg-white text-navy flex items-center justify-center mb-4 border border-navy/10">{item.icon}</div>
              <h3 className="font-semibold text-navy">{item.title}</h3>
              <p className="mt-1.5 text-sm leading-6 text-ink">{item.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-16" aria-labelledby="steps-heading">
        <h2 id="steps-heading" className="font-display text-3xl sm:text-4xl font-semibold text-navy">How it works</h2>
        <ol className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 list-none">
          {[
            { num: '01', title: 'Search', desc: 'Filter by budget, locality and sharing.' },
            { num: '02', title: 'Request a visit', desc: 'Choose a date. Time is arranged afterwards.' },
            { num: '03', title: 'See the room', desc: 'Check the room, mess and washrooms in person.' },
            { num: '04', title: 'Decide with the owner', desc: 'Rent and deposit stay between you and the property.' },
          ].map((s) => (
            <li key={s.num} className="bg-white rounded-card border border-navy/10 p-5">
              <span className="font-display text-2xl text-gold font-semibold">{s.num}</span>
              <div className="mt-3 w-8 h-8 rounded-full bg-navy text-white flex items-center justify-center">
                <Check className="w-4 h-4" aria-hidden />
              </div>
              <h3 className="mt-3 font-semibold text-navy text-sm">{s.title}</h3>
              <p className="mt-1 text-sm leading-6 text-ink">{s.desc}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="bg-navy text-white" aria-labelledby="close-heading">
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-14 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-gold">Kota</p>
            <h2 id="close-heading" className="mt-2 font-display text-3xl sm:text-4xl font-semibold">
              Look through stays, then visit the room.
            </h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-white/75">
              Search the demo catalogue by locality, budget and sharing. Nothing here reserves a bed.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/explore"
              className="inline-flex items-center justify-center h-11 px-5 rounded-pill bg-gold text-navy text-sm font-medium hover:bg-white"
            >
              Explore Hostels
            </Link>
            <Link
              to="/login?role=owner"
              className="inline-flex items-center justify-center h-11 px-5 rounded-pill border border-white/30 text-sm font-medium text-white hover:bg-white/10"
            >
              List your property
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
