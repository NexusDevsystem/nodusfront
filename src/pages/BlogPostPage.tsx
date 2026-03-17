import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/landing/Navbar';
import { Footer } from '../components/landing/Footer';
import { useLanguage } from '../components/landing/i18n/LanguageContext';
import { Calendar, User, Heart, ArrowLeft, FileText, ArrowRight, Share2, Twitter, Send, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
    } catch (error) {
      console.error('Error fetching post:', error);
      navigate('/blog');
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async () => {
    if (!post) return;
    try {
      const updated = await apiClient.upvoteBlogPost(post.id);
      setPost({ ...post, likesCount: updated.likesCount });
    } catch (error) {
      console.error('Error upvoting post:', error);
    }
  };
  
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnWhatsApp = () => {
    const text = encodeURIComponent(`Confira este artigo no Nodus: ${post?.title} - ${window.location.href}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const shareOnX = () => {
    const text = encodeURIComponent(`Confira este artigo no Nodus: ${post?.title}\n\n`);
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

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

            <div className="flex items-center gap-8 font-black uppercase text-sm tracking-widest text-dark/40 border-b-4 border-dark/5 pb-8">
              <span className="flex items-center gap-2 text-dark"><User size={20} strokeWidth={2.5} /> @{(post.author?.toLowerCase().includes('nodus') ? 'Nodus' : post.author)}</span>
              <button 
                onClick={handleUpvote}
                className="flex items-center gap-2 hover:text-red-500 transition-colors"
              >
                <Heart size={20} strokeWidth={2.5} className={post.likesCount ? "fill-red-500 text-red-500" : ""} /> {post.likesCount || 0}
              </button>
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
                    <img src={imgMatch[2]} alt={imgMatch[1]} className="w-full h-auto" />
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
          <footer className="pt-20 border-t-4 border-dark/5 flex flex-col items-center gap-16">
            <div className="flex flex-col items-center gap-8 text-center">
              <h3 className="font-display font-black text-4xl uppercase tracking-tighter">{blogT.enjoyedRead || (lang === 'pt' ? 'Gostou da leitura?' : 'Enjoyed the read?')}</h3>
              <div className="flex flex-wrap justify-center gap-6">
                <button 
                  onClick={handleUpvote}
                  className="group relative"
                >
                  <div className="absolute inset-0 bg-brand translate-y-2 rounded-2xl group-hover:translate-y-3 transition-transform"></div>
                  <div className="relative px-8 md:px-12 py-5 md:py-6 bg-white border-4 border-dark rounded-2xl flex items-center gap-4 group-active:translate-y-1 transition-all">
                    <Heart size={28} strokeWidth={3} className={post.likesCount ? "fill-red-500 text-red-500" : "text-dark"} />
                    <span className="font-black uppercase text-lg md:text-xl tracking-widest">{post.likesCount || 0} {blogT.likes || (lang === 'pt' ? 'Curtidas' : 'Likes')}</span>
                  </div>
                </button>

                <button 
                  onClick={() => setIsShareModalOpen(true)}
                  className="group relative"
                >
                  <div className="absolute inset-0 bg-[#FFA6F6] translate-y-2 rounded-2xl group-hover:translate-y-3 transition-transform"></div>
                  <div className="relative px-8 md:px-12 py-5 md:py-6 bg-white border-4 border-dark rounded-2xl flex items-center gap-4 group-active:translate-y-1 transition-all">
                    <Share2 size={28} strokeWidth={3} className="text-dark" />
                    <span className="font-black uppercase text-lg md:text-xl tracking-widest">{blogT.shareArticle || (lang === 'pt' ? 'Compartilhar Artigo' : 'Share Article')}</span>
                  </div>
                </button>
              </div>
            </div>
          </footer>
        </article>
      </main>

      {/* Share Modal */}
      <AnimatePresence>
        {isShareModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsShareModalOpen(false)}
              className="absolute inset-0 bg-dark/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-white border-4 border-dark rounded-[32px] shadow-[0_20px_0_0_#000] p-8 md:p-12 overflow-hidden"
            >
              <button 
                onClick={() => setIsShareModalOpen(false)}
                className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-xl transition-colors"
                title={blogT.close || (lang === 'pt' ? 'Fechar' : 'Close')}
              >
                <X size={24} strokeWidth={3} />
              </button>

              <div className="space-y-8">
                <div className="space-y-2">
                  <h2 className="font-display font-black text-4xl uppercase tracking-tighter">{blogT.whereToSend || (lang === 'pt' ? 'Para onde enviar?' : 'Where to send?')}</h2>
                  <p className="font-bold text-dark/40 uppercase text-xs tracking-widest">{blogT.chooseNetwork || (lang === 'pt' ? 'Escolha sua rede favorita' : 'Choose your favorite network')}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <button 
                    onClick={shareOnWhatsApp}
                    className="flex items-center gap-4 p-6 bg-white border-2 border-dark rounded-2xl hover:bg-brand transition-all font-black uppercase text-sm tracking-widest shadow-[0_6px_0_0_#000] hover:translate-y-[2px] hover:shadow-[0_4px_0_0_#000] active:translate-y-[6px] active:shadow-none"
                  >
                    <div className="p-3 bg-[#a5e6ab] border-2 border-dark rounded-xl">
                      <Send size={24} strokeWidth={3} />
                    </div>
                    WhatsApp
                  </button>
                  <button 
                    onClick={shareOnX}
                    className="flex items-center gap-4 p-6 bg-white border-2 border-dark rounded-2xl hover:bg-dark hover:text-white transition-all font-black uppercase text-sm tracking-widest shadow-[0_6px_0_0_#000] hover:translate-y-[2px] hover:shadow-[0_4px_0_0_#000] active:translate-y-[6px] active:shadow-none group"
                  >
                    <div className="p-3 bg-white border-2 border-dark rounded-xl text-dark group-hover:bg-white group-hover:text-dark">
                      <Twitter size={24} strokeWidth={3} />
                    </div>
                    X / Twitter
                  </button>
                </div>

                <div className="pt-4">
                  <span className="block font-black uppercase text-xs tracking-widest text-dark/30 mb-4">{blogT.copyLink || (lang === 'pt' ? 'Ou apenas copie o link' : 'Or just copy the link')}</span>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-slate-100 border-2 border-dark rounded-xl px-4 py-3 font-bold text-dark/60 truncate text-sm">
                      {window.location.href}
                    </div>
                    <button 
                      onClick={handleCopyLink}
                      className={`px-6 rounded-xl border-2 border-dark font-black uppercase text-xs tracking-widest transition-all shadow-[0_4px_0_0_#000] active:translate-y-[2px] active:shadow-none ${copied ? 'bg-green-500 text-white' : 'bg-white hover:bg-slate-50'}`}
                    >
                      {copied ? (blogT.copied || 'Copiado!') : (blogT.copy || 'Copiar')}
                    </button>
                  </div>
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
