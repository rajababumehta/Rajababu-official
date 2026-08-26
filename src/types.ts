export type Language = 'EN' | 'NE';

export interface Moment {
  id: string;
  titleEn: string;
  titleNe: string;
  descEn: string;
  descNe: string;
  imgUrl: string;
  likes: number;
  category: string;
  date: string;
  isUserUploaded?: boolean;
  uploadedAt?: string;
}

export interface Comment {
  id: string;
  momentId: string;
  author: string;
  text: string;
  createdAt: string;
}

export interface StatItem {
  id: string;
  labelEn: string;
  labelNe: string;
  value: string;
  suffix: string;
  icon: string;
}

export interface ValueItem {
  id: string;
  titleEn: string;
  titleNe: string;
  descEn: string;
  descNe: string;
  icon: string;
}

export interface SkillItem {
  id: string;
  nameEn: string;
  nameNe: string;
  level: number;
  category: 'technical' | 'leadership' | 'strategy';
  descEn: string;
  descNe: string;
}

export interface MilestoneItem {
  id: string;
  year: string;
  titleEn: string;
  titleNe: string;
  orgEn: string;
  orgNe: string;
  descEn: string;
  descNe: string;
  roleType: string;
}

export interface ProfileSettings {
  name: string;
  titleEn: string;
  titleNe: string;
  taglineEn: string;
  taglineNe: string;
  welcomeBadgeEn: string;
  welcomeBadgeNe: string;
  heroImage: string;
  ctaPrimaryEn: string;
  ctaPrimaryNe: string;
  ctaSecondaryEn: string;
  ctaSecondaryNe: string;
}

export interface AboutSettings {
  badgeEn: string;
  badgeNe: string;
  headingEn: string;
  headingNe: string;
  bioParagraph1En: string;
  bioParagraph1Ne: string;
  bioParagraph2En: string;
  bioParagraph2Ne: string;
  mottoEn: string;
  mottoNe: string;
  stats: StatItem[];
  values: ValueItem[];
}

export interface ExperienceSettings {
  badgeEn: string;
  badgeNe: string;
  headingEn: string;
  headingNe: string;
  skills: SkillItem[];
  milestones: MilestoneItem[];
  quoteEn: string;
  quoteNe: string;
  quoteAuthor: string;
}

export interface ContactSettings {
  badgeEn: string;
  badgeNe: string;
  headingEn: string;
  headingNe: string;
  subheadingEn: string;
  subheadingNe: string;
  email: string;
  phone: string;
  locationEn: string;
  locationNe: string;
  facebookUrl: string;
  linkedinUrl: string;
  githubUrl: string;
  instagramUrl: string;
  whatsappNumber: string;
}

export interface AutoLikesConfig {
  defaultBoostRangeMin: number;
  defaultBoostRangeMax: number;
  mode: 'balanced' | 'high' | 'viral';
}

export interface SystemSettings {
  profile: ProfileSettings;
  about: AboutSettings;
  experience: ExperienceSettings;
  contact: ContactSettings;
  autoLikes: AutoLikesConfig;
}

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

export interface ClipzoneImage {
  id: string;
  title: string;
  titleNe?: string;
  description?: string;
  descNe?: string;
  imgUrl: string;
  storagePath?: string;
  uploadDate: string;
  category: string;
  likes: number;
  tags?: string[];
  fileSize?: number;
  authorEmail?: string;
  authorName?: string;
  isFirebase?: boolean;
}

export interface AdminUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  isAnonymous?: boolean;
  photoURL?: string | null;
}

