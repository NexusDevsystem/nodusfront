import React from 'react';
import { UserProfile, LinkItem, Product, Store } from '../types';
import { ExternalLink, Globe, Signal, Wifi, Battery } from 'lucide-react';
import ProfileRenderer from './ProfileRenderer';

interface PreviewProps {
  profile: UserProfile;
  links: LinkItem[];
  products: Product[];
  stores?: Store[];
  onShare?: () => void;
  forcedTab?: 'links' | 'shop';
}

const Preview: React.FC<PreviewProps> = ({ profile, links, products = [], stores = [], onShare, forcedTab }) => {
  return (
    <div className="flex flex-col items-center lg:justify-center w-full h-full overflow-x-hidden lg:overflow-visible select-none lg:px-4">
      {/* Public URL Preview Bar - Hidden on mobile for immersive feel */}
      <div className="hidden lg:flex mb-6 items-center gap-2 px-3 py-2 bg-[#fdfcf0] border-2 border-[#1a1a1a] shadow-[0_3px_0_0_#1a1a1a] text-black text-[9px] font-black uppercase tracking-widest">
        <Globe size={12} strokeWidth={3} className="text-black/40" />
        <span className="opacity-70">nodus.my/</span>
        <span className="text-black">{profile.username || profile.name.toLowerCase().replace(/\s+/g, '')}</span>
        <button
          onClick={() => window.open(`/${profile.username || profile.name.toLowerCase().replace(/\s+/g, '')}`, '_blank')}
          className="ml-1 p-1 hover:bg-[#ffdf00] hover:text-[#97cd7a] transition-all"
        >
          <ExternalLink size={12} strokeWidth={3} />
        </button>
      </div>      {/* Frame Container - Full screen on mobile, S24 Ultra mockup on desktop */}
      <div className={`relative origin-center flex items-center justify-center w-full h-full lg:w-[350px] lg:h-[740px] lg:scale-[0.83] xl:scale-100`}>
        {/* Phone Body */}
        <div className="relative w-full h-full lg:bg-black lg:border-[8px] lg:border-[#1a1a1a] lg:rounded-sm lg:shadow-[0_20px_40px_-10px_rgba(26,26,26,0.4)] flex flex-col lg:ring-1 lg:ring-[#2a2a2a] transform z-10">

          {/* Screen Content Wrapper */}
          <div className="relative w-full h-full lg:rounded-sm overflow-hidden bg-transparent lg:bg-[#fdfcf0] flex flex-col transform">

            {/* Android Status Bar (Overlay) */}
            <div className="hidden lg:flex w-full absolute top-0 z-[100] h-8 px-4 justify-between items-center text-white pointer-events-none mix-blend-difference">
              <span className="text-[10px] font-medium tracking-wide">9:41</span>
              <div className="flex items-center gap-1.5 opacity-90">
                <Signal size={12} strokeWidth={2.5} />
                <Wifi size={12} strokeWidth={2.5} />
                <Battery size={13} strokeWidth={2.5} />
              </div>
            </div>

            {/* Punch Hole Camera */}
            <div className="hidden lg:flex absolute top-[10px] left-1/2 -translate-x-1/2 w-[14px] h-[14px] bg-black rounded-full z-[100] items-center justify-center pointer-events-none ring-1 ring-black/10 shadow-[inset_0_-1px_2px_rgba(255,255,255,0.15)]">
              <div className="w-[5px] h-[5px] rounded-full bg-[#111133] shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]"></div>
            </div>

            {/* Screen Content */}
            <ProfileRenderer
              key={`${profile.id || 'preview'}-${profile.headerLayout}-${profile.customBackground || 'no-bg'}`}
              profile={profile}
              links={links}
              products={products}
              stores={stores}
              isPreview={true}
              onShare={onShare}
              forcedTab={forcedTab}
            />
          </div>

        </div>

        {/* Physical Buttons - S24 Ultra (Right side) */}
        <div className="hidden lg:block absolute top-[130px] lg:-right-[3px] h-12 w-[3px] bg-[#1a1a1a] rounded-r-md z-0 shadow-[-1px_0_1px_rgba(255,255,255,0.1)]"></div>
        <div className="hidden lg:block absolute top-[200px] lg:-right-[3px] h-20 w-[3px] bg-[#1a1a1a] rounded-r-md z-0 shadow-[-1px_0_1px_rgba(255,255,255,0.1)]"></div>
      </div>
    </div >
  );
};

export default Preview;