export interface LinkItem {
  id: string;
  title: string;
  url: string;
  icon?: string;
  isActive: boolean;
  layout: 'classic' | 'social';
  type?: 'link' | 'collection';
  children?: LinkItem[];
  image?: string;
  highlight?: 'none' | 'pulse' | 'bounce' | 'shake' | 'glow' | 'wobble';
  embedType?: 'none' | 'youtube' | 'spotify' | 'twitch';
  clicks?: number;
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
  buttonStyle?: 'rounded' | 'soft-rect';
  showNewsletter?: boolean;
  customBackground?: string | null;
  customTextColor?: string | null;
  customSolidColor?: string | null;
  customButtonColor?: string | null;
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
}

export interface Theme {
  id: string;
  name: string;
  backgroundClass: string;
  buttonClass: string;
  textClass: string;
  avatarBorder: string;
}


export interface Product {
  id: string;
  image: string;
  name: string;
  url: string;
  price?: string;
  discountCode?: string;
}

export interface FontOption {
  name: string;
  family: string;
  type: 'sans' | 'serif' | 'mono' | 'display' | 'handwriting';
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