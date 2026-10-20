import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-navy text-white/80">
      <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
          <div className="sm:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-gold text-navy flex items-center justify-center text-sm font-semibold font-display">S</div>
              <span className="text-base font-semibold text-white">StayKota</span>
            </div>
            <p className="text-sm leading-6 text-white/70 max-w-sm">
              Hostel and PG discovery for students in Kota. Listings, prices and photos on this demo are sample data.
            </p>
          </div>
          <div>
            <h2 className="text-white font-semibold mb-4 text-sm">Explore</h2>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/explore" className="hover:text-gold">All stays</Link></li>
              <li><Link to="/explore?locality=Talwandi" className="hover:text-gold">Talwandi</Link></li>
              <li><Link to="/explore?locality=Landmark" className="hover:text-gold">Landmark</Link></li>
            </ul>
          </div>
          <div>
            <h2 className="text-white font-semibold mb-4 text-sm">For owners</h2>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/how-it-works" className="hover:text-gold">How it works</Link></li>
              <li><Link to="/login?role=owner" className="hover:text-gold">List your property</Link></li>
              <li><Link to="/login?role=student" className="hover:text-gold">Student login</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-white/15 text-xs text-white/60 flex flex-col sm:flex-row justify-between gap-2">
          <p>© {new Date().getFullYear()} StayKota · Kota, Rajasthan</p>
          <p>A visit request is not a booking or a payment.</p>
        </div>
      </div>
    </footer>
  );
}
