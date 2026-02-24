export interface LinkItem {
  id: string;
  clientId?: string;
  title: string;
  url: string;
  icon?: string;
  isActive: boolean;
  layout: 'classic' | 'social' | 'card' | 'icon' | 'grid' | 'carousel' | 'stacked';
  type?: 'link' | 'collection' | 'social' | 'header';
  children?: LinkItem[];
  subtitle?: string;
  image?: string;
  highlight?: 'none' | 'pulse' | 'bounce' | 'shake' | 'glow' | 'wobble';
  embedType?: 'none' | 'youtube' | 'spotify' | 'twitch' | 'deezer' | 'tiktok';
  videoUrl?: string; // For native video players
  clicks?: number;
  isArchived?: boolean;
  platform?: string;
  scheduleStart?: string | null;
  scheduleEnd?: string | null;
}

export interface PaymentMethod {
  id: string;
  type: 'pix' | 'paypal';
  key: string;
  label?: string; // Optional nickname e.g. "Business Pix"
  isActive?: boolean;
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
  headerLayout?: 'classic' | 'compact' | 'banner';
  headerStyle?: 'text' | 'logo';
  logoUrl?: string;
  avatarSize?: 'sm' | 'md' | 'lg';
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
  supportType?: 'pix' | 'paypal'; // Deprecated/Legacy
  supportKey?: string; // Deprecated/Legacy
  paymentMethods?: PaymentMethod[]; // New Array
  userCategory?: 'creator' | 'personal' | 'business' | null;
  referralSource?: string | null;
  isVerified?: boolean;
  enableBlur?: boolean;
  fontSize?: number | null;
  fontWeight?: string | null;
  fontItalic?: boolean;
  customSecondaryColor?: string | null;
  customTextColor?: string | null;
  customCollectionTextColor?: string | null;
  customButtonTextColor?: string | null;
  customButtonColor?: string | null;
  integrations?: any[];
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
  category?: 'solid' | 'gradient' | 'animated' | 'music' | 'creative' | 'kawaii' | 'business' | 'engineering' | 'medicine' | 'technology' | 'advocacy';
  cardClass?: string;
  fontFamily?: string;
  buttonRoundness?: 'square' | 'round' | 'rounder' | 'full';
}


export interface Product {
  id: string;
  clientId?: string;
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

export interface SocialIntegration {
  user_id: string;
  provider: 'tiktok' | 'youtube' | 'instagram';
  access_token: string;
  refresh_token?: string;
  expires_at?: string;
  profile_data: {
    username?: string;
    follower_count?: number | null;
    avatar_url?: string | null;
    channel_id?: string;
    available_accounts?: Array<{
      username: string;
      avatar_url: string | null;
      follower_count: number | null;
      channel_id: string;
    }>;
  };
}