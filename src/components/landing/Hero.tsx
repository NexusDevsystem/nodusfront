import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../services/apiClient';
import { Button } from './Button';
import { ArrowRight, Check, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { SplitText } from './SplitText';
import { useLanguage } from './i18n/LanguageContext';
import { ScrollIndicator } from './ScrollIndicator';

export function Hero() {
  const container = useRef<HTMLDivElement>(null);
  const { t, lang } = useLanguage();
  const navigate = useNavigate();

  const [username, setUsername] = React.useState('');
  const [isAvailable, setIsAvailable] = React.useState<boolean | null>(null);
  const [isChecking, setIsChecking] = React.useState(false);

  // Debounced username check
  React.useEffect(() => {
    if (username.length < 3) {
      setIsAvailable(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsChecking(true);
      try {
        const { available } = await apiClient.checkUsername(username.toLowerCase());
        setIsAvailable(available);
      } catch (error) {
        setIsAvailable(false);
      } finally {
        setIsChecking(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username]);

  const handleReserve = () => {
    if (username.length >= 3 && isAvailable) {
      localStorage.setItem('nodus_reserved_username', username.toLowerCase());
      navigate('/login?mode=register');
    }
  };

  useGSAP(() => {
    // Text reveal animation
    const tl = gsap.timeline();

    tl.from('.hero-letter', {
      y: 80,
      opacity: 0,
      rotation: 10,
      duration: 0.8,
      stagger: 0.02,
      ease: 'back.out(1.5)'
    })
      .from('.hero-subtitle', {
        y: 20,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out'
      }, "-=0.6")
      .from('.hero-input-group', {
        y: 20,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out'
      }, "-=0.6")
      .from('.scribble-float', {
        scale: 0,
        opacity: 0,
        rotation: -45,
        duration: 0.6,
        ease: 'back.out(2)',
        stagger: 0.1
      }, "-=0.4");

    // Simple, lightweight continuous floating animation
    gsap.to('.scribble-float', {
      y: -8,
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      stagger: 0.3
    });
  }, { scope: container });

  return (
    <section ref={container} className="relative pt-36 pb-12 lg:pt-48 lg:pb-16 w-full overflow-hidden">
      <ScrollIndicator />

      {/* Grid Background Pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(#121212 2px, transparent 2px)', backgroundSize: '32px 32px' }}>
      </div>

      {/* Lightweight Scribbles / Riscos */}
      <div className="absolute top-16 left-[5%] xl:left-[15%] hidden md:block z-20 pointer-events-none">
        <div className="scribble-float opacity-60">
          <svg width="80" height="80" viewBox="0 0 100 100" fill="none" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20,80 Q40,20 80,20 M60,40 L80,20 L60,10" stroke="#a2d2a2" transform="translate(3, 3)" />
            <path d="M20,80 Q40,20 80,20 M60,40 L80,20 L60,10" stroke="#121212" />
          </svg>
        </div>
      </div>

      <div className="absolute top-24 right-[5%] xl:right-[15%] hidden md:block z-20 pointer-events-none">
        <div className="scribble-float opacity-60">
          <svg width="90" height="90" viewBox="0 0 100 100" fill="none" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10,50 C10,10 50,10 50,50 C50,90 90,90 90,50 C90,10 50,10 50,50" stroke="#ffc9f0" transform="translate(3, 3)" />
            <path d="M10,50 C10,10 50,10 50,50 C50,90 90,90 90,50 C90,10 50,10 50,50" stroke="#121212" />
          </svg>
        </div>
      </div>

      <div className="absolute bottom-40 left-[10%] xl:left-[18%] hidden md:block z-20 pointer-events-none">
        <div className="scribble-float opacity-60">
          <svg width="70" height="70" viewBox="0 0 100 100" fill="none" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M50,10 L50,90 M10,50 L90,50 M22,22 L78,78 M22,78 L78,22" stroke="#fef08a" transform="translate(3, 3)" />
            <path d="M50,10 L50,90 M10,50 L90,50 M22,22 L78,78 M22,78 L78,22" stroke="#121212" />
          </svg>
        </div>
      </div>

      <div className="absolute bottom-32 right-[10%] xl:right-[20%] hidden md:block z-20 pointer-events-none">
        <div className="scribble-float opacity-60">
          <svg width="100" height="40" viewBox="0 0 100 40" fill="none" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10,20 Q25,5 40,20 T70,20 T90,20" stroke="#a2d2a2" transform="translate(3, 3)" />
            <path d="M10,20 Q25,5 40,20 T70,20 T90,20" stroke="#121212" />
          </svg>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

          {/* Left Side: Content */}
          <div className="flex-[1.2] text-center lg:text-left flex flex-col items-center lg:items-start">
            <h1 className="font-display font-black text-4xl sm:text-6xl lg:text-[4rem] xl:text-[4.5rem] leading-[0.9] tracking-tighter uppercase text-dark">
              <div className="overflow-hidden pt-4 pb-1 -mt-4"><span className="inline-block"><SplitText text={t.hero.title1} letterClass="hero-letter" /></span></div>
              <div className="overflow-hidden pt-4 pb-1 -mt-4"><span className="inline-block"><SplitText text={t.hero.title2} letterClass="hero-letter" /></span></div>
              <div className="overflow-hidden pt-6 pb-4 -mt-6">
                <span className="inline-block">
                  <SplitText text={t.hero.title3} letterClass="hero-letter" />
                  <span className="text-dark inline-block transform -rotate-2 bg-brand px-3 py-1 ml-2 rounded-none border-4 border-dark shadow-brutal"><SplitText text={t.hero.title4} letterClass="hero-letter" /></span>
                </span>
              </div>
            </h1>

            <p className="hero-subtitle text-lg sm:text-xl font-medium max-w-2xl text-dark mt-6 mb-8">
              {t.hero.sub1} <span className="bg-yellow px-3 border-2 border-dark font-bold transform rotate-2 inline-block rounded-none text-dark shadow-brutal-sm">{t.hero.subBrutal}</span>{t.hero.sub2}
            </p>

            <div className="hero-input-group flex flex-col sm:flex-row gap-4 w-full max-w-xl">
              <div className={`flex-1 flex items-center bg-white border-2 border-dark shadow-[0_8px_0_0_#000] p-4 rounded-xl transition-all text-left relative ${isAvailable === true ? 'border-[#97cd7a]' : isAvailable === false ? 'border-red-500' : 'border-dark'}`}>
                <span className="font-bold text-lg pl-2 pr-0.5 text-gray-400">nodus.my/</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9._]/g, ''))}
                  placeholder={t.hero.placeholder}
                  className="w-full bg-transparent outline-none font-bold text-lg placeholder:text-gray-300 text-dark"
                />
                <div className="absolute right-4 flex items-center">
                  {isChecking && <Loader2 className="animate-spin text-dark/20" size={20} />}
                  {!isChecking && isAvailable === true && <Check className="text-[#97cd7a]" size={20} strokeWidth={4} />}
                  {!isChecking && isAvailable === false && username.length >= 3 && <X className="text-red-500" size={20} strokeWidth={4} />}
                </div>
              </div>
              <Button
                variant="primary"
                size="lg"
                onClick={handleReserve}
                disabled={!isAvailable || isChecking}
                className="whitespace-nowrap group text-xl px-10 py-4 bg-[#b4e3b8] border-2 border-dark shadow-[0_8px_0_0_#121212] rounded-xl text-dark font-black flex items-center justify-center hover:translate-y-[4px] hover:shadow-[0_4px_0_0_#121212] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {t.hero.reserve}
                <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            {/* Availability short message */}
            {username.length >= 3 && !isChecking && (
              <div className="mt-4 text-xs font-black uppercase tracking-widest text-left w-full pl-2">
                {isAvailable === true ? (
                  <span className="text-[#5b8c41]">{lang === 'pt' ? 'Username disponível!' : 'Username available!'}</span>
                ) : isAvailable === false ? (
                  <span className="text-red-500">{lang === 'pt' ? 'Username já ocupado' : 'Username already taken'}</span>
                ) : null}
              </div>
            )}
          </div>

          {/* Right Side: Mockup */}
          <div className="flex-1 w-full lg:w-auto hero-mockup-wrapper relative perspective-1000 flex justify-center lg:justify-end lg:-mt-16">
            <div className="mockup-window flex justify-center items-center">

              {/* Samsung Galaxy S24 (Android) Mockup */}
              <div className="w-[280px] sm:w-[320px] bg-dark border-[8px] border-dark shadow-[12px_12px_0_0_#000] rounded-[2rem] overflow-hidden flex flex-col relative z-20 duration-500 ease-out hero-mockup-phone">
                {/* Android Punch Hole Camera */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-3 h-3 bg-black rounded-full z-30 shadow-inner opacity-90"></div>

                {/* Screen Content */}
                <div className="flex-1 h-[550px] relative overflow-hidden bg-white">
                  <img
                    src="/images/iPhone-13-PRO-www.nodus.my (3).png"
                    alt="Nodus Mobile Preview on Samsung Galaxy S24"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Background Shape */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand rounded-full blur-[120px] opacity-20 -z-10 pointer-events-none"></div>
        </div>
      </div>
    </section>
  );
}
