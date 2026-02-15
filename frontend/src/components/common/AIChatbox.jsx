import { useState, useRef, useEffect } from 'react';
import { chatService } from '../../services/api';
import { FaRobot, FaPaperPlane, FaTimes, FaComments } from 'react-icons/fa';

const AIChatbox = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'ai', text: 'Xin chào! 👋 Tôi là trợ lý AI của UniMarket. Bạn cần hỗ trợ gì?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setLoading(true);

        try {
            const res = await chatService.sendMessage(userMsg);
            const reply = res.data?.data?.reply || 'Xin lỗi, không thể xử lý.';
            setMessages(prev => [...prev, { role: 'ai', text: reply }]);
        } catch {
            setMessages(prev => [...prev, { role: 'ai', text: 'Lỗi kết nối. Vui lòng thử lại.' }]);
        }
        setLoading(false);
    };

    return (
        <>
            {/* Toggle Button */}
            <button onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: 'fixed', bottom: 24, right: 24, width: 60, height: 60, borderRadius: '50%',
                    background: '#4f46e5', border: 'none', cursor: 'pointer',
                    boxShadow: '0 4px 20px rgba(79, 70, 229, 0.4)', color: '#fff', fontSize: 24,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
                    transition: 'transform .3s', transform: isOpen ? 'scale(0)' : 'scale(1)'
                }}>
                <FaComments />
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div style={{
                    position: 'fixed', bottom: 24, right: 24, width: 380, height: 520,
                    background: '#fff', borderRadius: 20, boxShadow: '0 10px 40px rgba(0,0,0,.2)',
                    display: 'flex', flexDirection: 'column', zIndex: 10000, overflow: 'hidden',
                    animation: 'slideUp .3s ease'
                }}>
                    {/* Header */}
                    <div style={{
                        background: '#4f46e5', padding: '16px 20px',
                        display: 'flex', alignItems: 'center', gap: 12
                    }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FaRobot style={{ color: '#fff', fontSize: 18 }} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>UniMarket AI</div>
                            <div style={{ color: 'rgba(255,255,255,.7)', fontSize: 12 }}>Trợ lý mua sắm thông minh</div>
                        </div>
                        <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 18 }}><FaTimes /></button>
                    </div>

                    {/* Messages */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 8px', display: 'flex', flexDirection: 'column', gap: 10, background: '#f8f9ff' }}>
                        {messages.map((msg, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                                <div style={{
                                    maxWidth: '80%', padding: '10px 14px', borderRadius: 16,
                                    background: msg.role === 'user' ? '#4f46e5' : '#fff',
                                    color: msg.role === 'user' ? '#fff' : '#333',
                                    boxShadow: '0 2px 8px rgba(0,0,0,.06)', fontSize: 14, lineHeight: 1.5,
                                    borderBottomRightRadius: msg.role === 'user' ? 4 : 16,
                                    borderBottomLeftRadius: msg.role === 'ai' ? 4 : 16,
                                    whiteSpace: 'pre-wrap'
                                }}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div style={{ display: 'flex', gap: 6, padding: '10px 14px', background: '#fff', borderRadius: 16, width: 'fit-content', boxShadow: '0 2px 8px rgba(0,0,0,.06)' }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4f46e5', animation: 'bounce .6s infinite alternate' }} />
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4f46e5', animation: 'bounce .6s .15s infinite alternate' }} />
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4f46e5', animation: 'bounce .6s .3s infinite alternate' }} />
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={sendMessage} style={{ padding: '12px 16px', borderTop: '1px solid #f0f0f0', display: 'flex', gap: 8, background: '#fff' }}>
                        <input value={input} onChange={e => setInput(e.target.value)} placeholder="Nhập tin nhắn..." disabled={loading}
                            style={{ flex: 1, padding: '10px 14px', border: '2px solid #e0e0e0', borderRadius: 12, fontSize: 14, outline: 'none', transition: 'border .2s' }}
                            onFocus={e => e.target.style.borderColor = '#4f46e5'} onBlur={e => e.target.style.borderColor = '#e0e0e0'} />
                        <button type="submit" disabled={loading || !input.trim()}
                            style={{ width: 40, height: 40, borderRadius: '50%', background: input.trim() ? '#4f46e5' : '#e0e0e0', border: 'none', cursor: input.trim() ? 'pointer' : 'not-allowed', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FaPaperPlane />
                        </button>
                    </form>
                </div>
            )}

            <style>{`
                @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes bounce { to { transform: translateY(-6px); } }
            `}</style>
        </>
    );
};

export default AIChatbox;
