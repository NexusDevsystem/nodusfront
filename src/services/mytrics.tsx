import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * 📊 Mytrics Analytics TypeScript Types
 */
export interface MytricsMetadata {
  [key: string]: string | number | boolean | null | undefined | object;
}

export interface MytricsInstance {
  track: (eventName: string, metadata?: MytricsMetadata) => void;
}

declare global {
  interface Window {
    mytrics?: MytricsInstance;
  }
}

// In-memory queue for events fired before the script finishes loading
const eventQueue: { eventName: string; metadata?: MytricsMetadata }[] = [];

/**
 * Flushes all pending queued events once the Mytrics script has successfully loaded.
 */
const flushQueue = () => {
  if (typeof window !== 'undefined' && window.mytrics && typeof window.mytrics.track === 'function') {
    const queueLength = eventQueue.length;
    if (queueLength > 0 && import.meta.env.DEV) {
      console.log(`[Mytrics] Flushing ${queueLength} queued events...`);
    }

    while (eventQueue.length > 0) {
      const queued = eventQueue.shift();
      if (queued) {
        try {
          window.mytrics.track(queued.eventName, queued.metadata);
        } catch (error) {
          console.warn('[Mytrics] Failed to dispatch queued event:', error);
        }
      }
    }
  }
};

/**
 * 🚀 Safe Tracking Utility
 * Compiles cleanly, prevents window.mytrics is undefined exceptions, 
 * handles adblockers gracefully, and queues events if the script hasn't loaded yet.
 */
export const trackMytricsEvent = (eventName: string, metadata?: MytricsMetadata) => {
  if (typeof window === 'undefined') return;

  if (window.mytrics && typeof window.mytrics.track === 'function') {
    try {
      window.mytrics.track(eventName, metadata);
    } catch (error) {
      console.warn('[Mytrics] Error tracking event:', error);
    }
  } else {
    // Queue the event so it is not lost
    eventQueue.push({ eventName, metadata });
    if (import.meta.env.DEV) {
      console.info(`[Mytrics] Script not loaded yet. Queuing event "${eventName}":`, metadata);
    }
  }
};

/**
 * React Context Definition
 */
interface MytricsContextType {
  track: (eventName: string, metadata?: MytricsMetadata) => void;
  isLoaded: boolean;
}

const MytricsContext = createContext<MytricsContextType | null>(null);

/**
 * 📦 Mytrics Provider Component
 * - Inject the `<script>` tag dynamically with the appropriate data-site-id.
 * - Monitors SPA Route Changes and triggers automatic 'pageview' custom tracking.
 * - Flushes queued events once script successfully mounts.
 */
interface MytricsProviderProps {
  children: React.ReactNode;
  siteId?: string;
  trackPageViews?: boolean;
}

export const MytricsProvider: React.FC<MytricsProviderProps> = ({
  children,
  siteId = import.meta.env.VITE_MYTRICS_SITE_ID || 'site_5c26ovgkl2e1779156094697',
  trackPageViews = true,
}) => {
  const isInitialized = useRef(false);
  const location = useLocation();

  useEffect(() => {
    if (typeof window === 'undefined' || isInitialized.current) return;
    isInitialized.current = true;

    // Verify if script already exists to avoid duplication
    const scriptSrc = 'https://mytricsapi.up.railway.app/t.js';
    let script = document.querySelector(`script[src="${scriptSrc}"]`) as HTMLScriptElement;

    if (!script) {
      script = document.createElement('script');
      script.src = scriptSrc;
      script.async = true;
      script.setAttribute('data-site-id', siteId);

      script.onload = () => {
        if (import.meta.env.DEV) {
          console.log('[Mytrics] Script loaded and initialized.');
        }
        flushQueue();
      };

      script.onerror = () => {
        console.error('[Mytrics] Failed to load the analytics script. It may be blocked by an adblocker/privacy extension.');
      };

      document.head.appendChild(script);
    } else {
      // Script already loaded by another mechanism, go ahead and flush queue
      flushQueue();
    }
  }, [siteId]);

  // SPA Route Transition Tracking
  useEffect(() => {
    if (trackPageViews) {
      trackMytricsEvent('pageview', {
        path: location.pathname,
        search: location.search,
        title: document.title,
        referrer: document.referrer || 'direct',
        timestamp: new Date().toISOString()
      });
    }
  }, [location, trackPageViews]);

  return (
    <MytricsContext.Provider value={{ track: trackMytricsEvent, isLoaded: typeof window !== 'undefined' && !!window.mytrics }}>
      {children}
    </MytricsContext.Provider>
  );
};

/**
 * ⚡ Custom Hook to interact with Mytrics in components
 */
export const useMytrics = () => {
  const context = useContext(MytricsContext);
  if (!context) {
    // Fail-safe default in case components are rendered outside of <MytricsProvider>
    return {
      track: trackMytricsEvent,
      isLoaded: typeof window !== 'undefined' && !!window.mytrics,
    };
  }
  return context;
};
