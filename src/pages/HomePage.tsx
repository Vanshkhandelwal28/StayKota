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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-10 lg:pt-14 lg:pb-16">
          <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] gap-8 lg:gap-12 items-center">
            <div>
              <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide uppercase text-teal-800">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
                Kota · Hostels & PGs
              </p>
              <h1 id="hero-heading" className="mt-3 text-[2rem] sm:text-5xl font-semibold leading-[1.12] tracking-tight text-[#10212b]">
                Find Your Stay in Kota.
              </h1>
              <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-md leading-relaxed">
                Discover hostels and PGs that fit your budget, location, and lifestyle.
              </p>

              <form onSubmit={handleSearch} className="mt-7 bg-white border border-stone-200 rounded-2xl p-3 shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label className="relative block">
                    <span className="sr-only">Locality</span>
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                      value={locality}
                      onChange={(e) => setLocality(e.target.value)}
                      className="w-full pl-9 pr-3 py-3 rounded-xl text-sm text-slate-800 bg-stone-50 border border-transparent focus:outline-none focus:ring-2 focus:ring-teal-700"
                    >
                      <option value="">Locality</option>
                      {LOCALITIES.map((l) => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                  </label>
                  <label className="relative block">
                    <span className="sr-only">Monthly budget</span>
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                      value={maxBudget}
                      onChange={(e) => setMaxBudget(e.target.value)}
                      className="w-full pl-9 pr-3 py-3 rounded-xl text-sm text-slate-800 bg-stone-50 border border-transparent focus:outline-none focus:ring-2 focus:ring-teal-700"
                    >
                      <option value="">Monthly budget</option>
                      <option value="5000">Under ₹5,000</option>
                      <option value="8000">Under ₹8,000</option>
                      <option value="12000">Under ₹12,000</option>
                    </select>
                  </label>
                  <label className="relative block sm:col-span-2">
                    <span className="sr-only">Sharing type</span>
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                      value={sharing}
                      onChange={(e) => setSharing(e.target.value as SharingType | '')}
                      className="w-full pl-9 pr-3 py-3 rounded-xl text-sm text-slate-800 bg-stone-50 border border-transparent focus:outline-none focus:ring-2 focus:ring-teal-700"
                    >
                      <option value="">Sharing type</option>
                      <option value="single">Single</option>
                      <option value="double">Double</option>
                      <option value="triple">Triple</option>
                    </select>
                  </label>
                </div>
                <div className="mt-2 flex flex-col sm:flex-row gap-2">
                  <button
                    type="submit"
                    className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-medium text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-800"
                  >
                    <Search className="w-4 h-4" />
                    Explore Hostels
                  </button>
                  <Link
                    to="/login?role=owner"
                    className="inline-flex items-center justify-center px-5 py-3 rounded-xl border border-stone-300 text-sm font-medium text-[#10212b] hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-teal-800"
                  >
                    List Your Property
                  </Link>
                </div>
              </form>
            </div>

            <div className="relative">
              <div className="relative h-[320px] sm:h-[420px] lg:h-[480px] rounded-3xl overflow-hidden border border-stone-200 bg-[#e7efe4]">
                <Suspense fallback={<div className="w-full h-full bg-[#e7efe4]" aria-hidden />}>
                  <HostelCanvas />
                </Suspense>
              </div>
              <p className="mt-3 text-xs text-slate-500">An illustrative hostel campus — listings come from StayKota’s catalogue, not this model.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4" aria-label="Popular localities">
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

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10" aria-labelledby="featured-heading">
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

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6" aria-labelledby="benefits-heading">
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

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-16" aria-labelledby="steps-heading">
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
