import React from 'react';
import { UserProfile, LinkItem, Product } from '../types';
import { ExternalLink, Globe } from 'lucide-react';
import ProfileRenderer from './ProfileRenderer';

interface PreviewProps {
  profile: UserProfile;
  links: LinkItem[];
  products: Product[];
}

const Preview: React.FC<PreviewProps> = ({ profile, links, products = [] }) => {
  return (
    <div className="flex flex-col items-center select-none w-full">
      {/* Public URL Preview Bar */}
      <div className="mb-4 flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full border border-slate-200 text-slate-500 text-xs font-medium">
        <Globe size={12} />
        <span>noduscc.com/{profile.name.toLowerCase().replace(/\s+/g, '')}</span>
        <button
          onClick={() => window.open(`/${profile.name.toLowerCase().replace(/\s+/g, '')}`, '_blank')}
          className="hover:text-brand-600 transition-colors"
        >
          <ExternalLink size={12} className="ml-1 opacity-50 hover:opacity-100" />
        </button>
      </div>

      {/* Frame Container */}
      <div className={`relative transition-all duration-500 ease-in-out origin-top flex items-center justify-center w-[340px] h-[700px] scale-[0.85] sm:scale-100`}>
        <div className="relative w-full h-full border-gray-900 bg-gray-900 border-[12px] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden ring-1 ring-white/20">

          {/* Dynamic Island (Mock) */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[90px] h-[24px] bg-black rounded-full z-40 flex items-center justify-center pointer-events-none">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-900/30 ml-8"></div>
          </div>

          {/* Physical Buttons */}
          <div className="absolute top-24 -right-[15px] h-16 w-[3px] bg-gray-800 rounded-r-md"></div>
          <div className="absolute top-24 -left-[15px] h-8 w-[3px] bg-gray-800 rounded-l-md"></div>
          <div className="absolute top-36 -left-[15px] h-16 w-[3px] bg-gray-800 rounded-l-md"></div>

          {/* Screen Content */}
          <ProfileRenderer profile={profile} links={links} products={products} isPreview={true} />

        </div>
      </div>

      {/* Reflection Effect */}
      <div className="absolute top-[108px] right-[calc(50%-150px)] w-[100px] h-[300px] bg-gradient-to-b from-white/5 to-transparent skew-x-12 pointer-events-none rounded-[2rem]"></div>
    </div >
  );
};

export default Preview;