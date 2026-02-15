import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { forumService } from '../../services/api';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaImage, FaTimes, FaPenNib, FaNewspaper, FaRocket, FaPen } from 'react-icons/fa';

const CreatePost = () => {
    const navigate = useNavigate();
    const [topics, setTopics] = useState([]);
    const [form, setForm] = useState({ title: '', content: '', postType: 'SHORT', topicId: '', tags: '' });
    const [files, setFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        forumService.getTopics().then(res => setTopics(res.data?.data || []));
    }, []);

    useEffect(() => {
        const urls = files.map(f => URL.createObjectURL(f));
        setPreviews(urls);
        return () => urls.forEach(URL.revokeObjectURL);
    }, [files]);

    const handleFileChange = (e) => {
        const selected = Array.from(e.target.files);
        setFiles(prev => [...prev, ...selected]);
    };

    const removeFile = (index) => setFiles(prev => prev.filter((_, i) => i !== index));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.content.trim()) { toast.warning('Vui lòng nhập nội dung'); return; }
        if (form.postType === 'LONG' && !form.title.trim()) { toast.warning('Bài viết dạng dài cần tiêu đề'); return; }
        if (form.postType === 'LONG' && !form.topicId) { toast.warning('Vui lòng chọn chủ đề'); return; }

        setSubmitting(true);
        try {
            const postData = {
                title: form.title || null,
                content: form.content,
                postType: form.postType,
                topicId: form.topicId ? Number(form.topicId) : null,
                tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(t => t) : []
            };

            const formData = new FormData();
            formData.append('post', new Blob([JSON.stringify(postData)], { type: 'application/json' }));
            files.forEach(f => formData.append('files', f));

            const res = await forumService.createPost(formData);
            toast.success('Đăng bài thành công!');
            navigate(`/forum/post/${res.data?.data?.id}`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Lỗi đăng bài');
        }
        setSubmitting(false);
    };

    return (
        <div style={{ maxWidth: 700, margin: '0 auto', padding: '24px 16px' }}>
            <button onClick={() => navigate('/forum')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#4f46e5', fontWeight: 600, cursor: 'pointer', marginBottom: 20, fontSize: 15 }}>
                <FaArrowLeft /> Quay lại
            </button>

            <div style={{ background: '#fff', borderRadius: 16, padding: 32, boxShadow: '0 4px 20px rgba(0,0,0,.08)' }}>
                <h2 style={{ margin: '0 0 24px', fontSize: 22, fontWeight: 800, color: '#1a1a2e', display: 'flex', alignItems: 'center', gap: 10 }}><FaPen /> Đăng bài mới</h2>
                <form onSubmit={handleSubmit}>
                    {/* Post Type */}
                    <div style={{ marginBottom: 20 }}>
                        <label style={{ fontWeight: 600, fontSize: 14, color: '#333', marginBottom: 8, display: 'block' }}>Loại bài viết</label>
                        <div style={{ display: 'flex', gap: 12 }}>
                            {['SHORT', 'LONG'].map(type =>
                                <button key={type} type="button" onClick={() => setForm(f => ({ ...f, postType: type }))}
                                    style={{
                                        flex: 1, padding: '12px', borderRadius: 10, border: `2px solid ${form.postType === type ? '#4f46e5' : '#e0e0e0'}`,
                                        background: form.postType === type ? '#f0f0ff' : '#fff', color: form.postType === type ? '#4f46e5' : '#555',
                                        fontWeight: 600, cursor: 'pointer', fontSize: 14,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                                    }}>
                                    {type === 'SHORT' ? <><FaPenNib /> Bài ngắn</> : <><FaNewspaper /> Bài dài</>}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Topic (for LONG) */}
                    {form.postType === 'LONG' && (
                        <div style={{ marginBottom: 20 }}>
                            <label style={{ fontWeight: 600, fontSize: 14, color: '#333', marginBottom: 8, display: 'block' }}>Chủ đề *</label>
                            <select value={form.topicId} onChange={e => setForm(f => ({ ...f, topicId: e.target.value }))}
                                style={{ width: '100%', padding: '10px 16px', border: '2px solid #e0e0e0', borderRadius: 10, fontSize: 14, outline: 'none', appearance: 'auto' }}>
                                <option value="">Chọn chủ đề...</option>
                                {topics.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                            </select>
                        </div>
                    )}

                    {/* Title */}
                    {(form.postType === 'LONG' || form.title) && (
                        <div style={{ marginBottom: 20 }}>
                            <label style={{ fontWeight: 600, fontSize: 14, color: '#333', marginBottom: 8, display: 'block' }}>Tiêu đề {form.postType === 'LONG' && '*'}</label>
                            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                style={{ width: '100%', padding: '12px 16px', border: '2px solid #e0e0e0', borderRadius: 10, fontSize: 15, outline: 'none', fontWeight: 600 }}
                                placeholder="Tiêu đề bài viết..." />
                        </div>
                    )}

                    {/* Content */}
                    <div style={{ marginBottom: 20 }}>
                        <label style={{ fontWeight: 600, fontSize: 14, color: '#333', marginBottom: 8, display: 'block' }}>Nội dung *</label>
                        <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                            rows={form.postType === 'LONG' ? 12 : 5}
                            style={{ width: '100%', padding: '12px 16px', border: '2px solid #e0e0e0', borderRadius: 10, fontSize: 14, outline: 'none', resize: 'vertical', lineHeight: 1.6 }}
                            placeholder="Viết nội dung bài viết..." />
                    </div>

                    {/* Tags */}
                    <div style={{ marginBottom: 20 }}>
                        <label style={{ fontWeight: 600, fontSize: 14, color: '#333', marginBottom: 8, display: 'block' }}>Tags (phân cách bằng dấu phẩy)</label>
                        <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                            style={{ width: '100%', padding: '10px 16px', border: '2px solid #e0e0e0', borderRadius: 10, fontSize: 14, outline: 'none' }}
                            placeholder="mua bán, công nghệ, tips..." />
                    </div>

                    {/* Files */}
                    <div style={{ marginBottom: 24 }}>
                        <label style={{ fontWeight: 600, fontSize: 14, color: '#333', marginBottom: 8, display: 'block' }}>Hình ảnh / Video</label>
                        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', border: '2px dashed #d0d0d0', borderRadius: 10, cursor: 'pointer', color: '#4f46e5', fontWeight: 600, fontSize: 14, transition: 'all .2s' }}>
                            <FaImage /> Chọn file
                            <input type="file" multiple accept="image/*,video/*" onChange={handleFileChange} style={{ display: 'none' }} />
                        </label>
                        {previews.length > 0 && (
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                                {previews.map((url, i) => (
                                    <div key={i} style={{ position: 'relative', width: 100, height: 80 }}>
                                        <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
                                        <button type="button" onClick={() => removeFile(i)} style={{ position: 'absolute', top: -6, right: -6, width: 22, height: 22, borderRadius: '50%', background: '#e74c3c', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaTimes /></button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <button type="submit" disabled={submitting}
                        style={{ width: '100%', padding: '14px', background: submitting ? '#ccc' : '#4f46e5', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 16, cursor: submitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                        {submitting ? 'Đang đăng...' : <><FaRocket /> Đăng bài</>}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreatePost;
