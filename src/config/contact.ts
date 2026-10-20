/** Business contact — update these when real numbers are ready. */
export const CONTACT = {
  /** E.164 digits only, e.g. 919876543210. Empty = Call Us uses a non-call fallback. */
  phoneDigits: '',
  /** E.164 digits only for wa.me links. Button is always shown; fill this to enable chat. */
  whatsappDigits: '',
  whatsappPrefill: 'Hi StayKota, I want help finding a hostel in Kota.',
};

export function phoneHref(): string | null {
  const d = CONTACT.phoneDigits.replace(/\D/g, '');
  return d.length >= 10 ? `tel:+${d}` : null;
}

export function whatsappHref(): string {
  const d = CONTACT.whatsappDigits.replace(/\D/g, '');
  const text = encodeURIComponent(CONTACT.whatsappPrefill);
  if (d.length >= 10) return `https://wa.me/${d}?text=${text}`;
  // Visible control; opens WhatsApp web — user will set a real number later
  return `https://wa.me/?text=${text}`;
}
