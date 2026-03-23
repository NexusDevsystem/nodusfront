import React from 'react';
import { BlogPost } from '../types';
import { Calendar, User, Check, Heart, FileText, ArrowRight, Share2, Twitter, Send, X } from 'lucide-react';

interface BlogShareCardProps {
    post: BlogPost;
    cardRef: React.RefObject<HTMLDivElement | null>;
}

const BlogShareCard: React.FC<BlogShareCardProps> = ({ post, cardRef }) => {
    return (
        <div className="absolute top-0 left-0 w-0 h-0 overflow-hidden pointer-events-none z-[-1]">
            <div 
                ref={cardRef}
                id="blog-share-card-element"
                className="flex items-center justify-center"
                style={{ 
                    width: '1200px', 
                    height: '630px', 
                    fontFamily: 'Instrument Sans, Inter, sans-serif',
                    backgroundColor: 'transparent'
                }}
            >
                {/* Main Outer Container */}
            <div className="relative w-[1120px] h-[550px] rounded-[4rem] border-[10px] border-[#1a1a1a] shadow-[0_24px_0_0_#1a1a1a] overflow-hidden flex bg-[#fdfdf6]">
                
                {/* Left Side: Content */}
                <div className="flex-1 flex flex-col p-14 h-full relative z-10 w-3/5 border-r-[10px] border-[#1a1a1a]">
                    <div className="flex flex-col h-full justify-between">
                        {/* Header: Category */}
                        <div className="flex items-center gap-4">
                            <span className="bg-[#ffdf00] text-[#1a1a1a] border-4 border-[#1a1a1a] px-5 py-2 font-black uppercase text-xl md:text-2xl tracking-[0.2em] leading-none rounded-md">
                                {post.category || 'Novidades'}
                            </span>
                            <span className="font-black uppercase text-xl text-[#1a1a1a]/30 tracking-widest">
                                Nodus Official Blog
                            </span>
                        </div>

                        {/* Title & Excerpt */}
                        <div className="flex flex-col gap-6 -mt-8">
                            <h1 className="text-[72px] font-[900] tracking-tighter leading-[0.9] uppercase text-[#1a1a1a] line-clamp-3">
                                {post.title}
                            </h1>
                        </div>

                        {/* Footer: Author & Branding */}
                        <div className="flex items-center justify-between w-full pt-6 border-t-[6px] border-[#1a1a1a]/10">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white border-4 border-[#1a1a1a] rounded-md shrink-0">
                                    <User size={32} className="text-[#1a1a1a]" strokeWidth={3} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-black uppercase text-sm tracking-widest text-[#1a1a1a]/40">Autor</span>
                                    <span className="font-black uppercase text-2xl tracking-tighter text-[#1a1a1a]">
                                        @{post.author || 'Nodus'}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Heart size={36} strokeWidth={3} className="fill-red-500 text-red-500" />
                                <span className="font-black text-3xl text-[#1a1a1a]">{post.likesCount || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Image Cover */}
                <div className="w-2/5 h-full relative bg-white flex flex-col items-center justify-center p-8 overflow-hidden">
                    {/* Decorative pattern behind image */}
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #000 2px, transparent 2px)', backgroundSize: '24px 24px' }} />
                    
                    {post.imageUrl ? (
                        <div className="relative w-full h-[90%] border-[8px] border-[#1a1a1a] rounded-[2rem] overflow-hidden shadow-[0_12px_0_0_#1a1a1a] bg-black">
                            <img 
                                src={post.imageUrl} 
                                alt={post.title} 
                                className="w-full h-full object-cover"
                                crossOrigin="anonymous"
                                loading="eager"
                            />
                        </div>
                    ) : (
                        <div className="relative w-full h-[90%] border-[8px] border-[#1a1a1a] rounded-[2rem] overflow-hidden shadow-[0_12px_0_0_#1a1a1a] bg-[#1a1a1a] flex flex-col items-center justify-center gap-6">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ffdf00" className="w-40 h-40">
                                <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
                            </svg>
                            <span className="font-black uppercase text-6xl text-white tracking-tighter">Nodus</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
        </div>
    );
};

export default BlogShareCard;
