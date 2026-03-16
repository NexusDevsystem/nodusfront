import React from 'react';
import { ArrowDown } from 'lucide-react';

export function ScrollIndicator() {
  return (
    <div className="absolute bottom-8 right-8 z-50 hidden md:flex items-center justify-center pointer-events-none">
      <div className="relative w-24 h-24">
        {/* Spinning text circle */}
        <svg viewBox="0 0 100 100" className="w-full h-full text-brand animate-[spin_10s_linear_infinite]">
          <path id="circlePath" d="M 50, 50 m -40, 0 a 40,40 0 1,1 80,0 a 40,40 0 1,1 -80,0" fill="none" />
          <text className="fill-current font-mono text-[10px] font-bold uppercase tracking-widest">
            <textPath href="#circlePath" startOffset="0%">
              SCROLL DOWN  •  SCROLL DOWN  •  SCROLL DOWN  •  SCROLL DOWN  •  
            </textPath>
          </text>
        </svg>
        {/* Static arrow */}
        <div className="absolute inset-0 flex items-center justify-center">
          <ArrowDown className="w-6 h-6 text-brand" />
        </div>
      </div>
    </div>
  );
}
