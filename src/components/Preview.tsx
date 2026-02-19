import React from 'react';
import { UserProfile, LinkItem, Product } from '../types';
import { ExternalLink, Globe } from 'lucide-react';
import ProfileRenderer from './ProfileRenderer';

interface PreviewProps {
  profile: UserProfile;
  links: LinkItem[];
  products: Product[];
  onShare?: () => void;
  forcedTab?: 'links' | 'shop';
}

const Preview: React.FC<PreviewProps> = ({ profile, links, products = [], onShare, forcedTab }) => {
  return (
    <div className="flex flex-col items-center justify-center select-none w-full h-full overflow-hidden">
      {/* Public URL Preview Bar - Hidden on mobile for immersive feel */}
      <div className="hidden lg:flex mb-4 items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full border border-slate-200 text-slate-500 text-xs font-medium">
        <Globe size={12} />
        <span>nodus.my/{profile.username || profile.name.toLowerCase().replace(/\s+/g, '')}</span>
        <button
          onClick={() => window.open(`/${profile.username || profile.name.toLowerCase().replace(/\s+/g, '')}`, '_blank')}
          className="hover:text-brand-600 transition-colors"
        >
          <ExternalLink size={12} className="ml-1 opacity-50 hover:opacity-100" />
        </button>
      </div>

      {/* Frame Container - Full screen on mobile, centered frame on desktop */}
      <div className={`relative origin-center flex items-center justify-center w-full h-full lg:w-[340px] lg:h-[700px] lg:scale-[0.85] xl:scale-100`}>
        <div className="relative w-full h-full lg:border-gray-900 lg:bg-gray-900 lg:border-[12px] lg:rounded-[3rem] lg:shadow-2xl flex flex-col overflow-hidden lg:ring-1 lg:ring-white/20">

          {/* Dynamic Island - Only on Desktop Frame */}
          <div className="hidden lg:flex absolute top-2 left-1/2 -translate-x-1/2 w-[90px] h-[24px] bg-black rounded-full z-40 items-center justify-center pointer-events-none">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-900/30 ml-8"></div>
          </div>

          {/* Physical Buttons - Only on Desktop Frame */}
          <div className="hidden lg:block absolute top-24 -right-[15px] h-16 w-[3px] bg-gray-800 rounded-r-md"></div>
          <div className="hidden lg:block absolute top-24 -left-[15px] h-8 w-[3px] bg-gray-800 rounded-l-md"></div>
          <div className="hidden lg:block absolute top-36 -left-[15px] h-16 w-[3px] bg-gray-800 rounded-l-md"></div>

          {/* Screen Content */}
          <ProfileRenderer
            key={`${profile.fontFamily}-${profile.fontSize || 16}-${profile.fontWeight || '400'}-${profile.fontItalic}-${profile.buttonRoundness}`}
            profile={profile}
            links={links}
            products={products}
            isPreview={true}
            onShare={onShare}
            forcedTab={forcedTab}
          />

        </div>
      </div>

      {/* Reflection Effect - Only on Desktop Frame */}
      <div className="hidden lg:block absolute top-[108px] right-[calc(50%-150px)] w-[100px] h-[300px] bg-gradient-to-b from-white/5 to-transparent skew-x-12 pointer-events-none rounded-[2rem]"></div>
    </div >
  );
};

export default Preview;