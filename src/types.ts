export interface PersonInfo {
  name: string;
  fullName: string;
  avatar: string;
  fatherName: string;
  motherName: string;
  bio?: string;
  phone?: string;
}

export interface WeddingEvent {
  id: string;
  title: string;
  side: 'groom' | 'bride' | 'both';
  time: string;
  dateText: string;
  venueName: string;
  address: string;
  mapQuery: string;
  mapEmbedUrl: string;
}

export interface StoryMilestone {
  id: string;
  year: string;
  title: string;
  description: string;
  image: string;
}

export interface GalleryItem {
  id: string;
  url: string;
  title: string;
  caption?: string;
}

export interface BankAccount {
  bankId: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  branch?: string;
  customQrUrl?: string;
}

export interface AudioTrack {
  id: string;
  title: string;
  artist: string;
  src: string;
}

export interface WeddingData {
  groom: PersonInfo;
  bride: PersonInfo;
  targetDateTime: string; // ISO string for countdown e.g. "2026-11-28T18:00:00"
  weddingDateFormatted: string; // e.g. "Thứ Bảy, 28 Tháng 11, 2026"
  lunarDateFormatted: string; // e.g. "Ngày 20 tháng 10 năm Bính Ngọ"
  heroTagline: string;
  heroQuote: string;
  quoteAuthor: string;
  coverImage: string;
  secondaryCoverImage: string;
  events: WeddingEvent[];
  story: StoryMilestone[];
  gallery: GalleryItem[];
  bankAccounts: {
    groom: BankAccount;
    bride: BankAccount;
  };
  adminEmail: string;
  audioTrack: AudioTrack;
}

export interface GuestRSVP {
  id: string;
  name: string;
  phone: string;
  email?: string;
  guestSide: 'groom' | 'bride' | 'both';
  attendance: 'attending' | 'not_attending' | 'tentative';
  guestCount: number;
  needTransportation: boolean;
  notes?: string;
  createdAt: string;
}

export interface WeddingWish {
  id: string;
  senderName: string;
  relationship: string;
  message: string;
  createdAt: string;
  likes: number;
  isLiked?: boolean;
}
