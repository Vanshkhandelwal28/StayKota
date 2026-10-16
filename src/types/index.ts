export type UserRole = 'visitor' | 'student' | 'owner' | 'admin';

export type ListingStatus = 'draft' | 'pending' | 'approved' | 'rejected';

export type SharingType = 'single' | 'double' | 'triple' | 'four';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
}

/** Room type — maps cleanly to a future room_types table (PostgreSQL). */
export interface RoomType {
  id: string;
  hostelId: string;
  name: string;
  sharingType: SharingType;
  /** Occupancy capacity (beds). */
  capacity: number;
  rent: number;
  deposit: number;
  billingPeriod: 'monthly';
  /** Named extras (AC, laundry, etc.) with amount and optional flag. */
  extraCharges: { name: string; amount: number; optional: boolean }[];
  /** Items included in rent (WiFi, Meals, …). */
  included: string[];
  available: boolean;
  features: string[];
}

/** Hostel listing — rules stored as string[] (jsonb-ready for PostgreSQL). */
export interface Hostel {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  locality: string;
  address: string;
  category: 'boys' | 'girls' | 'co-ed';
  status: ListingStatus;
  amenities: string[];
  /** House rules selected/custom by owner. Shown on student detail page. */
  rules: string[];
  coverImage: string;
  images: string[];
  videoUrl?: string;
  latitude?: number;
  longitude?: number;
  roomTypes: RoomType[];
  createdAt: string;
  updatedAt: string;
}

export interface VisitRequest {
  id: string;
  studentId: string;
  studentName: string;
  hostelId: string;
  hostelName: string;
  roomTypeId?: string;
  roomTypeName?: string;
  visitDate: string;
  message?: string;
  /** Instant confirm on student submit — no owner approval queue. */
  status: 'confirmed' | 'cancelled';
  createdAt: string;
}

export interface Favourite {
  studentId: string;
  hostelId: string;
  addedAt: string;
}

export interface SearchFilters {
  locality: string;
  minBudget: number;
  maxBudget: number;
  sharingType: SharingType | '';
  category: '' | 'boys' | 'girls' | 'co-ed';
}
