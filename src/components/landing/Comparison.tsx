import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Check, X } from 'lucide-react';
import { useLanguage } from './i18n/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

export function Comparison() {
  const container = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container.current,
        start: 'top 85%',
        end: 'top 20%',
        scrub: 1,
      }
    });

    tl.fromTo('.comp-title', 
      { y: 80, opacity: 0 },
      { y: 0, opacity: 1, duration: 1 }
    )
    .fromTo('.comp-table-row', 
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.1 }, 
      0
    );
  }, { scope: container });

  const comparisonData = [
    {
      feature: "Integração Kick & Twitch",
      nodus: "Deep Sync: Puxa seguidores e avatar via API em tempo real.",
      competitor: "Apenas link simples com ícone."
    },
    {
      feature: "Media Kit Expansível",
      nodus: "Nativo: Botão que revela métricas profissionais ao clicar.",
      competitor: "Requer integração externa ou PDF estático."
    },
    {
      feature: "PIX e Pagamentos BR",
      nodus: "Nativo: Focado no mercado brasileiro com chaves e QR Codes.",
      competitor: "Focado em Stripe/PayPal (taxas altas e menos intuitivo no BR)."
    },
    {
      feature: "Music Card (Álbuns)",
      nodus: "Agrupado: Expande a playlist inteira dentro de um único botão.",
      competitor: "Geralmente apenas um embed de uma única faixa ou player externo."
    },
    {
      feature: "Localização e Mapas",
      nodus: "Card Ativo: Mapa interativo renderizado direto na bio.",
      competitor: "Apenas redirecionamento para Google Maps."
    },
    {
      feature: "Download de Arquivos",
      nodus: "Nodus Storage: Hospedagem interna de PDFs e E-books.",
      competitor: "Requer link externo (Google Drive/Dropbox)."
    },
    {
      feature: "Estética Visual",
      nodus: "Neobrutalismo: Bordas 1.5px, sombras rígidas e animações premium.",
      competitor: "Design minimalista padrão (arredondado e genérico)."
    },
    {
      feature: "Links com Senha",
      nodus: "Nativo: Proteção direta na interface do editor.",
      competitor: "Funcionalidade restrita apenas a planos pagos elevados."
    }
  ];

  return (
    <section id="comparison" ref={container} className="py-24 bg-bg relative overflow-hidden border-t-4 border-dark">
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#121212 2px, transparent 2px)', backgroundSize: '32px 32px' }}>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="comp-title text-center mb-16 md:mb-24">
          <h2 className="font-display font-black text-5xl md:text-7xl uppercase tracking-tighter mb-6">
            {t.comparison.title}
          </h2>
          <p className="text-xl md:text-2xl font-medium text-gray-600 max-w-3xl mx-auto">
            {t.comparison.subtitle}
          </p>
        </div>

        <div className="pb-8">
          {/* Desktop Table (hidden on mobile) */}
          <div className="hidden lg:block w-full bg-white border-4 border-dark rounded-none shadow-brutal-lg overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-3 bg-dark text-white border-b-2 border-dark">
              <div className="p-6 font-display font-black text-2xl uppercase tracking-tighter">Funcionalidade</div>
              <div className="p-6 font-display font-black text-2xl uppercase tracking-tighter bg-brand text-dark border-l-2 border-dark flex items-center gap-2">
                <Check className="w-6 h-6 stroke-[3]" /> Nodus
              </div>
              <div className="p-6 font-display font-black text-2xl uppercase tracking-tighter bg-gray-200 text-gray-500 border-l-2 border-dark flex items-center gap-2">
                <X className="w-6 h-6" /> Concorrente
              </div>
            </div>

            {/* Table Body */}
            <div className="flex flex-col">
              {comparisonData.map((row, i) => (
                <div key={i} className="comp-table-row grid grid-cols-3 border-b-2 border-dark last:border-b-0 hover:bg-gray-50 transition-colors">
                  <div className="p-6 font-bold text-lg flex items-center">
                    {row.feature}
                  </div>
                  <div className="p-6 font-medium text-lg border-l-2 border-dark bg-brand/10">
                    {row.nodus}
                  </div>
                  <div className="p-6 font-medium text-lg border-l-2 border-dark text-gray-500 bg-gray-100/50">
                    {row.competitor}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Cards (hidden on desktop) */}
          <div className="flex flex-col gap-6 lg:hidden">
            {comparisonData.map((row, i) => (
              <div key={i} className="comp-table-row bg-white border-4 border-dark rounded-none shadow-brutal-lg overflow-hidden flex flex-col">
                <div className="p-4 bg-dark text-white font-display font-black text-xl uppercase tracking-tighter border-b-2 border-dark">
                  {row.feature}
                </div>
                <div className="flex flex-col">
                  <div className="p-5 bg-brand/10 border-b-2 border-dark">
                    <div className="flex items-center gap-2 font-display font-black text-lg uppercase tracking-tighter text-dark mb-2">
                      <Check className="w-5 h-5 stroke-[3] text-brand" /> Nodus
                    </div>
                    <p className="font-medium text-base text-dark">{row.nodus}</p>
                  </div>
                  <div className="p-5 bg-gray-100/50">
                    <div className="flex items-center gap-2 font-display font-black text-lg uppercase tracking-tighter text-gray-500 mb-2">
                      <X className="w-5 h-5" /> Concorrente
                    </div>
                    <p className="font-medium text-base text-gray-500">{row.competitor}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
