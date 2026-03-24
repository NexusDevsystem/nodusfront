import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/landing/Navbar';
import { Footer } from '../components/landing/Footer';
import { useLanguage } from '../components/landing/i18n/LanguageContext';
import { Calendar, User, Heart, ArrowLeft, FileText, ArrowRight, Share2, Twitter, Send, X, Download, Loader2, Copy, Check, Facebook, Linkedin } from 'lucide-react';
import { SiWhatsapp, SiX, SiMessenger, SiSnapchat, SiInstagram } from 'react-icons/si';
import { motion, AnimatePresence } from 'framer-motion';
import { toPng } from 'html-to-image';
import BlogShareCard from '../components/BlogShareCard';
import BlogStoryShareCard from '../components/BlogStoryShareCard';
import { apiClient } from '../services/apiClient';
import { BlogPost } from '../types';

function BlogPostContent() {
  const { t, lang } = useLanguage();
  const blogT = t.blog;
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (slug) fetchPost();
  }, [slug]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getBlogPostBySlug(slug!);
      setPost(data);
      if (data?.id) {
        apiClient.trackBlogPostView(data.id);
      }
    } catch (error) {
      console.error('Error fetching post:', error);
      navigate('/blog');
    } finally {
      setLoading(false);
    }
  };

  const [hasLiked, setHasLiked] = useState(false);
  const [fingerprint, setFingerprint] = useState('');

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const shareCardRef = useRef<HTMLDivElement>(null);
  const storyCardRef = useRef<HTMLDivElement>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    if (isShareModalOpen && !previewImage) {
      generateShareImage();
    } else if (!isShareModalOpen) {
      setPreviewImage(null);
    }
  }, [isShareModalOpen]);

  useEffect(() => {
    // Basic device identification for anonymous likes
    let fp = localStorage.getItem('nodus_blog_fingerprint');
    if (!fp) {
      fp = Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem('nodus_blog_fingerprint', fp);
    }
    setFingerprint(fp);

    // Check if already liked this post
    const likedPosts = JSON.parse(localStorage.getItem('nodus_liked_posts') || '[]');
    if (slug && likedPosts.includes(slug)) {
      setHasLiked(true);
    }
  }, [slug]);

  const handleUpvote = async () => {
    if (!post || hasLiked) return;
    
    // Optimistic Update
    const originalCount = post.likesCount || 0;
    setPost({ ...post, likesCount: originalCount + 1 });
    setHasLiked(true);
    
    // Save to local storage immediately
    const likedPosts = JSON.parse(localStorage.getItem('nodus_liked_posts') || '[]');
    if (slug && !likedPosts.includes(slug)) {
      likedPosts.push(slug);
      localStorage.setItem('nodus_liked_posts', JSON.stringify(likedPosts));
    }

    try {
      const updated = await apiClient.upvoteBlogPost(post.id, fingerprint);
      // Sync with server result (just in case)
      setPost({ ...post, likesCount: updated.likesCount });
    } catch (error) {
      console.error('Error upvoting post:', error);
      // Revert if error
      setPost({ ...post, likesCount: originalCount });
      setHasLiked(false);
      const revertedLikes = JSON.parse(localStorage.getItem('nodus_liked_posts') || '[]');
      const index = revertedLikes.indexOf(slug);
      if (index > -1) {
        revertedLikes.splice(index, 1);
        localStorage.setItem('nodus_liked_posts', JSON.stringify(revertedLikes));
      }
    }
  };

  const generateShareImage = async () => {
    if (!shareCardRef.current || !post) return;
    try {
      setIsGeneratingImage(true);
      await new Promise(resolve => setTimeout(resolve, 500)); // wait for renders/fonts
      
      const dataUrl = await toPng(shareCardRef.current, {
        cacheBust: true,
        style: {
          background: 'transparent'
        },
        width: 1200,
        height: 630,
        pixelRatio: 1, // Keep standard 1200x630
        skipFonts: false,
        fontEmbedCSS: '', // Try to avoid font fetch timeouts
        filter: (node) => {
          // Skip any node that might break serialization like tricky external SVGs
          if (node.tagName === 'link' || node.tagName === 'script') return false;
          return true;
        }
      });
      
      // If the dataUrl is too short or empty, it failed silently
      if (dataUrl.length < 100) throw new Error('Renderização vazia');
      
      setPreviewImage(dataUrl);
      
      // Silently sync the card with the server for social preview bots
      if (slug) {
        apiClient.syncBlogCard(slug, dataUrl).catch(e => console.warn('Social card sync failed:', e));
      }
    } catch (error) {
      console.error('Error generating share image:', error);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const generateStoryImage = async () => {
    if (!storyCardRef.current || !post) return;
    try {
      setIsGeneratingStory(true);
      await new Promise(resolve => setTimeout(resolve, 500)); 
      
      const dataUrl = await toPng(storyCardRef.current, {
        cacheBust: true,
        width: 1080,
        height: 1920,
        pixelRatio: 1,
        skipFonts: false,
      });
      
      if (dataUrl.length < 100) throw new Error('Renderização vazia');
      
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `nodus-story-${slug}.png`;
      link.click();
    } catch (error) {
      console.error('Error generating story image:', error);
    } finally {
      setIsGeneratingStory(false);
    }
  };
  
  const shortUrl = post?.id ? `${window.location.origin}/blog/${post.id.substring(0, 8)}` : window.location.href;
  const shareUrl = shortUrl; // Short URL for humans
  const botFriendlyShareUrl = slug ? `${window.location.origin}/blog/${slug}` : shortUrl; // Full slug for bots/OG
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const shareLinks = [
    { name: 'Copiar', icon: copied ? Check : Copy, onClick: handleCopyLink, color: 'bg-white text-dark' },
    { name: 'WhatsApp', icon: SiWhatsapp, url: `https://wa.me/?text=${encodeURIComponent(`Confira este artigo no Nodus: ${post?.title} - ${botFriendlyShareUrl}`)}`, color: 'bg-[#25D366] text-white' },
    { name: 'X', icon: SiX, url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(botFriendlyShareUrl)}&text=${encodeURIComponent(`Confira este artigo no Nodus: ${post?.title}`)}`, color: 'bg-black text-white' },
    { name: 'Facebook', icon: Facebook, url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(botFriendlyShareUrl)}`, color: 'bg-[#1877F2] text-white' },
    { name: 'Messenger', icon: SiMessenger, url: `https://www.facebook.com/dialog/send?app_id=123456789&link=${encodeURIComponent(botFriendlyShareUrl)}&redirect_uri=${encodeURIComponent(botFriendlyShareUrl)}`, color: 'bg-[#00B2FF] text-white' },
    { name: 'Snapchat', icon: SiSnapchat, url: `https://www.snapchat.com/scan?attachmentUrl=${encodeURIComponent(botFriendlyShareUrl)}`, color: 'bg-[#FFFC00] text-black' },
    { name: 'Instagram', icon: SiInstagram, onClick: () => { handleCopyLink(); window.open('https://instagram.com', '_blank'); }, color: 'bg-[#E1306C] text-white' },
    { name: 'LinkedIn', icon: Linkedin, url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(botFriendlyShareUrl)}`, color: 'bg-[#0A66C2] text-white' },
  ];
  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#fdfdf6] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-brand"></div>
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="landing-page-root min-h-screen bg-[#fdfdf6]">
      <Navbar />
      
      <main className="pt-40 pb-20 px-6 max-w-5xl mx-auto">
        {/* Back Button */}
        <motion.button
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          onClick={() => navigate('/blog')}
          className="flex items-center gap-2 font-black uppercase text-xs tracking-widest mb-12 hover:text-brand transition-colors group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> {blogT.backToBlog || (lang === 'pt' ? 'Voltar ao Blog' : 'Back to Blog')}
        </motion.button>

        <article className="space-y-16">
          {/* Header Section */}
          <header className="space-y-8">
            <div className="flex items-center gap-4">
              <span className="bg-brand text-dark border-2 border-dark px-4 py-1.5 font-black uppercase text-xs tracking-widest leading-none">
                {post.category === 'Atualização' ? blogT.categories.design : 
                 post.category === 'Novidades' ? blogT.categories.updates : 
                 post.category === 'Cultura' ? blogT.categories.culture :
                 post.category === 'Off Topic' ? blogT.categories.mastery :
                 post.category}
              </span>
              <span className="font-black uppercase text-xs tracking-[0.2em] opacity-30">
                {new Date(post.publishedAt || post.createdAt || '').toLocaleDateString(lang === 'pt' ? 'pt-BR' : 'en-US', { day: '2-digit', month: 'long', year: 'numeric' })}
              </span>
            </div>

            <h1 className="font-display font-black text-6xl md:text-8xl uppercase leading-[0.85] tracking-tighter text-dark">
              {post.title}
            </h1>

            <div className="flex items-center gap-8 font-black uppercase text-sm tracking-widest text-dark border-b-4 border-dark pb-8">
              <button 
                onClick={handleUpvote}
                className={`flex items-center gap-2 transition-colors ${hasLiked ? 'text-red-500' : 'hover:text-red-500'}`}
                disabled={hasLiked}
              >
                <Heart size={20} strokeWidth={2.5} className={hasLiked ? "fill-red-500 text-red-500" : ""} /> {23 + (post.likesCount || 0)}
              </button>
              <div className="flex items-center gap-2">
                <Share2 size={20} strokeWidth={2.5} /> 23
              </div>

              <button 
                onClick={() => setIsShareModalOpen(true)}
                className="ml-auto flex items-center gap-2 bg-white border-2 border-dark px-4 py-1.5 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-slate-50 transition-all shadow-[0_4px_0_0_#000] active:translate-y-[2px] active:shadow-none"
              >
                <Share2 size={18} strokeWidth={3} /> {blogT.share || (lang === 'pt' ? 'Compartilhar' : 'Share')}
              </button>
            </div>
          </header>

          {/* Post Content */}
          <div className="font-bold text-xl md:text-2xl text-dark/80 leading-relaxed space-y-10 py-10 selection:bg-brand selection:text-dark max-w-4xl mx-auto">
            {post.content.split(/(!\[.*?\]\(.*?\)|\[video\]\(.*?\)|\[📎 .*?\]\(.*?\))/g).map((part, i) => {
              const imgMatch = part.match(/!\[(.*?)\]\((.*?)\)/);
              const videoMatch = part.match(/\[video\]\((.*?)\)/);
              const fileMatch = part.match(/\[📎 (.*?)\]\((.*?)\)/);

              if (imgMatch) {
                return (
                  <div key={i} className="my-20 border-2 border-dark rounded-[40px] overflow-hidden shadow-[0_15px_0_0_#000]">
                    <img src={imgMatch[2]} alt={imgMatch[1]} className="w-full h-auto" loading="lazy" decoding="async" />
                  </div>
                );
              }

              if (videoMatch) {
                return (
                  <div key={i} className="my-20 aspect-video border-2 border-dark rounded-[40px] overflow-hidden shadow-[0_15px_0_0_#000] bg-black">
                    <video src={videoMatch[1]} controls className="w-full h-full" />
                  </div>
                );
              }

              if (fileMatch) {
                return (
                  <a 
                    key={i} 
                    href={fileMatch[2]} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-6 p-8 bg-slate-50 border-2 border-dark rounded-[32px] shadow-[0_10px_0_0_#000] hover:translate-y-1 hover:shadow-[0_6px_0_0_#000] transition-all group my-10"
                  >
                    <div className="p-4 bg-white border-2 border-dark rounded-2xl">
                      <FileText size={40} className="text-dark" />
                    </div>
                    <div className="flex-1">
                      <span className="block font-black text-dark text-xl uppercase tracking-tighter">{fileMatch[1]}</span>
                      <span className="text-xs font-black uppercase text-dark/30 tracking-widest">{lang === 'pt' ? 'Clique para baixar o anexo' : 'Click to download attachment'}</span>
                    </div>
                    <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
                  </a>
                );
              }

              return part.split('\n').map((line, j) => (
                <p key={`${i}-${j}`} className={line.startsWith('#') ? 'text-4xl md:text-6xl font-black uppercase tracking-tighter pt-8 border-l-8 border-brand pl-8 mb-8 mt-12' : ''}>
                  {line.startsWith('#') ? line.replace(/^#+\s/, '') : line}
                </p>
              ));
            })}
          </div>

          {/* Footer Interactivity */}
          <footer className="pt-20 border-t-4 border-dark flex flex-col items-center gap-16">
            <div className="flex flex-col items-center gap-8 text-center">
              <h3 className="font-display font-black text-4xl uppercase tracking-tighter">{blogT.enjoyedRead || (lang === 'pt' ? 'Gostou da leitura?' : 'Enjoyed the read?')}</h3>
              <div className="flex flex-wrap justify-center gap-6">
                <button 
                  onClick={handleUpvote}
                  className="group relative"
                  disabled={hasLiked}
                >
                  <div className={`absolute inset-0 bg-brand translate-y-2 rounded-2xl transition-transform ${!hasLiked && 'group-hover:translate-y-3'}`}></div>
                  <div className="relative px-8 md:px-12 py-5 md:py-6 bg-white border-4 border-dark rounded-2xl flex items-center gap-4 group-active:translate-y-1 transition-all">
                    <Heart size={28} strokeWidth={3} className={hasLiked ? "fill-red-500 text-red-500" : "text-dark"} />
                    <span className="font-black uppercase text-lg md:text-xl tracking-widest">{23 + (post.likesCount || 0)} {blogT.likes || (lang === 'pt' ? 'Curtidas' : 'Likes')}</span>
                  </div>
                </button>

                <button 
                  onClick={() => setIsShareModalOpen(true)}
                  className="group relative"
                >
                  <div className="absolute inset-0 bg-[#FFA6F6] translate-y-2 rounded-2xl group-hover:translate-y-3 transition-transform"></div>
                  <div className="relative px-8 md:px-12 py-5 md:py-6 bg-white border-4 border-dark rounded-2xl flex items-center gap-4 group-active:translate-y-1 transition-all">
                    <Share2 size={28} strokeWidth={3} className="text-dark" />
                    <span className="font-black uppercase text-lg md:text-xl tracking-widest">{23} {lang === 'pt' ? 'Comp.' : 'Shares'}</span>
                  </div>

                </button>
              </div>
            </div>
          </footer>
        </article>
      </main>

      {/* Hidden Card rendering for PNG output */}
      <BlogShareCard post={post} cardRef={shareCardRef} />
      <BlogStoryShareCard post={post} cardRef={storyCardRef} />

      {/* Share Modal */}
      <AnimatePresence>
        {isShareModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsShareModalOpen(false)}
              className="absolute inset-0 bg-dark/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={window.innerWidth < 768 ? { y: '100%' } : { scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={window.innerWidth < 768 ? { y: '100%' } : { scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="relative w-full max-w-xl bg-white border-t-8 md:border-4 border-[#000000] rounded-t-[40px] md:rounded-[32px] md:shadow-[0_20px_0_0_#000000] p-8 md:p-10 overflow-hidden z-10"
              >
                {/* Mobile Handle */}
                <div className="md:hidden absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-dark/10 rounded-full" />
                
                <button 
                  onClick={() => setIsShareModalOpen(false)}
                  className="absolute top-6 right-6 md:top-5 md:right-5 p-2 bg-[#ffdf00] border-[3px] border-[#000000] shadow-[0_4px_0_0_#000000] rounded-xl hover:translate-y-[2px] hover:shadow-[0_2px_0_0_#000000] transition-all z-20 active:translate-y-[4px] active:shadow-none"
                >
                  <X size={20} strokeWidth={4} className="text-[#000000]" />
                </button>

              <div className="space-y-6 md:space-y-8">
                {/* Image Preview Area */}
                <div className="w-[108%] -ml-[4%] relative flex items-center justify-center -mt-2 mb-4 group">
                  {!previewImage ? (
                    <div className="w-full aspect-[1200/630] rounded-2xl bg-slate-50 flex flex-col items-center justify-center gap-3 text-dark/40 border-4 border-dashed border-dark/10">
                      <Loader2 className="animate-spin w-8 h-8" />
                      <span className="font-black uppercase text-xs tracking-widest">Montando cartão visual...</span>
                    </div>
                  ) : (
                    <div className="relative group/image">
                      <img 
                        src={previewImage} 
                        alt="Preview do Artigo" 
                        className="w-full h-auto object-contain drop-shadow-2xl transition-transform duration-300" 
                      />
                      <div className="absolute bottom-4 right-4 flex gap-3">
                        <button
                          onClick={generateStoryImage}
                          disabled={isGeneratingStory}
                          className="flex items-center gap-2 px-5 py-3 bg-black text-[#ffdf00] border-2 border-dark shadow-[0_4px_0_0_#000] rounded-xl hover:translate-y-[2px] hover:shadow-[0_2px_0_0_#000] transition-all active:translate-y-[4px] active:shadow-none z-10 disabled:opacity-50"
                        >
                          {isGeneratingStory ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} strokeWidth={3} />}
                          <span className="font-black uppercase text-[10px] tracking-widest">{lang === 'pt' ? 'Baixar Story' : 'Download Story'}</span>
                        </button>

                        <button
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = previewImage;
                            link.download = `nodus-blog-${slug}.png`;
                            link.click();
                          }}
                          className="p-3 bg-[#ffdf00] border-2 border-dark shadow-[0_4px_0_0_#000] rounded-xl hover:translate-y-[2px] hover:shadow-[0_2px_0_0_#000] transition-all active:translate-y-[4px] active:shadow-none z-10"
                          title={lang === 'pt' ? 'Baixar Post' : 'Download Post'}
                        >
                          <Download size={20} strokeWidth={3} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <h2 className="font-display font-black text-4xl uppercase tracking-tighter">{blogT.whereToSend || (lang === 'pt' ? 'Para onde enviar?' : 'Where to send?')}</h2>
                  <p className="font-bold text-dark/40 uppercase text-xs tracking-widest">{blogT.chooseNetwork || (lang === 'pt' ? 'Escolha sua rede favorita' : 'Choose your favorite network')}</p>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-8 gap-4 px-2">
                  {shareLinks.map((link, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-2">
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => {
                          if (link.onClick) {
                            e.preventDefault();
                            link.onClick();
                          }
                        }}
                        className={`${link.color} w-14 h-14 border-2 border-[#000000] flex items-center justify-center transition-all shadow-[0_4px_0_0_#000000] hover:translate-y-[2px] hover:shadow-[0_2px_0_0_#000000] active:translate-y-[4px] active:shadow-none cursor-pointer rounded-full overflow-hidden`}
                      >
                        <link.icon className="w-7 h-7" strokeWidth={link.icon === Facebook || link.icon === Linkedin ? 1 : undefined} />
                      </a>
                      <span className="text-[10px] font-black uppercase tracking-tighter text-dark text-center">{link.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Decorative star */}
              <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-yellow border-4 border-dark rounded-full flex items-center justify-center -rotate-12 opacity-20">
                <Share2 size={40} className="text-dark" strokeWidth={3} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <Footer />

      <style>{`
        ::selection {
          background: #ffdf00;
          color: #000;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #fdfdf6;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #eee;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}

export default function BlogPostPage() {
  return <BlogPostContent />;
}
