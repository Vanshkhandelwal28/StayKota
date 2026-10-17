import React, { lazy, Suspense, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, IndianRupee, Users, FileText, Phone, GraduationCap, ArrowRight, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { HostelCard } from '../components/hostel/HostelCard';
import { LOCALITIES } from '../data/mockData';
import type { SharingType } from '../types';

const HostelCanvas = lazy(() => import('../components/home/HostelScene').then((m) => ({ default: m.HostelCanvas })));

export function HomePage() {
  const { hostels } = useApp();
  const navigate = useNavigate();
  const [locality, setLocality] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [sharing, setSharing] = useState<SharingType | ''>('');

  const approved = hostels.filter((h) => h.status === 'approved');
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
    <div>
      <section className="bg-[#faf8f5]" aria-labelledby="hero-heading">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6 lg:pt-12 lg:pb-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-10 items-stretch">
            <div className="flex flex-col justify-center max-w-xl">
              <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-teal-800">
                Kota · Hostels and PGs
              </p>
              <h1 id="hero-heading" className="mt-3 max-w-[12ch] text-[2.15rem] sm:text-5xl font-semibold leading-[1.08] tracking-[-0.025em] text-[#10212b]">
                Find Your Stay in Kota.
              </h1>
              <p className="mt-4 max-w-sm text-[15px] sm:text-base leading-7 text-slate-600">
                Discover hostels and PGs that fit your budget, location, and lifestyle.
              </p>

              <form onSubmit={handleSearch} className="mt-6 bg-white border border-stone-200 rounded-xl p-4 shadow-[0_1px_2px_rgba(16,33,43,0.04)]">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label className="block">
                    <span className="block text-xs font-medium text-slate-600 mb-1.5">Locality</span>
                    <span className="relative block">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <select
                        value={locality}
                        onChange={(e) => setLocality(e.target.value)}
                        className="w-full h-11 pl-9 pr-2 rounded-lg text-sm text-slate-800 bg-white border border-stone-200 focus:outline-none focus:ring-2 focus:ring-teal-800 focus:border-teal-800"
                      >
                        <option value="">Any</option>
                        {LOCALITIES.map((l) => (
                          <option key={l} value={l}>{l}</option>
                        ))}
                      </select>
                    </span>
                  </label>
                  <label className="block">
                    <span className="block text-xs font-medium text-slate-600 mb-1.5">Budget</span>
                    <span className="relative block">
                      <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <select
                        value={maxBudget}
                        onChange={(e) => setMaxBudget(e.target.value)}
                        className="w-full h-11 pl-9 pr-2 rounded-lg text-sm text-slate-800 bg-white border border-stone-200 focus:outline-none focus:ring-2 focus:ring-teal-800 focus:border-teal-800"
                      >
                        <option value="">Any</option>
                        <option value="5000">Under ₹5,000</option>
                        <option value="8000">Under ₹8,000</option>
                        <option value="12000">Under ₹12,000</option>
                      </select>
                    </span>
                  </label>
                  <label className="block">
                    <span className="block text-xs font-medium text-slate-600 mb-1.5">Sharing</span>
                    <span className="relative block">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <select
                        value={sharing}
                        onChange={(e) => setSharing(e.target.value as SharingType | '')}
                        className="w-full h-11 pl-9 pr-2 rounded-lg text-sm text-slate-800 bg-white border border-stone-200 focus:outline-none focus:ring-2 focus:ring-teal-800 focus:border-teal-800"
                      >
                        <option value="">Any</option>
                        <option value="single">Single</option>
                        <option value="double">Double</option>
                        <option value="triple">Triple</option>
                      </select>
                    </span>
                  </label>
                </div>
                <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-lg bg-teal-800 hover:bg-teal-900 text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-800"
                  >
                    <Search className="w-4 h-4" />
                    Explore Hostels
                  </button>
                  <Link
                    to="/login?role=owner"
                    className="inline-flex items-center justify-center h-11 px-2 text-sm font-medium text-slate-700 hover:text-teal-900 underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-teal-800 rounded-lg"
                  >
                    List your property
                  </Link>
                </div>
              </form>
            </div>

            <div className="flex flex-col min-h-[300px]">
              <div className="relative flex-1 min-h-[300px] lg:min-h-[420px] rounded-xl overflow-hidden border border-stone-200 bg-[#e4eee0]">
                <Suspense fallback={<div className="w-full h-full bg-[#e4eee0]" aria-hidden />}>
                  <HostelCanvas />
                </Suspense>
              </div>
              <p className="mt-2.5 text-xs leading-5 text-slate-500">
                Illustrated campus. Search uses StayKota listings, not this model.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-8" aria-label="Popular localities">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-slate-500 mr-1">Popular:</span>
          {LOCALITIES.slice(0, 6).map((l, i) => (
            <Link
              key={l}
              to={`/explore?locality=${encodeURIComponent(l)}`}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-700 ${i === 0 ? 'bg-[#10212b] text-white' : 'bg-white text-slate-600 border border-slate-200 hover:border-teal-700'}`}
            >
              {l}
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10" aria-labelledby="featured-heading">
        <div className="flex items-end justify-between mb-6 gap-4">
          <div>
            <p className="text-sm text-teal-800 font-medium mb-1">From the current catalogue</p>
            <h2 id="featured-heading" className="text-2xl sm:text-3xl font-semibold text-[#10212b]">Featured hostels near coaching hubs</h2>
          </div>
          <Link to="/explore" className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-teal-800 hover:text-teal-950">
            View all stays <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((h) => (
            <HostelCard key={h.id} hostel={h} />
          ))}
        </div>
        <Link to="/explore" className="sm:hidden mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-teal-800">
          View all stays <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6" aria-labelledby="benefits-heading">
        <h2 id="benefits-heading" className="sr-only">Why students use StayKota</h2>
        <div className="grid sm:grid-cols-3 gap-5">
          {[
            { icon: <FileText className="w-5 h-5" />, title: 'Transparent rent breakup', desc: 'Monthly rent, deposit and extras shown separately on each listing.' },
            { icon: <Phone className="w-5 h-5" />, title: 'Direct owner contact', desc: 'Request a visit in one step. The owner follows up — no commission on the listing.' },
            { icon: <GraduationCap className="w-5 h-5" />, title: 'Built for students', desc: 'Filter by sharing type, mess and how close a stay is to coaching areas.' },
          ].map((item) => (
            <div key={item.title} className="bg-white rounded-2xl border border-stone-200 p-6">
              <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center mb-4">{item.icon}</div>
              <h3 className="font-semibold text-[#10212b]">{item.title}</h3>
              <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-16" aria-labelledby="steps-heading">
        <h2 id="steps-heading" className="text-2xl font-semibold text-[#10212b] mb-5">How a search usually goes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { num: '01', title: 'Search & compare', desc: 'Filter by budget, locality and sharing.' },
            { num: '02', title: 'Request a visit', desc: 'Pick a date. The owner confirms.' },
            { num: '03', title: 'Visit the room', desc: 'Check the room, mess and washrooms in person.' },
            { num: '04', title: 'Move in', desc: 'Agree the deposit directly with the owner.' },
          ].map((s) => (
            <div key={s.num} className="bg-white rounded-2xl border border-stone-200 p-5 relative">
              <span className="text-xs font-semibold tracking-wide text-teal-800">{s.num}</span>
              <div className="w-9 h-9 rounded-lg bg-stone-100 flex items-center justify-center my-3 text-slate-700">
                <Check className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-[#10212b] text-sm">{s.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
