import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';

export function VisitsPage() {
  const { user, visits } = useApp();

  if (!user || user.role !== 'student') {
    return (
      <div className="app-dark min-h-[50vh] max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-slate-400">Please login as a student to view visits.</p>
        <Link to="/login?role=student" className="mt-4 inline-block text-violet-400 font-medium">Login</Link>
      </div>
    );
  }

  const myVisits = visits.filter(v => v.studentId === user.id);

  const formatDate = (iso: string) => {
    try {
      return new Date(iso + 'T12:00:00').toLocaleDateString('en-IN', {
        weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
      });
    } catch { return iso; }
  };

  return (
    <div className="app-dark min-h-[70vh]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
        <h1 className="text-2xl font-bold text-white mb-2">My Visits</h1>
        <p className="text-slate-400 mb-8">
          All visits are marked Confirmed in this prototype. Exact time is coordinated later with the owner.
        </p>

        {myVisits.length === 0 ? (
          <div className="text-center py-20 surface-card">
            <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No visit requests yet</p>
            <Link to="/explore" className="mt-4 inline-block text-violet-400 font-medium">Find a hostel</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {myVisits.map((v, i) => (
              <Card key={v.id} glow="violet" className="p-4 surface-card bg-[#161d33] border-violet-500/15 animate-slide-up" style={{ animationDelay: `${i * 0.05}s`, opacity: 0 }}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-violet-500/20 text-violet-300 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white">{v.hostelName}</p>
                    <p className="text-sm text-slate-400 mt-0.5">{formatDate(v.visitDate)}{v.roomTypeName ? ` · ${v.roomTypeName}` : ''}</p>
                    {v.message && <p className="text-xs text-slate-500 mt-1">{v.message}</p>}
                  </div>
                  <Badge variant="success">{v.status}</Badge>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
