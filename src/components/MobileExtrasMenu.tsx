import React from 'react';
import { 
  BarChart3, 
  Link2, 
  FolderOpen, 
  FlaskConical,
  CreditCard,
  ShieldAlert,
  LifeBuoy
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Props {
  onSelect: (tab: string) => void;
  isAdmin?: boolean;
}

export default function MobileExtrasMenu({ onSelect, isAdmin }: Props) {
  const { t } = useTranslation();

  const options = [
    { id: 'analytics', icon: BarChart3, label: t('editor.tabs.analytics') },
    { id: 'integrations', icon: Link2, label: 'Integrações' },
    { id: 'files', icon: FolderOpen, label: 'Arquivos' },
    { id: 'roadmap', icon: FlaskConical, label: 'Lab' },
    { id: 'billing', icon: CreditCard, label: 'Faturamento' },
    { id: 'support', icon: LifeBuoy, label: 'Suporte' },
    ...(isAdmin ? [{ id: 'admin', icon: ShieldAlert, label: 'Admin' }] : []),
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {options.map((option) => {
        const Icon = option.icon;
        return (
          <button
            key={option.id}
            onClick={() => onSelect(option.id)}
            className="flex items-center gap-4 p-4 bg-white border-2 border-black rounded-2xl shadow-[0_4px_0_0_#000] active:translate-y-[2px] active:shadow-none transition-all"
          >
            <div className="p-2 bg-[#ffdf00] border-2 border-black rounded-xl">
              <Icon size={20} strokeWidth={2.5} />
            </div>
            <span className="font-black uppercase text-[10px] tracking-widest text-left">
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
