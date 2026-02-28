import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
// @ts-ignore
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion';
import { LinkItem, UserProfile } from '../types';
import { SiSpotify } from 'react-icons/si';
import { compressImage } from '../utils/imageUtils';
import { fetchMusicMetadata } from '../utils/musicUtils';
import { fetchYoutubeChannelInfo, isYoutubeChannelUrl } from '../utils/socialUtils';
import {
  Trash2,
  GripVertical,
  Plus,
  Link as LinkIcon,
  Image as ImageIcon,
  BarChart2,
  Pencil,
  Archive,
  LayoutGrid,
  LayoutTemplate,
  MessageCircle,
  FolderHeart,
  Zap,
  ChevronRight,
  ChevronDown,
  Folder,
  Sparkles,
  CreditCard,
  Youtube,
  Ban,
  X,
  User,
  ExternalLink,
  Share2,
  Check,
  DollarSign,
  Store,
  Smartphone,
  Mail,
  Type,
  Hash,
  Send as SendIcon
} from 'lucide-react';
import { apiClient } from '../services/apiClient';
import AddLinkModal from './AddLinkModal';
import { SOCIAL_NETWORKS } from '../constants';

const DeezerIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 1433 1431" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill="currentColor" fillRule="evenodd" d="M1201.8 218.3c13.2-76.7 32.7-125 54.2-125.1h.1c40.2.2 72.7 167.5 72.7 374.1 0 206.7-32.6 374.1-72.8 374.1-16.5 0-31.7-28.4-44-76.1-19.3 174.5-59.5 294.4-106 294.4-36 0-68.3-72-90-185.6-14.8 216-52.1 369.3-95.6 369.3-27.3 0-52.3-60.7-70.7-159.6-22.2 204.1-73.5 347.2-133.2 347.2-59.8 0-111.1-143-133.2-347.2-18.3 98.9-43.3 159.6-70.7 159.6-43.6 0-80.8-153.3-95.6-369.3-21.7 113.6-53.9 185.6-90 185.6-46.5 0-86.7-119.9-106.1-294.4-12.1 47.8-27.4 76.1-43.9 76.1-40.3 0-72.9-167.4-72.9-374.1 0-206.6 32.6-374.1 72.9-374.1 21.6 0 40.9 48.4 54.3 125.1C252.7 86 287.6 0 327 0c46.8 0 87.3 121.6 106.5 298.2 18.8-128.5 47.2-210.4 79.1-210.4 44.7 0 82.7 161.1 96.8 385.9 26.4-115.2 64.8-187.5 107.2-187.5s80.7 72.3 107.1 187.5c14.1-224.8 52.1-385.9 96.8-385.9 31.8 0 60.2 81.9 79.1 210.4C1018.7 121.6 1059.3 0 1106.1 0c39.2 0 74.2 86 95.7 218.3M41.3 597.8C18.5 597.8 0 523 0 430.5s18.5-167.2 41.3-167.2c22.9 0 41.4 74.7 41.4 167.2S64.2 597.8 41.3 597.8m1350.3 0c-22.9 0-41.3-74.8-41.3-167.3s18.4-167.2 41.3-167.2c22.8 0 41.3 74.7 41.3 167.2s-18.5 167.3-41.3 167.3" />
  </svg>
);

interface SortableLinkItemProps {
  link: LinkItem;
  updateLink: (id: string, field: keyof LinkItem, value: any) => void;
  updateLinkFields: (id: string, updates: Partial<LinkItem>) => void;
  removeLink: (id: string) => void;
  toggleLink: (id: string) => void;
  isExpanded: boolean;
  toggleCollection: (id: string) => void;
  isCollectionExpanded: boolean;
  profile: UserProfile;
  level: number;
  expandedLinks: Record<string, boolean>;
  setExpandedLinks: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  expandedCollections: Record<string, boolean>;
  setExpandedCollections: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  isAnyExpanded: boolean;
  isMobile: boolean;
}

function SortableLinkItem({
  link,
  updateLink,
  updateLinkFields,
  removeLink,
  toggleLink,
  isExpanded,
  toggleCollection,
  isCollectionExpanded,
  profile,
  level,
  expandedLinks,
  setExpandedLinks,
  expandedCollections,
  setExpandedCollections,
  isAnyExpanded,
  isMobile
}: SortableLinkItemProps) {
  const { t } = useTranslation();
  const dragControls = useDragControls();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isRefreshingMeta, setIsRefreshingMeta] = useState(false);



  // LinkEditor is used recursively here. It must be hoisted or available.

  // Auto-detect music metadata when URL changes
  React.useEffect(() => {
    if (!link.url) return;

    const checkMusicMetadata = async () => {
      const url = link.url;
      const isSpotify = url.includes('open.spotify.com/') && (url.includes('/track/') || url.includes('/album/') || url.includes('/playlist/'));
      const isDeezer = url.includes('deezer.com/') || url.includes('deezer.page.link/');
      const isTiktok = url.includes('tiktok.com');
      const isYoutubeChannel = isYoutubeChannelUrl(url);
      const isYoutubeVideo = (url.includes('youtube.com') || url.includes('youtu.be')) && !isYoutubeChannel;

      const needsAutoFetch = !link.title || link.title === t('links.newLink') || link.title === t('links.noTitle') || link.title === t('links.unknownLink');

      // YouTube Channel — use socialUtils
      if (isYoutubeChannel && needsAutoFetch) {
        try {
          const info = await fetchYoutubeChannelInfo(url);
          if (info) {
            updateLinkFields(link.id, {
              title: info.name,
              subtitle: info.subscribers,
              image: info.avatarUrl,
            });
          }
        } catch (err) {
          console.error('[LinkEditor] YouTube channel fetch error:', err);
        }
        return;
      }

      // Music / TikTok video / YouTube video — use musicUtils
      if ((isSpotify || isDeezer || isTiktok || isYoutubeVideo) && needsAutoFetch) {
        let type: 'spotify' | 'deezer' | 'tiktok' | 'youtube' | 'none' = 'none';
        if (isSpotify) type = 'spotify';
        else if (isDeezer) type = 'deezer';
        else if (isTiktok) type = 'tiktok';
        else if (isYoutubeVideo) type = 'youtube';

        try {
          // Special handling for TikTok to distinguish video vs profile
          if (isTiktok) {
            const metadata = await fetchMusicMetadata(url);
            if (metadata) {
              const updates: Partial<LinkItem> = {};
              if (metadata.title) updates.title = metadata.title;

              // Only embed if it's a video
              if (metadata.type === 'video') {
                updates.embedType = 'tiktok';
                // Use the resolved URL (numeric ID) for the video embed to work correctly
                if (metadata.resolvedUrl) {
                  updates.url = metadata.resolvedUrl;
                }
                // Store the direct video source for clean player
                if (metadata.videoUrl) {
                  updates.videoUrl = metadata.videoUrl;
                }
              } else {
                updates.embedType = 'none';
              }

              updateLinkFields(link.id, updates);
              return;
            }
          }

          // Only update type if not set
          if (link.embedType !== type) {
            updateLinkFields(link.id, { embedType: type });
          }

          const metadata = await fetchMusicMetadata(url);
          if (metadata) {
            console.log('🎵 Metadata fetched via useEffect:', metadata);
            updateLinkFields(link.id, {
              title: metadata.title,
              subtitle: metadata.platform === 'youtube' ? metadata.followers : (metadata.followers || metadata.artist),
              image: metadata.thumbnailUrl,
              embedType: type
            });
          }
        } catch (error) {
          console.error('Error fetching metadata:', error);
        }
      }
    };

    const timeoutId = setTimeout(checkMusicMetadata, 800); // Debounce
    return () => clearTimeout(timeoutId);
  }, [link.url]);

  return (
    <Reorder.Item
      value={link}
      dragListener={false}
      dragControls={dragControls}
      id={link.id}
      layout
      onDrag={(e, info) => {
        // We keep this clear since drag-to-drop into collections using Reorder caused visual swapping issues.
        // We now rely on the 'Move' button action for moving items into collections.
      }}
      onDragEnd={(e, info) => {
      }}
      className={`relative border-2 border-black ${isExpanded ? 'bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]' : 'bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'} select-none`}
      whileDrag={{
        scale: 1,
        boxShadow: "6px 6px 0px 0px rgba(0,0,0,1)",
        zIndex: 50
      }}
    >
      <div className={`transition-all duration-300 ${level === 0 && isAnyExpanded && !isExpanded && !isCollectionExpanded ? 'opacity-40' : 'opacity-100'} ${isExpanded ? 'bg-[#ffdf00]' : 'bg-white'}`}>
        {/* RENDER COLLECTION ITEM */}
        {link.type === 'collection' ? (
          <div className="overflow-hidden">
            <div className={`flex border-b border-black items-stretch ${level > 0 ? 'min-h-[44px]' : 'min-h-[50px]'}`}>
              {/* Drag Handle */}
              <div
                className={`${level > 0 ? 'w-8' : 'w-10'} flex items-center justify-center cursor-move text-black hover:bg-black hover:text-white touch-none border-r border-black transition-colors`}
                onPointerDown={(e) => dragControls.start(e)}
              >
                <GripVertical size={level > 0 ? 14 : 18} strokeWidth={3} />
              </div>

              {/* Header Content */}
              <div
                onClick={() => toggleCollection(link.id)}
                className={`flex-1 ${level > 0 ? 'py-1.5 md:py-2' : 'py-2 md:py-2.5'} pr-3 md:pr-4 flex items-center gap-2 md:gap-3 overflow-hidden bg-white hover:bg-slate-50 transition-colors duration-200 cursor-pointer`}
              >
                <div className="text-black p-0.5 transition-colors shrink-0">
                  {isCollectionExpanded ? <ChevronDown size={level > 0 ? 14 : 18} strokeWidth={3} /> : <ChevronRight size={level > 0 ? 14 : 18} strokeWidth={3} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="w-full font-medium text-black uppercase tracking-widest p-0 text-xs md:text-sm truncate mb-0.5">
                    {link.title || t('links.collectionUnnamed')}
                  </div>
                  <div className="text-[9px] md:text-[10px] text-black/70 font-normal uppercase tracking-[0.2em] truncate leading-none">
                    {link.children?.length || 0} {(link.children?.length === 1) ? t('links.itemConfigured') : t('links.itemsConfigured')}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 md:gap-4 shrink-0">
                  <span className="shrink-0 px-1.5 py-0.5 md:px-2 md:py-1 bg-[#ffdf00] text-[9px] md:text-[10px] font-medium text-black border-2 border-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] leading-none">
                    {t('links.collectionLabel')}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={link.isActive}
                      onChange={(e) => updateLink(link.id, 'isActive', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className={`w-8 h-4 border border-black bg-white peer-focus:outline-none peer peer-checked:after:translate-x-4 after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-black after:h-3 after:w-3 after:border after:border-black after:transition-all peer-checked:bg-[#97cd7a]`}></div>
                  </label>
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(!showDeleteConfirm); }}
                    className={`p-1.5 md:p-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all ${showDeleteConfirm ? 'bg-red-500 text-white' : 'bg-white text-black hover:bg-red-400'}`}
                  >
                    <Trash2 size={isMobile ? 14 : 18} strokeWidth={3} />
                  </button>
                </div>
              </div>
            </div>
            <AnimatePresence>
              {showDeleteConfirm && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden bg-red-50 border-t border-black border-dashed"
                >
                  <div className="p-3 flex items-center justify-between gap-3 px-4">
                    <span className="text-[10px] font-medium uppercase tracking-widest text-red-600">{t('links.deleteCollection')}</span>
                    <div className="flex gap-2">
                      <button onClick={() => removeLink(link.id)} className="px-3 py-1.5 bg-red-600 text-white border border-black text-[9px] font-medium uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[1px] active:translate-y-[1px]">{t('common.confirm')}</button>
                      <button onClick={() => setShowDeleteConfirm(false)} className="px-3 py-1.5 bg-white text-black border border-black text-[9px] font-medium uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[1px] active:translate-y-[1px]">{t('common.cancel')}</button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Expanded Content (Nested Editor) */}
            <AnimatePresence>
              {isCollectionExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden bg-slate-50/50"
                >
                  <div className="overflow-hidden bg-slate-50/50">
                    <div className="p-2 md:p-3 md:pl-5 border-t border-black space-y-3 md:space-y-4">
                      {/* Name Input */}
                      <div className="space-y-1 pb-6 border-b border-black">
                        <label className="text-[9px] font-medium text-black uppercase tracking-[0.2em] px-1">{t('links.collectionName')}</label>
                        <input
                          type="text"
                          value={link.title}
                          onChange={(e) => updateLink(link.id, 'title', e.target.value)}
                          className="w-full font-medium text-sm text-black bg-white border border-black px-3 py-2.5 focus:bg-[#f1f1f1] outline-none transition-all placeholder:text-black/30 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                          placeholder={t('links.collectionNamePlaceholder')}
                        />
                      </div>

                      {/* Collection Layout Picker */}
                      {link.platform === 'instagram' || link.title === 'Posts do Instagram' ? (
                        <div className="space-y-3 pb-6 border-b border-black">
                          <label className="text-[9px] font-medium text-black uppercase tracking-[0.2em] px-1">{t('links.instagramLayout')}</label>
                          <div className="flex flex-col gap-2.5">
                            {[
                              { id: 'card', label: t('links.instagramLayoutFeed'), desc: t('links.instagramLayoutFeedDesc'), icon: <LayoutGrid size={24} strokeWidth={3} /> },
                              { id: 'classic', label: t('links.instagramLayoutProfile'), desc: t('links.instagramLayoutProfileDesc'), icon: <User size={24} strokeWidth={3} /> }
                            ].map((opt) => (
                              <button
                                key={opt.id}
                                onClick={() => updateLink(link.id, 'layout', opt.id)}
                                className={`flex-1 p-3 border-[1.5px] text-left flex items-center sm:items-start gap-3.5 transition-all ${((link.layout || 'card') === 'classic' ? 'classic' : 'card') === opt.id
                                  ? 'bg-[#97cd7a] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                                  : 'bg-white border-black hover:translate-x-[0.5px] hover:translate-y-[0.5px] hover:shadow-none hover:bg-[#ffdf00] shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
                                  }`}
                              >
                                <div className={`shrink-0 flex items-center justify-center p-2 border border-black ${((link.layout || 'card') === 'classic' ? 'classic' : 'card') === opt.id ? 'bg-black text-[#97cd7a]' : 'bg-white text-black'}`}>
                                  <opt.icon.type {...opt.icon.props} size={18} strokeWidth={3} />
                                </div>
                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                  <div className={`text-xs md:text-sm font-medium uppercase tracking-widest truncate ${((link.layout || 'card') === 'classic' ? 'classic' : 'card') === opt.id ? 'text-black' : 'text-black'}`}>{opt.label}</div>
                                  <div className="text-[10px] text-black/70 font-normal uppercase tracking-wider leading-tight line-clamp-1">{opt.desc}</div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3 pb-6 border-b border-black">
                          <label className="text-[9px] font-medium text-black uppercase tracking-[0.2em] px-1">{t('links.groupLayout')}</label>
                          <div className="flex flex-col gap-2.5">
                            {[
                              { id: 'stacked', label: t('links.layoutStacked'), desc: t('links.layoutStackedDesc'), icon: <LayoutGrid size={24} strokeWidth={3} /> },
                              { id: 'carousel', label: t('links.layoutCarousel'), desc: t('links.layoutCarouselDesc'), icon: <Sparkles size={24} strokeWidth={3} /> }
                            ].map((opt) => (
                              <button
                                key={opt.id}
                                onClick={() => updateLink(link.id, 'layout', opt.id)}
                                className={`flex-1 p-3 border-[1.5px] text-left flex items-center sm:items-start gap-3.5 transition-all ${((link.layout || 'stacked') === 'carousel' ? 'carousel' : 'stacked') === opt.id
                                  ? 'bg-[#97cd7a] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                                  : 'bg-white border-black hover:translate-x-[0.5px] hover:translate-y-[0.5px] hover:bg-[#f1f1f1] shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
                                  }`}
                              >
                                <div className={`shrink-0 flex items-center justify-center p-2 border border-black ${((link.layout || 'stacked') === 'carousel' ? 'carousel' : 'stacked') === opt.id ? 'bg-black text-[#97cd7a]' : 'bg-white text-black'}`}>
                                  <opt.icon.type {...opt.icon.props} size={18} strokeWidth={3} />
                                </div>
                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                  <div className={`text-xs md:text-sm font-medium uppercase tracking-widest truncate text-black`}>{opt.label}</div>
                                  <div className="text-[10px] text-black/70 font-normal uppercase tracking-wider leading-tight line-clamp-1">{opt.desc}</div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="md:px-0 pt-6">
                        <LinkEditor
                          links={link.children || []}
                          onChange={(newChildren) => updateLink(link.id, 'children', newChildren)}
                          level={level + 1}
                          profile={profile}
                          expandedLinks={expandedLinks}
                          setExpandedLinks={setExpandedLinks}
                          expandedCollections={expandedCollections}
                          setExpandedCollections={setExpandedCollections}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          /* RENDER STANDARD LINK ITEM */
          <div className="flex flex-col">
            {/* Header Row (Always Visible) */}
            <div className={`flex border-b border-black items-stretch ${level > 0 ? 'min-h-[44px]' : 'min-h-[50px]'} bg-white`}>
              {/* Drag Handle */}
              <div
                className={`${level > 0 ? 'w-8' : 'w-10'} flex items-center justify-center cursor-move text-black hover:bg-black hover:text-white border-r border-black touch-none transition-colors`}
                onPointerDown={(e) => dragControls.start(e)}
              >
                <GripVertical size={level > 0 ? 14 : 18} strokeWidth={3} />
              </div>

              {/* Header Content Wrapper (Matching Collection Style) */}
              <div
                onClick={() => toggleLink(link.id)}
                className={`flex-1 ${level > 0 ? 'py-1.5 md:py-2' : 'py-2 md:py-2.5'} pr-3 md:pr-4 flex items-center gap-2 md:gap-3 overflow-hidden bg-white hover:bg-slate-50 transition-colors duration-200 cursor-pointer`}
              >
                {/* Expand Toggle (Left) */}
                <div
                  className="text-black p-0.5 transition-colors shrink-0"
                >
                  {isExpanded ? <ChevronDown size={level > 0 ? 14 : 18} strokeWidth={3} /> : <ChevronRight size={level > 0 ? 14 : 18} strokeWidth={3} />}
                </div>

                {/* Image Thumbnail */}
                <div className="shrink-0">
                  <div className="relative">
                    <input
                      type="file"
                      id={`file-${link.id}`}
                      className="hidden"
                      accept="image/*"
                      onChange={async (e) => {
                        if (e.target.files && e.target.files[0]) {
                          try {
                            const compressed = await compressImage(e.target.files[0], 400, 0.8);
                            updateLink(link.id, 'image', compressed);
                          } catch (error) {
                            console.error('Error processing image:', error);
                          }
                        }
                      }}
                    />
                    {link.image ? (
                      <div className={`${level > 0 ? 'w-8 h-8' : 'w-9 h-9'} border border-black overflow-hidden shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]`}>
                        <img src={link.image} alt="Thumbnail" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); document.getElementById(`file-${link.id}`)?.click(); }}
                        className={`${level > 0 ? 'w-8 h-8' : 'w-9 h-9'} bg-white border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center text-black hover:bg-black hover:text-white transition-all`}
                      >
                        {(() => {
                          const network = SOCIAL_NETWORKS.find(n => n.id === link.platform) ||
                            SOCIAL_NETWORKS.find(n => link.url?.toLowerCase().includes(n.id)) ||
                            SOCIAL_NETWORKS.find(n => link.title?.toLowerCase().includes(n.id));
                          const Icon = network?.icon;
                          return Icon ? <Icon size={level > 0 ? 14 : 18} /> : <ImageIcon size={level > 0 ? 14 : 16} strokeWidth={3} />;
                        })()}
                      </button>
                    )}
                  </div>
                </div>

                {/* Title & URL (Click to Expand) */}
                <div className="flex-1 min-w-0 group/title">
                  <div className="flex items-center gap-2 mb-0.5">
                    <div className="font-medium uppercase tracking-widest text-black truncate text-[11px] md:text-xs flex items-center gap-1.5">
                      {link.title || (link.type === 'header' ? t('links.headerItem') : t('links.untitled'))}

                      {/* Tags */}
                      {link.scheduleStart && new Date(link.scheduleStart) > new Date() && (
                        <span className="shrink-0 px-1.5 py-0.5 bg-[#97cd7a] text-[8px] font-medium text-black border border-black uppercase flex items-center gap-1 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                          {t('links.scheduled').toUpperCase()}
                        </span>
                      )}
                      {link.scheduleEnd && new Date(link.scheduleEnd) < new Date() && (
                        <span className="shrink-0 px-1.5 py-0.5 bg-red-400 text-[8px] font-medium text-black border border-black uppercase flex items-center gap-1 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                          {t('links.expired').toUpperCase()}
                        </span>
                      )}
                      {(link.embedType === 'youtube' || link.platform === 'youtube' || link.url?.includes('youtube.com')) && (
                        <span className="shrink-0 px-1.5 py-0.5 bg-black text-[8px] font-medium text-white border border-black uppercase flex items-center gap-1 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                          YOUTUBE
                        </span>
                      )}
                      {(link.embedType === 'tiktok' || link.platform === 'tiktok' || link.url?.includes('tiktok.com')) && (
                        <span className="shrink-0 px-1.5 py-0.5 bg-black text-[8px] font-medium text-white border border-black uppercase flex items-center gap-1 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                          TIKTOK
                        </span>
                      )}
                      {(link.platform === 'twitch' || link.url?.includes('twitch.tv')) && (
                        <span className="shrink-0 px-1.5 py-0.5 bg-[#6441a5] text-[8px] font-medium text-white border border-black uppercase flex items-center gap-1 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                          TWITCH
                        </span>
                      )}
                      {(link.platform === 'instagram' || link.url?.includes('instagram.com')) && (
                        <span className="shrink-0 px-1.5 py-0.5 bg-[#E1306C] text-[8px] font-medium text-white border border-black uppercase flex items-center gap-1 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                          INSTAGRAM
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-[9px] md:text-[10px] text-black/60 font-normal uppercase tracking-[0.1em] truncate leading-none">
                    {link.type === 'header' ? t('links.separatorText') : (link.url || t('links.yourNetworks'))}
                  </div>
                </div>

                {/* Right Actions: Switch & Delete */}
                <div className="flex items-center gap-1.5 md:gap-4 shrink-0">
                  {link.type === 'header' ? (
                    <span className="shrink-0 px-1.5 py-0.5 md:px-2 md:py-1 bg-white text-[9px] md:text-[10px] font-medium text-black border-2 border-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] leading-none">
                      {t('links.headerLabel')}
                    </span>
                  ) : link.layout === 'social' ? (
                    <span className="shrink-0 px-1.5 py-0.5 md:px-2 md:py-1 bg-white text-[9px] md:text-[10px] font-medium text-black border-2 border-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] leading-none">
                      {t('links.topLabel')}
                    </span>
                  ) : (
                    <span className="shrink-0 px-1.5 py-0.5 md:px-2 md:py-1 bg-[#97cd7a] text-[9px] md:text-[10px] font-medium text-black border-2 border-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] leading-none">
                      Link
                    </span>
                  )}

                  <label className="relative inline-flex items-center cursor-pointer" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={link.isActive}
                      onChange={(e) => updateLink(link.id, 'isActive', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className={`w-8 h-4 border border-black bg-white peer-focus:outline-none peer peer-checked:after:translate-x-4 after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-black after:h-3 after:w-3 after:border after:border-black after:transition-all peer-checked:bg-[#97cd7a]`}></div>
                  </label>

                  <button
                    onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(!showDeleteConfirm); }}
                    className={`p-1.5 md:p-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all ${showDeleteConfirm ? 'bg-red-500 text-white' : 'bg-white text-black hover:bg-red-400'}`}
                  >
                    <Trash2 size={isMobile ? 14 : 18} strokeWidth={3} />
                  </button>
                </div>
              </div>
            </div>
            <AnimatePresence>
              {showDeleteConfirm && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden bg-red-50 border-b border-black border-dashed"
                >
                  <div className="p-3 px-4 flex items-center justify-between gap-3 text-red-600">
                    <span className="text-[10px] font-medium uppercase tracking-widest leading-none">{t('links.deleteItem')}</span>
                    <div className="flex gap-2">
                      <button onClick={() => removeLink(link.id)} className="px-3 py-1.5 bg-red-600 text-white border border-black text-[9px] font-medium uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[1px] active:translate-y-[1px]">{t('common.delete')}</button>
                      <button onClick={() => setShowDeleteConfirm(false)} className="px-3 py-1.5 bg-white text-black border border-black text-[9px] font-medium uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[1px] active:translate-y-[1px]">{t('common.cancel')}</button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Expanded Body Content */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden bg-[#f8f8f8] border-t border-black border-dashed"
                >
                  <div className={`${level > 0 ? 'p-3' : 'px-4 md:px-6 pb-6 pt-5'}`}>
                    {/* Main Edit Form */}
                    <div className={`flex flex-col md:flex-row items-center md:items-start ${level > 0 ? 'gap-3 mb-4' : 'gap-4 md:gap-6 mb-6'}`}>
                      {/* Expanded Image (Larger with controls) */}
                      <div className="relative shrink-0">
                        {link.image ? (
                          <div className="w-14 h-14 md:w-16 md:h-16 overflow-hidden border border-black bg-white relative group/img shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                            <img src={link.image} alt="Thumbnail" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-white/90 opacity-100 md:opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <button
                                onClick={() => document.getElementById(`file-${link.id}`)?.click()}
                                className="p-1.5 bg-white text-black hover:bg-black hover:text-[#ffdf00] border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-colors"
                              >
                                <Pencil size={14} strokeWidth={3} />
                              </button>
                              <button
                                onClick={() => updateLink(link.id, 'image', undefined)}
                                className="p-1.5 bg-white text-black hover:bg-red-500 hover:text-white border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-colors"
                              >
                                <Trash2 size={14} strokeWidth={3} />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => document.getElementById(`file-${link.id}`)?.click()}
                            className="w-14 h-14 md:w-16 md:h-16 bg-white border border-dashed border-black flex flex-col items-center justify-center text-black hover:bg-black hover:text-[#ffdf00] transition-all group/btn shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[0.5px] hover:translate-y-[0.5px] hover:shadow-none"
                          >
                            <ImageIcon size={18} className="mb-0.5" strokeWidth={3} />
                            <span className="text-[8px] font-medium uppercase tracking-widest">{t('links.imageLabel')}</span>
                          </button>
                        )}
                      </div>

                      {/* Inputs */}
                      <div className="flex-1 min-w-0 space-y-4">
                        <div className="space-y-1">
                          <label className="text-[9px] font-medium text-black uppercase tracking-[0.2em] px-1">{t('links.titleLabel')}</label>
                          <input
                            type="text"
                            value={link.title}
                            onChange={(e) => updateLink(link.id, 'title', e.target.value)}
                            className="w-full font-medium text-base text-black bg-white border border-black px-3 py-2 focus:bg-[#f1f1f1] outline-none transition-all placeholder:text-black/30 select-text shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                            placeholder={link.type === 'header' ? t('links.sectionPlaceholder') : t('links.titlePlaceholder')}
                          />
                        </div>

                        {link.type !== 'header' && (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between px-1">
                              <label className="text-[9px] font-medium text-black uppercase tracking-[0.2em]">URL / Link</label>
                              {(link.url.includes('youtube.com') || link.url.includes('tiktok.com') || link.url.includes('youtu.be')) && (
                                <button
                                  type="button"
                                  onClick={async () => {
                                    setIsRefreshingMeta(true);
                                    try {
                                      // Use correct service based on link type
                                      if (isYoutubeChannelUrl(link.url)) {
                                        const info = await fetchYoutubeChannelInfo(link.url);
                                        if (info) {
                                          updateLinkFields(link.id, {
                                            title: info.name,
                                            subtitle: info.subscribers,
                                            image: info.avatarUrl
                                          });
                                        }
                                      } else {
                                        const meta = await fetchMusicMetadata(link.url);
                                        if (meta) {
                                          updateLinkFields(link.id, {
                                            title: meta.title,
                                            subtitle: meta.artist,
                                            image: meta.thumbnailUrl
                                          });
                                        }
                                      }
                                    } catch (e) { console.error(e); }
                                    finally { setIsRefreshingMeta(false); }
                                  }}
                                  className="text-[8px] font-medium text-black bg-[#97cd7a] border border-black px-1.5 py-0.5 uppercase tracking-widest flex items-center gap-1 hover:translate-x-[0.5px] hover:translate-y-[0.5px] hover:shadow-none shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50"
                                  disabled={isRefreshingMeta}
                                >
                                  {isRefreshingMeta ? '...' : `↻ ${t('common.reload')}`}
                                </button>
                              )}
                            </div>
                            <input
                              type="text"
                              value={link.url}
                              onChange={(e) => {
                                const newUrl = e.target.value;
                                const updates: Partial<LinkItem> = { url: newUrl };

                                // WhatsApp phone number auto-detection
                                // If it looks like a phone number (8-15 digits, no dots/slashes, no letters)
                                const cleanPhone = newUrl.replace(/\D/g, '');
                                const hasNoLetters = !/[a-zA-Z]/.test(newUrl);
                                if (cleanPhone.length >= 8 && cleanPhone.length <= 15 && hasNoLetters && !newUrl.includes('.') && !newUrl.includes('/') && !newUrl.includes('@')) {
                                  updates.url = `https://wa.me/${cleanPhone}`;
                                  // Optional: also set title if not set
                                  if (!link.title || link.title === t('links.newLink') || link.title === t('links.untitled')) {
                                    updates.title = 'WhatsApp';
                                  }
                                }

                                // Auto detection logic
                                const isSpotify = newUrl.includes('open.spotify.com/') && (newUrl.includes('/track/') || newUrl.includes('/album/') || newUrl.includes('/playlist/'));
                                const isDeezer = newUrl.includes('deezer.com/') || newUrl.includes('deezer.page.link/');
                                const isYoutube = newUrl.includes('youtube.com/') || newUrl.includes('youtu.be/');
                                const isTiktok = newUrl.includes('tiktok.com');
                                const isLivepix = newUrl.includes('livepix.gg/') || newUrl.includes('livepix.');

                                if (isLivepix) {
                                  updates.platform = 'livepix';
                                  if (!link.title || link.title === t('links.newLink') || link.title === t('links.untitled')) {
                                    updates.title = t('links.livepixSupport');
                                  }
                                }

                                let detectedType: 'none' | 'youtube' | 'spotify' | 'deezer' | 'tiktok' = 'none';

                                if (isSpotify) detectedType = 'spotify';
                                else if (isDeezer) detectedType = 'deezer';
                                else if (isYoutube) {
                                  // Only set as youtube embed if it has a valid video ID
                                  const videoId = newUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|live|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
                                  if (videoId) {
                                    detectedType = 'youtube';
                                  }
                                }
                                else if (isTiktok) {
                                  // For TikTok, we default to 'none' until the backend confirms it's a video
                                  detectedType = 'none';

                                  // We trigger a background metadata fetch to check if it's a video
                                  const checkTikTok = async () => {
                                    const metadata = await fetchMusicMetadata(newUrl);
                                    if (metadata && metadata.type === 'video') {
                                      const updateFields: Partial<LinkItem> = {
                                        embedType: 'tiktok',
                                        title: metadata.title || link.title
                                      };
                                      // Update to resolved URL for better compatibility with embed player
                                      if (metadata.resolvedUrl) {
                                        updateFields.url = metadata.resolvedUrl;
                                      }
                                      // Store direct video URL
                                      if (metadata.videoUrl) {
                                        updateFields.videoUrl = metadata.videoUrl;
                                      }
                                      updateLinkFields(link.id, updateFields);
                                    }
                                  };
                                  setTimeout(checkTikTok, 500);
                                }

                                // Update embedType based on detection
                                updates.embedType = detectedType;

                                if (isSpotify || isDeezer || isYoutube) {
                                  // Call fetch intentionally without awaiting to not block UI
                                  fetchMusicMetadata(newUrl).then(metadata => {
                                    if (metadata) {
                                      console.log('🎵 Metadata found:', metadata);

                                      // Check if it's an album with tracks
                                      if (metadata.type === 'album' && metadata.tracks && metadata.tracks.length > 0) {
                                        const newChildren = metadata.tracks.map((track: any) => ({
                                          id: self.crypto.randomUUID(),
                                          title: track.title,
                                          subtitle: track.artist,
                                          image: track.image, // Add image
                                          url: track.url,
                                          embedType: 'spotify' as const,
                                          layout: 'classic' as const, // Keeping conformant to LinkItem type, but parent is grid
                                          isActive: true,
                                          clicks: 0
                                        }));

                                        updateLinkFields(link.id, {
                                          title: metadata.title,
                                          subtitle: metadata.followers || metadata.artist,
                                          image: metadata.thumbnailUrl,
                                          type: 'collection' as const,
                                          layout: 'grid' as const, // Provide grid layout for collection
                                          children: newChildren,
                                          url: ''
                                        });
                                      } else {
                                        // Normal single track update
                                        updateLinkFields(link.id, {
                                          title: metadata.title,
                                          subtitle: metadata.platform === 'youtube' ? metadata.followers : (metadata.followers || metadata.artist),
                                          image: metadata.thumbnailUrl,
                                          embedType: detectedType,
                                          url: newUrl
                                        });
                                      }
                                    }
                                  }).catch(err => {
                                    console.error("Error fetching music metadata:", err);
                                  });
                                }

                                // Apply immediate updates (URL + Type)
                                updateLinkFields(link.id, updates);
                              }}
                              className="w-full text-xs font-medium uppercase tracking-widest text-black bg-white border border-black px-3 py-2 focus:bg-[#f1f1f1] outline-none transition-all placeholder:text-black/30 select-text shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                              placeholder="https://exemplo.com"
                            />
                          </div>
                        )}

                        <div className="space-y-1">
                          <label className="text-[10px] font-medium text-black uppercase tracking-[0.2em] px-1">{t('links.subtitleLabel')}</label>
                          <input
                            type="text"
                            value={link.subtitle || ''}
                            onChange={(e) => updateLink(link.id, 'subtitle', e.target.value)}
                            className="w-full text-xs font-normal uppercase tracking-wider text-black bg-white border border-black px-3 py-2 focus:bg-[#f1f1f1] outline-none transition-all placeholder:text-black/30 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                            placeholder={t('links.subtitlePlaceholder')}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 md:space-y-6 mb-6 md:mb-8 pt-4 md:pt-6 border-t border-black border-dashed">
                      {/* Layout Picker */}
                      <div className="space-y-2">
                        <label className="text-[9px] font-medium text-black uppercase tracking-[0.2em] px-1">{t('links.layoutLabel')}</label>
                        <div className="flex flex-col gap-1.5">
                          {[
                            { id: 'classic', label: t('links.layoutClassic'), desc: t('links.layoutClassicDesc'), icon: <LayoutGrid size={24} strokeWidth={3} /> },
                            { id: 'card', label: t('links.layoutCard'), desc: t('links.layoutCardDesc'), icon: <LayoutTemplate size={24} strokeWidth={3} /> },
                            { id: 'social', label: t('links.layoutSocial'), desc: t('links.layoutSocialDesc'), icon: <Share2 size={24} strokeWidth={3} /> }
                          ].map((opt) => (
                            <button
                              key={opt.id}
                              onClick={() => updateLink(link.id, 'layout', opt.id)}
                              className={`p-2 border text-left flex items-start gap-2.5 transition-all ${link.layout === opt.id
                                ? 'bg-[#97cd7a] border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
                                : 'bg-white border-black hover:translate-x-[0.5px] hover:translate-y-[0.5px] hover:bg-[#f1f1f1] shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
                                }`}
                            >
                              <div className={`flex items-center justify-center p-1 border border-black ${link.layout === opt.id ? 'bg-black text-[#97cd7a]' : 'bg-white text-black'}`}>
                                {opt.icon.type === LayoutGrid || opt.icon.type === LayoutTemplate || opt.icon.type === Share2 ? React.cloneElement(opt.icon, { size: 16 }) : opt.icon}
                              </div>
                              <div className="flex-1 mt-0">
                                <div className={`text-[11px] font-medium uppercase tracking-widest leading-none mb-1 ${link.layout === opt.id ? 'text-black' : 'text-black'}`}>{opt.label}</div>
                                <p className="text-[10px] text-black/40 font-normal uppercase tracking-widest">{t('links.collectionUnnamed')}</p>
                                <div className="text-[9px] text-black/70 font-normal uppercase tracking-wider leading-none">{opt.desc}</div>
                              </div>
                              {link.layout === opt.id && (
                                <div className="w-3.5 h-3.5 bg-black border border-black mt-0.5 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center">
                                  <Check size={10} strokeWidth={4} className="text-[#97cd7a]" />
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Scheduling Section (PRO) */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-medium text-black uppercase tracking-[0.2em] px-1">{t('links.schedule')} (PRO)</label>
                          {(!profile.planType || profile.planType === 'free') && (
                            <span className="px-2 py-0.5 bg-black text-[#97cd7a] border-2 border-black text-[9px] font-medium uppercase tracking-tight shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">{t('links.locked')}</span>
                          )}
                        </div>

                        <div className={`p-2 border mt-1 ${(!profile.planType || profile.planType === 'free') ? 'bg-slate-100 border-black opacity-60 pointer-events-none grayscale' : 'bg-white border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'}`}>
                          <div className="grid grid-cols-1 gap-2.5">
                            {/* Start Date */}
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-black">
                                <div className={`w-2.5 h-2.5 border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] ${(link.scheduleStart && new Date(link.scheduleStart) > new Date()) ? 'bg-[#97cd7a]' : 'bg-white'}`}></div>
                                {t('links.scheduleStart')}
                              </div>
                              <input
                                type="datetime-local"
                                value={link.scheduleStart ? new Date(link.scheduleStart).toISOString().slice(0, 16) : ''}
                                onChange={(e) => {
                                  const date = e.target.value ? new Date(e.target.value).toISOString() : null;
                                  updateLink(link.id, 'scheduleStart', date);
                                }}
                                disabled={!profile.planType || profile.planType === 'free'}
                                className="w-full text-[10px] font-black uppercase tracking-widest text-black bg-white border border-black px-2 py-1.5 focus:bg-[#ffdf00] outline-none transition-all shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                              />
                            </div>

                            {/* End Date */}
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-black">
                                <div className={`w-2.5 h-2.5 border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] ${(link.scheduleEnd && new Date(link.scheduleEnd) < new Date()) ? 'bg-red-500' : 'bg-white'}`}></div>
                                {t('links.scheduleEnd')}
                              </div>
                              <input
                                type="datetime-local"
                                value={link.scheduleEnd ? new Date(link.scheduleEnd).toISOString().slice(0, 16) : ''}
                                onChange={(e) => {
                                  const date = e.target.value ? new Date(e.target.value).toISOString() : null;
                                  updateLink(link.id, 'scheduleEnd', date);
                                }}
                                disabled={!profile.planType || profile.planType === 'free'}
                                className="w-full text-[10px] font-black uppercase tracking-widest text-black bg-white border border-black px-2 py-1.5 focus:bg-[#ffdf00] outline-none transition-all shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                              />
                            </div>

                            {/* Status Message */}
                            {(link.scheduleStart || link.scheduleEnd) && (
                              <div className="pt-2 border-t border-slate-100">
                                {link.scheduleStart && new Date(link.scheduleStart) > new Date() ? (
                                  <div className="text-[10px] font-semibold text-blue-600 flex items-center gap-1.5">
                                    <Sparkles size={12} /> {t('links.scheduledFor', { date: new Date(link.scheduleStart).toLocaleDateString() })}
                                  </div>
                                ) : link.scheduleEnd && new Date(link.scheduleEnd) < new Date() ? (
                                  <div className="text-[10px] font-semibold text-red-500 flex items-center gap-1.5">
                                    <Archive size={12} /> {t('links.expiredAndHidden')}
                                  </div>
                                ) : (
                                  <div className="text-[10px] font-bold text-emerald-600 flex items-center gap-1.5">
                                    <Zap size={12} fill="currentColor" /> {t('links.currentlyVisible')}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Instagram Account Switcher */}
                        {profile.integrations?.find(i => i.provider === 'instagram')?.profile_data?.available_accounts?.length > 1 && (
                          <div className="space-y-3 pb-6 border-b border-slate-100">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">{t('links.switchInstagram')}</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {profile.integrations?.find((i: any) => i.provider === 'instagram')?.profile_data?.available_accounts?.map((acc: any) => {
                                const isActive = acc.channel_id === profile.integrations?.find(i => i.provider === 'instagram')?.profile_data?.channel_id;
                                return (
                                  <button
                                    key={acc.channel_id}
                                    onClick={async () => {
                                      if (isActive) return;
                                      try {
                                        await apiClient.switchInstagramAccount(acc.channel_id);
                                        // Force full page reload or update parent to see changes
                                        window.location.reload();
                                      } catch (err) {
                                        console.error('Error switching account:', err);
                                        alert(t('common.errorTryAgain'));
                                      }
                                    }}
                                    className={`flex items-center gap-3 p-2 rounded-xl border transition-all ${isActive
                                      ? 'bg-purple-500/5 border-purple-200 ring-1 ring-purple-500/10'
                                      : 'bg-white border-slate-100 hover:border-slate-200'
                                      }`}
                                  >
                                    <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-slate-100">
                                      <img src={acc.avatar_url} alt={acc.username} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0 text-left">
                                      <div className={`text-xs font-bold truncate ${isActive ? 'text-purple-600' : 'text-slate-700'}`}>@{acc.username}</div>
                                      <div className="text-[9px] text-slate-400">{acc.follower_count} {t('links.followers')}</div>
                                    </div>
                                    {isActive && (
                                      <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center text-white shrink-0">
                                        <Check size={12} strokeWidth={3} />
                                      </div>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 mt-4 border-t border-black border-dashed gap-4">
                      <div className="flex items-center gap-2 text-black font-black uppercase tracking-widest text-[10px] sm:shrink-0">
                        <BarChart2 size={14} strokeWidth={3} className="text-black" />
                        <span className="text-black leading-none">{link.clicks || 0} {t('analytics.totalClicks').toUpperCase()}</span>
                      </div>

                      <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                        <button
                          onClick={() => window.dispatchEvent(new CustomEvent('nodus:open-move-modal', { detail: { linkId: link.id } }))}
                          className="flex-1 sm:flex-none px-2 sm:px-3 h-8 text-[9px] sm:text-[10px] font-black uppercase tracking-widest bg-white border border-black text-black hover:bg-[#ffdf00] transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                        >
                          {t('links.moveTo')}
                        </button>

                        <button
                          onClick={() => updateLink(link.id, 'isArchived', !link.isArchived)}
                          className={`flex-1 sm:flex-none px-2 sm:px-3 h-8 border text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${link.isArchived ? 'bg-black border-black text-[#ffdf00] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'bg-white border-black text-black hover:bg-black hover:text-[#ffdf00] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none'}`}
                        >
                          {link.isArchived ? t('links.restore') : t('links.archive')}
                        </button>

                        <button
                          onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
                          className={`flex-1 sm:flex-none px-2 sm:px-3 h-8 border text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none ${showDeleteConfirm ? 'bg-red-500 border-black text-white' : 'bg-white border-black text-black hover:bg-red-500 hover:text-white'}`}
                        >
                          {t('common.delete')}
                        </button>
                      </div>
                    </div>
                    <AnimatePresence>
                      {showDeleteConfirm && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden bg-red-50 border-t border-black border-dashed mt-4 pt-4"
                        >
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-[10px] font-black uppercase tracking-widest text-red-600">{t('links.confirmDelete')}?</span>
                            <div className="flex gap-2">
                              <button onClick={() => removeLink(link.id)} className="px-4 py-2 bg-red-600 text-white border-2 border-black text-[10px] font-black uppercase tracking-widest shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[1px] active:translate-y-[1px]">{t('common.yes')}, {t('common.delete')}</button>
                              <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 bg-white text-black border-2 border-black text-[10px] font-black uppercase tracking-widest shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[1px] active:translate-y-[1px]">{t('common.cancel')}</button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
        }
      </div >
    </Reorder.Item >
  );
}

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
  onAddCollection?: (name: string, url?: string) => void;
  onAddIncentive?: (type: 'pix' | 'paypal', key: string) => void;
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

  // Use effect to handle mounting state for Portals
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

      // @ts-ignore
      onChange((prevLinks: LinkItem[]) => {
        let newLinks = JSON.parse(JSON.stringify(prevLinks)) as LinkItem[];
        let movedLink: LinkItem | null = null;

        const removeRec = (list: LinkItem[]): LinkItem[] => {
          return list.filter(item => {
            if (item.id === sourceId) {
              movedLink = item;
              return false;
            }
            if (item.children) {
              item.children = removeRec(item.children);
            }
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

    const handleOpenMove = (e: any) => {
      setMoveModalLinkId(e.detail.linkId);
    };

    window.addEventListener('nodus:move-link', handleMoveLink);
    window.addEventListener('nodus:open-move-modal', handleOpenMove);
    return () => {
      window.removeEventListener('nodus:move-link', handleMoveLink);
      window.removeEventListener('nodus:open-move-modal', handleOpenMove);
    };
  }, [level, onChange, setExpandedCollections]);

  const isLimitReached = (profile.planType === 'free' || !profile.planType) && links.length >= 5;

  const activeLinks = useMemo(() => {
    const manual = links.filter(l => !l.isArchived);
    const result = [...manual];

    // Only inject integration buttons at the root level (level === 0)
    // so they don't appear inside collections
    const isRoot = level === 0;
    if (isRoot) {
      const integrations = profile.integrations || [];
      const order = ['instagram', 'youtube', 'twitch'];
      const providersToInject = order.filter(p =>
        integrations.some(i => i.provider === p) &&
        !result.some(l =>
          (l.url && l.url.toLowerCase().includes(p)) ||
          (l.title && l.title.toLowerCase().includes(p)) ||
          l.platform === p
        )
      );

      [...providersToInject].reverse().forEach(provider => {
        const integration = integrations.find(i => i.provider === provider);
        const username = integration?.profile_data?.username;
        if (username) {
          let url = '';
          if (provider === 'instagram') url = `https://instagram.com/${username}`;
          else if (provider === 'youtube') url = `https://youtube.com/@${username}`;
          else if (provider === 'twitch') url = `https://twitch.tv/${username}`;

          if (url) {
            result.unshift({
              id: `btn-integration-${provider}`,
              title: provider === 'instagram' ? 'Instagram' : (provider === 'youtube' ? 'YouTube' : 'Twitch'),
              url: url,
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

  const archivedLinks = links.filter(l => l.isArchived);

  const isAnyExpanded = Object.values(expandedLinks).some(Boolean) || Object.values(expandedCollections).some(Boolean);

  const toggleCollection = (id: string) => {
    const isCurrentlyExpanded = !!expandedCollections[id];
    setExpandedCollections(prev => {
      const next = { ...prev };
      if (isCurrentlyExpanded) {
        next[id] = false;
      } else {
        // Accordion: Close others at this level
        activeLinks.forEach(l => {
          if (l.id !== id && l.type === 'collection') next[l.id] = false;
        });
        next[id] = true;
      }
      return next;
    });

    if (!isCurrentlyExpanded) {
      setExpandedLinks(prev => {
        const next = { ...prev };
        activeLinks.forEach(l => {
          if (l.type !== 'collection') next[l.id] = false;
        });
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
        // Accordion: Close others at this level
        activeLinks.forEach(l => {
          if (l.id !== id && l.type !== 'collection') next[l.id] = false;
        });
        next[id] = true;
      }
      return next;
    });

    if (!isCurrentlyExpanded) {
      setExpandedCollections(prev => {
        const next = { ...prev };
        activeLinks.forEach(l => {
          if (l.id !== id && l.type === 'collection') next[l.id] = false;
        });
        return next;
      });
    }
  };

  const addLink = async (url?: string) => {
    const newLinkId = Date.now().toString();
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
    // @ts-ignore
    onChange(prev => [newLink, ...prev]);

    // If URL is provided, try to fetch metadata immediately
    if (url) {
      const isMusic = url.includes('spotify') || url.includes('deezer') || url.includes('youtube') || url.includes('youtu.be') || url.includes('tiktok');
      if (isMusic) {
        try {
          const metadata = await fetchMusicMetadata(url);
          if (metadata) {
            updateLinkFields(newLinkId, {
              title: metadata.title,
              subtitle: metadata.platform === 'youtube' ? metadata.followers : (metadata.followers || metadata.artist),
              image: metadata.thumbnailUrl,
              embedType: metadata.platform as any
            });
          }
        } catch (error) {
          console.error('Error fetching metadata in addLink:', error);
        }
      }
    }
  };

  const addCollection = (name?: string, url?: string) => {
    const newCollectionId = Date.now().toString();
    const children: LinkItem[] = [];

    if (url) {
      const childId = (Date.now() + 1).toString();
      children.push({
        id: childId,
        clientId: crypto.randomUUID(),
        title: t('links.newLink'),
        url: url,
        isActive: true,
        clicks: 0,
        layout: 'classic',
        type: 'link'
      });

      // Fetch metadata in background
      const isMusic = url.includes('spotify') || url.includes('deezer') || url.includes('youtube') || url.includes('youtu.be') || url.includes('tiktok');
      if (isMusic) {
        fetchMusicMetadata(url).then(metadata => {
          if (metadata) {
            // Need to update the child inside the collection
            // Since onChange hasn't finished or we just pushed it, 
            // the most reliable way is to update via the parent state after a small delay 
            // or just let the SortableLinkItem useEffect handle it when child mounts.
            // Actually, SortableLinkItem will mount when this finishes, so the useEffect there 
            // should catch it if the URL is set.
          }
        });
      }
    }

    const newCollection: LinkItem = {
      id: newCollectionId,
      clientId: crypto.randomUUID(),
      title: name || t('links.newCollection'),
      url: '',
      isActive: true,
      clicks: 0,
      layout: 'stacked',
      type: 'collection',
      children: children
    };

    setExpandedCollections(prev => {
      const next = { ...prev };
      activeLinks.forEach(l => { if (l.type === 'collection') next[l.id] = false; });
      next[newCollectionId] = true;
      return next;
    });
    setExpandedLinks(prev => {
      const next = { ...prev };
      activeLinks.forEach(l => { if (l.type !== 'collection') next[l.id] = false; });
      return next;
    });
    // @ts-ignore
    onChange(prev => [newCollection, ...prev]);

    // If it was called externally (e.g. from a sub-component that doesn't have the state)
    // this might not be needed but keeping for consistency if we ever use the prop
    if (externalAddCollection && !name) {
      // This part is tricky because the prop is usually passed DOWN
      // But here we are PROVIDING the implementation.
    }
  };

  const addSocialLink = (platformId: string) => {
    const platform = SOCIAL_NETWORKS.find(p => p.id === platformId);
    const newLink: LinkItem = {
      id: Date.now().toString(),
      clientId: crypto.randomUUID(),
      title: platform?.name || t('links.newLink'),
      url: platform?.baseUrl || '',
      isActive: true,
      clicks: 0,
      layout: 'classic',
      type: 'link',
      platform: platformId
    };
    setExpandedLinks(prev => {
      const next = { ...prev };
      activeLinks.forEach(l => { if (l.type !== 'collection') next[l.id] = false; });
      next[newLink.id] = true;
      return next;
    });
    setExpandedCollections(prev => {
      const next = { ...prev };
      activeLinks.forEach(l => { if (l.type === 'collection') next[l.id] = false; });
      return next;
    });
    // @ts-ignore
    onChange(prev => [newLink, ...prev]);
  };

  const addProduct = (collectionName: string) => {
    if (onAddProduct) {
      onAddProduct(collectionName);
      setIsAddModalOpen(false);
    } else if (setActiveTab) {
      setActiveTab('shop');
      setIsAddModalOpen(false);
    }
  };

  const addHeader = () => {
    const newHeader: LinkItem = {
      id: Date.now().toString(),
      clientId: crypto.randomUUID(),
      title: t('links.newSection'),
      url: '',
      isActive: true,
      clicks: 0,
      layout: 'classic',
      type: 'header'
    };
    setExpandedLinks(prev => {
      const next = { ...prev };
      activeLinks.forEach(l => { if (l.type !== 'collection') next[l.id] = false; });
      next[newHeader.id] = true;
      return next;
    });
    setExpandedCollections(prev => {
      const next = { ...prev };
      activeLinks.forEach(l => { if (l.type === 'collection') next[l.id] = false; });
      return next;
    });
    // @ts-ignore
    onChange(prev => [newHeader, ...prev]);
  };

  const updateLink = (id: string, field: keyof LinkItem, value: any) => {
    // @ts-ignore
    onChange((prev: LinkItem[]) => prev.map(link => {
      if (link.id !== id) return link;
      const newValue = typeof value === 'function' ? value(link[field] || []) : value;
      return { ...link, [field]: newValue };
    }));
  };

  const updateLinkFields = (id: string, updates: Partial<LinkItem>) => {
    // @ts-ignore
    onChange((prev: LinkItem[]) => prev.map(link => {
      if (link.id !== id) return link;
      const resolvedUpdates = { ...updates };
      Object.keys(resolvedUpdates).forEach((key) => {
        const field = key as keyof LinkItem;
        if (typeof resolvedUpdates[field] === 'function') {
          // @ts-ignore
          resolvedUpdates[field] = resolvedUpdates[field](link[field] || []);
        }
      });
      return { ...link, ...resolvedUpdates };
    }));
  };

  const removeLink = (id: string) => {
    // @ts-ignore
    onChange(prev => prev.filter(link => link.id !== id));
  };

  const handleReorder = (newActiveLinks: LinkItem[]) => {
    // @ts-ignore
    if (window.__nodusIsDraggingIntoCollection) return;
    // Combine new active links with existing archived links to preserve full state
    onChange([...newActiveLinks, ...archivedLinks]);
  };

  return (
    <div className={`space-y-5 ${level === 0 ? 'bg-white border-[1.5px] border-black p-3 md:p-4 pt-4 md:pt-5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : ''}`}>
      <div className="space-y-5">
        {level === 0 ? (
          <>
            <div className="flex flex-col gap-4 mb-4">
              <div className="flex items-center justify-between border-b border-black pb-3">
                <div>
                  <h2 className="text-base md:text-lg font-black uppercase text-black tracking-tight">{t('links.myLinks')}</h2>
                  <p className="text-[10px] font-bold text-black/60 mt-0.5 uppercase tracking-widest leading-none">{t('links.myLinksSubtitle')}</p>
                </div>

                <div className="flex items-center gap-2 md:gap-2.5">
                  <button
                    onClick={() => setShowArchive(true)}
                    className="w-10 h-10 flex items-center justify-center border border-black bg-white hover:bg-[#ffdf00] shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[0.5px] hover:translate-y-[0.5px] hover:shadow-none"
                    title={t('links.viewArchive')}
                  >
                    <Archive size={18} className="text-black" />
                    {archivedLinks.length > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center border border-black bg-[#97cd7a] text-[8px] font-black uppercase text-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                        {archivedLinks.length}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    disabled={isLimitReached}
                    className={`w-10 h-10 flex items-center justify-center border transition-all hover:translate-x-[0.5px] hover:translate-y-[0.5px] hover:shadow-none ${isLimitReached
                      ? 'border-black bg-slate-200 text-black/30 cursor-not-allowed shadow-none'
                      : 'border-black bg-[#97cd7a] text-black shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] hover:bg-[#86b567]'
                      }`}
                    title={t('links.addLink')}
                  >
                    <Plus size={18} className="text-black" strokeWidth={3} />
                  </button>
                </div>
              </div>

            </div>

            {isLimitReached && (
              <div className="bg-amber-50 border border-amber-100 p-6 rounded-2xl flex items-center gap-6 mb-8">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-amber-900">{t('links.limitReached')}</p>
                  <p className="text-sm text-amber-700 mt-0.5">{t('links.limitReachedDesc')}</p>
                </div>
                <button className="text-xs font-bold text-amber-700 bg-white border border-amber-200 px-4 py-2 rounded-xl hover:bg-amber-100 transition-colors shadow-sm">{t('links.seePlans')}</button>
              </div>
            )}
          </>
        ) : (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className={`w-full ${level > 0 ? 'py-1.5 text-[10px]' : 'py-2.5 text-xs'} border border-dashed border-black bg-white font-black uppercase text-black hover:bg-[#ffdf00] transition-colors flex items-center justify-center gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[0.5px] hover:translate-y-[0.5px] hover:shadow-none`}
          >
            <Plus size={level > 0 ? 14 : 16} strokeWidth={3} /> {t('links.addLinkInCollection')}
          </button>
        )}
      </div>

      <div className="space-y-5">
        {activeLinks.length === 0 && (
          <div className="text-center py-10 md:py-16 bg-[#ffdf00] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-white border-4 border-black rounded-full flex items-center justify-center mx-auto mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black">
              <Ban size={32} strokeWidth={3} />
            </div>
            <p className="text-lg md:text-xl font-black uppercase tracking-widest text-black">{t('links.emptyList')}</p>
            <p className="text-xs md:text-sm text-black/70 font-bold uppercase tracking-wider mt-2">{t('links.addFirstLink')}</p>
          </div>
        )}

        <Reorder.Group
          axis="y"
          values={activeLinks}
          onReorder={handleReorder}
          className="space-y-5"
        >
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

      {/* Archive Modal - Soft Corporate */}
      {mounted && createPortal(
        <AnimatePresence>
          {showArchive && (
            <div className={`fixed inset-0 z-[9999] flex ${isMobile ? 'items-end' : 'items-center justify-center p-4 md:p-8'}`}>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowArchive(false)}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              />
              <motion.div
                initial={isMobile ? { y: '100%' } : { opacity: 0, scale: 0.95, y: 20 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={isMobile ? { y: '100%' } : { opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300, mass: 0.5 }}
                drag={isMobile ? "y" : false}
                dragConstraints={isMobile ? { top: 0, bottom: 0 } : undefined}
                dragElastic={isMobile ? 0.05 : 1}
                onDragEnd={(_, info) => {
                  if (isMobile && (info.offset.y > 100 || info.velocity.y > 500)) {
                    setShowArchive(false);
                  }
                }}
                className={`
                  relative bg-white border-black flex flex-col shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] overflow-hidden
                  ${isMobile ? 'w-full max-h-[92vh] border-t-4 p-8 pb-12' : 'w-full max-w-xl max-h-[85vh] border-[1.5px] p-6 md:p-10'}
                `}
              >
                {isMobile && (
                  <div className="w-12 h-1.5 bg-black mx-auto mb-6 shrink-0" />
                )}

                {/* Header */}
                <div className="mb-6 flex items-center justify-between shrink-0">
                  <div>
                    <h3 className={`${isMobile ? 'text-2xl' : 'text-xl md:text-2xl'} font-black uppercase tracking-tighter text-black`}>{t('links.archivedItems')}</h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-black/70 mt-0.5">{archivedLinks.length} {t('links.linksInArchive')}</p>
                  </div>
                  {!isMobile && (
                    <button
                      onClick={() => setShowArchive(false)}
                      className="p-2 bg-white text-black border border-black hover:bg-red-500 hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[0.5px] hover:translate-y-[0.5px] hover:shadow-none"
                    >
                      <X size={18} strokeWidth={3} />
                    </button>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-hide py-2">
                  {archivedLinks.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center py-20 border-4 border-dashed border-black">
                      <div className="w-20 h-20 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center mb-6">
                        <Archive size={32} strokeWidth={3} className="text-black" />
                      </div>
                      <p className="text-sm font-black text-black uppercase tracking-widest leading-none">{t('links.emptyArchive')}</p>
                    </div>
                  ) : (
                    archivedLinks.map((link) => (
                      <motion.div
                        key={link.id}
                        layout
                        className="flex items-center justify-between p-3 bg-white border border-black transition-all hover:bg-[#ffdf00] group/item shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mb-3"
                      >
                        <div className="flex items-center gap-5 min-w-0">
                          <div className="w-14 h-14 bg-white border-2 border-black flex items-center justify-center shrink-0 overflow-hidden shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            {link.image ? (
                              <img src={link.image} alt="" className="w-full h-full object-cover grayscale group-hover/item:grayscale-0 transition-all border-none" />
                            ) : (
                              <LinkIcon size={24} strokeWidth={3} className="text-black" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-black uppercase tracking-widest text-black truncate mb-0.5">{link.title || t('links.untitled')}</h4>
                            <p className="text-xs text-black/70 font-bold uppercase tracking-widest truncate">{link.url || t('links.noUrl')}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => updateLink(link.id, 'isArchived', false)}
                            className="h-8 px-3 bg-white border border-black text-black text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-[#ffdf00] transition-all shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[0.5px] hover:translate-y-[0.5px] hover:shadow-none"
                          >
                            {t('links.restore')}
                          </button>
                          <button
                            onClick={() => removeLink(link.id)}
                            className="p-2 bg-white border border-black text-black hover:text-white hover:bg-red-500 transition-all shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[0.5px] hover:translate-y-[0.5px] hover:shadow-none"
                          >
                            <Trash2 size={16} strokeWidth={3} />
                          </button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>

                <div className="mt-8 pt-6 border-t border-black border-dashed shrink-0">
                  <button
                    onClick={() => setShowArchive(false)}
                    className="w-full h-11 bg-black text-[#ffdf00] font-black uppercase tracking-widest text-xs transition-all border border-black hover:bg-white hover:text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[0.5px] hover:translate-y-[0.5px] hover:shadow-none"
                  >
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
            />
          )}

          {level === 0 && moveModalLinkId && (
            <div className={`fixed inset-0 z-[9999] flex ${isMobile ? 'items-end' : 'items-center justify-center p-4 md:p-8'}`}>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMoveModalLinkId(null)}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              />
              <motion.div
                initial={isMobile ? { y: '100%', opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={isMobile ? { y: '100%', opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95, y: 20 }}
                transition={isMobile ? { type: 'spring', damping: 32, stiffness: 320, mass: 0.8 } : { type: 'spring', damping: 25, stiffness: 200 }}
                drag={isMobile ? "y" : false}
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={{ top: 0, bottom: 0.8 }}
                onDragEnd={(_, info) => {
                  if (info.offset.y > 100 || info.velocity.y > 500) {
                    setMoveModalLinkId(null);
                  }
                }}
                className={`
                  relative bg-white border-4 border-black flex flex-col shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden touch-none
                  ${isMobile ? 'w-full p-8 pb-12' : 'w-full max-w-sm p-6'}
                `}
              >
                {isMobile && (
                  <div className="w-12 h-1.5 bg-black mx-auto mb-6 shrink-0" />
                )}

                <div className="mb-6 flex items-center justify-between">
                  <h3 className={`${isMobile ? 'text-2xl' : 'text-lg'} font-black uppercase tracking-tighter text-black`}>{t('links.moveTo')}</h3>
                  {!isMobile && (
                    <button
                      onClick={() => setMoveModalLinkId(null)}
                      className="p-1.5 bg-white text-black border-2 border-black hover:bg-black hover:text-[#ffdf00] transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                    >
                      <X size={16} strokeWidth={4} />
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('nodus:move-link', { detail: { sourceId: moveModalLinkId, targetId: 'root' } }));
                      setMoveModalLinkId(null);
                    }}
                    className="w-full text-left flex items-center gap-4 p-4 bg-white border-2 border-black hover:bg-[#ffdf00] transition-all font-black uppercase tracking-widest text-[11px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                  >
                    <Folder size={18} strokeWidth={3} className="text-black" /> {t('links.myLinksRoot')}
                  </button>

                  <div className="pt-2">
                    <p className="text-[10px] font-black uppercase text-black/40 mb-3 tracking-[0.2em] px-1">{t('links.yourCollections')}</p>
                    <div className="space-y-3">
                      {links.filter(l => l.type === 'collection' && l.id !== moveModalLinkId).length > 0 ? (
                        links.filter(l => l.type === 'collection' && l.id !== moveModalLinkId).map(c => (
                          <button
                            key={c.id}
                            onClick={() => {
                              window.dispatchEvent(new CustomEvent('nodus:move-link', { detail: { sourceId: moveModalLinkId, targetId: c.id } }));
                              setMoveModalLinkId(null);
                            }}
                            className="w-full text-left flex items-center gap-4 p-4 bg-white border-2 border-black hover:bg-[#97cd7a] transition-all font-black uppercase tracking-widest text-[11px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                          >
                            <FolderHeart size={18} strokeWidth={3} className="text-black" /> {c.title || t('links.collectionUnnamed')}
                          </button>
                        ))
                      ) : (
                        <div className="p-8 border-2 border-dashed border-black/10 flex flex-col items-center justify-center text-center">
                          <span className="text-[9px] font-black uppercase tracking-widest text-black/20">{t('links.noCollections')}</span>
                        </div>
                      )}
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
