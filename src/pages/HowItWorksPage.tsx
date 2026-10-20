import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Heart, Calendar, Building2, Shield, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export function HowItWorksPage() {
  const steps = [
    { icon: <Search className="w-6 h-6" />, title: 'Search & filter', desc: 'Browse hostels by locality, budget and sharing type. Only admin-approved listings appear publicly.' },
    { icon: <Heart className="w-6 h-6" />, title: 'Save favourites', desc: 'Create a free student account to save hostels and compare options later.' },
    { icon: <Calendar className="w-6 h-6" />, title: 'Schedule a visit', desc: 'Pick a date (no time needed). Request is confirmed in this prototype; owner coordinates exact time later.' },
    { icon: <Building2 className="w-6 h-6" />, title: 'For owners', desc: 'List your hostel with multiple room types, transparent pricing and manage visit requests.' },
  ];

  return (
    <div className="animate-fade-in app-dark min-h-[70vh]">
      <section className="bg-gradient-to-b from-violet-950/40 to-transparent py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-white">How StayKota works</h1>
          <p className="mt-4 text-lg text-slate-400">Simple, transparent hostel discovery built for Kota students and owners.</p>
        </div>
      </section>
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-6">
          {steps.map((s, i) => (
            <Card key={i} glow="violet" className="p-6 surface-card bg-[#161d33] border-violet-500/15 animate-slide-up" style={{ animationDelay: `${i * 0.08}s`, opacity: 0 }}>
              <div className="w-12 h-12 rounded-xl bg-violet-500/20 text-violet-300 flex items-center justify-center mb-4">{s.icon}</div>
              <h3 className="font-semibold text-white text-lg">{s.title}</h3>
              <p className="mt-2 text-slate-400 text-sm">{s.desc}</p>
            </Card>
          ))}
        </div>
        <div className="mt-12 p-6 surface-card bg-[#12182a]">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-violet-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-white">Important notes (prototype)</h3>
              <ul className="mt-2 text-sm text-slate-400 space-y-1 list-disc list-inside">
                <li>All data is simulated. No real emails or payments are sent.</li>
                <li>Visit requests are immediately marked Confirmed — not a room reservation.</li>
                <li>Listings go live after admin review in production.</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-10 text-center">
          <Link to="/explore">
            <Button variant="violet" size="lg" className="rounded-full">
              Explore hostels <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
