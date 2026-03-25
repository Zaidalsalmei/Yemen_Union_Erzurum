import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { getLogoUrl } from '../../utils/images';
import { useBranding } from '../../contexts/BrandingContext';

// ════════════════════════════════════════
//  Types
// ════════════════════════════════════════
interface OtherUser {
    id: number; full_name: string;
    profile_photo: string | null; status: string;
}
interface Conversation {
    id: number; type: 'direct' | 'group' | 'broadcast';
    title: string | null; created_by: number; updated_at: string;
    last_message: string | null; last_message_type: string;
    last_message_at: string | null; last_sender_name: string | null;
    unread_count: number; other_user?: OtherUser; participants_count?: number;
}
interface Message {
    id: number; conversation_id: number;
    sender_id: number; body: string | null;
    type: 'text' | 'image' | 'file';
    file_url: string | null; file_name: string | null;
    sender_name: string; sender_photo: string | null;
    created_at: string; deleted_at?: string | null;
}
interface UserItem { id: number; full_name: string; profile_photo: string | null; }

// ════════════════════════════════════════
//  ألوان حسب نوع المحادثة
// ════════════════════════════════════════
const CONV_COLORS = {
    direct: { from: '#DC2626', to: '#991B1B', accent: '#FCA5A5', badge: 'bg-rose-500', ring: 'ring-rose-500/30' },
    group: { from: '#2563EB', to: '#1D4ED8', accent: '#93C5FD', badge: 'bg-blue-500', ring: 'ring-blue-500/30' },
    broadcast: { from: '#D97706', to: '#B45309', accent: '#FCD34D', badge: 'bg-amber-500', ring: 'ring-amber-500/30' },
};

// ════════════════════════════════════════
//  Emoji
// ════════════════════════════════════════
const EMOJIS = ['😀', '😂', '😍', '🥰', '😎', '🤔', '😢', '😡', '👍', '👎', '❤️', '🔥', '✅', '⚡', '🎉', '🙏', '👏', '💪', '🤝', '👋', '😅', '🥳', '😭', '🤣', '😊', '😇', '🤗', '😴', '😷', '🤯'];

// ════════════════════════════════════════
//  Helpers
// ════════════════════════════════════════
function photoUrl(path: string | null | undefined): string | null {
    if (!path) return null;
    if (path.startsWith('http') || path.startsWith('/')) return path;
    return `/uploads/${path}`;
}
function timeShort(d: string): string {
    const date = new Date(d);
    const diff = Date.now() - date.getTime();
    if (diff < 86400000) return date.toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString('ar', { day: 'numeric', month: 'short' });
}
function convTitle(conv: Conversation): string {
    if (conv.type === 'direct' && conv.other_user) return conv.other_user.full_name;
    if (conv.type === 'broadcast') return conv.title ?? 'رسالة جماعية';
    return conv.title ?? `مجموعة (${conv.participants_count ?? ''})`;
}
function convInitial(conv: Conversation): string {
    if (conv.type === 'broadcast') return '📢';
    if (conv.type === 'group') return conv.title?.charAt(0)?.toUpperCase() ?? 'م';
    return conv.other_user?.full_name?.charAt(0)?.toUpperCase() ?? '?';
}
function convPhotoUrl(conv: Conversation): string | null {
    return conv.type === 'direct' ? photoUrl(conv.other_user?.profile_photo) : null;
}

// ════════════════════════════════════════
//  Sub Components
// ════════════════════════════════════════
function Avatar({ name, photo, size = 10, type = 'direct' }: {
    name: string; photo?: string | null;
    size?: number; type?: 'direct' | 'group' | 'broadcast';
}) {
    const color = CONV_COLORS[type];
    return (
        <div
            className={`w-${size} h-${size} rounded-full flex items-center justify-center font-black text-white overflow-hidden flex-shrink-0 ring-2 ${color.ring}`}
            style={{ background: `linear-gradient(135deg, ${color.from}, ${color.to})` }}
        >
            {photo
                ? <img src={photo} className="w-full h-full object-cover" alt={name} onError={e => (e.currentTarget.style.display = 'none')} />
                : <span className="text-sm">{name?.charAt(0)?.toUpperCase() ?? '?'}</span>
            }
        </div>
    );
}

// ════════════════════════════════════════
//  CSS Styles (injected once)
// ════════════════════════════════════════
const CHAT_STYLES = `
.fc-glass {
    background: rgba(15, 15, 20, 0.85);
    backdrop-filter: blur(24px) saturate(180%);
    -webkit-backdrop-filter: blur(24px) saturate(180%);
    border: 1px solid rgba(255,255,255,0.08);
}
.fc-glass-light {
    background: rgba(30, 30, 40, 0.7);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255,255,255,0.06);
}
.fc-input {
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    color: #fff;
    outline: none;
    transition: border-color 0.2s;
}
.fc-input:focus { border-color: rgba(220,38,38,0.6); }
.fc-input::placeholder { color: rgba(255,255,255,0.3); }
.fc-scroll::-webkit-scrollbar { width: 3px; }
.fc-scroll::-webkit-scrollbar-track { background: transparent; }
.fc-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 99px; }
@keyframes fc-slide-up {
    from { opacity: 0; transform: translateY(16px) scale(0.96); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes fc-slide-down {
    from { opacity: 1; transform: translateY(0) scale(1); }
    to   { opacity: 0; transform: translateY(16px) scale(0.96); }
}
@keyframes fc-bounce-in {
    0%   { transform: scale(0); opacity: 0; }
    60%  { transform: scale(1.15); }
    100% { transform: scale(1); opacity: 1; }
}
@keyframes fc-msg-in-right {
    from { opacity: 0; transform: translateX(-10px); }
    to   { opacity: 1; transform: translateX(0); }
}
@keyframes fc-msg-in-left {
    from { opacity: 0; transform: translateX(10px); }
    to   { opacity: 1; transform: translateX(0); }
}
@keyframes fc-typing-dot {
    0%, 60%, 100% { transform: translateY(0); }
    30%           { transform: translateY(-4px); }
}
.fc-open  { animation: fc-slide-up   0.28s cubic-bezier(0.34,1.56,0.64,1) forwards; }
.fc-close { animation: fc-slide-down 0.2s ease-in forwards; }
.fc-msg-me    { animation: fc-msg-in-right 0.2s ease-out; }
.fc-msg-other { animation: fc-msg-in-left  0.2s ease-out; }
.fc-btn-bounce { animation: fc-bounce-in 0.4s cubic-bezier(0.34,1.56,0.64,1); }
.fc-dot-1 { animation: fc-typing-dot 1.2s ease-in-out 0s   infinite; }
.fc-dot-2 { animation: fc-typing-dot 1.2s ease-in-out 0.2s infinite; }
.fc-dot-3 { animation: fc-typing-dot 1.2s ease-in-out 0.4s infinite; }
.fc-watermark {
    position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center;
    pointer-events: none; overflow: hidden; border-radius: inherit;
}
.fc-watermark img {
    width: 140px; height: 140px;
    object-fit: contain;
    opacity: 0.04;
    filter: grayscale(100%) brightness(200%);
}
.fc-conv-row:hover { background: rgba(255,255,255,0.04); }
.fc-user-row:hover { background: rgba(255,255,255,0.04); }
`;

// ════════════════════════════════════════
//  Main
// ════════════════════════════════════════
type View = 'list' | 'chat' | 'new';

export default function FloatingChat() {
    const { user } = useAuth();
    const { settings } = useBranding();
    const myId = user?.id as number;
    const logoUrl = getLogoUrl(settings?.logoUrl);

    const [open, setOpen] = useState(false);
    const [closing, setClosing] = useState(false);
    const [view, setView] = useState<View>('list');
    const [conversations, setConvs] = useState<Conversation[]>([]);
    const [activeConv, setActiveConv] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [text, setText] = useState('');
    const [totalUnread, setTotalUnread] = useState(0);
    const [users, setUsers] = useState<UserItem[]>([]);
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState<number[]>([]);
    const [groupTitle, setGroupTitle] = useState('');
    const [newType, setNewType] = useState<'direct' | 'group' | 'broadcast'>('direct');
    const [sending, setSending] = useState(false);
    const [loadingMsgs, setLoadingMsgs] = useState(false);
    const [typingUsers, setTypingUsers] = useState<string[]>([]);
    const [showEmoji, setShowEmoji] = useState(false);
    const [uploading, setUploading] = useState(false);

    const endRef = useRef<HTMLDivElement>(null);
    const pollRef = useRef<ReturnType<typeof setInterval>>();
    const typingRef = useRef<ReturnType<typeof setTimeout>>();
    const isTypingRef = useRef(false);
    const lastIdRef = useRef(0);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const fileRef = useRef<HTMLInputElement>(null);
    const notifPerm = useRef(false);

    // inject styles
    useEffect(() => {
        if (document.getElementById('fc-styles')) return;
        const el = document.createElement('style');
        el.id = 'fc-styles';
        el.textContent = CHAT_STYLES;
        document.head.appendChild(el);
    }, []);

    // notif permission
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().then(p => { notifPerm.current = p === 'granted'; });
        } else { notifPerm.current = Notification.permission === 'granted'; }
    }, []);

    const showNotif = (title: string, body: string) => {
        if (!notifPerm.current || document.hasFocus()) return;
        try { new Notification(title, { body, icon: '/favicon.ico', dir: 'rtl' }); } catch { }
    };

    // fetch conversations
    const fetchConvs = useCallback(async () => {
        try {
            const r = await api.get<{ data: { conversations: Conversation[] } }>('/conversations');
            const c = r.data.data.conversations ?? [];
            setConvs(c);
            setTotalUnread(c.reduce((s, x) => s + (x.unread_count || 0), 0));
        } catch { }
    }, []);

    useEffect(() => {
        fetchConvs();
        const t = setInterval(fetchConvs, 30000);
        return () => clearInterval(t);
    }, [fetchConvs]);

    // open/close animation
    const handleOpen = () => { setClosing(false); setOpen(true); fetchConvs(); };
    const handleClose = () => {
        setClosing(true);
        setTimeout(() => { setOpen(false); setClosing(false); }, 180);
    };

    const openConv = async (conv: Conversation) => {
        setActiveConv(conv); setView('chat');
        setMessages([]); setTypingUsers([]); setShowEmoji(false);
        lastIdRef.current = 0; setLoadingMsgs(true);
        try {
            const r = await api.get<{ data: { messages: Message[] } }>(`/conversations/${conv.id}/messages`);
            const msgs = r.data.data.messages ?? [];
            setMessages(msgs);
            if (msgs.length) lastIdRef.current = msgs[msgs.length - 1].id;
            fetchConvs();
        } catch { } finally { setLoadingMsgs(false); }
    };

    useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, typingUsers]);

    // polling
    useEffect(() => {
        clearInterval(pollRef.current);
        if (view !== 'chat' || !activeConv) return;
        const interval = document.hasFocus() ? 3000 : 15000;
        pollRef.current = setInterval(async () => {
            try {
                const r = await api.get<{ data: { messages: Message[]; typing_users?: string[] } }>(
                    `/conversations/${activeConv.id}/poll?after=${lastIdRef.current}`
                );
                const newMsgs = r.data.data.messages ?? [];
                setTypingUsers(r.data.data.typing_users ?? []);
                if (newMsgs.length) {
                    setMessages(p => [...p, ...newMsgs]);
                    lastIdRef.current = newMsgs[newMsgs.length - 1].id;
                    fetchConvs();
                    newMsgs.forEach(m => {
                        if (m.sender_id !== myId) showNotif(`رسالة من ${m.sender_name}`, m.body ?? '📎');
                    });
                }
            } catch { }
        }, interval);
        return () => clearInterval(pollRef.current);
    }, [view, activeConv, myId]);

    const handleTyping = () => {
        if (!activeConv || isTypingRef.current) return;
        isTypingRef.current = true;
        api.post(`/conversations/${activeConv.id}/typing`, {}).catch(() => { });
        clearTimeout(typingRef.current);
        typingRef.current = setTimeout(() => { isTypingRef.current = false; }, 3000);
    };

    const sendMsg = async () => {
        if (!text.trim() || !activeConv || sending) return;
        setSending(true);
        const draft = text.trim(); setText(''); setShowEmoji(false);
        try {
            const r = await api.post<{ data: { message: Message } }>(
                `/conversations/${activeConv.id}/messages`, { body: draft, type: 'text' }
            );
            const msg = r.data.data.message;
            setMessages(p => [...p, msg]);
            lastIdRef.current = msg.id;
            fetchConvs();
        } catch { setText(draft); }
        finally { setSending(false); setTimeout(() => inputRef.current?.focus(), 50); }
    };

    const handleKey = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMsg(); }
    };

    const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !activeConv) return;
        const isImg = file.type.startsWith('image/');
        setUploading(true);
        try {
            const fd = new FormData(); fd.append('image', file);
            const up = await api.post<{ data: { url: string } }>(
                '/upload/image', fd, { headers: { 'Content-Type': 'multipart/form-data' } }
            );
            const r = await api.post<{ data: { message: Message } }>(
                `/conversations/${activeConv.id}/messages`,
                { body: null, type: isImg ? 'image' : 'file', file_url: up.data.data.url, file_name: file.name }
            );
            const msg = r.data.data.message;
            setMessages(p => [...p, msg]); lastIdRef.current = msg.id; fetchConvs();
        } catch { alert('فشل رفع الملف'); }
        finally { setUploading(false); if (fileRef.current) fileRef.current.value = ''; }
    };

    const deleteMsg = async (id: number) => {
        try {
            await api.delete(`/conversations/${activeConv!.id}/messages/${id}`);
            setMessages(p => p.map(m => m.id === id ? { ...m, deleted_at: new Date().toISOString() } : m));
        } catch { }
    };

    const loadUsers = async () => {
        try {
            const r = await api.get<any>('/users?per_page=100');
            const list = r.data.data?.users ?? r.data.data?.data ?? r.data.data ?? [];
            setUsers(Array.isArray(list) ? list : []);
        } catch { setUsers([]); }
    };

    const openNew = (type: 'direct' | 'group' | 'broadcast') => {
        setNewType(type); setSelected([]); setGroupTitle(''); setSearch(''); setView('new');
        if (type !== 'broadcast') loadUsers();
    };

    const toggleUser = (id: number) => {
        if (newType === 'direct') { setSelected([id]); }
        else { setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]); }
    };

    const createConv = async () => {
        if (newType !== 'broadcast' && selected.length === 0) return;
        try {
            const payload: any = { type: newType, participant_ids: newType === 'broadcast' ? [] : selected };
            if (newType !== 'direct') payload.title = groupTitle || (newType === 'broadcast' ? 'رسالة جماعية' : 'مجموعة جديدة');
            const r = await api.post<{ data: { conversation: Conversation } }>('/conversations', payload);
            await openConv(r.data.data.conversation);
        } catch { }
    };

    const goBack = () => { clearInterval(pollRef.current); setView('list'); setShowEmoji(false); fetchConvs(); };
    const filtered = users.filter(u => u.id !== myId && u.full_name?.toLowerCase().includes(search.toLowerCase()));
    const activeColor = activeConv ? CONV_COLORS[activeConv.type] : CONV_COLORS.direct;

    // ════════════════════════════════════════
    //  Render
    // ════════════════════════════════════════
    return (
        <div className="fixed bottom-6 left-6 z-50" dir="rtl">

            {/* ══ نافذة الشات ══════════════════════════════ */}
            {(open || closing) && (
                <div
                    className={`absolute bottom-16 left-0 w-80 sm:w-96 rounded-3xl overflow-hidden flex flex-col fc-glass shadow-2xl shadow-black/50 ${closing ? 'fc-close' : 'fc-open'}`}
                    style={{ height: '560px' }}
                >
                    {/* شعار الاتحاد كعلامة مائية */}
                    <div className="fc-watermark">
                        <img src={logoUrl} alt="" />
                    </div>

                    {/* ══ Header ════════════════════════════ */}
                    <div
                        className="relative flex-shrink-0 px-4 py-3 flex items-center gap-2"
                        style={{ background: `linear-gradient(135deg, ${activeColor.from}CC, ${activeColor.to}99)`, borderBottom: '1px solid rgba(255,255,255,0.08)' }}
                    >
                        {view !== 'list' && (
                            <button onClick={goBack}
                                className="w-7 h-7 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-all text-sm flex-shrink-0">
                                ←
                            </button>
                        )}
                        <div className="flex-1 min-w-0">
                            {view === 'list' && (
                                <div className="flex items-center gap-2">
                                    <span className="text-white font-black text-sm">💬 المحادثات</span>
                                    {totalUnread > 0 && (
                                        <span className="bg-white/20 text-white text-[10px] font-black rounded-full px-1.5 py-0.5">
                                            {totalUnread}
                                        </span>
                                    )}
                                </div>
                            )}
                            {view === 'chat' && activeConv && (
                                <div className="flex items-center gap-2">
                                    <Avatar
                                        name={convTitle(activeConv)}
                                        photo={convPhotoUrl(activeConv)}
                                        size={8}
                                        type={activeConv.type}
                                    />
                                    <div className="min-w-0">
                                        <p className="text-white font-black text-sm truncate leading-tight">{convTitle(activeConv)}</p>
                                        {typingUsers.length > 0
                                            ? <p className="text-white/60 text-[10px]">✍️ {typingUsers[0]} يكتب...</p>
                                            : <p className="text-white/50 text-[10px]">{activeConv.type === 'direct' ? 'محادثة خاصة' : `${activeConv.participants_count} مشارك`}</p>
                                        }
                                    </div>
                                </div>
                            )}
                            {view === 'new' && (
                                <p className="text-white font-black text-sm">
                                    {newType === 'direct' ? '💬 محادثة جديدة' : newType === 'broadcast' ? '📢 رسالة جماعية' : '👥 مجموعة جديدة'}
                                </p>
                            )}
                        </div>
                        <button onClick={handleClose}
                            className="w-7 h-7 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all flex-shrink-0">
                            ✕
                        </button>
                    </div>

                    {/* ══ قائمة المحادثات ═══════════════════ */}
                    {view === 'list' && (
                        <div className="flex flex-col flex-1 overflow-hidden relative">
                            {/* أزرار إنشاء */}
                            <div className="flex gap-1.5 p-3 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                {(['direct', 'group', 'broadcast'] as const).map(t => (
                                    <button key={t} onClick={() => openNew(t)}
                                        className="flex-1 text-[11px] py-1.5 rounded-xl font-black transition-all hover:scale-105"
                                        style={{
                                            background: `linear-gradient(135deg, ${CONV_COLORS[t].from}33, ${CONV_COLORS[t].to}22)`,
                                            border: `1px solid ${CONV_COLORS[t].from}44`,
                                            color: CONV_COLORS[t].accent,
                                        }}>
                                        {t === 'direct' ? '💬 محادثة' : t === 'group' ? '👥 مجموعة' : '📢 بث'}
                                    </button>
                                ))}
                            </div>

                            <div className="flex-1 overflow-y-auto fc-scroll">
                                {conversations.length === 0 ? (
                                    <div className="text-center py-16">
                                        <div className="text-4xl mb-3 opacity-30">💬</div>
                                        <p className="text-white/30 text-xs font-bold">لا توجد محادثات بعد</p>
                                    </div>
                                ) : conversations.map(conv => {
                                    const cc = CONV_COLORS[conv.type];
                                    return (
                                        <button key={conv.id} onClick={() => openConv(conv)}
                                            className="w-full flex items-center gap-3 px-4 py-3 transition-all fc-conv-row text-right"
                                            style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                            {/* Avatar */}
                                            <div className="relative flex-shrink-0">
                                                <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-white overflow-hidden ring-2"
                                                    style={{
                                                        background: `linear-gradient(135deg, ${cc.from}, ${cc.to})`,
                                                        ringColor: `${cc.from}44`,
                                                    }}>
                                                    {convPhotoUrl(conv)
                                                        ? <img src={convPhotoUrl(conv)!} className="w-full h-full object-cover" alt="" />
                                                        : <span className="text-sm">{convInitial(conv)}</span>
                                                    }
                                                </div>
                                                {conv.unread_count > 0 && (
                                                    <span className="absolute -top-0.5 -right-0.5 text-white text-[9px] font-black rounded-full min-w-[16px] h-4 flex items-center justify-center px-0.5"
                                                        style={{ background: cc.from }}>
                                                        {conv.unread_count > 9 ? '9+' : conv.unread_count}
                                                    </span>
                                                )}
                                            </div>
                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-center">
                                                    <p className={`text-xs truncate ${conv.unread_count > 0 ? 'font-black text-white' : 'font-bold text-white/70'}`}>
                                                        {convTitle(conv)}
                                                    </p>
                                                    {conv.last_message_at && (
                                                        <span className="text-[10px] text-white/30 flex-shrink-0 mr-1">{timeShort(conv.last_message_at)}</span>
                                                    )}
                                                </div>
                                                <p className={`text-[11px] truncate mt-0.5 ${conv.unread_count > 0 ? 'text-white/60 font-bold' : 'text-white/30'}`}>
                                                    {conv.last_message
                                                        ? (conv.type !== 'direct' && conv.last_sender_name ? `${conv.last_sender_name}: ` : '') + conv.last_message
                                                        : 'لا توجد رسائل بعد'}
                                                </p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* ══ نافذة الرسائل ════════════════════ */}
                    {view === 'chat' && activeConv && (
                        <div className="flex flex-col flex-1 overflow-hidden relative">
                            {/* الرسائل */}
                            <div className="flex-1 overflow-y-auto p-3 space-y-1.5 fc-scroll" onClick={() => setShowEmoji(false)}>
                                {loadingMsgs ? (
                                    <div className="text-center py-10 text-white/30 text-xs">⏳ جارٍ التحميل...</div>
                                ) : messages.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="text-3xl mb-2 opacity-30">👋</div>
                                        <p className="text-white/30 text-xs font-bold">ابدأ المحادثة الآن</p>
                                    </div>
                                ) : messages.map((msg, idx) => {
                                    const isMe = msg.sender_id === myId;
                                    const isDeleted = !!msg.deleted_at;
                                    const isLastMe = isMe && messages.slice(idx + 1).every(m => m.sender_id !== myId);

                                    return (
                                        <div key={msg.id} className={`flex items-end gap-1.5 group ${isMe ? 'flex-row-reverse' : ''} ${isMe ? 'fc-msg-me' : 'fc-msg-other'}`}>
                                            {!isMe && (
                                                <div className="w-6 h-6 rounded-full flex items-center justify-center text-white font-black text-xs flex-shrink-0 overflow-hidden"
                                                    style={{ background: `linear-gradient(135deg, ${activeColor.from}, ${activeColor.to})` }}>
                                                    {photoUrl(msg.sender_photo)
                                                        ? <img src={photoUrl(msg.sender_photo)!} className="w-full h-full object-cover" alt="" />
                                                        : msg.sender_name?.charAt(0)
                                                    }
                                                </div>
                                            )}
                                            <div className={`max-w-[75%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                                {!isMe && activeConv.type !== 'direct' && (
                                                    <span className="text-[10px] mb-0.5 font-bold px-1" style={{ color: activeColor.accent }}>
                                                        {msg.sender_name}
                                                    </span>
                                                )}
                                                {/* فقاعة الرسالة */}
                                                <div className={`relative px-3 py-2 rounded-2xl text-xs leading-relaxed break-words ${isDeleted ? 'fc-glass-light italic' :
                                                        isMe ? 'text-white' : 'text-white/90 fc-glass-light'
                                                    } ${isMe ? 'rounded-bl-sm' : 'rounded-br-sm'}`}
                                                    style={isMe && !isDeleted ? {
                                                        background: `linear-gradient(135deg, ${activeColor.from}, ${activeColor.to})`,
                                                    } : {}}>
                                                    {isDeleted ? (
                                                        <span className="text-white/30">🚫 تم حذف هذه الرسالة</span>
                                                    ) : (
                                                        <>
                                                            {msg.type === 'image' && msg.file_url && (
                                                                <img
                                                                    src={photoUrl(msg.file_url)!}
                                                                    className="max-w-[160px] rounded-xl mb-1 cursor-pointer hover:opacity-80 transition-opacity"
                                                                    alt="صورة"
                                                                    onClick={() => window.open(photoUrl(msg.file_url)!, '_blank')}
                                                                />
                                                            )}
                                                            {msg.type === 'file' && msg.file_url && (
                                                                <a href={photoUrl(msg.file_url)!} target="_blank" rel="noreferrer"
                                                                    className="flex items-center gap-1.5 underline text-white/80 hover:text-white">
                                                                    📎 {msg.file_name ?? 'ملف'}
                                                                </a>
                                                            )}
                                                            {msg.body && <span>{msg.body}</span>}
                                                        </>
                                                    )}
                                                    {/* زر حذف */}
                                                    {isMe && !isDeleted && (
                                                        <button onClick={() => deleteMsg(msg.id)}
                                                            className="absolute -top-2 -left-2 bg-black/40 backdrop-blur-sm border border-white/10 rounded-full w-5 h-5 text-[10px] text-white/40 hover:text-red-400 hidden group-hover:flex items-center justify-center transition-colors">
                                                            🗑
                                                        </button>
                                                    )}
                                                </div>
                                                {/* وقت + علامة قراءة */}
                                                <div className={`flex items-center gap-1 mt-0.5 px-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                                                    <span className="text-[9px] text-white/25">{timeShort(msg.created_at)}</span>
                                                    {isLastMe && !isDeleted && (
                                                        <span className="text-[10px] font-black" style={{ color: activeColor.accent }}>✓✓</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* مؤشر الكتابة */}
                                {typingUsers.length > 0 && (
                                    <div className="flex items-end gap-1.5">
                                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0"
                                            style={{ background: `linear-gradient(135deg, ${activeColor.from}, ${activeColor.to})` }}>
                                            {typingUsers[0]?.charAt(0)}
                                        </div>
                                        <div className="fc-glass-light rounded-2xl rounded-br-sm px-4 py-3 flex gap-1 items-center">
                                            <span className="w-1.5 h-1.5 rounded-full fc-dot-1" style={{ background: activeColor.accent }} />
                                            <span className="w-1.5 h-1.5 rounded-full fc-dot-2" style={{ background: activeColor.accent }} />
                                            <span className="w-1.5 h-1.5 rounded-full fc-dot-3" style={{ background: activeColor.accent }} />
                                        </div>
                                    </div>
                                )}
                                <div ref={endRef} />
                            </div>

                            {/* Emoji Picker */}
                            {showEmoji && (
                                <div className="fc-glass-light border-t border-white/06 p-2 grid grid-cols-10 gap-1 flex-shrink-0">
                                    {EMOJIS.map(e => (
                                        <button key={e} onClick={() => { setText(p => p + e); inputRef.current?.focus(); }}
                                            className="text-base hover:bg-white/10 rounded-lg p-0.5 transition-colors">{e}</button>
                                    ))}
                                </div>
                            )}

                            {/* حقل الإرسال */}
                            <div className="flex-shrink-0 p-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                {uploading && <p className="text-center text-xs text-white/40 py-1 animate-pulse">⏳ جارٍ الرفع...</p>}
                                <div className="flex gap-1.5 items-end">
                                    <button onClick={e => { e.stopPropagation(); setShowEmoji(p => !p); }}
                                        className={`w-8 h-8 flex items-center justify-center rounded-xl transition-all flex-shrink-0 text-base ${showEmoji ? 'bg-amber-500/20 text-amber-400' : 'text-white/30 hover:text-white/60 hover:bg-white/06'}`}>
                                        😊
                                    </button>
                                    <button onClick={() => fileRef.current?.click()}
                                        className="w-8 h-8 flex items-center justify-center rounded-xl text-white/30 hover:text-white/60 hover:bg-white/06 transition-all flex-shrink-0 text-base">
                                        📎
                                    </button>
                                    <input ref={fileRef} type="file" accept="image/*,.pdf,.doc,.docx" className="hidden" onChange={handleFile} />
                                    <textarea
                                        ref={inputRef} value={text}
                                        onChange={e => { setText(e.target.value); handleTyping(); }}
                                        onKeyDown={handleKey}
                                        placeholder="اكتب رسالة..."
                                        rows={1}
                                        className="flex-1 resize-none rounded-xl px-3 py-2 text-xs font-bold max-h-20 overflow-y-auto fc-input"
                                        style={{ direction: 'rtl' }}
                                    />
                                    <button onClick={sendMsg} disabled={!text.trim() || sending}
                                        className="w-9 h-9 rounded-xl flex items-center justify-center text-sm transition-all flex-shrink-0 disabled:opacity-30 hover:scale-105 active:scale-95 text-white"
                                        style={{ background: `linear-gradient(135deg, ${activeColor.from}, ${activeColor.to})` }}>
                                        {sending ? '⏳' : '➤'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ══ إنشاء محادثة جديدة ═══════════════ */}
                    {view === 'new' && (
                        <div className="flex flex-col flex-1 overflow-hidden relative">
                            {(newType === 'group' || newType === 'broadcast') && (
                                <div className="p-3 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                    <input value={groupTitle} onChange={e => setGroupTitle(e.target.value)}
                                        placeholder={newType === 'broadcast' ? 'عنوان الرسالة الجماعية' : 'اسم المجموعة'}
                                        className="w-full rounded-xl px-3 py-2 text-xs font-bold fc-input"
                                        style={{ direction: 'rtl' }} />
                                </div>
                            )}
                            {newType === 'broadcast' ? (
                                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                                    <div className="text-5xl mb-4 opacity-60">📢</div>
                                    <p className="text-white font-black mb-1">رسالة جماعية</p>
                                    <p className="text-white/40 text-xs mb-6">ستُرسل لجميع الأعضاء النشطين</p>
                                    <button onClick={createConv}
                                        className="px-8 py-2.5 rounded-xl text-sm font-black text-white hover:scale-105 transition-all"
                                        style={{ background: `linear-gradient(135deg, ${CONV_COLORS.broadcast.from}, ${CONV_COLORS.broadcast.to})` }}>
                                        إنشاء المحادثة ←
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="p-2 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                        <input value={search} onChange={e => setSearch(e.target.value)}
                                            placeholder="🔍 بحث عن عضو..."
                                            className="w-full rounded-xl px-3 py-2 text-xs font-bold fc-input"
                                            style={{ direction: 'rtl' }} />
                                    </div>
                                    {selected.length > 0 && (
                                        <div className="px-4 py-1.5 text-xs font-black flex-shrink-0"
                                            style={{ background: `${CONV_COLORS[newType].from}22`, color: CONV_COLORS[newType].accent, borderBottom: `1px solid ${CONV_COLORS[newType].from}33` }}>
                                            ✓ {selected.length} مختار{selected.length > 1 ? 'ين' : ''}
                                        </div>
                                    )}
                                    <div className="flex-1 overflow-y-auto fc-scroll">
                                        {filtered.length === 0 ? (
                                            <div className="text-center py-8 text-white/30 text-xs">
                                                {users.length === 0 ? '⏳ جارٍ التحميل...' : 'لا توجد نتائج'}
                                            </div>
                                        ) : filtered.map(u => {
                                            const sel = selected.includes(u.id);
                                            return (
                                                <button key={u.id} onClick={() => toggleUser(u.id)}
                                                    className="w-full flex items-center gap-3 px-4 py-2.5 transition-all fc-user-row text-right"
                                                    style={{
                                                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                                                        background: sel ? `${CONV_COLORS[newType].from}22` : undefined,
                                                    }}>
                                                    <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-white text-sm flex-shrink-0 overflow-hidden"
                                                        style={{ background: `linear-gradient(135deg, ${CONV_COLORS[newType].from}, ${CONV_COLORS[newType].to})` }}>
                                                        {photoUrl(u.profile_photo)
                                                            ? <img src={photoUrl(u.profile_photo)!} className="w-full h-full object-cover" alt="" />
                                                            : u.full_name?.charAt(0)
                                                        }
                                                    </div>
                                                    <span className="flex-1 text-xs font-bold text-white/80">{u.full_name}</span>
                                                    {sel && <span className="font-black text-sm" style={{ color: CONV_COLORS[newType].accent }}>✓</span>}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <div className="p-2 flex-shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                        <button onClick={createConv} disabled={selected.length === 0}
                                            className="w-full py-2.5 rounded-xl text-sm font-black text-white disabled:opacity-30 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                            style={{ background: `linear-gradient(135deg, ${CONV_COLORS[newType].from}, ${CONV_COLORS[newType].to})` }}>
                                            {newType === 'direct' ? '💬 بدء المحادثة' : '👥 إنشاء المجموعة'}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* ══ زر الفتح ════════════════════════════ */}
            <button
                onClick={open ? handleClose : handleOpen}
                className="w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl shadow-red-900/50 hover:scale-110 active:scale-95 transition-all relative fc-btn-bounce"
                style={{ background: 'linear-gradient(135deg, #DC2626, #991B1B)' }}
            >
                <span className={`text-2xl transition-transform duration-300 ${open ? 'rotate-90 scale-75' : ''}`}>
                    {open ? '✕' : '💬'}
                </span>
                {!open && totalUnread > 0 && (
                    <span className="absolute -top-1 -right-1 bg-white text-red-600 text-[10px] font-black rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 shadow-lg animate-pulse">
                        {totalUnread > 99 ? '99+' : totalUnread}
                    </span>
                )}
            </button>
        </div>
    );
}
