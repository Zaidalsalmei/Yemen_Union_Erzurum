import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../../services/api';

interface EmailReply {
    id: number;
    user_id: number;
    sender_email: string;
    subject: string;
    message: string;
    created_at: string;
    user?: {
        id: number;
        full_name: string;
        phone_number: string;
    };
}

export function EmailRepliesList() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [replies, setReplies] = useState<EmailReply[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [fetching, setFetching] = useState(false);
    const [fetchMessage, setFetchMessage] = useState<string | null>(null);

    const currentPage = parseInt(searchParams.get('page') || '1');
    const searchQuery = searchParams.get('search') || '';

    useEffect(() => {
        loadReplies();
    }, [currentPage, searchQuery]);

    const loadReplies = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch email replies from API
            const response = await api.get('/email-replies/list', {
                params: {
                    page: currentPage,
                    search: searchQuery
                }
            });

            if (response.data.success) {
                setReplies(response.data.data || []);
            } else {
                setError(response.data.message || 'حدث خطأ في تحميل الردود');
            }

        } catch (err: any) {
            // If error is 404 or connection issue, show helpful message
            if (err.response?.status === 404 || !err.response) {
                setError('لم يتم العثور على ردود. استخدم زر "جلب الردود الجديدة" لجلب الرسائل من البريد الإلكتروني.');
            } else {
                setError(err.response?.data?.message || 'حدث خطأ في تحميل الردود');
            }
            setReplies([]);
        } finally {
            setLoading(false);
        }
    };

    const handleFetchReplies = async () => {
        try {
            setFetching(true);
            setFetchMessage(null);

            const response = await api.get('/email-replies/fetch');
            setFetchMessage(response.data.message || 'تم جلب الردود بنجاح');

            // Reload replies after fetching
            setTimeout(() => {
                loadReplies();
            }, 1000);

        } catch (err: any) {
            setFetchMessage(err.response?.data?.message || 'حدث خطأ في جلب الردود');
        } finally {
            setFetching(false);
        }
    };

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const search = formData.get('search') as string;

        setSearchParams({
            page: '1',
            ...(search && { search })
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">جاري التحميل...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">ردود البريد الإلكتروني</h1>
                    <p className="text-gray-600 mt-1">عرض وإدارة ردود الأعضاء عبر البريد الإلكتروني</p>
                </div>

                <button
                    onClick={handleFetchReplies}
                    disabled={fetching}
                    className="btn btn-primary flex items-center gap-2"
                >
                    {fetching ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            جاري الجلب...
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            جلب الردود الجديدة
                        </>
                    )}
                </button>
            </div>

            {/* Fetch Message */}
            {fetchMessage && (
                <div className={`p-4 rounded-lg ${fetchMessage.includes('خطأ') ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'}`}>
                    <p className="text-sm">{fetchMessage}</p>
                </div>
            )}

            {/* Search */}
            <form onSubmit={handleSearch} className="card">
                <div className="flex gap-4">
                    <div className="flex-1">
                        <input
                            type="text"
                            name="search"
                            defaultValue={searchQuery}
                            placeholder="البحث في الردود..."
                            className="input w-full"
                        />
                    </div>
                    <button type="submit" className="btn btn-primary">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        بحث
                    </button>
                </div>
            </form>

            {/* Error Message */}
            {error && (
                <div className="card bg-yellow-50 border-yellow-200">
                    <div className="flex items-start gap-3">
                        <svg className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div className="flex-1">
                            <h3 className="font-semibold text-yellow-900 mb-1">تنبيه</h3>
                            <p className="text-yellow-800">{error}</p>
                            <div className="mt-3 p-3 bg-white rounded border border-yellow-200">
                                <p className="text-sm text-gray-700 mb-2">
                                    <strong>لتفعيل هذه الميزة:</strong>
                                </p>
                                <ol className="text-sm text-gray-600 space-y-1 mr-4 list-decimal">
                                    <li>تأكد من تثبيت PHP IMAP Extension</li>
                                    <li>قم بتكوين إعدادات IMAP في ملف .env</li>
                                    <li>أضف البريد الإلكتروني: <code className="bg-gray-100 px-2 py-1 rounded">ixruz79@gmail.com</code></li>
                                </ol>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Replies List */}
            {replies.length > 0 ? (
                <div className="space-y-4">
                    {replies.map((reply) => (
                        <div key={reply.id} className="card hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold">
                                        {reply.user?.full_name?.charAt(0) || '؟'}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">
                                            {reply.user?.full_name || 'غير معروف'}
                                        </h3>
                                        <p className="text-sm text-gray-500">{reply.sender_email}</p>
                                    </div>
                                </div>
                                <span className="text-xs text-gray-500">
                                    {new Date(reply.created_at).toLocaleDateString('ar-EG', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </span>
                            </div>

                            <div className="mb-3">
                                <h4 className="font-medium text-gray-900 mb-2">{reply.subject}</h4>
                                <p className="text-gray-700 whitespace-pre-wrap">{reply.message}</p>
                            </div>

                            {reply.user && (
                                <div className="pt-3 border-t border-gray-100">
                                    <Link
                                        to={`/users/${reply.user.id}`}
                                        className="text-sm text-red-600 hover:text-red-700 font-medium"
                                    >
                                        عرض ملف العضو ←
                                    </Link>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : !error && (
                <div className="card text-center py-12">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد ردود</h3>
                    <p className="text-gray-600">لم يتم العثور على أي ردود بريد إلكتروني</p>
                </div>
            )}
        </div>
    );
}
