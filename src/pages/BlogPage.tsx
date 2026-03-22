import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/landing/Navbar';
import { Footer } from '../components/landing/Footer';
import { LanguageProvider, useLanguage } from '../components/landing/i18n/LanguageContext';
import { Calendar, User, ArrowRight, Search, Heart, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { apiClient } from '../services/apiClient';
import { BlogPost } from '../types';

function BlogContent() {
  const { t } = useLanguage();
  const blogT = t.blog;
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [fingerprint, setFingerprint] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchPosts();

    // Basic device identification for anonymous likes
    let fp = localStorage.getItem('nodus_blog_fingerprint');
    if (!fp) {
      fp = Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem('nodus_blog_fingerprint', fp);
    }
    setFingerprint(fp);
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getPublicBlogPosts();
      setPosts(data);
      
      // Update last seen timestamp to clear navbar badge
      localStorage.setItem('nodus_blog_last_seen', Date.now().toString());
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async (postId: string) => {
    try {
      const updated = await apiClient.upvoteBlogPost(postId, fingerprint);
      setPosts((prev: BlogPost[]) => prev.map((p: BlogPost) => p.id === postId ? { ...p, likesCount: updated.likesCount } : p));
    } catch (error) {
      console.error('Error upvoting post:', error);
    }
  };

  const filteredPosts = posts.filter((p: BlogPost) => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const featuredPost = filteredPosts[0];
  const remainingPosts = filteredPosts.slice(1);

  return (
    <div className="landing-page-root min-h-screen bg-[#fdfdf6]">
      <Navbar />
      
      <main className="pt-40 pb-20 px-6 max-w-7xl mx-auto">
        {/* Professional Header / Editorial Intro */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20 border-b-4 border-dark pb-12">
          <div className="max-w-3xl">
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="inline-block bg-[#000000] text-[#ffffff] px-4 py-1.5 font-black uppercase text-sm tracking-widest mb-6 border-2 border-dark"
            >
              {blogT.editorial}
            </motion.div>
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="font-display font-black text-6xl md:text-8xl tracking-tighter text-dark uppercase leading-[0.85]"
            >
              {blogT.prefix} <span className="text-brand">{blogT.name}</span><br/>{blogT.title}
            </motion.h1>
          </div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col gap-4"
          >
            <div className="flex items-center gap-4 bg-white border-2 border-dark rounded-xl px-6 py-3 shadow-[0_6px_0_0_#000]">
              <Search size={20} />
              <input 
                type="text" 
                placeholder={blogT.search} 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-transparent font-black uppercase tracking-tight outline-none w-48 text-sm" 
              />
            </div>
            <p className="text-right font-black uppercase text-xs tracking-tighter opacity-40">{blogT.est}</p>
          </motion.div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-40">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-brand"></div>
          </div>
        ) : !featuredPost ? (
           <div className="text-center p-40 border-4 border-dark border-dashed rounded-[40px] bg-slate-50/50">
             <h2 className="text-2xl font-black uppercase text-slate-300 tracking-widest">{blogT.noPosts || 'Aguardando novidades...'}</h2>
           </div>
        ) : (
          <>

        {/* Featured Post - Large Horizontal Layout */}
        <section className="mb-24">
          <motion.article
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => navigate(`/blog/${featuredPost.slug}`)}
            className="group flex flex-col lg:flex-row gap-12 items-center cursor-pointer"
          >
            <div className="w-full lg:w-3/5 relative">
              <div className="absolute inset-0 bg-brand translate-y-4 rounded-3xl -z-10 border-4 border-dark transition-transform group-hover:translate-y-6"></div>
              <div className="aspect-[16/9] bg-white border-4 border-dark rounded-3xl overflow-hidden">
                <img 
                  src={featuredPost.imageUrl || "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800"} 
                  alt={featuredPost.title} 
                  className="w-full h-full object-cover grayscale transition-all group-hover:grayscale-0 group-hover:scale-105 duration-500" 
                />
              </div>
            </div>
            
            <div className="w-full lg:w-2/5 flex flex-col gap-6">
              <div className="flex items-center gap-4">
                 <span className={`
                  font-black text-[10px] uppercase tracking-widest px-4 py-1.5 border-2 border-dark rounded-xl shadow-[3px_3px_0_0_#000]
                  ${featuredPost.category === 'Atualização' ? 'bg-[#97cd7a]' : 
                    featuredPost.category === 'Novidades' ? 'bg-[#ffdf00]' : 'bg-slate-100'}
                `}>
                  {featuredPost.category === 'Atualização' ? blogT.categories.design : 
                   featuredPost.category === 'Novidades' ? blogT.categories.updates : 
                   featuredPost.category === 'Cultura' ? blogT.categories.culture :
                   featuredPost.category === 'Off Topic' ? blogT.categories.mastery :
                   featuredPost.category}
                </span>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleUpvote(featuredPost.id); }}
                  className="flex items-center gap-2 font-black text-xs uppercase bg-white border-2 border-dark px-3 py-1 hover:bg-brand transition-colors"
                >
                  <Heart size={14} className={featuredPost.likesCount ? "text-red-500 fill-red-500" : ""} /> {featuredPost.likesCount || 0}
                </button>
                <div className="flex items-center gap-2 font-black text-xs uppercase bg-white border-2 border-dark px-3 py-1 opacity-50 cursor-not-allowed">
                  <MessageSquare size={14} /> 0
                </div>
              </div>
              <h2 className="font-display font-black text-4xl md:text-5xl uppercase leading-none tracking-tighter group-hover:text-brand transition-colors">
                {featuredPost.title}
              </h2>
              <p className="font-bold text-gray-600 text-lg leading-snug line-clamp-4">
                {featuredPost.excerpt}
              </p>
              <div className="flex items-center gap-6 font-black uppercase text-xs tracking-tight text-gray-400">
                 <span className="flex items-center gap-1.5"><Calendar size={14} /> {new Date(featuredPost.publishedAt || featuredPost.createdAt || '').toLocaleDateString()}</span>
                 <span className="flex items-center gap-1.5"><User size={14} /> {(featuredPost.author?.toLowerCase().includes('nodus') ? 'Nodus' : featuredPost.author)}</span>
              </div>
              <button className="flex items-center gap-2 font-black uppercase text-sm group-hover:translate-x-2 transition-transform self-start border-b-4 border-brand">
                {blogT.readMore} <ArrowRight size={18} />
              </button>
            </div>
          </motion.article>
        </section>

        {/* Editorial List Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 border-t-4 border-dark pt-16">
          <div className="lg:col-span-2 flex flex-col gap-16">
            <h3 className="font-display font-black text-3xl uppercase border-l-4 border-brand pl-6">{blogT.latest}</h3>
            
            {remainingPosts.map((post: BlogPost, index: number) => (
              <motion.article 
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                onClick={() => navigate(`/blog/${post.slug}`)}
                className="group flex flex-col sm:flex-row gap-8 items-start border-b-2 border-dark/10 pb-16 last:border-0 hover:bg-white/50 p-4 rounded-2xl transition-all cursor-pointer"
              >
                <div className="w-full sm:w-48 h-32 shrink-0 border-2 border-dark rounded-xl overflow-hidden">
                  <img src={post.imageUrl || "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&q=80&w=800"} alt={post.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                </div>
                <div className="flex-1 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className={`
                      font-black text-[10px] uppercase tracking-widest px-3 py-1 border-2 border-dark rounded-lg shadow-[2px_2px_0_0_#000]
                      ${post.category === 'Atualização' ? 'bg-[#97cd7a]' : 
                        post.category === 'Novidades' ? 'bg-[#ffdf00]' : 'bg-slate-100'}
                    `}>
                      {post.category === 'Atualização' ? blogT.categories.design : 
                       post.category === 'Novidades' ? blogT.categories.updates : 
                       post.category === 'Cultura' ? blogT.categories.culture :
                       post.category === 'Off Topic' ? blogT.categories.mastery :
                       post.category}
                    </span>
                    <span className="font-black text-[10px] uppercase tracking-[0.2em] opacity-30 ml-2">
                      // {new Date(post.publishedAt || post.createdAt || '').toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleUpvote(post.id); }}
                        className="flex items-center gap-1.5 font-black text-[10px] uppercase bg-slate-50 border border-dark/10 px-2 py-1 rounded hover:bg-brand hover:border-dark transition-all"
                      >
                        <Heart size={10} className={post.likesCount ? "text-red-500 fill-red-500" : ""} /> {post.likesCount || 0}
                      </button>
                      <div className="flex items-center gap-1.5 font-black text-[10px] uppercase bg-slate-50 border border-dark/10 px-2 py-1 rounded opacity-50">
                        <MessageSquare size={10} /> 0
                      </div>
                    </div>
                  </div>
                  <h4 className="font-display font-black text-2xl md:text-3xl uppercase leading-tight group-hover:text-brand transition-colors tracking-tight">
                    {post.title}
                  </h4>
                  <p className="font-bold text-gray-400 text-sm line-clamp-2">
                    {post.excerpt}
                  </p>
                </div>
              </motion.article>
            ))}
          </div>

          {/* Sidebar Editorial Style */}
          <aside className="lg:col-span-1 border-l-4 border-dark pl-12 hidden lg:block">
            <div className="sticky top-40 space-y-16">
              <div>
                <h3 className="font-display font-black text-2xl uppercase mb-8">{blogT.quickReads}</h3>
                <div className="space-y-8">
                  {posts.slice(0, 3).map(post => (
                    <div key={post.id} onClick={() => navigate(`/blog/${post.slug}`)} className="group cursor-pointer">
                      <div className={`
                        font-black text-[8px] uppercase tracking-widest px-2 py-0.5 border border-dark rounded-md shadow-[1.5px_1.5px_0_0_#000] w-fit mb-2
                        ${post.category === 'Atualização' ? 'bg-[#97cd7a]' : 
                          post.category === 'Novidades' ? 'bg-[#ffdf00]' : 'bg-slate-100'}
                      `}>
                        {post.category === 'Atualização' ? blogT.categories.design : 
                         post.category === 'Novidades' ? blogT.categories.updates : 
                         post.category === 'Cultura' ? blogT.categories.culture :
                         post.category === 'Off Topic' ? blogT.categories.mastery :
                         post.category}
                      </div>
                      <div className="font-black text-[8px] uppercase tracking-widest opacity-30 mb-1">
                        // {new Date(post.publishedAt || post.createdAt || '').toLocaleDateString()}
                      </div>
                      <p className="font-bold text-dark leading-tight group-hover:underline">
                        {post.title}
                      </p>
                    </div>
                  ))}
                </div>
              </div>


            </div>
          </aside>
        </div>
        </>
        )}
      </main>

      <Footer />
      
      <style>{`
        .shadow-text {
          text-shadow: 4px 4px 0 #000;
        }
        ::selection {
          background: #ffdf00;
          color: #000;
        }
      `}</style>
    </div>
  );
}

export default function BlogPage() {
  return <BlogContent />;
}
