import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, IndianRupee, Users, FileText, Phone, GraduationCap, ArrowRight, Check, BookOpen, Home, Star } from 'lucide-react';
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
      <section className="relative overflow-hidden" aria-labelledby="hero-heading">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1920&q=80"
            alt=""
            className="w-full h-full object-cover object-center"
            width={1920}
            height={1080}
            fetchPriority="high"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(105deg, rgba(3,37,57,0.90) 0%, rgba(7,59,85,0.82) 42%, rgba(5,45,67,0.72) 100%)',
            }}
            aria-hidden
          />
        </div>

        <div className="relative max-w-[90rem] mx-auto px-4 sm:px-8 lg:px-12 pt-10 pb-20 sm:pt-14 sm:pb-24 lg:min-h-[42rem] lg:flex lg:items-center">
          <div className="grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] gap-10 lg:gap-12 items-center w-full">
            <div className="min-w-0">
              <span className="inline-flex items-center px-3.5 py-1.5 rounded-full border border-[#F5A91F]/70 text-[#F5A91F] text-[11px] sm:text-[13px] font-semibold tracking-[0.16em] uppercase">
                10+ Locations in Kota
              </span>

              <h1
                id="hero-heading"
                className="mt-5 font-display font-semibold text-white tracking-tight"
                style={{
                  fontSize: 'clamp(2.5rem, 6.5vw, 5.75rem)',
                  lineHeight: 0.94,
                }}
              >
                <span className="block">Luxury That</span>
                <span className="relative inline-block italic text-[#F5A91F] font-semibold">
                  Feels
                  <svg
                    className="absolute left-0 -bottom-1 w-full h-3 text-[#F5A91F]"
                    viewBox="0 0 200 12"
                    fill="none"
                    aria-hidden
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M2 8c40-6 80-6 120 0s60 6 76 1"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>{' '}
                <span className="not-italic">Like</span>
                <span className="block">Home</span>
              </h1>

              <p className="mt-6 max-w-xl text-[15px] sm:text-[19px] leading-relaxed text-[#D6E0E7]">
                Premium student accommodation in Kota — fully furnished, all-inclusive living with
                home-cooked meals, modern amenities, and a community that cares.
              </p>

              <form
                onSubmit={handleSearch}
                className="mt-8 bg-white rounded-2xl p-3.5 sm:p-4 shadow-[0_16px_40px_rgba(0,0,0,0.22)] border border-white/40"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 min-w-0">
                  <label className="block">
                    <span className="sr-only">Locality</span>
                    <span className="relative block">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink pointer-events-none" />
                      <select
                        value={locality}
                        onChange={(e) => setLocality(e.target.value)}
                        className="w-full h-12 pl-9 pr-2 rounded-xl text-[15px] text-navy bg-[#F4F6F7] border border-transparent focus:outline-none focus:ring-2 focus:ring-navy"
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
                        className="w-full h-12 pl-9 pr-2 rounded-xl text-[15px] text-navy bg-[#F4F6F7] border border-transparent focus:outline-none focus:ring-2 focus:ring-navy"
                      >
                        <option value="">Monthly budget</option>
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
                        className="w-full h-12 pl-9 pr-2 rounded-xl text-[15px] text-navy bg-[#F4F6F7] border border-transparent focus:outline-none focus:ring-2 focus:ring-navy"
                      >
                        <option value="">Sharing type</option>
                        <option value="single">Single</option>
                        <option value="double">Double</option>
                        <option value="triple">Triple</option>
                      </select>
                    </span>
                  </label>
                </div>
                <div className="mt-3 flex flex-col sm:flex-row gap-2">
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full bg-[#073B55] hover:bg-[#0a4d6e] text-white text-[15px] font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy"
                  >
                    <Search className="w-4 h-4" />
                    Explore Hostels
                  </button>
                  <Link
                    to="/login?role=owner"
                    className="inline-flex items-center justify-center gap-2 h-12 px-5 rounded-full border border-[#073B55]/25 text-[#073B55] text-[15px] font-semibold hover:bg-[#F4F6F7]"
                  >
                    <Home className="w-4 h-4" />
                    List Your Property
                  </Link>
                </div>
              </form>
            </div>

            <div className="relative flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[22rem] sm:max-w-[28rem] lg:max-w-[32rem]">
                <div className="relative rounded-[1.35rem] overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.35)] border border-white/20 bg-white rotate-0 sm:rotate-[2.5deg] motion-safe:sm:hover:rotate-0 transition-transform duration-500 ease-out">
                  <div className="relative">
                    <img
                      src="https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80"
                      alt="Warm student hostel bedroom"
                      className="w-full aspect-[4/5] object-cover object-center"
                      width={900}
                      height={1125}
                    />
                    <span className="absolute top-4 right-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F5A91F] text-[#073B55] text-sm font-semibold shadow-md">
                      <Star className="w-3.5 h-3.5 fill-current" aria-hidden />
                      4.8 Rating
                    </span>
                  </div>
                  <div className="bg-white px-5 py-4">
                    <p className="font-display text-lg sm:text-xl font-semibold text-[#073B55]">
                      The StayKota Experience
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 leading-[0]" aria-hidden>
          <svg viewBox="0 0 1440 80" className="w-full h-12 sm:h-16 text-[#F7F8F7]" preserveAspectRatio="none">
            <path fill="currentColor" d="M0,48 C240,80 480,0 720,32 C960,64 1200,80 1440,24 L1440,80 L0,80 Z" />
          </svg>
        </div>
      </section>

      <section className="bg-gold text-navy overflow-hidden" aria-label="What StayKota helps with">
        <div className="py-3 overflow-hidden">
          <div className="feature-marquee-track flex w-max">
            {[0, 1].map((copy) => (
              <ul
                key={copy}
                className="flex items-center gap-10 sm:gap-14 px-6 text-sm font-medium shrink-0"
                aria-hidden={copy === 1}
              >
                <li className="whitespace-nowrap">Rent, deposit and extras listed separately</li>
                <li className="w-1.5 h-1.5 rounded-full bg-navy/35 shrink-0" aria-hidden />
                <li className="whitespace-nowrap">Search by locality, budget and sharing</li>
                <li className="w-1.5 h-1.5 rounded-full bg-navy/35 shrink-0" aria-hidden />
                <li className="whitespace-nowrap">Request a visit date from the listing</li>
                <li className="w-1.5 h-1.5 rounded-full bg-navy/35 shrink-0" aria-hidden />
              </ul>
            ))}
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
              className="inline-flex items-center justify-center h-11 w-full sm:w-auto px-5 rounded-pill bg-gold text-navy text-sm font-medium hover:bg-white"
            >
              Explore Hostels
            </Link>
            <Link
              to="/login?role=owner"
              className="inline-flex items-center justify-center h-11 w-full sm:w-auto px-5 rounded-pill border border-white/30 text-sm font-medium text-white hover:bg-white/10"
            >
              List your property
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
