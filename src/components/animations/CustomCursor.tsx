import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { gsap } from 'gsap';

interface CustomCursorProps {
  targetSelector?: string;
  spinDuration?: number;
  hideDefaultCursor?: boolean;
  hoverDuration?: number;
}

const CustomCursor: React.FC<CustomCursorProps> = ({
  targetSelector = 'button, a, [role="button"], .cursor-target',
  spinDuration = 8,
  hideDefaultCursor = true,
  hoverDuration = 0.3
}) => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const crosshairRef = useRef<HTMLDivElement>(null);

  const [isHovering, setIsHovering] = useState(false);
  const [isHidden, setIsHidden] = useState(true);

  // Refs for logic state to avoid re-renders and closure issues
  const activeTargetRef = useRef<HTMLElement | null>(null);
  const isHoveringRef = useRef(false);

  // Constants
  const padding = 10;
  const idleSize = 24;

  const isMobile = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isSmallScreen = window.innerWidth <= 1024; // Including tablets
    return hasTouchScreen || isSmallScreen;
  }, []);

  const rotationRef = useRef<HTMLDivElement>(null);

  // Optimized update function
  const updateVisorPosition = useCallback((x: number, y: number, immediate = false) => {
    if (!viewRef.current) return;

    const target = activeTargetRef.current;

    if (target && isHoveringRef.current) {
      const rect = target.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const targetW = rect.width + padding * 2;
      const targetH = rect.height + padding * 2;

      gsap.to(viewRef.current, {
        x: centerX,
        y: centerY,
        width: targetW,
        height: targetH,
        duration: immediate ? 0 : 0.25,
        ease: 'power3.out',
        overwrite: 'auto'
      });
    } else {
      // Idle state: Follow mouse
      gsap.to(viewRef.current, {
        x,
        y,
        width: idleSize,
        height: idleSize,
        duration: immediate ? 0 : 0.2,
        ease: 'power2.out',
        overwrite: 'auto'
      });
    }
  }, []);

  const hasInitializedRef = useRef(false);

  useEffect(() => {
    if (isMobile || !cursorRef.current || !viewRef.current) return;

    const cursor = cursorRef.current;
    const view = viewRef.current;

    // Hide default cursor logic
    if (hideDefaultCursor) {
      document.body.style.cursor = 'none';
      if (!document.getElementById('cursor-style-override')) {
        const style = document.createElement('style');
        style.id = 'cursor-style-override';
        style.innerHTML = `* { cursor: none !important; }`;
        document.head.appendChild(style);
      }
    }

    // Set initial state only once
    if (!hasInitializedRef.current) {
      gsap.set([cursor, view], { opacity: 0, xPercent: -50, yPercent: -50 });
    }

    const moveHandler = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;

      if (!hasInitializedRef.current) {
        hasInitializedRef.current = true;
        gsap.to([cursor, view], { opacity: 1, duration: 0.3 });
      }

      // 1. Crosshair always follows mouse 1:1
      gsap.set(cursor, { x, y });

      // 2. Target Detection (Prioritize .cursor-target for large card snapping)
      const element = document.elementFromPoint(x, y);
      const foundTarget = (element?.closest('.cursor-target') || element?.closest(targetSelector)) as HTMLElement;

      // Sticky Logic for Magnetic Buttons
      if (foundTarget) {
        if (activeTargetRef.current !== foundTarget) {
          activeTargetRef.current = foundTarget;
          isHoveringRef.current = true;
          setIsHovering(true);
          updateVisorPosition(x, y, true);
        } else {
          // While already hovering, update visually to follow the target's real-time position
          updateVisorPosition(x, y);
        }
      } else if (activeTargetRef.current) {
        // Only release target if mouse is truly far from it (safety margin)
        const rect = activeTargetRef.current.getBoundingClientRect();
        const margin = 20; // 20px safety margin
        if (
          x < rect.left - margin ||
          x > rect.right + margin ||
          y < rect.top - margin ||
          y > rect.bottom + margin
        ) {
          activeTargetRef.current = null;
          isHoveringRef.current = false;
          setIsHovering(false);
          updateVisorPosition(x, y);
        } else {
          // Still in safety zone, keep snapping but follow mouse within it
          updateVisorPosition(x, y);
        }
      } else {
        updateVisorPosition(x, y);
      }
    };

    const scrollHandler = () => {
      if (isHoveringRef.current && activeTargetRef.current) {
        const mouseX = gsap.getProperty(cursor, 'x') as number;
        const mouseY = gsap.getProperty(cursor, 'y') as number;
        updateVisorPosition(mouseX, mouseY);
      }
    };

    const downHandler = () => gsap.to(cursor, { scale: 0.75, duration: 0.15 });
    const upHandler = () => gsap.to(cursor, { scale: 1, duration: 0.2 });

    window.addEventListener('mousemove', moveHandler);
    window.addEventListener('scroll', scrollHandler, { passive: true });
    window.addEventListener('mousedown', downHandler);
    window.addEventListener('mouseup', upHandler);

    // Spin animation - Targeting the inner rotation element
    const spinTl = gsap.to(rotationRef.current, {
      rotation: 360,
      duration: spinDuration,
      repeat: -1,
      ease: 'none',
      paused: false
    });

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', moveHandler);
      window.removeEventListener('scroll', scrollHandler);
      window.removeEventListener('mousedown', downHandler);
      window.removeEventListener('mouseup', upHandler);
      spinTl.kill();
      document.body.style.cursor = 'auto';
      document.getElementById('cursor-style-override')?.remove();
    };
  }, [isMobile, hideDefaultCursor, spinDuration, targetSelector, updateVisorPosition]);

  // Handle spin pausing when hovering - Corrected logic: stop on hover, resume on leave
  useEffect(() => {
    if (!rotationRef.current) return;
    
    if (isHovering) {
      // Smoothly stop and align to 0
      gsap.to(rotationRef.current, { rotation: 0, duration: 0.3, overwrite: 'auto' });
    } else {
      // Resume infinite spin
      gsap.to(rotationRef.current, {
        rotation: '+=360',
        duration: spinDuration,
        repeat: -1,
        ease: 'none',
        overwrite: 'auto'
      });
    }
  }, [isHovering, spinDuration]);

  if (isMobile) return null;

  return (
    <>
      {/* 1. Viewfinder (The Snap Box) - Independent Layer */}
      <div
        ref={viewRef}
        className="fixed top-0 left-0 pointer-events-none z-[1999999] hidden md:block select-none will-change-transform"
        style={{ width: idleSize, height: idleSize }}
      >
        <div ref={rotationRef} className="w-full h-full relative">
          <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[#ffdf00] drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]" />
          <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[#ffdf00] drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]" />
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-[#ffdf00] drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]" />
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-[#ffdf00] drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]" />
        </div>
      </div>

      {/* 2. Precision Crosshair (+) - Follows Mouse 1:1 */}
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 pointer-events-none z-[2000000] hidden md:block select-none will-change-transform"
      >
        <div ref={crosshairRef} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center">
          <div className="absolute w-full h-[1.5px] bg-[#ffdf00] drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]" />
          <div className="absolute h-full w-[1.5px] bg-[#ffdf00] drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]" />
        </div>
        <div ref={dotRef} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-[#ffdf00] rounded-full" />
      </div>
    </>
  );
};

export default CustomCursor;
