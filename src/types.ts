export interface LinkItem {
  id: string;
  title: string;
  url: string;
  isActive: boolean;
  clicks: number;
  layout: 'classic' | 'social';
  type?: 'link' | 'collection';
  children?: LinkItem[];
  image?: string;
  highlight?: 'none' | 'pulse' | 'bounce' | 'shake' | 'glow' | 'wobble';
  embedType?: 'none' | 'youtube' | 'spotify' | 'twitch';
}

export interface UserProfile {
  name: string;
  bio: string;
  avatarUrl: string;
  customBackground?: string; // Base64 or URL
  themeId: string;
  fontFamily: string;
  buttonStyle?: 'rounded' | 'soft-rect';
  showNewsletter?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  customCSS?: string;
  supportType?: 'pix' | 'paypal';
  supportKey?: string;
  customTextColor?: string;
  customSolidColor?: string;
  customButtonColor?: string;
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
  clicks: number;
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