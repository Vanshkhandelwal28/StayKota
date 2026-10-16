import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutGrid, Building2, Calendar, CreditCard, Plus, Eye, Clock,
  CheckCircle, XCircle, Phone, Pencil, Trash2, X, Search, BedDouble
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { LOCALITIES, AMENITIES, COMMON_RULES } from '../data/mockData';
import type { Hostel, ListingStatus, RoomType, SharingType } from '../types';

type Section = 'overview' | 'listings' | 'visits' | 'payments';

const emptyRoom = (hostelId: string): RoomType => ({
  id: `rt-${Date.now()}`, hostelId, name: 'Double Sharing', sharingType: 'double',
  capacity: 2, rent: 6000, deposit: 4000, billingPeriod: 'monthly',
  extraCharges: [], included: ['WiFi', 'Meals'], available: true, features: ['Shared bathroom'],
});

export function OwnerDashboard() {
  const { user, hostels, visits, addHostel, updateHostel, updateHostelStatus } = useApp();
  const [section, setSection] = useState<Section>('overview');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Hostel | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [fName, setFName] = useState('');
  const [fLocality, setFLocality] = useState(LOCALITIES[0]);
  const [fAddress, setFAddress] = useState('');
  const [fCategory, setFCategory] = useState<'boys' | 'girls' | 'co-ed'>('boys');
  const [fDesc, setFDesc] = useState('');
  const [fAmenities, setFAmenities] = useState<string[]>(['WiFi', 'Meals']);
  const [fRules, setFRules] = useState<string[]>(['No smoking', 'No alcohol', 'Gate closes at 10:30 PM']);
  const [customRule, setCustomRule] = useState('');
  const [fCover, setFCover] = useState('https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80');
  const [fRooms, setFRooms] = useState<RoomType[]>([emptyRoom('new')]);
  const [fStatus, setFStatus] = useState<ListingStatus>('draft');
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  if (!user || user.role !== 'owner') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center animate-fade-in">
        <p className="text-slate-600">Please log in as a hostel owner.</p>
        <Link to="/login?role=owner" className="mt-4 inline-block text-teal-600 font-medium">Login as Owner</Link>
      </div>
    );
  }

  const myHostels = hostels.filter(h => h.ownerId === user.id || user.id.startsWith('demo-owner') || h.ownerId === 'u2');
  const myVisits = visits.filter(v => myHostels.some(h => h.id === v.hostelId));
  const confirmedVisits = myVisits.filter(v => v.status === 'confirmed');
  const upcomingVisits = confirmedVisits.filter(v => v.visitDate >= today);
  const liveCount = myHostels.filter(h => h.status === 'approved').length;
  const draftCount = myHostels.filter(h => h.status === 'draft').length;
  const pendingCount = myHostels.filter(h => h.status === 'pending').length;

  const filteredListings = useMemo(() => {
    let list = myHostels;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(h => h.name.toLowerCase().includes(q) || h.locality.toLowerCase().includes(q));
    }
    return list;
  }, [myHostels, search]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  const statusBadge = (status: ListingStatus) => {
    const map: Record<ListingStatus, React.ReactNode> = {
      draft: <Badge>Draft</Badge>,
      pending: <Badge variant="warning"><Clock className="w-3 h-3 mr-1" />Pending review</Badge>,
      approved: <Badge variant="success"><CheckCircle className="w-3 h-3 mr-1" />Live</Badge>,
      rejected: <Badge variant="error"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>,
    };
    return map[status];
  };

  const openCreate = () => {
    setEditing(null); setFName(''); setFLocality(LOCALITIES[0]); setFAddress(''); setFCategory('boys');
    setFDesc(''); setFAmenities(['WiFi', 'Meals']); setFRules(['No smoking', 'No alcohol', 'Gate closes at 10:30 PM']); setCustomRule('');
    setFCover('https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80');
    setFRooms([emptyRoom('new')]); setFStatus('draft'); setError(''); setFormOpen(true);
  };

  const openEdit = (h: Hostel) => {
    setEditing(h); setFName(h.name); setFLocality(h.locality); setFAddress(h.address);
    setFCategory(h.category); setFDesc(h.description); setFAmenities([...h.amenities]);
    setFRules([...(h.rules || [])]); setCustomRule(''); setFCover(h.coverImage);
    setFRooms(h.roomTypes.map(r => ({ ...r, extraCharges: r.extraCharges || [], included: r.included || [] })));
    setFStatus(h.status); setError(''); setFormOpen(true);
  };

  const saveListing = () => {
    setError('');
    if (!fName.trim()) { setError('Hostel name is required'); return; }
    if (!fAddress.trim()) { setError('Address is required'); return; }
    if (fRooms.length === 0) { setError('Add at least one room type'); return; }
    for (const r of fRooms) { if (!r.name.trim() || r.rent <= 0) { setError('Each room needs a name and rent > 0'); return; } }
    setSaving(true);
    setTimeout(() => {
      const id = editing?.id || `h-${Date.now()}`;
      const hostel: Hostel = {
        id, ownerId: user.id.startsWith('demo-') ? 'u2' : user.id, name: fName.trim(),
        description: fDesc.trim() || 'Owner-managed hostel listing.', locality: fLocality,
        address: fAddress.trim(), category: fCategory, status: fStatus, amenities: fAmenities,
        rules: fRules, coverImage: fCover, images: [fCover],
        roomTypes: fRooms.map((r, i) => ({ ...r, id: r.id.startsWith('rt-') && editing ? r.id : `rt-${id}-${i}`, hostelId: id })),
        createdAt: editing?.createdAt || today, updatedAt: today,
      };
      if (editing) updateHostel(hostel); else addHostel(hostel);
      setSaving(false); setFormOpen(false);
      showToast(editing ? 'Listing updated (local only)' : 'Listing created (local only)');
      setSection('listings');
    }, 400);
  };

  const formatDate = (iso: string) => {
    try { return new Date(iso + 'T12:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }); }
    catch { return iso; }
  };

  const menu: { id: Section; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'overview', label: 'Overview', icon: <LayoutGrid className="w-4 h-4" /> },
    { id: 'listings', label: 'My listings', icon: <Building2 className="w-4 h-4" /> },
    { id: 'visits', label: 'Visit requests', icon: <Calendar className="w-4 h-4" />, badge: upcomingVisits.length || undefined },
    { id: 'payments', label: 'Payments', icon: <CreditCard className="w-4 h-4" /> },
  ];

  const pageItems = filteredListings.slice((page - 1) * 6, page * 6);

  return (
    <div className="animate-fade-in bg-[#faf8f5] min-h-[70vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{user.name.split(' ')[0]}&apos;s hostels</h1>
            <p className="text-sm text-slate-500 mt-1">{liveCount} live · {draftCount} draft · {pendingCount} pending review</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-full" onClick={() => setSection('listings')}>Edit listings</Button>
            <Button className="rounded-full" onClick={openCreate}><Plus className="w-4 h-4" /> Add new hostel</Button>
          </div>
        </div>
        {toast && <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-sm text-emerald-800">{toast}</div>}
        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="lg:w-56 flex-shrink-0">
            <Card className="p-3 sticky top-24">
              <p className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Owner menu</p>
              <nav className="space-y-0.5">
                {menu.map(m => (
                  <button key={m.id} type="button" onClick={() => setSection(m.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium ${section === m.id ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
                    {m.icon}<span className="flex-1 text-left">{m.label}</span>
                    {m.badge != null && m.badge > 0 && <span className="text-xs px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800">{m.badge}</span>}
                  </button>
                ))}
              </nav>
            </Card>
          </aside>
          <div className="flex-1 min-w-0 space-y-6">
            {section === 'overview' && (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[{ label: 'Live listings', value: liveCount }, { label: 'Visit requests', value: myVisits.length }, { label: 'Confirmed visits', value: confirmedVisits.length }, { label: 'Pending review', value: pendingCount }].map(s => (
                    <Card key={s.label} className="p-4">
                      <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                      <p className="text-sm text-slate-600 mt-0.5">{s.label}</p>
                    </Card>
                  ))}
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {myHostels.slice(0, 4).map(h => (
                    <Card key={h.id} className="p-4 flex gap-3">
                      <img src={h.coverImage} alt="" className="w-20 h-16 rounded-xl object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-slate-900 truncate">{h.name}</p>
                        <p className="text-xs text-slate-500">{h.locality} · {h.roomTypes.length} room types</p>
                        <div className="mt-1.5">{statusBadge(h.status)}</div>
                        <div className="flex gap-2 mt-2">
                          {h.status === 'approved' && <Link to={`/hostel/${h.id}`}><Button size="sm" variant="outline" className="text-xs h-7 rounded-lg">View</Button></Link>}
                          <Button size="sm" variant="outline" className="text-xs h-7 rounded-lg" onClick={() => openEdit(h)}>Edit</Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </>
            )}
            {section === 'listings' && (
              <Card className="p-5">
                <div className="flex flex-col sm:flex-row gap-3 mb-5">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search listings…" className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm" />
                  </div>
                  <Button onClick={openCreate} className="rounded-xl"><Plus className="w-4 h-4" /> Add</Button>
                </div>
                <div className="space-y-3">
                  {pageItems.map(h => (
                    <div key={h.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-white">
                      <img src={h.coverImage} alt="" className="w-full sm:w-28 h-20 rounded-xl object-cover" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-slate-900">{h.name}</p>
                          {statusBadge(h.status)}
                        </div>
                        <p className="text-sm text-slate-500 mt-0.5">{h.locality} · from ₹{Math.min(...h.roomTypes.map(r => r.rent)).toLocaleString()}/mo</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEdit(h)}><Pencil className="w-3.5 h-3.5" /> Edit</Button>
                        <Button size="sm" variant="ghost" onClick={() => setDeleteId(h.id)}><Trash2 className="w-3.5 h-3.5 text-red-500" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
            {section === 'visits' && (
              <Card className="p-5">
                <h2 className="font-semibold text-slate-900 mb-1">Visit requests</h2>
                <p className="text-xs text-slate-400 mb-4">Confirmed when student submits — no owner approval queue</p>
                {myVisits.length === 0 ? <p className="text-center py-12 text-slate-500 text-sm">No visit requests yet</p> : (
                  <ul className="divide-y divide-slate-100">
                    {myVisits.map(v => (
                      <li key={v.id} className="py-4 flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-semibold text-sm">{v.studentName.charAt(0)}</div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900">{v.studentName}</p>
                          <p className="text-sm text-slate-500">{v.hostelName} · {formatDate(v.visitDate)}</p>
                        </div>
                        <Badge variant={v.status === 'confirmed' ? 'success' : 'default'}>{v.status}</Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            )}
            {section === 'payments' && (
              <Card className="p-8 text-center">
                <CreditCard className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                <h2 className="font-semibold text-slate-900">Payments</h2>
                <p className="text-sm text-slate-500 mt-2">Online rent collection comes in a later phase.</p>
              </Card>
            )}
          </div>
        </div>
      </div>

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => !saving && setFormOpen(false)} />
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-t-3xl sm:rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{editing ? 'Edit listing' : 'Add new hostel'}</h3>
              <button type="button" onClick={() => setFormOpen(false)} className="p-1 text-slate-400"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Hostel name *</label>
                <input value={fName} onChange={e => setFName(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 text-sm" />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-slate-700">Locality</label>
                  <select value={fLocality} onChange={e => setFLocality(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 text-sm">
                    {LOCALITIES.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Category</label>
                  <select value={fCategory} onChange={e => setFCategory(e.target.value as typeof fCategory)} className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 text-sm">
                    <option value="boys">Boys</option><option value="girls">Girls</option><option value="co-ed">Co-ed</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Address *</label>
                <input value={fAddress} onChange={e => setFAddress(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Amenities</label>
                <div className="flex flex-wrap gap-2">
                  {AMENITIES.map(a => (
                    <button key={a} type="button" onClick={() => setFAmenities(p => p.includes(a) ? p.filter(x => x !== a) : [...p, a])}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border ${fAmenities.includes(a) ? 'bg-teal-600 text-white border-teal-600' : 'border-slate-200 text-slate-600'}`}>{a}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">House rules</label>
                <p className="text-xs text-slate-400 mb-2">Select common rules or add custom</p>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1 border border-slate-100 rounded-xl mb-2">
                  {COMMON_RULES.map(rule => (
                    <button key={rule} type="button" onClick={() => setFRules(p => p.includes(rule) ? p.filter(x => x !== rule) : [...p, rule])}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border ${fRules.includes(rule) ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-200 text-slate-600'}`}>{rule}</button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input value={customRule} onChange={e => setCustomRule(e.target.value)} placeholder="Custom rule…" className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm" />
                  <Button type="button" size="sm" onClick={() => { if (customRule.trim() && !fRules.includes(customRule.trim())) { setFRules(p => [...p, customRule.trim()]); setCustomRule(''); } }}>Add</Button>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-slate-700">Room types</label>
                  <button type="button" className="text-xs text-teal-700 font-medium" onClick={() => setFRooms(rs => [...rs, emptyRoom(editing?.id || 'new')])}>+ Add room</button>
                </div>
                <div className="space-y-3">
                  {fRooms.map((r, idx) => (
                    <div key={r.id + idx} className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2">
                      <div className="flex gap-2 items-center">
                        <input value={r.name} onChange={e => setFRooms(rs => rs.map((x, i) => i === idx ? { ...x, name: e.target.value } : x))} className="flex-1 px-2 py-1.5 rounded-lg border border-slate-200 text-sm font-medium" />
                        {fRooms.length > 1 && <button type="button" onClick={() => setFRooms(rs => rs.filter((_, i) => i !== idx))} className="text-red-400"><Trash2 className="w-4 h-4" /></button>}
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <p className="text-[10px] text-slate-500">Sharing</p>
                          <select value={r.sharingType} onChange={e => {
                            const v = e.target.value as SharingType;
                            setFRooms(rs => rs.map((x, i) => i === idx ? { ...x, sharingType: v, capacity: v === 'single' ? 1 : v === 'double' ? 2 : v === 'triple' ? 3 : 4 } : x));
                          }} className="w-full px-2 py-1 rounded-lg border border-slate-200 text-xs">
                            <option value="single">Single</option><option value="double">Double</option><option value="triple">Triple</option><option value="four">Four</option>
                          </select>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500">Rent ₹</p>
                          <input type="number" value={r.rent} onChange={e => setFRooms(rs => rs.map((x, i) => i === idx ? { ...x, rent: Number(e.target.value) } : x))} className="w-full px-2 py-1 rounded-lg border border-slate-200 text-xs" />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500">Deposit ₹</p>
                          <input type="number" value={r.deposit} onChange={e => setFRooms(rs => rs.map((x, i) => i === idx ? { ...x, deposit: Number(e.target.value) } : x))} className="w-full px-2 py-1 rounded-lg border border-slate-200 text-xs" />
                        </div>
                      </div>
                      <div>
                        <p className="text-[11px] font-medium text-slate-500 mb-1">Included in rent</p>
                        <div className="flex flex-wrap gap-1">
                          {['WiFi', 'Meals', 'Laundry', 'AC', 'Housekeeping'].map(item => (
                            <button key={item} type="button" onClick={() => setFRooms(rs => rs.map((x, i) => i === idx ? { ...x, included: (x.included || []).includes(item) ? x.included.filter(t => t !== item) : [...(x.included || []), item] } : x))}
                              className={`px-2 py-0.5 rounded-full text-[10px] border ${(r.included || []).includes(item) ? 'bg-teal-600 text-white border-teal-600' : 'border-slate-200 text-slate-600'}`}>{item}</button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-[11px] font-medium text-slate-500">Extra charges</p>
                          <button type="button" className="text-[10px] text-teal-700" onClick={() => setFRooms(rs => rs.map((x, i) => i === idx ? { ...x, extraCharges: [...(x.extraCharges || []), { name: '', amount: 0, optional: true }] } : x))}>+ Add</button>
                        </div>
                        {(r.extraCharges || []).map((ec, ecIdx) => (
                          <div key={ecIdx} className="flex gap-1.5 mb-1 items-center">
                            <input placeholder="e.g. AC" value={ec.name} onChange={e => setFRooms(rs => rs.map((x, i) => i === idx ? { ...x, extraCharges: x.extraCharges.map((c, j) => j === ecIdx ? { ...c, name: e.target.value } : c) } : x))} className="flex-1 px-2 py-1 rounded-lg border border-slate-200 text-xs" />
                            <input type="number" placeholder="₹" value={ec.amount || ''} onChange={e => setFRooms(rs => rs.map((x, i) => i === idx ? { ...x, extraCharges: x.extraCharges.map((c, j) => j === ecIdx ? { ...c, amount: Number(e.target.value) } : c) } : x))} className="w-20 px-2 py-1 rounded-lg border border-slate-200 text-xs" />
                            <button type="button" className="text-red-400 text-xs" onClick={() => setFRooms(rs => rs.map((x, i) => i === idx ? { ...x, extraCharges: x.extraCharges.filter((_, j) => j !== ecIdx) } : x))}>×</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex gap-2 pt-2">
                <Button className="flex-1 rounded-xl" loading={saving} onClick={saveListing}>{editing ? 'Save changes' : 'Create listing'}</Button>
                <Button variant="ghost" disabled={saving} onClick={() => setFormOpen(false)}>Cancel</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteId(null)} />
          <Card className="relative w-full max-w-md p-6 shadow-xl">
            <h3 className="font-semibold">Remove this listing?</h3>
            <div className="mt-5 flex gap-2">
              <Button variant="danger" className="flex-1" onClick={() => { updateHostelStatus(deleteId, 'rejected'); setDeleteId(null); showToast('Listing removed'); }}>Remove</Button>
              <Button variant="ghost" onClick={() => setDeleteId(null)}>Keep</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
