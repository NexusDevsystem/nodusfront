export interface LinkItem {
  id: string;
  title: string;
  url: string;
  icon?: string;
  isActive: boolean;
  layout: 'classic' | 'social' | 'card' | 'icon' | 'grid' | 'carousel' | 'stacked';
  type?: 'link' | 'collection' | 'social';
  children?: LinkItem[];
  subtitle?: string;
  image?: string;
  highlight?: 'none' | 'pulse' | 'bounce' | 'shake' | 'glow' | 'wobble';
  embedType?: 'none' | 'youtube' | 'spotify' | 'twitch' | 'deezer';
  clicks?: number;
  isArchived?: boolean;
  platform?: string;
}

export interface UserProfile {
  id?: string;
  email?: string;
  username?: string;
  name: string;
  bio: string;
  avatarUrl: string;
  themeId: string;
  fontFamily: string;
  buttonRoundness?: 'square' | 'round' | 'rounder' | 'full' | null;
  headerLayout?: 'classic' | 'compact' | 'hero';
  headerStyle?: 'text' | 'logo';
  logoUrl?: string;
  avatarSize?: 'sm' | 'md' | 'lg';
  showNewsletter?: boolean;
  customBackground?: string | null;
  customSolidColor?: string | null;
  authProvider?: string;
  planType?: 'free' | 'monthly' | 'annual';
  subscriptionStatus?: 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid';
  subscriptionExpiryDate?: string | null;
  stripeCustomerId?: string | null;
  onboardingCompleted?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  customCSS?: string;
  supportType?: 'pix' | 'paypal';
  supportKey?: string;
  userCategory?: 'creator' | 'personal' | 'business' | null;
  referralSource?: string | null;
  isVerified?: boolean;
  enableBlur?: boolean;
  fontSize?: number | null;
  fontWeight?: string | null;
  fontItalic?: boolean;
  customSecondaryColor?: string | null;
  customTextColor?: string | null;
  customButtonTextColor?: string | null;
  customButtonColor?: string | null;
}

export interface Theme {
  id: string;
  name: string;
  backgroundClass: string;
  buttonClass: string;
  textClass: string;
  avatarBorder: string;
  isPro?: boolean;
  solidColor?: string;
  buttonHex?: string;
  textHex?: string;
  category?: 'solid' | 'gradient' | 'animated' | 'music' | 'creative' | 'kawaii';
  cardClass?: string;
  fontFamily?: string;
  buttonRoundness?: 'square' | 'round' | 'rounder' | 'full';
}


export interface Product {
  id: string;
  image: string;
  name: string;
  url: string;
  price?: string;
  discountCode?: string;
  clicks?: number;
  collection?: string;
}

export interface FontOption {
  name: string;
  family: string;
  type: 'sans' | 'serif' | 'mono' | 'display' | 'handwriting';
  isPro?: boolean;
}

export interface AnalyticsEvent {
  id: string;
  linkId: string;
  timestamp: string;
  type: 'click';
}

export interface NewsletterLead {
  id: string;
  email: string;
  name?: string;
  date: string;
  profileName?: string;
}