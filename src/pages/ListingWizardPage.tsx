import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/Button';

/** Full listing form lives on OwnerDashboard modal (rules + room pricing). */
export function ListingWizardPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useApp();

  if (!user || user.role !== 'owner') {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <p className="text-slate-600">Owner login required.</p>
        <Link to="/login?role=owner" className="text-teal-600 font-medium mt-4 inline-block">Login as Owner</Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center animate-fade-in">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">
        {id ? 'Edit listing' : 'Add new hostel'}
      </h1>
      <p className="text-slate-600 mb-6">
        Use the owner dashboard form to create or edit listings (house rules + room pricing included).
      </p>
      <Button className="rounded-full" onClick={() => navigate('/owner')}>
        Open owner dashboard
      </Button>
    </div>
  );
}
