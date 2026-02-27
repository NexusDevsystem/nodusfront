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
    <div className="flex flex-col items-center justify-center w-full h-full lg:overflow-hidden select-none lg:px-4">
      {/* Public URL Preview Bar - Hidden on mobile for immersive feel */}
      <div className="hidden lg:flex mb-6 items-center gap-2 px-3 py-2 bg-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-black text-[9px] font-black uppercase tracking-widest">
        <Globe size={12} strokeWidth={3} className="text-black/40" />
        <span className="opacity-70">nodus.my/</span>
        <span className="text-black">{profile.username || profile.name.toLowerCase().replace(/\s+/g, '')}</span>
        <button
          onClick={() => window.open(`/${profile.username || profile.name.toLowerCase().replace(/\s+/g, '')}`, '_blank')}
          className="ml-1 p-1 hover:bg-black hover:text-[#97cd7a] transition-all"
        >
          <ExternalLink size={12} strokeWidth={3} />
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
            key={profile.id || 'preview'}
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