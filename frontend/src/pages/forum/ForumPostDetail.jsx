import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { forumService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { FaThumbsUp, FaHeart, FaLaugh, FaSurprise, FaSadTear, FaAngry, FaEye, FaComment, FaTrash, FaFlag, FaShareAlt, FaReply, FaArrowLeft, FaNewspaper, FaPenNib, FaEllipsisV } from 'react-icons/fa';

const reactionIcons = {
    LIKE: <FaThumbsUp />, HEART: <FaHeart style={{ color: '#e74c3c' }} />,
    HAHA: <FaLaugh style={{ color: '#f39c12' }} />, WOW: <FaSurprise style={{ color: '#f39c12' }} />,
    SAD: <FaSadTear style={{ color: '#f39c12' }} />, ANGRY: <FaAngry style={{ color: '#e74c3c' }} />
};

const ForumPostDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState('');
    const [replyTo, setReplyTo] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [loading, setLoading] = useState(true);
    const [showShare, setShowShare] = useState(false);
    const [showActions, setShowActions] = useState(false);

    useEffect(() => { loadPost(); loadComments(); }, [id]);

    const loadPost = async () => {
        try {
            const res = await forumService.getPost(id);
            setPost(res.data?.data);
        } catch { toast.error('Không tìm thấy bài viết'); navigate('/forum'); }
        setLoading(false);
    };

    const loadComments = async () => {
        try {
            const res = await forumService.getComments(id, { page: 0, size: 50 });
            setComments(res.data?.data?.content || []);
        } catch { /* ignore */ }
    };

    const handleReact = async (type) => {
        if (!user) { toast.warning('Vui lòng đăng nhập'); return; }
        try {
            const res = await forumService.reactToPost(id, type);
            setPost(res.data?.data);
        } catch { toast.error('Lỗi'); }
    };

    const handleComment = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        try {
            const formData = new FormData();
            formData.append('comment', new Blob([JSON.stringify({ content: commentText })], { type: 'application/json' }));
            await forumService.addComment(id, formData);
            setCommentText('');
            loadComments();
            toast.success('Đã bình luận');
        } catch { toast.error('Lỗi bình luận'); }
    };

    const handleReply = async (e, parentId) => {
        e.preventDefault();
        if (!replyText.trim()) return;
        try {
            const formData = new FormData();
            formData.append('comment', new Blob([JSON.stringify({ content: replyText, parentId })], { type: 'application/json' }));
            await forumService.addComment(id, formData);
            setReplyText('');
            setReplyTo(null);
            loadComments();
        } catch { toast.error('Lỗi'); }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm('Xoá bình luận này?')) return;
        try { await forumService.deleteComment(commentId); loadComments(); } catch { toast.error('Lỗi'); }
    };

    const handleDelete = async () => {
        if (!window.confirm('Xoá bài viết này?')) return;
        try { await forumService.deletePost(id); toast.success('Đã xoá'); navigate('/forum'); } catch { toast.error('Lỗi'); }
    };

    const handleReport = async () => {
        try { await forumService.reportPost(id); toast.success('Đã báo cáo bài viết'); setShowActions(false); } catch { toast.error('Lỗi'); }
    };

    const shareUrl = window.location.href;

    if (loading) return <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" style={{ margin: '0 auto' }}></div></div>;
    if (!post) return null;

    return (
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 16px' }}>
            <Link to="/forum" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#4f46e5', textDecoration: 'none', marginBottom: 20, fontWeight: 600 }}>
                <FaArrowLeft /> Quay lại
            </Link>

            <div style={{ background: '#fff', borderRadius: 16, padding: 28, boxShadow: '0 4px 20px rgba(0,0,0,.08)' }}>
                {/* Author */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#4f46e5', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, overflow: 'hidden' }}>
                        {post.authorAvatar ? <img src={post.authorAvatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : post.authorName?.[0]}
                    </div>
                    <div>
                        <div style={{ fontWeight: 700, color: '#1a1a2e', fontSize: 16 }}>{post.authorName}</div>
                        <div style={{ color: '#999', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
                            {new Date(post.createdAt).toLocaleString('vi-VN')} •
                            {post.postType === 'LONG' ? <><FaNewspaper /> Bài dài</> : <><FaPenNib /> Bài ngắn</>}
                        </div>
                    </div>
                    <div style={{ marginLeft: 'auto', position: 'relative' }}>
                        <button onClick={() => setShowActions(!showActions)}
                            style={{ background: '#f5f5f5', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#666' }}>
                            <FaEllipsisV />
                        </button>
                        {showActions && (
                            <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: 8, background: '#fff', borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,.15)', padding: 8, zIndex: 10, minWidth: 200 }}>
                                <button onClick={() => { setShowShare(true); setShowActions(false); }}
                                    style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 12px', border: 'none', background: 'none', cursor: 'pointer', borderRadius: 8, fontSize: 14, color: '#444', fontWeight: 500, textAlign: 'left', whiteSpace: 'nowrap' }}
                                    onMouseEnter={e => e.target.style.background = '#f5f5f5'} onMouseLeave={e => e.target.style.background = 'none'}>
                                    <FaShareAlt style={{ color: '#4f46e5' }} /> Chia sẻ bài viết
                                </button>
                                <button onClick={handleReport}
                                    style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 12px', border: 'none', background: 'none', cursor: 'pointer', borderRadius: 8, fontSize: 14, color: '#444', fontWeight: 500, textAlign: 'left', whiteSpace: 'nowrap' }}
                                    onMouseEnter={e => e.target.style.background = '#f5f5f5'} onMouseLeave={e => e.target.style.background = 'none'}>
                                    <FaFlag style={{ color: '#f39c12' }} /> Báo cáo vi phạm
                                </button>
                                {user && (user.id === post.authorId || user.role === 'ADMIN') && (
                                    <>
                                        <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '4px 0' }} />
                                        <button onClick={handleDelete}
                                            style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 12px', border: 'none', background: 'none', cursor: 'pointer', borderRadius: 8, fontSize: 14, color: '#e74c3c', fontWeight: 500, textAlign: 'left', whiteSpace: 'nowrap' }}
                                            onMouseEnter={e => e.target.style.background = '#fff0f0'} onMouseLeave={e => e.target.style.background = 'none'}>
                                            <FaTrash /> Xoá bài viết
                                        </button>
                                    </>
                                )}
                            </div>
                        )}

                        {showShare && (
                            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }} onClick={() => setShowShare(false)}>
                                <div style={{ background: '#fff', borderRadius: 16, padding: 28, minWidth: 480, maxWidth: '90%', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
                                    <h3 style={{ margin: '0 0 16px', fontSize: 20, fontWeight: 700, color: '#1a1a2e' }}>Chia sẻ bài viết</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                        <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px', background: '#f0f2f5', borderRadius: 10, color: '#1877f2', textDecoration: 'none', fontWeight: 600 }}>Facebook</a>
                                        <a href={`https://zalo.me/share?url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px', background: '#f0f2f5', borderRadius: 10, color: '#0068ff', textDecoration: 'none', fontWeight: 600 }}>Zalo</a>
                                        <button onClick={() => { navigator.clipboard.writeText(shareUrl); toast.success('Đã sao chép link'); setShowShare(false); }} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px', background: '#f0f2f5', border: 'none', borderRadius: 10, color: '#555', cursor: 'pointer', fontWeight: 600, textAlign: 'left' }}>Sao chép link</button>
                                    </div>
                                    <button onClick={() => setShowShare(false)} style={{ width: '100%', marginTop: 16, padding: '10px', background: 'none', border: '1px solid #eee', borderRadius: 8, cursor: 'pointer', color: '#999' }}>Đóng</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Topic & Tags */}
                {post.topicTitle && <span style={{ padding: '4px 12px', background: '#f0f0ff', color: '#4f46e5', borderRadius: 20, fontSize: 13, fontWeight: 600, marginBottom: 16, display: 'inline-block' }}>{post.topicTitle}</span>}

                {/* Title & Content */}
                {post.title && <h1 style={{ margin: '12px 0 16px', fontSize: 26, fontWeight: 800, color: '#1a1a2e', lineHeight: 1.3 }}>{post.title}</h1>}
                <div style={{ color: '#444', lineHeight: 1.8, fontSize: 16, marginBottom: 20, whiteSpace: 'pre-wrap' }}>{post.content}</div>

                {/* Files */}
                {post.files?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
                        {post.files.map((f, i) => (
                            f.fileType?.startsWith('image') ?
                                <img key={i} src={f.filePath} alt={f.originalName} style={{ maxWidth: '100%', maxHeight: 400, borderRadius: 10, cursor: 'pointer' }} onClick={() => window.open(f.filePath, '_blank')} /> :
                                f.fileType?.startsWith('video') ?
                                    <video key={i} controls style={{ maxWidth: '100%', borderRadius: 10 }}><source src={f.filePath} type={f.fileType} /></video> :
                                    <a key={i} href={f.filePath} target="_blank" rel="noreferrer" style={{ padding: '8px 16px', background: '#f5f5f5', borderRadius: 8, color: '#4f46e5', textDecoration: 'none' }}>📎 {f.originalName}</a>
                        ))}
                    </div>
                )}

                {post.tags?.length > 0 && <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>{post.tags.map((t, i) => <span key={i} style={{ padding: '4px 10px', background: '#f5f5f5', borderRadius: 20, fontSize: 13, color: '#4f46e5', fontWeight: 500 }}>#{t}</span>)}</div>}

                {/* Stats & Reactions */}
                <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                        {Object.keys(reactionIcons).map(type => (
                            <button key={type} onClick={() => handleReact(type)}
                                style={{ background: post.userReaction === type ? '#f0f0ff' : '#f8f8f8', border: post.userReaction === type ? '2px solid #4f46e5' : '2px solid transparent', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', gap: 6, transition: 'all .2s' }}>
                                {reactionIcons[type]}
                                <span style={{ fontSize: 13, color: '#666', fontWeight: 600 }}>{post.reactionCounts?.[type] || 0}</span>
                            </button>
                        ))}
                    </div>
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: 16, color: '#999', fontSize: 14 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FaEye /> {post.viewCount}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FaComment /> {post.commentCount}</span>
                    </div>
                </div>
            </div>

            {/* Comments */}
            <div style={{ marginTop: 24 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1a1a2e', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FaComment style={{ color: '#4f46e5' }} /> Bình luận ({comments?.length || 0})
                </h3>
                {user && (
                    <form onSubmit={handleComment} style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                        <input value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Viết bình luận..."
                            style={{ flex: 1, padding: '12px 16px', border: '2px solid #e0e0e0', borderRadius: 12, fontSize: 14, outline: 'none', transition: 'border .2s' }}
                            onFocus={e => e.target.style.borderColor = '#4f46e5'} onBlur={e => e.target.style.borderColor = '#e0e0e0'} />
                        <button type="submit" style={{ padding: '12px 20px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 600, cursor: 'pointer', transition: 'opacity .2s' }} disabled={!commentText.trim()}>Gửi</button>
                    </form>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {comments && comments.length > 0 ? comments.map(c => (
                        <div key={c.id} style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 1px 6px rgba(0,0,0,.04)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#4f46e5', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, overflow: 'hidden' }}>
                                    {c.userAvatar ? <img src={c.userAvatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : c.userName?.[0]}
                                </div>
                                <div><span style={{ fontWeight: 600, fontSize: 14, color: '#1a1a2e' }}>{c.userName}</span><span style={{ color: '#999', fontSize: 12, marginLeft: 8 }}>{new Date(c.createdAt).toLocaleString('vi-VN')}</span></div>
                                {user && (user.id === c.userId || user.role === 'ADMIN') && <button onClick={() => handleDeleteComment(c.id)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer' }}><FaTrash /></button>}
                            </div>
                            <p style={{ margin: '0 0 8px', color: '#444', lineHeight: 1.6 }}>{c.content}</p>
                            {c.files?.length > 0 && c.files.map((f, i) => f.fileType?.startsWith('image') && <img key={i} src={f.filePath} alt="" style={{ maxWidth: 200, borderRadius: 8, marginRight: 8 }} />)}
                            <div style={{ display: 'flex', gap: 12, fontSize: 13 }}>
                                {user && <button onClick={() => { setReplyTo(replyTo === c.id ? null : c.id); setReplyText(''); }} style={{ background: 'none', border: 'none', color: '#4f46e5', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}><FaReply /> Trả lời</button>}
                            </div>
                            {/* Reply form */}
                            {replyTo === c.id && (
                                <form onSubmit={(e) => handleReply(e, c.id)} style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                                    <input value={replyText} onChange={e => setReplyText(e.target.value)} placeholder={`Trả lời ${c.userName}...`}
                                        style={{ flex: 1, padding: '8px 12px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 13 }} autoFocus />
                                    <button type="submit" style={{ padding: '8px 14px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>Gửi</button>
                                </form>
                            )}
                            {/* Replies */}
                            {c.replies?.length > 0 && (
                                <div style={{ marginTop: 12, marginLeft: 32, display: 'flex', flexDirection: 'column', gap: 10, borderLeft: '3px solid #f0f0f0', paddingLeft: 16 }}>
                                    {c.replies.map(r => (
                                        <div key={r.id}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                                <span style={{ fontWeight: 600, fontSize: 13, color: '#1a1a2e' }}>{r.userName}</span>
                                                <span style={{ color: '#999', fontSize: 11 }}>{new Date(r.createdAt).toLocaleString('vi-VN')}</span>
                                                {user && (user.id === r.userId || user.role === 'ADMIN') && <button onClick={() => handleDeleteComment(r.id)} style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', marginLeft: 'auto' }}><FaTrash /></button>}
                                            </div>
                                            <p style={{ margin: 0, color: '#555', fontSize: 13 }}>{r.content}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )) : (
                        <div style={{ textAlign: 'center', padding: '40px 0', color: '#999', fontSize: 14 }}>Chưa có bình luận nào. Hãy là người đầu tiên thảo luận!</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForumPostDetail;
