import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { forumService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { FaEye, FaComment, FaThumbsUp, FaHeart, FaLaugh, FaSurprise, FaSadTear, FaAngry, FaPlus, FaSearch, FaPenNib, FaNewspaper, FaEllipsisV, FaTrash, FaFlag, FaShareAlt } from 'react-icons/fa';

const reactionIcons = {
    LIKE: <FaThumbsUp />, HEART: <FaHeart style={{ color: '#e74c3c' }} />,
    HAHA: <FaLaugh style={{ color: '#f39c12' }} />, WOW: <FaSurprise style={{ color: '#f39c12' }} />,
    SAD: <FaSadTear style={{ color: '#f39c12' }} />, ANGRY: <FaAngry style={{ color: '#e74c3c' }} />
};

const ForumHome = () => {
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const [posts, setPosts] = useState([]);
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [keyword, setKeyword] = useState('');
    const [selectedType, setSelectedType] = useState(searchParams.get('type') || '');
    const [selectedTopic, setSelectedTopic] = useState(searchParams.get('topicId') || '');
    const [selectedAuthor, setSelectedAuthor] = useState(null);
    const [activeMenuForPost, setActiveMenuForPost] = useState(null);
    const [showShareModal, setShowShareModal] = useState(false);
    const [sharingPost, setSharingPost] = useState(null);

    useEffect(() => {
        loadTopics();
    }, []);

    useEffect(() => {
        loadPosts();
    }, [page, selectedType, selectedTopic, selectedAuthor]);

    const loadTopics = async () => {
        try {
            const res = await forumService.getTopics();
            setTopics(res.data?.data || []);
        } catch { /* ignore */ }
    };

    const loadPosts = async () => {
        setLoading(true);
        try {
            const params = { page, size: 10 };
            if (selectedType) params.type = selectedType;
            if (selectedTopic) params.topicId = selectedTopic;
            if (selectedAuthor !== null && selectedAuthor !== undefined) params.authorId = selectedAuthor;
            if (keyword && keyword.trim()) params.keyword = keyword;
            const res = await forumService.getPosts(params);
            const data = res.data?.data;
            setPosts(data?.content || []);
            setTotalPages(data?.totalPages || 0);
        } catch { toast.error('Không thể tải bài viết'); }
        setLoading(false);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(0);
        loadPosts();
    };

    const handleReact = async (postId, type) => {
        if (!user) { toast.warning('Vui lòng đăng nhập'); return; }
        try {
            const res = await forumService.reactToPost(postId, type);
            setPosts(prev => prev.map(p => p.id === postId ? res.data?.data : p));
        } catch { toast.error('Lỗi'); }
    };

    const handleDelete = async (postId) => {
        if (!window.confirm('Xoá bài viết này?')) return;
        try {
            await forumService.deletePost(postId);
            toast.success('Đã xoá');
            setPosts(prev => prev.filter(p => p.id !== postId));
            setActiveMenuForPost(null);
        } catch { toast.error('Lỗi'); }
    };

    const handleReport = async (postId) => {
        try {
            await forumService.reportPost(postId);
            toast.success('Đã báo cáo bài viết');
            setActiveMenuForPost(null);
        } catch { toast.error('Lỗi'); }
    };

    const shareUrl = (postId) => `${window.location.origin}/forum/post/${postId}`;

    const totalReactions = (counts) => Object.values(counts || {}).reduce((a, b) => a + b, 0);

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px', display: 'flex', gap: 24 }}>
            {/* Sidebar */}
            <div style={{ width: 260, flexShrink: 0, position: 'sticky', top: 24, height: 'fit-content' }}>
                <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,.06)', marginBottom: 16 }}>
                    <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: '#1a1a2e' }}>Chủ đề</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <button onClick={() => { setSelectedTopic(''); setSelectedType(''); setSelectedAuthor(null); setPage(0); }}
                            style={{
                                textAlign: 'left', padding: '8px 12px', border: 'none', borderRadius: 8, cursor: 'pointer',
                                background: !selectedTopic && !selectedType && !selectedAuthor ? '#4f46e5' : 'transparent',
                                color: !selectedTopic && !selectedType && !selectedAuthor ? '#fff' : '#555', fontWeight: 600, fontSize: 14
                            }}>
                            Tất cả
                        </button>
                        {user && (
                            <button onClick={() => { setSelectedAuthor(user.id); setSelectedTopic(''); setSelectedType(''); setKeyword(''); setPage(0); }}
                                style={{
                                    textAlign: 'left', padding: '8px 12px', border: 'none', borderRadius: 8, cursor: 'pointer',
                                    background: Number(selectedAuthor) === Number(user.id) ? '#4f46e5' : 'transparent',
                                    color: Number(selectedAuthor) === Number(user.id) ? '#fff' : '#555', fontWeight: 600, fontSize: 14
                                }}>
                                Bài viết của tôi
                            </button>
                        )}
                        <button onClick={() => { setSelectedType('SHORT'); setSelectedTopic(''); setSelectedAuthor(null); setPage(0); }}
                            style={{
                                textAlign: 'left', padding: '8px 12px', border: 'none', borderRadius: 8, cursor: 'pointer',
                                background: selectedType === 'SHORT' ? '#4f46e5' : 'transparent',
                                color: selectedType === 'SHORT' ? '#fff' : '#555', fontWeight: 600, fontSize: 14,
                                display: 'flex', alignItems: 'center', gap: 8
                            }}>
                            <FaPenNib /> Bài ngắn
                        </button>
                        <button onClick={() => { setSelectedType('LONG'); setSelectedTopic(''); setSelectedAuthor(null); setPage(0); }}
                            style={{
                                textAlign: 'left', padding: '8px 12px', border: 'none', borderRadius: 8, cursor: 'pointer',
                                background: selectedType === 'LONG' ? '#4f46e5' : 'transparent',
                                color: selectedType === 'LONG' ? '#fff' : '#555', fontWeight: 600, fontSize: 14,
                                display: 'flex', alignItems: 'center', gap: 8
                            }}>
                            <FaNewspaper /> Bài dài
                        </button>
                        <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '8px 0' }} />
                        {topics.map(t => (
                            <button key={t.id} onClick={() => { setSelectedTopic(t.id); setSelectedType(''); setSelectedAuthor(null); setPage(0); }}
                                style={{
                                    textAlign: 'left', padding: '8px 12px', border: 'none', borderRadius: 8, cursor: 'pointer',
                                    background: Number(selectedTopic) === t.id ? '#4f46e5' : 'transparent',
                                    color: Number(selectedTopic) === t.id ? '#fff' : '#555', fontWeight: 500, fontSize: 14
                                }}>
                                {t.title}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main */}
            <div style={{ flex: 1, minWidth: 0 }}>
                {/* Toolbar */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center' }}>
                    <form onSubmit={handleSearch} style={{ display: 'flex', flex: 1, gap: 0, background: '#fff', borderRadius: 30, border: '2px solid #e0e0e0', overflow: 'hidden', transition: 'border .2s', paddingLeft: 4 }}>
                        <input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="Tìm kiếm bài viết..."
                            style={{ flex: 1, padding: '10px 16px', border: 'none', borderRadius: 0, fontSize: 14, outline: 'none' }}
                            onFocus={e => e.target.parentElement.style.borderColor = '#4f46e5'} onBlur={e => e.target.parentElement.style.borderColor = '#e0e0e0'} />
                        <button type="submit" style={{ padding: '10px 24px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
                            <FaSearch /> Tìm
                        </button>
                    </form>
                    {user && (
                        <Link to="/forum/create" style={{ padding: '10px 24px', background: '#4f46e5', color: '#fff', borderRadius: 30, textDecoration: 'none', fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)' }}>
                            <FaPlus /> Đăng bài
                        </Link>
                    )}
                </div>

                {/* Posts */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: 60 }}>
                        <div className="spinner" style={{ margin: '0 auto' }}></div>
                    </div>
                ) : posts.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 60, background: '#fff', borderRadius: 12, color: '#999' }}>
                        <p style={{ fontSize: 48, margin: 0 }}>📭</p>
                        <p>Chưa có bài viết nào</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {posts.map(post => (
                            <div key={post.id} style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,.06)', transition: 'transform .2s, box-shadow .2s' }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,.1)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,.06)'; }}>
                                {/* Author */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#4f46e5', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, overflow: 'hidden' }}>
                                        {post.authorAvatar ? <img src={post.authorAvatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : post.authorName?.[0]}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, color: '#1a1a2e', fontSize: 14 }}>{post.authorName}</div>
                                        <div style={{ color: '#999', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                                            {new Date(post.createdAt).toLocaleDateString('vi-VN')} •
                                            {post.postType === 'LONG' ? <><FaNewspaper /> Bài dài</> : <><FaPenNib /> Bài ngắn</>}
                                        </div>
                                    </div>
                                    {post.topicTitle && <span style={{ padding: '4px 10px', background: '#f0f0ff', color: '#4f46e5', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{post.topicTitle}</span>}

                                    {/* Action dropdown */}
                                    <div style={{ marginLeft: 'auto', position: 'relative' }}>
                                        <button onClick={(e) => { e.stopPropagation(); setActiveMenuForPost(activeMenuForPost === post.id ? null : post.id); }}
                                            style={{ background: '#f5f5f5', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#666' }}>
                                            <FaEllipsisV />
                                        </button>
                                        {activeMenuForPost === post.id && (
                                            <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: 8, background: '#fff', borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,.15)', padding: 8, zIndex: 10, minWidth: 200 }}>
                                                <button onClick={(e) => { e.stopPropagation(); setSharingPost(post); setShowShareModal(true); setActiveMenuForPost(null); }}
                                                    style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 12px', border: 'none', background: 'none', cursor: 'pointer', borderRadius: 8, fontSize: 14, color: '#444', fontWeight: 500, textAlign: 'left', whiteSpace: 'nowrap' }}
                                                    onMouseEnter={e => e.target.style.background = '#f5f5f5'} onMouseLeave={e => e.target.style.background = 'none'}>
                                                    <FaShareAlt style={{ color: '#4f46e5' }} /> Chia sẻ bài viết
                                                </button>
                                                <button onClick={(e) => { e.stopPropagation(); handleReport(post.id); }}
                                                    style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 12px', border: 'none', background: 'none', cursor: 'pointer', borderRadius: 8, fontSize: 14, color: '#444', fontWeight: 500, textAlign: 'left', whiteSpace: 'nowrap' }}
                                                    onMouseEnter={e => e.target.style.background = '#f5f5f5'} onMouseLeave={e => e.target.style.background = 'none'}>
                                                    <FaFlag style={{ color: '#f39c12' }} /> Báo cáo vi phạm
                                                </button>
                                                {user && (user.id === post.authorId || user.role === 'ADMIN') && (
                                                    <>
                                                        <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '4px 0' }} />
                                                        <button onClick={(e) => { e.stopPropagation(); handleDelete(post.id); }}
                                                            style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 12px', border: 'none', background: 'none', cursor: 'pointer', borderRadius: 8, fontSize: 14, color: '#e74c3c', fontWeight: 500, textAlign: 'left', whiteSpace: 'nowrap' }}
                                                            onMouseEnter={e => e.target.style.background = '#fff0f0'} onMouseLeave={e => e.target.style.background = 'none'}>
                                                            <FaTrash /> Xoá bài viết
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {/* Title & Content */}
                                <Link to={`/forum/post/${post.id}`} style={{ textDecoration: 'none' }}>
                                    {post.title && <h3 style={{ margin: '0 0 8px', color: '#1a1a2e', fontSize: 18, fontWeight: 700 }}>{post.title}</h3>}
                                    <p style={{ color: '#555', margin: '0 0 12px', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{post.content}</p>
                                </Link>
                                {/* Files preview */}
                                {post.files?.length > 0 && (
                                    <div style={{ display: 'flex', gap: 8, marginBottom: 12, overflowX: 'auto' }}>
                                        {post.files.slice(0, 4).map((f, i) => (
                                            f.fileType?.startsWith('image') && <img key={i} src={f.filePath} alt="" style={{ width: 120, height: 90, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
                                        ))}
                                    </div>
                                )}
                                {/* Tags */}
                                {post.tags?.length > 0 && (
                                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                                        {post.tags.map((tag, i) => <span key={i} style={{ padding: '3px 10px', background: '#f5f5f5', borderRadius: 20, fontSize: 12, color: '#4f46e5', fontWeight: 500 }}>#{tag}</span>)}
                                    </div>
                                )}
                                {/* Footer */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 16, borderTop: '1px solid #f0f0f0', paddingTop: 12 }}>
                                    <div style={{ display: 'flex', gap: 4 }}>
                                        {Object.keys(reactionIcons).map(type => (
                                            <button key={type} onClick={() => handleReact(post.id, type)}
                                                style={{ background: post.userReaction === type ? '#f0f0ff' : 'transparent', border: post.userReaction === type ? '1px solid #4f46e5' : '1px solid transparent', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', gap: 4, transition: 'all .2s' }}
                                                title={type}>
                                                {reactionIcons[type]}
                                                {(post.reactionCounts?.[type] || 0) > 0 && <span style={{ fontSize: 12, color: '#666' }}>{post.reactionCounts[type]}</span>}
                                            </button>
                                        ))}
                                    </div>
                                    <Link to={`/forum/post/${post.id}`} style={{ marginLeft: 'auto', display: 'flex', gap: 16, color: '#999', fontSize: 13, textDecoration: 'none' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FaComment /> {post.commentCount || 0}</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FaEye /> {post.viewCount || 0}</span>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
                        {Array.from({ length: totalPages }, (_, i) => (
                            <button key={i} onClick={() => setPage(i)}
                                style={{
                                    width: 36, height: 36, borderRadius: 8, border: 'none', cursor: 'pointer',
                                    background: page === i ? '#4f46e5' : '#f5f5f5', color: page === i ? '#fff' : '#555', fontWeight: 600
                                }}>
                                {i + 1}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Global Share Modal */}
            {showShareModal && sharingPost && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }} onClick={() => setShowShareModal(false)}>
                    <div style={{ background: '#fff', borderRadius: 16, padding: 28, minWidth: 480, maxWidth: '90%', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
                        <h3 style={{ margin: '0 0 16px', fontSize: 20, fontWeight: 700, color: '#1a1a2e' }}>Chia sẻ bài viết</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl(sharingPost.id))}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px', background: '#f0f2f5', borderRadius: 10, color: '#1877f2', textDecoration: 'none', fontWeight: 600 }}>Facebook</a>
                            <a href={`https://zalo.me/share?url=${encodeURIComponent(shareUrl(sharingPost.id))}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px', background: '#f0f2f5', borderRadius: 10, color: '#0068ff', textDecoration: 'none', fontWeight: 600 }}>Zalo</a>
                            <button onClick={() => { navigator.clipboard.writeText(shareUrl(sharingPost.id)); toast.success('Đã sao chép link'); setShowShareModal(false); }} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px', background: '#f0f2f5', border: 'none', borderRadius: 10, color: '#555', cursor: 'pointer', fontWeight: 600, textAlign: 'left' }}>Sao chép link</button>
                        </div>
                        <button onClick={() => setShowShareModal(false)} style={{ width: '100%', marginTop: 16, padding: '10px', background: 'none', border: '1px solid #eee', borderRadius: 8, cursor: 'pointer', color: '#999' }}>Đóng</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ForumHome;
