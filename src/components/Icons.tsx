import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { size?: number };

function base({ size = 20, ...rest }: P, children: React.ReactNode) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" {...rest}>
      {children}
    </svg>
  );
}

export const SearchIcon = (p: P) => base(p, <><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></>);
export const BagIcon = (p: P) => base(p, <><path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 8Z" /><path d="M9 8V6.5a3 3 0 0 1 6 0V8" /></>);
export const UserIcon = (p: P) => base(p, <><circle cx="12" cy="8.5" r="3.5" /><path d="M5 20c1.2-3.5 4-5 7-5s5.8 1.5 7 5" /></>);
export const MenuIcon = (p: P) => base(p, <><path d="M4 7h16M4 12h16M4 17h16" /></>);
export const CloseIcon = (p: P) => base(p, <><path d="M6 6l12 12M18 6 6 18" /></>);
export const ArrowRight = (p: P) => base(p, <><path d="M5 12h14M13 6l6 6-6 6" /></>);
export const ChevronDown = (p: P) => base(p, <path d="m6 9 6 6 6-6" />);
export const ChevronLeft = (p: P) => base(p, <path d="m15 6-6 6 6 6" />);
export const ChevronRight = (p: P) => base(p, <path d="m9 6 6 6-6 6" />);
export const DownloadIcon = (p: P) => base(p, <><path d="M12 4v11M7 10l5 5 5-5" /><path d="M5 19h14" /></>);
export const PrinterIcon = (p: P) => base(p, <><path d="M7 9V4h10v5" /><rect x="4" y="9" width="16" height="7" rx="2" /><path d="M7 14h10v6H7z" /></>);
export const TagIcon = (p: P) => base(p, <><path d="M3 12V4h8l9 9-8 8-9-9Z" /><circle cx="7.5" cy="8.5" r="1.3" /></>);
export const HeartIcon = (p: P) => base(p, <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" />);
export const SparkleIcon = (p: P) => base(p, <><path d="M12 3v4M12 17v4M3 12h4M17 12h4" /><path d="m6.5 6.5 2 2M15.5 15.5l2 2M6.5 17.5l2-2M15.5 8.5l2-2" /></>);
export const CheckIcon = (p: P) => base(p, <path d="m5 12.5 4.5 4.5L19 7.5" />);
export const MailIcon = (p: P) => base(p, <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></>);
export const EditIcon = (p: P) => base(p, <><path d="M4 20h4L19 9l-4-4L4 16v4Z" /><path d="m13.5 6.5 4 4" /></>);
export const TrashIcon = (p: P) => base(p, <><path d="M4 7h16M10 11v6M14 11v6" /><path d="M6 7l1 13h10l1-13M9 7V4h6v3" /></>);
export const GiftIcon = (p: P) => base(p, <><rect x="4" y="10" width="16" height="10" rx="1.5" /><path d="M3 7h18v3H3zM12 7v13" /><path d="M12 7c-1.5-3-5-3-5-.5S12 7 12 7Zm0 0c1.5-3 5-3 5-.5S12 7 12 7Z" /></>);
export const PhoneIcon = (p: P) => base(p, <><rect x="7" y="3" width="10" height="18" rx="2" /><path d="M11 18h2" /></>);
export const CardIcon = (p: P) => base(p, <><path d="M5 4h14v16H5z" /><path d="M12 4v16" /><path d="M8 9h1M15 11h1" /></>);
export const EyeIcon = (p: P) => base(p, <><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="3" /></>);
export const LockIcon = (p: P) => base(p, <><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7.5a4 4 0 0 1 8 0V10" /></>);
export const SmileIcon = (p: P) => base(p, <><circle cx="12" cy="12" r="8.5" /><path d="M8.5 14.5c1.8 2 5.2 2 7 0M9 10h.01M15 10h.01" /></>);
export const CalendarIcon = (p: P) => base(p, <><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M4 10h16M9 3v4M15 3v4" /></>);
export const AlignLeft = (p: P) => base(p, <path d="M4 6h16M4 10h10M4 14h16M4 18h10" />);
export const AlignCenter = (p: P) => base(p, <path d="M4 6h16M7 10h10M4 14h16M7 18h10" />);
export const AlignRight = (p: P) => base(p, <path d="M4 6h16M10 10h10M4 14h16M10 18h10" />);
export const ResetIcon = (p: P) => base(p, <><path d="M4 12a8 8 0 1 0 2.4-5.7" /><path d="M4 4v4h4" /></>);
export const InstagramIcon = (p: P) => base(p, <><rect x="4" y="4" width="16" height="16" rx="4.5" /><circle cx="12" cy="12" r="3.6" /><path d="M16.8 7.2h.01" /></>);
export const PinterestIcon = (p: P) => base(p, <><circle cx="12" cy="12" r="8.5" /><path d="M10.8 9.5c.5-1.6 3.8-1.8 4.2.6.4 2.5-1.6 4.6-3.1 3.6M11.7 10.5 9.8 19" /></>);
export const FacebookIcon = (p: P) => base(p, <path d="M14 8.5h2.5V5H14c-2 0-3.5 1.6-3.5 3.6V11H8v3.4h2.5V21H14v-6.6h2.5L17 11h-3V9c0-.3.2-.5.5-.5Z" />);
export const ImageIcon = (p: P) => base(p, <><rect x="4" y="5" width="16" height="14" rx="2" /><circle cx="9" cy="10" r="1.6" /><path d="m5 18 5-5 3 3 2.5-2.5L20 17" /></>);
export const DocumentIcon = (p: P) => base(p, <><path d="M7 3h7l4 4v14H7z" /><path d="M14 3v4h4M10 12h5M10 16h5" /></>);
export const LeafIcon = (p: P) => base(p, <><path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14Z" /><path d="M5 19 13 11" /></>);
export const EnvelopeIcon = (p: P) => base(p, <><rect x="3.5" y="6" width="17" height="12" rx="1.5" /><path d="m4 7 8 6 8-6" /></>);
export const CheckCircleIcon = (p: P) => base(p, <><circle cx="12" cy="12" r="8.5" /><path d="m8.5 12.3 2.3 2.3 4.7-4.9" /></>);
