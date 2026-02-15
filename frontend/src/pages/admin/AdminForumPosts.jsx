import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { forumService } from '../../services/api';
import { toast } from 'react-toastify';
import { FiFlag, FiTrash2, FiCheckCircle, FiExternalLink, FiAlertTriangle, FiEye, FiMessageSquare } from 'react-icons/fi';

const AdminForumPosts = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        loadReportedPosts();
    }, [page]);

    const loadReportedPosts = async () => {
        setLoading(true);
        try {
            const res = await forumService.getReportedPosts({ page, size: 20 });
            const data = res.data?.data;
            setPosts(data?.content || []);
            setTotalPages(data?.totalPages || 0);
        } catch {
            toast.error('Không thể tải danh sách bài viết bị báo cáo');
        }
        setLoading(false);
    };

    const handleDismiss = async (postId) => {
        if (!window.confirm('Bỏ qua báo cáo cho bài viết này?')) return;
        try {
            await forumService.dismissReport(postId);
            toast.success('Đã bỏ qua báo cáo');
            setPosts(prev => prev.filter(p => p.id !== postId));
        } catch {
            toast.error('Lỗi khi bỏ qua báo cáo');
        }
    };

    const handleDelete = async (postId) => {
        if (!window.confirm('Xoá bài viết này? Hành động này không thể hoàn tác.')) return;
        try {
            await forumService.deletePost(postId);
            toast.success('Đã xoá bài viết');
            setPosts(prev => prev.filter(p => p.id !== postId));
        } catch {
            toast.error('Lỗi khi xoá bài viết');
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                            <FiFlag className="text-red-500" size={20} />
                        </div>
                        Quản lý bài viết bị báo cáo
                    </h1>
                    <p className="text-gray-500 mt-1 text-sm">Xem xét và xử lý các bài viết vi phạm trên diễn đàn</p>
                </div>
                <div className="bg-red-50 text-red-600 px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2">
                    <FiAlertTriangle />
                    {posts.length} bài viết bị báo cáo
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="text-center py-20">
                    <div className="animate-spin w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full mx-auto"></div>
                    <p className="text-gray-400 mt-4 text-sm">Đang tải...</p>
                </div>
            ) : posts.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
                    <FiCheckCircle size={48} className="text-green-400 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">Không có bài viết nào bị báo cáo</p>
                    <p className="text-gray-400 text-sm mt-1">Diễn đàn đang sạch sẽ! 🎉</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {posts.map(post => (
                        <div key={post.id} className="bg-white rounded-2xl shadow-sm border border-red-100 overflow-hidden hover:shadow-md transition-shadow">
                            <div className="p-6">
                                {/* Post header */}
                                <div className="flex items-start gap-4">
                                    <div className="w-11 h-11 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shrink-0 overflow-hidden">
                                        {post.authorAvatar
                                            ? <img src={post.authorAvatar} alt="" className="w-full h-full object-cover" />
                                            : post.authorName?.[0]
                                        }
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-gray-900">{post.authorName}</span>
                                            <span className="text-xs text-gray-400">•</span>
                                            <span className="text-xs text-gray-400">
                                                {new Date(post.createdAt).toLocaleString('vi-VN')}
                                            </span>
                                            {post.topicTitle && (
                                                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-xs rounded-full font-medium">
                                                    {post.topicTitle}
                                                </span>
                                            )}
                                        </div>
                                        {post.title && (
                                            <h3 className="font-bold text-gray-900 text-lg mb-1">{post.title}</h3>
                                        )}
                                        <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">{post.content}</p>

                                        {/* Stats */}
                                        <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                                            <span className="flex items-center gap-1"><FiEye size={14} /> {post.viewCount || 0} lượt xem</span>
                                            <span className="flex items-center gap-1"><FiMessageSquare size={14} /> {post.commentCount || 0} bình luận</span>
                                        </div>
                                    </div>

                                    {/* Report badge */}
                                    <div className="shrink-0 flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-full text-xs font-bold">
                                        <FiFlag size={14} />
                                        Bị báo cáo
                                    </div>
                                </div>

                                {/* Files preview */}
                                {post.files?.length > 0 && (
                                    <div className="flex gap-2 mt-3 overflow-x-auto">
                                        {post.files.slice(0, 4).map((f, i) => (
                                            f.fileType?.startsWith('image') && (
                                                <img key={i} src={f.filePath} alt="" className="w-20 h-16 object-cover rounded-lg shrink-0" />
                                            )
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Actions bar */}
                            <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center gap-3">
                                <Link
                                    to={`/forum/post/${post.id}`}
                                    target="_blank"
                                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors no-underline"
                                >
                                    <FiExternalLink size={16} />
                                    Xem bài viết
                                </Link>
                                <button
                                    onClick={() => handleDismiss(post.id)}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-xl text-sm font-medium text-green-700 hover:bg-green-100 transition-colors"
                                >
                                    <FiCheckCircle size={16} />
                                    Bỏ qua báo cáo
                                </button>
                                <button
                                    onClick={() => handleDelete(post.id)}
                                    className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-xl text-sm font-medium text-red-600 hover:bg-red-100 transition-colors ml-auto"
                                >
                                    <FiTrash2 size={16} />
                                    Xoá bài viết
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                    {Array.from({ length: totalPages }, (_, i) => (
                        <button
                            key={i}
                            onClick={() => setPage(i)}
                            className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${page === i
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                                    : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'
                                }`}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminForumPosts;
