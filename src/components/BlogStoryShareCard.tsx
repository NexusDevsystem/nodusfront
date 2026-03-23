import React from 'react';
import { BlogPost } from '../types';
import { User, Heart } from 'lucide-react';

interface BlogStoryShareCardProps {
    post: BlogPost;
    cardRef: React.RefObject<HTMLDivElement | null>;
}

const BlogStoryShareCard: React.FC<BlogStoryShareCardProps> = ({ post, cardRef }) => {
    return (
        <div className="absolute top-0 left-0 w-0 h-0 overflow-hidden pointer-events-none z-[-1]">
            <div 
                ref={cardRef}
                id="blog-story-share-card-element"
                style={{ 
                    width: '1080px', 
                    height: '1920px', 
                    fontFamily: 'Instrument Sans, Inter, sans-serif',
                    backgroundColor: '#fdfdf6',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '80px 80px 100px 80px',
                    gap: '60px',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Background Texture */}
                <div style={{ position: 'absolute', inset: 0, opacity: 0.02, backgroundImage: 'radial-gradient(circle, #000 2px, transparent 2px)', backgroundSize: '40px 40px' }} />

                {/* 1. HEADER row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexShrink: 0 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <span style={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '28px', letterSpacing: '0.4em', color: 'rgba(26,26,26,0.3)' }}>Editoria</span>
                        <span style={{ background: '#ffdf00', color: '#1a1a1a', border: '8px solid #1a1a1a', padding: '12px 28px', fontWeight: 900, textTransform: 'uppercase', fontSize: '44px', letterSpacing: '0.15em', borderRadius: '18px', boxShadow: '8px 8px 0 0 #1a1a1a' }}>
                            {post.category || 'Novidades'}
                        </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', paddingTop: '16px' }}>
                        <span style={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '64px', letterSpacing: '-0.04em', color: '#1a1a1a', lineHeight: 1 }}>NODUS</span>
                        <div style={{ height: '8px', width: '96px', background: '#ffdf00', marginTop: '8px', border: '2px solid #1a1a1a' }} />
                    </div>
                </div>

                {/* 2. TITLE */}
                <div style={{ flexShrink: 0 }}>
                    <h1 style={{ fontSize: '84px', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: '0.88', textTransform: 'uppercase', color: '#1a1a1a', margin: 0 }}>
                        {post.title}
                    </h1>
                </div>

                {/* 3. IMAGE CARD */}
                <div style={{ flexShrink: 0, position: 'relative', border: '10px solid #1a1a1a', borderRadius: '48px', overflow: 'hidden', boxShadow: '24px 24px 0 0 #1a1a1a', height: '740px', background: '#1a1a1a' }}>
                    {/* Card Titlebar */}
                    <div style={{ padding: '16px 32px', borderBottom: '6px solid #1a1a1a', background: '#fdfdf6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#1a1a1a' }} />
                            <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#1a1a1a' }} />
                        </div>
                        <span style={{ fontWeight: 900, fontSize: '22px', textTransform: 'uppercase', letterSpacing: '0.3em', opacity: 0.2 }}>Post Oficial</span>
                    </div>
                    {/* Image */}
                    <div style={{ height: 'calc(100% - 68px)', position: 'relative' }}>
                        {post.imageUrl ? (
                            <img src={post.imageUrl} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} crossOrigin="anonymous" />
                        ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a1a1a' }}>
                                <svg viewBox="0 0 24 24" fill="#ffdf00" style={{ width: '180px', height: '180px' }}>
                                    <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
                                </svg>
                            </div>
                        )}
                        {/* Likes badge inside image, top-right */}
                        <div style={{ position: 'absolute', top: '20px', right: '20px', background: '#ffdf00', border: '6px solid #1a1a1a', borderRadius: '28px', padding: '16px 28px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '10px 10px 0 0 #1a1a1a' }}>
                            <Heart size={52} strokeWidth={5} style={{ fill: '#ef4444', color: '#ef4444' }} />
                            <span style={{ fontWeight: 900, fontSize: '60px', color: '#1a1a1a', lineHeight: 1 }}>{post.likesCount || 0}</span>
                        </div>
                    </div>
                </div>

                {/* 4. AUTHOR */}
                <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
                    <div style={{ background: '#ffdf00', border: '6px solid #1a1a1a', padding: '28px 60px', borderRadius: '999px', boxShadow: '10px 10px 0 0 #1a1a1a', display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ width: '80px', height: '80px', background: 'white', border: '4px solid #1a1a1a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <User size={40} strokeWidth={4} style={{ color: '#1a1a1a' }} />
                        </div>
                        <span style={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '56px', letterSpacing: '-0.03em', color: '#1a1a1a' }}>@{post.author || 'Nodus'}</span>
                    </div>
                </div>

                {/* 5. FOOTER CTA */}
                <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'center', paddingBottom: '20px' }}>
                    <span style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '30px', letterSpacing: '0.25em', color: 'rgba(26,26,26,0.35)', textAlign: 'center' }}>
                        Acesse para ler o artigo completo
                    </span>
                </div>
            </div>
        </div>
    );
};

export default BlogStoryShareCard;
