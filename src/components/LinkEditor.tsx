import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { LinkItem, UserProfile } from '../types';
import { fetchMusicMetadata } from '../utils/musicUtils';
import {
  Plus, Link as LinkIcon, Archive, FolderHeart, Zap, Folder,
  Ban, X, Trash2, LayoutGrid
} from 'lucide-react';
import { apiClient } from '../services/apiClient';
import AddLinkModal from './AddLinkModal';
import SortableLinkItem from './link-editor/SortableLinkItem';
import { SOCIAL_NETWORKS } from '../constants';

interface LinkEditorProps {
  links: LinkItem[];
  onChange: (links: LinkItem[] | ((prev: LinkItem[]) => LinkItem[])) => void;
  level?: number;
  profile: UserProfile;
  expandedLinks?: Record<string, boolean>;
  setExpandedLinks?: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  expandedCollections?: Record<string, boolean>;
  setExpandedCollections?: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  setActiveTab?: (tab: string) => void;
  onAddProduct?: (collectionName: string) => void;
  onAddCollection?: (name: string, url?: string, layout?: 'list' | 'grid' | 'carousel') => void;
  onAddIncentive?: (type: 'pix' | 'paypal', key: string) => void;
  setProfile?: React.Dispatch<React.SetStateAction<UserProfile>>;
}

function LinkEditor({
  links,
  onChange,
  level = 0,
  profile,
  setActiveTab,
  onAddProduct,
  onAddCollection: externalAddCollection,
  onAddIncentive,
  setProfile,
  expandedLinks: externalExpandedLinks,
  setExpandedLinks: externalSetExpandedLinks,
  expandedCollections: externalExpandedCollections,
  setExpandedCollections: externalSetExpandedCollections
}: LinkEditorProps) {
  const [internalExpandedCollections, setInternalExpandedCollections] = useState<Record<string, boolean>>({});
  const [internalExpandedLinks, setInternalExpandedLinks] = useState<Record<string, boolean>>({});
  const { t } = useTranslation();

  const expandedCollections = externalExpandedCollections || internalExpandedCollections;
  const setExpandedCollections = externalSetExpandedCollections || setInternalExpandedCollections;
  const expandedLinks = externalExpandedLinks || internalExpandedLinks;
  const setExpandedLinks = externalSetExpandedLinks || setInternalExpandedLinks;
  const [showArchive, setShowArchive] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [moveModalLinkId, setMoveModalLinkId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  React.useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Handle cross-list drops into Collections
  React.useEffect(() => {
    if (level !== 0) return;

    const handleMoveLink = (e: any) => {
      const { sourceId, targetId } = e.detail;
      if (!sourceId || !targetId) return;

      onChange((prevLinks: LinkItem[]) => {
        let newLinks = JSON.parse(JSON.stringify(prevLinks)) as LinkItem[];
        let movedLink: LinkItem | null = null;

        const removeRec = (list: LinkItem[]): LinkItem[] => {
          return list.filter(item => {
            if (item.id === sourceId) { movedLink = item; return false; }
            if (item.children) item.children = removeRec(item.children);
            return true;
          });
        };

        newLinks = removeRec(newLinks);
        if (!movedLink) return prevLinks;

        if (targetId === 'root') {
          newLinks.unshift(movedLink!);
          return newLinks;
        }

        const insertRec = (list: LinkItem[]) => {
          for (const item of list) {
            if (item.id === targetId && item.type === 'collection') {
              if (!item.children) item.children = [];
              if (movedLink!.type === 'collection') movedLink!.title = item.title;
              item.children.unshift(movedLink!);
              return true;
            }
            if (item.children && insertRec(item.children)) return true;
          }
          return false;
        };

        if (insertRec(newLinks)) {
          setExpandedCollections((prev) => ({ ...prev, [targetId]: true }));
          return newLinks;
        }
        return prevLinks;
      });
    };

    const handleOpenMove = (e: any) => setMoveModalLinkId(e.detail.linkId);

    window.addEventListener('nodus:move-link', handleMoveLink);
    window.addEventListener('nodus:open-move-modal', handleOpenMove);
    return () => {
      window.removeEventListener('nodus:move-link', handleMoveLink);
      window.removeEventListener('nodus:open-move-modal', handleOpenMove);
    };
  }, [level, onChange, setExpandedCollections]);

  React.useEffect(() => {
    if (level !== 0) return;
    const validIds = new Set<string>();
    const traverse = (items: LinkItem[]) => {
      items.forEach(item => {
        if (!item.isArchived) {
          validIds.add(item.id);
          if (item.children) traverse(item.children);
        }
      });
    };
    traverse(links);

    const cleanup = (expanded: Record<string, boolean>) => {
      let changed = false;
      const next = { ...expanded };
      Object.keys(next).forEach(id => {
        if (next[id] && !validIds.has(id)) { delete next[id]; changed = true; }
      });
      return changed ? next : null;
    };

    const nextLinks = cleanup(expandedLinks);
    if (nextLinks) setExpandedLinks(nextLinks);
    const nextColls = cleanup(expandedCollections);
    if (nextColls) setExpandedCollections(nextColls);
  }, [links, level, expandedLinks, expandedCollections, setExpandedLinks, setExpandedCollections]);

  const isLimitReached = (profile.planType === 'free' || !profile.planType) && links.length >= 5;

  const activeLinks = useMemo(() => {
    const manual = links.filter(l => !l.isArchived);
    const result = [...manual];

    if (level === 0) {
      const integrations = profile.integrations || [];
      const order = ['instagram', 'youtube', 'twitch', 'kick'];
      const hasLinkDeepEditor = (list: LinkItem[], provider: string): boolean => {
        const patterns: Record<string, string[]> = {
          youtube: ['youtube.com', 'youtu.be'],
          instagram: ['instagram.com', 'instagr.am'],
          tiktok: ['tiktok.com', 'vm.tiktok.com'],
          twitch: ['twitch.tv'],
          kick: ['kick.com']
        };

        return list.some(l => {
          const url = l.url?.toLowerCase() || '';
          const title = l.title?.toLowerCase() || '';
          const platform = l.platform || '';
          
          if (platform === provider) return true;
          if (title.includes(provider)) return true;
          
          const matchPatterns = patterns[provider] || [provider];
          if (matchPatterns.some(p => url.includes(p))) return true;

          if (l.children && l.children.length > 0) return hasLinkDeepEditor(l.children, provider);
          return false;
        });
      };

      const providersToInject = order.filter(p =>
        integrations.some(i => i.provider?.toLowerCase() === p.toLowerCase()) && !hasLinkDeepEditor(links, p)
      );

      [...providersToInject].reverse().forEach(provider => {
        const integration = integrations.find(i => i.provider === provider);
        const username = integration?.profile_data?.username;
        if (username) {
          let url = '';
          if (provider === 'instagram') url = `https://instagram.com/${username}`;
          else if (provider === 'youtube') url = `https://youtube.com/@${username}`;
          else if (provider === 'twitch') url = `https://twitch.tv/${username}`;
          else if (provider === 'kick') url = `https://kick.com/${username}`;

          if (url) {
            result.unshift({
              id: `btn-integration-${provider}`,
              title: provider === 'instagram' ? 'Instagram' : (provider === 'youtube' ? 'YouTube' : (provider === 'twitch' ? 'Twitch Live' : 'Kick Live')),
              url,
              isActive: true,
              clicks: 0,
              layout: 'classic',
              type: 'link',
              platform: provider
            } as any);
          }
        }
      });
    }
    return result;
  }, [links, profile.integrations, level]);

  const archivedLinks = useMemo(() => {
    return links.filter(l => l.isArchived);
  }, [links]);

  const isAnyExpanded = Object.values(expandedLinks).some(Boolean) || Object.values(expandedCollections).some(Boolean);


  const toggleCollection = (id: string) => {
    const isCurrentlyExpanded = !!expandedCollections[id];
    setExpandedCollections(prev => {
      const next = { ...prev };
      if (isCurrentlyExpanded) {
        next[id] = false;
      } else {
        activeLinks.forEach(l => { if (l.id !== id && l.type === 'collection') next[l.id] = false; });
        next[id] = true;
      }
      return next;
    });
    if (!isCurrentlyExpanded) {
      setExpandedLinks(prev => {
        const next = { ...prev };
        activeLinks.forEach(l => { if (l.type !== 'collection') next[l.id] = false; });
        return next;
      });
    }
  };

  const toggleLink = (id: string) => {
    const isCurrentlyExpanded = !!expandedLinks[id];
    setExpandedLinks(prev => {
      const next = { ...prev };
      if (isCurrentlyExpanded) {
        next[id] = false;
      } else {
        activeLinks.forEach(l => { if (l.id !== id && l.type !== 'collection') next[l.id] = false; });
        next[id] = true;
      }
      return next;
    });
    if (!isCurrentlyExpanded) {
      setExpandedCollections(prev => {
        const next = { ...prev };
        activeLinks.forEach(l => { if (l.id !== id && l.type === 'collection') next[l.id] = false; });
        return next;
      });
    }
  };

  const addLink = async (url?: string) => {
    const newLinkId = crypto.randomUUID();
    const newLink: LinkItem = {
      id: newLinkId,
      clientId: crypto.randomUUID(),
      title: t('links.newLink'),
      url: url || '',
      isActive: true,
      clicks: 0,
      layout: 'classic',
      type: 'link'
    };

    setExpandedLinks(prev => {
      const next = { ...prev };
      activeLinks.forEach(l => { if (l.type !== 'collection') next[l.id] = false; });
      next[newLinkId] = true;
      return next;
    });
    setExpandedCollections(prev => {
      const next = { ...prev };
      activeLinks.forEach(l => { if (l.type === 'collection') next[l.id] = false; });
      return next;
    });
    onChange(prev => [newLink, ...(prev as LinkItem[])]);

    if (url) {
      const isMusic = url.includes('spotify') || url.includes('deezer') || url.includes('youtube') || url.includes('youtu.be') || url.includes('tiktok');
      if (isMusic) {
        try {
          const metadata = await fetchMusicMetadata(url);
          if (metadata) {
            if ((metadata.type === 'album' || metadata.type === 'playlist') && (metadata.tracks?.length ?? 0) > 0) {
              const newChildren = (metadata.tracks ?? []).map((track: any) => ({
                id: crypto.randomUUID(), clientId: crypto.randomUUID(),
                title: track.title, subtitle: track.artist, image: track.image,
                url: track.url, embedType: metadata.platform as any, layout: 'classic' as const,
                isActive: true, clicks: 0
              }));
              updateLinkFields(newLinkId, { title: metadata.title, subtitle: metadata.followers || metadata.artist, type: 'collection', layout: 'list', children: newChildren, embedType: metadata.platform as any, url });
            } else {
              updateLinkFields(newLinkId, { title: metadata.title, subtitle: metadata.platform === 'youtube' ? metadata.followers : (metadata.followers || metadata.artist), image: metadata.thumbnailUrl, embedType: metadata.platform as any });
            }
          }
        } catch (error) {
          console.error('Error fetching metadata in addLink:', error);
        }
      }
    }
  };

  const addCollection = (name: string, url?: string, layout?: 'list' | 'carousel') => {
    const newCollectionId = Date.now().toString();
    const children: LinkItem[] = [];

    if (url) {
      const childId = (Date.now() + 1).toString();
      children.push({ id: childId, clientId: crypto.randomUUID(), title: t('links.newLink'), url, isActive: true, clicks: 0, layout: 'classic', type: 'link' });
      const isMusic = url.includes('spotify') || url.includes('deezer') || url.includes('youtube') || url.includes('youtu.be') || url.includes('tiktok');
      if (isMusic) {
        fetchMusicMetadata(url).then(metadata => {
          if (metadata) {
            if ((metadata.type === 'album' || metadata.type === 'playlist') && (metadata.tracks?.length ?? 0) > 0) {
              const newChildrenForCollection = (metadata.tracks ?? []).map((track: any) => ({
                id: crypto.randomUUID(), clientId: crypto.randomUUID(),
                title: track.title, subtitle: track.artist, image: track.image,
                url: track.url, embedType: metadata.platform as any, layout: 'classic' as const,
                isActive: true, clicks: 0
              }));
              updateLinkFields(newCollectionId, { title: metadata.title, subtitle: metadata.followers || metadata.artist, children: newChildrenForCollection, embedType: metadata.platform as any, layout: 'list' });
            } else {
              updateLinkFields(childId, { title: metadata.title, subtitle: metadata.platform === 'youtube' ? metadata.followers : (metadata.followers || metadata.artist), image: metadata.thumbnailUrl, embedType: metadata.platform as any });
            }
          }
        });
      }
    }

    const newCollection: LinkItem = { id: newCollectionId, clientId: crypto.randomUUID(), title: name || t('links.newCollection'), url: '', isActive: true, clicks: 0, layout: layout || 'list', type: 'collection', children };
    setExpandedCollections(prev => { const next = { ...prev }; activeLinks.forEach(l => { if (l.type === 'collection') next[l.id] = false; }); next[newCollectionId] = true; return next; });
    setExpandedLinks(prev => { const next = { ...prev }; activeLinks.forEach(l => { if (l.type !== 'collection') next[l.id] = false; }); return next; });
    onChange(prev => [newCollection, ...(prev as LinkItem[])]);
  };

  const addSocialLink = (platformId: string) => {
    const platform = SOCIAL_NETWORKS.find(p => p.id === platformId);
    const newLink: LinkItem = { id: Date.now().toString(), clientId: crypto.randomUUID(), title: platform?.name || t('links.newLink'), url: platform?.baseUrl || '', isActive: true, clicks: 0, layout: 'classic', type: 'link', platform: platformId };
    setExpandedLinks(prev => { const next = { ...prev }; activeLinks.forEach(l => { if (l.type !== 'collection') next[l.id] = false; }); next[newLink.id] = true; return next; });
    setExpandedCollections(prev => { const next = { ...prev }; activeLinks.forEach(l => { if (l.type === 'collection') next[l.id] = false; }); return next; });
    onChange(prev => [newLink, ...(prev as LinkItem[])]);
  };

  const addProduct = (collectionName: string) => {
    if (onAddProduct) { onAddProduct(collectionName); setIsAddModalOpen(false); }
    else if (setActiveTab) { setActiveTab('shop'); setIsAddModalOpen(false); }
  };

  const addHeader = () => {
    const newHeader: LinkItem = { id: Date.now().toString(), clientId: crypto.randomUUID(), title: t('links.newSection'), url: '', isActive: true, clicks: 0, layout: 'classic', type: 'header' };
    setExpandedLinks(prev => { const next = { ...prev }; activeLinks.forEach(l => { if (l.type !== 'collection') next[l.id] = false; }); next[newHeader.id] = true; return next; });
    setExpandedCollections(prev => { const next = { ...prev }; activeLinks.forEach(l => { if (l.type === 'collection') next[l.id] = false; }); return next; });
    onChange(prev => [newHeader, ...(prev as LinkItem[])]);
  };

  const addAgenda = () => {
    const newAgenda: LinkItem = { id: Date.now().toString(), clientId: crypto.randomUUID(), title: t('agenda.title') || 'Agenda', url: '', isActive: true, clicks: 0, layout: 'classic', type: 'agenda', events: [] };
    setExpandedLinks(prev => { const next = { ...prev }; activeLinks.forEach(l => { if (l.type !== 'collection') next[l.id] = false; }); next[newAgenda.id] = true; return next; });
    setExpandedCollections(prev => { const next = { ...prev }; activeLinks.forEach(l => { if (l.type === 'collection') next[l.id] = false; }); return next; });
    onChange(prev => [newAgenda, ...(prev as LinkItem[])]);
  };

  const addMap = () => {
    const newMap: LinkItem = { id: Date.now().toString(), clientId: crypto.randomUUID(), title: t('links.mapLabel') || 'Endereço', url: '', isActive: true, clicks: 0, layout: 'classic', type: 'map' };
    setExpandedLinks(prev => { const next = { ...prev }; activeLinks.forEach(l => { if (l.type !== 'collection') next[l.id] = false; }); next[newMap.id] = true; return next; });
    setExpandedCollections(prev => { const next = { ...prev }; activeLinks.forEach(l => { if (l.type === 'collection') next[l.id] = false; }); return next; });
    onChange(prev => [newMap, ...(prev as LinkItem[])]);
  };

  const addMediaKit = () => {
    const newMediaKit: LinkItem = { id: Date.now().toString(), clientId: crypto.randomUUID(), title: t('mediakit.title') || 'Mídia Kit', url: '', isActive: true, clicks: 0, layout: 'classic', type: 'mediakit' };
    setExpandedLinks(prev => { const next = { ...prev }; activeLinks.forEach(l => { if (l.type !== 'collection') next[l.id] = false; }); next[newMediaKit.id] = true; return next; });
    setExpandedCollections(prev => { const next = { ...prev }; activeLinks.forEach(l => { if (l.type === 'collection') next[l.id] = false; }); return next; });
    onChange(prev => [newMediaKit, ...(prev as LinkItem[])]);
  };

  const updateLink = React.useCallback((id: string, field: keyof LinkItem, value: any) => {
    onChange((prev: LinkItem[]) => prev.map(link => {
      if (link.id !== id) return link;
      const newValue = typeof value === 'function' ? value(link[field] || []) : value;
      return { ...link, [field]: newValue };
    }));
  }, [onChange]);

  const updateLinkFields = React.useCallback((id: string, updates: Partial<LinkItem>) => {
    onChange((prev: LinkItem[]) => prev.map(link => {
      if (link.id !== id) return link;
      const resolvedUpdates = { ...updates };
      Object.keys(resolvedUpdates).forEach((key) => {
        const field = key as keyof LinkItem;
        if (typeof resolvedUpdates[field] === 'function') {
          (resolvedUpdates as any)[field] = (resolvedUpdates as any)[field](link[field] || []);
        }
      });
      return { ...link, ...resolvedUpdates };
    }));
  }, [onChange]);

  const removeLink = React.useCallback((id: string) => {
    onChange((prev: LinkItem[]) => (prev as LinkItem[]).filter(link => link.id !== id));
  }, [onChange]);

  const handleReorder = (newActiveLinks: LinkItem[]) => {
    if ((window as any).__nodusIsDraggingIntoCollection) return;
    
    // Persist all links including integration ones to the actual state
    onChange([...newActiveLinks, ...archivedLinks]);
  };

  return (
    <div className="space-y-6 w-full">
      <div className={`${level === 0 ? 'bg-transparent md:bg-transparent border-0 md:border-0 px-0 md:px-0 py-0 md:py-0 shadow-none md:shadow-none rounded-md' : ''}`}>
        <div className="space-y-3">
        {level === 0 ? (
          <div className="px-3 md:px-5">
            <div className="flex flex-col gap-4 mb-4">
              <div className="flex items-center justify-between border-b-2 border-[#1a1a1a] pb-3">
                <div>
                  <h2 className="text-base md:text-lg font-black uppercase text-black tracking-tight">{t('links.myLinks')}</h2>
                  <p className="text-[10px] font-bold text-black/60 mt-0.5 uppercase tracking-widest leading-none">{t('links.myLinksSubtitle')}</p>
                </div>
                <div className="flex items-center gap-2 md:gap-2.5">
                    <button onClick={() => setShowArchive(true)} className="w-10 h-10 flex items-center justify-center border-2 border-[#1a1a1a] bg-white hover:bg-[#ffdf00] shadow-[0_2px_0_0_#1a1a1a] transition-all hover:translate-y-[0.5px] hover:shadow-none relative rounded-md">
                      <Archive size={18} strokeWidth={3} className="text-black" />
                      {archivedLinks.length > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center border-2 border-[#1a1a1a] bg-[#97cd7a] text-[9px] font-black uppercase text-black shadow-[0_1.5px_0_0_#1a1a1a] rounded-sm">
                          {archivedLinks.length}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => setIsAddModalOpen(true)}
                      disabled={isLimitReached}
                      className={`w-10 h-10 flex items-center justify-center border-2 transition-all hover:translate-y-[0.5px] hover:shadow-none rounded-md ${isLimitReached ? 'border-[#1a1a1a] bg-slate-200 text-black/30 cursor-not-allowed' : 'border-[#1a1a1a] bg-[#ffdf00] text-black shadow-[0_2px_0_0_#1a1a1a]'}`}
                    >
                      <Plus size={22} className="text-black" strokeWidth={4} />
                    </button>
                </div>
              </div>
            </div>
            {isLimitReached && (
              <div className="bg-amber-50 border border-amber-100 p-6 rounded-md flex items-center gap-6 mb-8">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-amber-900">{t('links.limitReached')}</p>
                  <p className="text-sm text-amber-700 mt-0.5">{t('links.limitReachedDesc')}</p>
                </div>
                <button className="text-xs font-bold text-amber-700 bg-white border border-amber-200 px-4 py-2 rounded-md hover:bg-amber-100 transition-colors shadow-sm">{t('links.seePlans')}</button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className={`
              w-full ${level > 0 ? 'py-1.5 text-[10px]' : 'py-2.5 text-xs'} 
              border-2 border-dashed border-[#1a1a1a] bg-white font-black uppercase text-black 
              hover:bg-[#ffdf00] transition-colors flex items-center justify-center gap-2 
              shadow-[0_3px_0_0_#1a1a1a] hover:translate-y-[0.5px] hover:shadow-none rounded-md
            `}
          >
            <Plus size={level > 0 ? 16 : 20} strokeWidth={4} /> {t('links.addLinkInCollection')}
          </button>
        )}
      </div>

      <div className="space-y-3">
        {activeLinks.length === 0 && (
          <div className="text-center py-10 md:py-14 bg-[#fff9c4] border-2 border-[#1a1a1a] shadow-[0_4px_0_0_#1a1a1a] rounded-md">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-white border-2 border-[#1a1a1a] rounded-full flex items-center justify-center mx-auto mb-5 shadow-[0_3px_0_0_#1a1a1a] text-black">
              <Ban size={32} strokeWidth={3} />
            </div>
            <p className="text-lg md:text-xl font-black uppercase tracking-widest text-black">{t('links.emptyList')}</p>
            <p className="text-xs md:text-sm text-black/70 font-bold uppercase tracking-wider mt-2">{t('links.addFirstLink')}</p>
          </div>
        )}

        <Reorder.Group axis="y" values={activeLinks} onReorder={handleReorder} className="space-y-3">
          {activeLinks.map((link) => (
            <SortableLinkItem
              key={link.clientId || link.id}
              link={link}
              updateLink={updateLink}
              updateLinkFields={updateLinkFields}
              removeLink={removeLink}
              toggleLink={toggleLink}
              isExpanded={!!expandedLinks[link.id]}
              toggleCollection={toggleCollection}
              isCollectionExpanded={!!expandedCollections[link.id]}
              profile={profile}
              level={level}
              expandedLinks={expandedLinks}
              setExpandedLinks={setExpandedLinks}
              expandedCollections={expandedCollections}
              setExpandedCollections={setExpandedCollections}
              isAnyExpanded={isAnyExpanded}
              isMobile={isMobile}
            />
          ))}
        </Reorder.Group>
      </div>
      </div>

      {/* Profile Footer Branding Section */}
      {level === 0 && (
        <div className="bg-transparent md:bg-transparent border-0 md:border-0 p-0 md:p-0 shadow-none md:shadow-none rounded-md">
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-xs md:text-sm font-black uppercase text-black tracking-widest leading-none">Link Footer</h2>
              <p className="text-[9px] md:text-[10px] text-black font-normal uppercase tracking-wider mt-1 opacity-60 leading-none">Gerencie a exibição da marca Nodus no seu perfil público.</p>
            </div>

            <div className={`p-5 border-2 border-[#1a1a1a] shadow-[0_4px_0_0_#1a1a1a] rounded-md flex items-center justify-between transition-all ${profile.planType === 'free' || !profile.planType ? 'bg-slate-50' : 'bg-white'}`}>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-black uppercase text-black tracking-widest leading-tight">Exibir branding da Nodus</span>
                {profile.planType === 'free' || !profile.planType ? (
                  <div className="flex items-center gap-1.5 text-[9px] font-bold text-[#e11d48] uppercase tracking-wider mt-1">
                    <Zap size={12} fill="currentColor" />
                    Ativo obrigatoriamente (Plano Free)
                  </div>
                ) : (
                  <span className="text-[9px] font-bold text-black/40 uppercase tracking-widest mt-1">Desative para esconder o rodapé completo</span>
                )}
              </div>

              <button
                onClick={() => {
                  if (profile.planType === 'free' || !profile.planType) return;
                  if (setProfile) setProfile(prev => ({ ...prev, hideBranding: !prev.hideBranding }));
                }}
                disabled={profile.planType === 'free' || !profile.planType}
                className={`w-12 h-6 border-2 border-[#1a1a1a] relative transition-all shadow-[0_3px_0_0_#1a1a1a] rounded-full active:shadow-none active:translate-y-[0.5px] ${!profile.hideBranding ? 'bg-[#97cd7a]' : 'bg-white'} ${profile.planType === 'free' || !profile.planType ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className={`absolute top-[3px] w-4 h-4 border-2 border-[#1a1a1a] bg-white rounded-full transition-all ${!profile.hideBranding ? 'left-[24px]' : 'left-[4px]'}`} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Archive Modal */}
      {mounted && createPortal(
        <AnimatePresence>
          {showArchive && (
            <div className={`fixed inset-0 z-[9999] flex ${isMobile ? 'items-end' : 'items-center justify-center p-4 md:p-8'}`}>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowArchive(false)} className="absolute inset-0 bg-slate-900/80 md:bg-slate-900/40 md:backdrop-blur-sm" />
              <motion.div
                initial={isMobile ? { y: '100%' } : { opacity: 0, scale: 0.95, y: 20 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={isMobile ? { y: '100%' } : { opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300, mass: 0.5 }}
                drag={isMobile ? 'y' : false}
                dragConstraints={isMobile ? { top: 0, bottom: 0 } : undefined}
                dragElastic={isMobile ? 0.05 : 1}
                onDragEnd={(_, info) => { if (isMobile && (info.offset.y > 100 || info.velocity.y > 500)) setShowArchive(false); }}
                className={`relative bg-white border-x-2 border-t-2 border-[#1a1a1a] flex flex-col shadow-[0_-8px_30px_rgba(0,0,0,0.1)] overflow-hidden ${isMobile ? 'w-full rounded-t-[40px] h-[96vh] p-8 pb-12' : 'w-full max-w-xl max-h-[85vh] p-6 md:p-10 rounded-md border-b-2 shadow-[0_4px_0_0_#1a1a1a]'}`}
              >
                <div className="mb-6 flex items-center justify-between shrink-0">
                  <div>
                    <h3 className={`${isMobile ? 'text-2xl' : 'text-xl md:text-2xl'} font-black uppercase tracking-tighter text-black`}>{t('links.archivedItems')}</h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-black/70 mt-0.5">{archivedLinks.length} {t('links.linksInArchive')}</p>
                  </div>
                  <button onClick={() => setShowArchive(false)} className="p-2 bg-white text-black border-2 border-[#1a1a1a] hover:bg-red-500 hover:text-white transition-all shadow-[0_2px_0_0_#1a1a1a] rounded-md">
                    <X size={18} strokeWidth={3} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-hide py-2">
                    {archivedLinks.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center py-20 border-4 border-dashed border-[#1a1a1a] rounded-sm">
                        <div className="w-20 h-20 bg-white border-2 border-[#1a1a1a] shadow-[0_4px_0_0_#1a1a1a] flex items-center justify-center mb-6 rounded-md">
                          <Archive size={32} strokeWidth={3} className="text-black" />
                        </div>
                        <p className="text-sm font-black text-black uppercase tracking-widest leading-none">{t('links.emptyArchive')}</p>
                      </div>
                    ) : (
                      archivedLinks.map((link) => (
                        <motion.div key={link.id} layout className="flex items-center justify-between p-3 bg-white border-2 border-[#1a1a1a] transition-all hover:bg-[#ffdf00] group/item shadow-[0_2px_0_0_#1a1a1a] mb-4 rounded-md">
                        <div className="flex items-center gap-5 min-w-0">
                          <div className="min-w-0">
                            <h4 className="text-sm font-black uppercase tracking-widest text-black truncate mb-0.5">{link.title || t('links.untitled')}</h4>
                            <p className="text-xs text-black/70 font-bold uppercase tracking-widest truncate">
                              {link.type === 'collection' 
                                ? `${link.children?.length || 0} ${link.children?.length === 1 ? t('links.itemConfigured') : t('links.itemsConfigured')}` 
                                : (link.url || t('links.noUrl'))}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button onClick={() => updateLink(link.id, 'isArchived', false)} className="h-8 px-3 bg-white border-2 border-[#1a1a1a] text-black text-[10px] font-black uppercase tracking-widest hover:bg-[#ffdf00] transition-all shadow-[0_1.5px_0_0_#1a1a1a] rounded-sm">{t('links.restore')}</button>
                          <button onClick={() => removeLink(link.id)} className="p-2 bg-white border-2 border-[#1a1a1a] text-black hover:text-white hover:bg-red-500 transition-all shadow-[0_1.5px_0_0_#1a1a1a] rounded-sm"><Trash2 size={16} strokeWidth={3} /></button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>

                <div className="mt-8 pt-6 border-t border-[#1a1a1a] border-dashed shrink-0">
                  <button onClick={() => setShowArchive(false)} className="w-full h-11 bg-[#ffdf00] text-black font-black uppercase tracking-widest text-xs transition-all border-2 border-[#1a1a1a] hover:bg-white shadow-[0_4px_0_0_#1a1a1a] rounded-md">
                    {t('links.backToMyLinks')}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {mounted && createPortal(
        <AnimatePresence>
          {isAddModalOpen && (
            <AddLinkModal
              isOpen={isAddModalOpen}
              onClose={() => setIsAddModalOpen(false)}
              onAddLink={addLink}
              onAddCollection={addCollection}
              onAddProduct={addProduct}
              onAddIncentive={onAddIncentive || (() => { })}
              onAddSocial={addSocialLink}
              onAddHeader={addHeader}
              onAddAgenda={addAgenda}
              onAddMap={addMap}
              onAddMediaKit={addMediaKit}
              planType={profile.planType}
            />
          )}

          {level === 0 && moveModalLinkId && (
            <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                onClick={() => setMoveModalLinkId(null)} 
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative bg-white border-4 border-black p-8 rounded-md shadow-[0_12px_0_0_#000] max-w-sm w-full"
              >
                <div className="flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-black uppercase tracking-tighter text-black">Mover Para</h3>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-black/40 mt-1">Selecione o destino</p>
                    </div>
                    <button 
                      onClick={() => setMoveModalLinkId(null)} 
                      className="w-10 h-10 flex items-center justify-center bg-white border-2 border-black hover:bg-black hover:text-white transition-all shadow-[0_4px_0_0_#000] active:translate-y-[2px] active:shadow-none rounded-md"
                    >
                      <X size={20} strokeWidth={3} />
                    </button>
                  </div>

                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    <button
                      onClick={() => { window.dispatchEvent(new CustomEvent('nodus:move-link', { detail: { sourceId: moveModalLinkId, targetId: 'root' } })); setMoveModalLinkId(null); }}
                      className="w-full group flex items-center gap-4 p-4 bg-[#f8f9fa] border-2 border-black hover:bg-[#ffdf00] transition-all rounded-md shadow-[0_4px_0_0_#000] active:translate-y-[2px] active:shadow-none"
                    >
                      <div className="w-12 h-12 bg-white border-2 border-black rounded-md flex items-center justify-center shadow-[2px_2px_0_0_#000] transition-transform group-hover:scale-110">
                        <LayoutGrid size={24} strokeWidth={3} className="text-black" />
                      </div>
                      <div className="text-left">
                        <span className="block font-black uppercase text-[12px] tracking-widest text-black">Página Principal</span>
                        <span className="block text-[9px] font-bold uppercase text-black/40 tracking-widest">Raiz do Perfil</span>
                      </div>
                    </button>

                    <div className="pt-2">
                      <label className="text-[9px] font-black uppercase tracking-[0.2em] text-black/50 px-1 mb-3 block">Suas Coleções</label>
                      <div className="space-y-3">
                        {links.filter(l => l.type === 'collection' && l.id !== moveModalLinkId).length > 0 ? (
                          links.filter(l => l.type === 'collection' && l.id !== moveModalLinkId).map(c => (
                            <button
                              key={c.id}
                              onClick={() => { window.dispatchEvent(new CustomEvent('nodus:move-link', { detail: { sourceId: moveModalLinkId, targetId: c.id } })); setMoveModalLinkId(null); }}
                              className="w-full group flex items-center gap-4 p-4 bg-white border-2 border-black hover:bg-[#97cd7a] transition-all rounded-md shadow-[0_4px_0_0_#000] active:translate-y-[2px] active:shadow-none"
                            >
                              <div className="w-11 h-11 bg-white border-2 border-black rounded-sm flex items-center justify-center shadow-[2px_2px_0_0_#000] group-hover:bg-white/50 transition-colors">
                                <Folder size={20} strokeWidth={3} className="text-black" />
                              </div>
                              <div className="text-left">
                                <span className="block font-black uppercase text-[11px] tracking-widest text-black truncate max-w-[120px]">{c.title || t('links.collectionUnnamed')}</span>
                                <span className="block text-[8px] font-bold uppercase text-black/40 tracking-widest">Coleção</span>
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="p-8 border-2 border-dashed border-black/10 rounded-md flex flex-col items-center justify-center text-center bg-slate-50">
                            <Archive size={24} className="text-black/10 mb-2" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-black/30">Nenhuma coleção encontrada</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}

export default LinkEditor;
