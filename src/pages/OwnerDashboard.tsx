import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  BedDouble,
  Building2,
  CalendarDays,
  ChevronRight,
  Clock3,
  FilePenLine,
  LayoutGrid,
  MapPin,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Modal } from "../components/ui/Modal";
import type { Hostel, ListingStatus } from "../types";
import "../styles/owner-workspace.css";

type Section = "overview" | "listings" | "visits";
const statusLabels: Record<ListingStatus, string> = {
  draft: "Draft",
  pending: "Pending review",
  approved: "Published",
  rejected: "Hidden / rejected",
};
const dateLabel = (value: string) =>
  new Date(value + "T12:00:00").toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
const localToday = () => {
  const now = new Date();
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
};

export function OwnerDashboard() {
  const { user, hostels, visits, updateHostel } = useApp();
  const [section, setSection] = useState<Section>("overview");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ListingStatus | "">("");
  const [notice, setNotice] = useState("");
  const [hideId, setHideId] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const today = localToday();
  const myHostels = useMemo(
    () => hostels.filter((hostel) => hostel.ownerId === user?.id),
    [hostels, user?.id],
  );
  const myVisits = useMemo(
    () =>
      visits.filter((visit) =>
        myHostels.some((hostel) => hostel.id === visit.hostelId),
      ),
    [visits, myHostels],
  );
  const filtered = useMemo(
    () =>
      myHostels.filter(
        (hostel) =>
          (!status || hostel.status === status) &&
          (hostel.name + " " + hostel.locality)
            .toLowerCase()
            .includes(search.toLowerCase().trim()),
      ),
    [myHostels, status, search],
  );
  const activeVisits = myVisits.filter(
    (visit) => visit.status !== "cancelled" && visit.visitDate >= today,
  );
  const published = myHostels.filter((hostel) => hostel.status === "approved");
  const pending = myHostels.filter((hostel) => hostel.status === "pending");

  if (!user || user.role !== "owner") {
    return (
      <div className="owner-gate">
        <Building2 size={32} />
        <h1>Owner workspace</h1>
        <p>
          Sign in as an owner to create listings and see your visit requests.
        </p>
        <Link to="/login?role=owner">Owner sign in</Link>
      </div>
    );
  }

  const changeStatus = (hostel: Hostel, next: ListingStatus) => {
    updateHostel({ ...hostel, status: next });
    setNotice(
      next === "pending"
        ? "Listing submitted for review."
        : next === "draft"
          ? "Listing moved to draft."
          : "Listing updated.",
    );
  };

  const listingCard = (hostel: Hostel) => (
    <article className="owner-listing" key={hostel.id}>
      <img src={hostel.coverImage || "/images/room-shared.webp"} alt="" />
      <div className="owner-listing-body">
        <div className="owner-listing-top">
          <h3>{hostel.name}</h3>
          <span className={"owner-status owner-status-" + hostel.status}>
            {statusLabels[hostel.status]}
          </span>
        </div>
        <p>
          <MapPin size={14} /> {hostel.locality}
        </p>
        <p>
          <BedDouble size={14} /> {hostel.roomTypes.length} room types
        </p>
        <div className="owner-listing-actions">
          <Link to={`/owner/listing/${hostel.id}/edit`}>
            <FilePenLine size={14} /> Edit
          </Link>
          {hostel.status === "approved" && (
            <button type="button" onClick={() => setHideId(hostel.id)}>
              Hide listing
            </button>
          )}
          {hostel.status === "draft" && (
            <button
              type="button"
              className="owner-text-action"
              onClick={() => changeStatus(hostel, "pending")}
            >
              Submit for review
            </button>
          )}
          {hostel.status === "approved" && (
            <Link to={`/hostel/${hostel.id}`}>View public page</Link>
          )}
        </div>
      </div>
    </article>
  );

  const visitCards = (limit?: number) => {
    const items = (section === "overview" ? activeVisits : myVisits).slice(
      0,
      limit ?? myVisits.length,
    );
    if (!items.length) {
      return (
        <div className="owner-empty">
          <CalendarDays size={28} />
          <h3>No visit requests yet</h3>
          <p>When students book a visit, confirmed bookings appear here.</p>
        </div>
      );
    }
    return (
      <div className="owner-visits">
        {items.map((visit) => (
          <article className="owner-visit" key={visit.id}>
            <div className="owner-visit-avatar">
              {visit.studentName.charAt(0)}
            </div>
            <div className="owner-visit-content">
              <h3>{visit.studentName}</h3>
              <p>
                {visit.hostelName}
                {visit.roomTypeName ? " · " + visit.roomTypeName : ""}
              </p>
              <p>
                <CalendarDays size={13} /> {dateLabel(visit.visitDate)}
              </p>
              {visit.message && <blockquote>{visit.message}</blockquote>}
            </div>
            <div className="owner-visit-actions">
              <Badge
                variant={
                  visit.status === "cancelled"
                    ? "default"
                    : visit.status === "confirmed"
                      ? "success"
                      : "success"
                }
              >
                {visit.status === "cancelled"
                  ? "Cancelled"
                  : visit.status === "confirmed"
                    ? "Confirmed"
                    : "Confirmed"}
              </Badge>
              <button type="button" onClick={() => setRequestId(visit.id)}>
                Details
              </button>
            </div>
          </article>
        ))}
      </div>
    );
  };

  const request = myVisits.find((v) => v.id === requestId);

  return (
    <div className="owner-shell">
      <div className="owner-heading">
        <div>
          <p className="owner-eyebrow">Owner workspace</p>
          <h1>
            {section === "visits"
              ? "Make room for a visit."
              : section === "listings"
                ? "Your listings"
                : `Hi, ${user.name.split(" ")[0]}`}
          </h1>
          <p>
            {section === "visits"
              ? "Students book visits with instant confirmation. Coordinate the exact time before they arrive."
              : "Create listings, track visits, and keep rooms ready for Kota students."}
          </p>
        </div>
        <Link className="owner-primary" to="/owner/listing/new">
          <Plus size={16} /> New listing
        </Link>
      </div>

      {notice && (
        <div className="owner-notice" role="status">
          {notice}
        </div>
      )}

      <div className="owner-layout">
        <aside className="owner-sidebar">
          <nav>
            {(
              [
                { id: "overview", label: "Overview", icon: LayoutGrid },
                { id: "listings", label: "Listings", icon: Building2 },
                { id: "visits", label: "Visit requests", icon: CalendarDays },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                aria-current={section === item.id ? "page" : undefined}
                onClick={() => setSection(item.id)}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
                {item.id === "visits" && activeVisits.length > 0 && (
                  <small>{activeVisits.length}</small>
                )}
              </button>
            ))}
          </nav>
        </aside>

        <div className="owner-main">
          {section === "overview" && (
            <>
              <div className="owner-stats">
                {[
                  { label: "Published", value: published.length },
                  { label: "Pending review", value: pending.length },
                  { label: "Active visits", value: activeVisits.length },
                ].map((stat) => (
                  <div key={stat.label} className="owner-stat">
                    <strong>{stat.value}</strong>
                    <span>{stat.label}</span>
                  </div>
                ))}
              </div>
              <section className="owner-panel">
                <div className="owner-section-heading">
                  <h2>Recent visit requests</h2>
                  <button type="button" onClick={() => setSection("visits")}>
                    View all <ChevronRight size={15} />
                  </button>
                </div>
                {visitCards(3)}
              </section>
            </>
          )}

          {section === "listings" && (
            <section className="owner-panel">
              <div className="owner-filters">
                <label>
                  <Search size={16} />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search listings"
                  />
                </label>
                <select
                  aria-label="Filter listing status"
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as ListingStatus | "")
                  }
                >
                  <option value="">All statuses</option>
                  {Object.entries(statusLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              {filtered.length ? (
                <div className="owner-listings">{filtered.map(listingCard)}</div>
              ) : (
                <div className="owner-empty">
                  <Building2 size={28} />
                  <h3>No listings match</h3>
                  <p>Try another name or clear the status filter.</p>
                </div>
              )}
            </section>
          )}

          {section === "visits" && (
            <section className="owner-panel">{visitCards()}</section>
          )}
        </div>
      </div>

      <Modal
        open={Boolean(hideId)}
        onClose={() => setHideId(null)}
        title="Hide this listing?"
      >
        <p>
          The listing moves back to draft and leaves the public explore page.
        </p>
        <div className="owner-modal-actions">
          <Button
            variant="danger"
            onClick={() => {
              const hostel = myHostels.find((h) => h.id === hideId);
              if (hostel) updateHostel({ ...hostel, status: "draft" });
              setHideId(null);
              setNotice("Listing hidden from public explore.");
            }}
          >
            Hide listing
          </Button>
          <Button variant="ghost" onClick={() => setHideId(null)}>
            Keep published
          </Button>
        </div>
      </Modal>

      <Modal
        open={Boolean(request)}
        onClose={() => setRequestId(null)}
        title="Visit request"
      >
        {request && (
          <div className="owner-request-detail">
            <p>
              <strong>{request.studentName}</strong> · {request.hostelName}
            </p>
            <p>
              <CalendarDays size={14} /> {dateLabel(request.visitDate)}
            </p>
            {request.studentPhone && <p>Phone: {request.studentPhone}</p>}
            {request.message && <blockquote>{request.message}</blockquote>}
            <Badge
              variant={
                request.status === "cancelled"
                  ? "default"
                  : request.status === "confirmed"
                    ? "success"
                    : "success"
              }
            >
              {request.status === "cancelled"
                ? "Cancelled"
                : request.status === "confirmed"
                  ? "Confirmed"
                  : "Confirmed"}
            </Badge>
            <p className="owner-muted">
              Visits are confirmed instantly when a student books. Owner
              notification and messaging delivery will be connected with the
              backend. A confirmed visit date is not a room reservation.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
