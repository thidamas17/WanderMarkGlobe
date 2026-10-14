export type TabType = 'globe' | 'passport' | 'stamps' | 'postcards';

export interface PostcardItem {
  id: string;
  code: string; // e.g. "084/24"
  title: string;
  frontTitle: string;
  frontSubtitle: string;
  frontCoords: string;
  regionCode: string; // e.g. "JPN", "ITA", "NOR", "MAR"
  country: string;
  dateDisplay: string;
  dateRaw: string;
  imageUrl: string;
  imageAlt: string;
  postmarkCity: string;
  postmarkDate: string;
  stampImageUrl: string;
  stampCountry: string;
  stampPrice: string;
  journalText: string;
  temperature: string;
  weatherEmoji: string;
  weatherText: string;
  locationTag: string;
  toRecipient: string;
  coordinates: string;
  status: string;
  serialNumber: string;
  continent?: string;
  createdAt?: number;
}

export type StampFrameStyle = 'classic' | 'airmail' | 'gold' | 'parchment' | 'imperial';

export interface StampItem {
  id: string;
  title: string;
  banner: string;
  country: string;
  region: 'all' | 'asia' | 'europe' | 'africa' | 'america';
  regionLabel: string;
  price: string;
  postmarkStation: string;
  postmarkDate: string;
  postmarkType: string;
  serialNumber: string;
  locationName: string;
  imageUrl: string;
  imageAlt: string;
  sepiaClass?: string;
  colorTheme?: 'primary' | 'secondary' | 'tertiary' | 'primary-container';
  frameStyle?: StampFrameStyle;
}

export interface PassportVisaStamp {
  id: string;
  country: string;
  date: string;
  location: string;
  coords: string;
  type: string;
  note: string;
  icon: string;
  code: string;
  shape: 'hexagon' | 'rectangle' | 'oval' | 'circle' | 'star';
  color: string;
  admitted: string;
  pageNumber: number;
}

export type PinStyleType = 'dot' | 'flag' | 'needle';

export interface GlobePin {
  id: string;
  code: string;
  city: string;
  country: string;
  region: string;
  date: string;
  lat: number;
  lng: number;
  latLngDisplay: string;
  categoryTag: string;
  isStamped: boolean;
  memoriesCount: number;
  imageUrl: string;
  status: 'VERIFIED' | 'PENDING' | 'EXPLORED';
  pinStyle?: PinStyleType;
  pinColor?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  avatarUrl: string;
  bio: string;
  titleRank: string;
  docId: string;
  registeredAt: string;
}
