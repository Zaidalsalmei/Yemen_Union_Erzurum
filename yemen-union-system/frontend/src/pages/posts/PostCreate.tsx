import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { Button, Card, CardBody, LoadingPage } from '../../components/common';
import ImageUpload from '../../components/ImageUpload';

const TYPES = [
    { value: 'announcement', label: 'إعلان', icon: '📢' },
    { value: 'news', label: 'خبر', icon: '📰' },
    { value: 'event', label: 'فعالية', icon: '🎉' },
    { value: 'financial', label: 'مالي', icon: '💰' },
];

export function PostCreate() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [form, setForm] = useState({
        title: '',
        content: '',
        type: 'announcement',
        image: '',
        status: 'draft'
    });
    const [loading, setLoading] = useState(isEdit);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isEdit) {
            const fetchPost = async () => {
                try {
                    const res = await api.get(`/posts/${id}`);
                    const data = res.data.data;
                    setForm({
                        title: data.title,
                        content: data.content,
                        type: data.type,
                        image: data.image || '',
                        status: data.status
                    });
                } catch (err) {
                    toast.error('خطأ في جلب بيانات المنشور');
                    navigate('/posts');
                } finally {
                    setLoading(false);
                }
            };
            fetchPost();
        }
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (targetStatus?: string) => {
        if (!form.title || !form.content) {
            toast.error('العنوان والمحتوى مطلوبان');
            return;
        }

        try {
            setSubmitting(true);
            const payload = { ...form, status: targetStatus || form.status };

            if (isEdit) {
                await api.put(`/posts/${id}`, payload);
                toast.success('تم تحديث المنشور بنجاح ✅');
            } else {
                await api.post('/posts', payload);
                toast.success(targetStatus === 'published' ? 'تم النشر بنجاح! 🚀' : 'تم الحفظ كمسودة 📝');
            }
            navigate('/posts');
        } catch (err) {
            toast.error('حدث خطأ أثناء الحفظ');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <LoadingPage message="جاري تجهيز المحرر..." />;

    return (
        <div className="post-create-page p-4 md:p-8 max-w-4xl mx-auto animate-fadeIn" dir="rtl">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-gray-800 flex items-center gap-3">
                        {isEdit ? '✏️ تعديل المنشور' : '📢 إنشاء منشور جديد'}
                    </h1>
                    <p className="text-gray-400 font-bold mt-1">شارك الأخبار والإعلانات مع أعضاء الاتحاد</p>
                </div>
                <Link to="/posts">
                    <Button variant="secondary" className="rounded-2xl font-black">إلغاء</Button>
                </Link>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
                <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-red-50/50 overflow-hidden">
                    <CardBody className="p-8 space-y-8">
                        {/* Type Selection */}
                        <div>
                            <label className="block text-sm font-black text-gray-400 mb-4">نوع المنشور:</label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {TYPES.map(type => (
                                    <button
                                        key={type.value}
                                        onClick={() => setForm(prev => ({ ...prev, type: type.value }))}
                                        className={`p-4 rounded-3xl border-2 transition-all flex flex-col items-center gap-2 ${form.type === type.value ? 'border-[#DC2626] bg-red-50 text-[#DC2626] shadow-lg shadow-red-100' : 'border-gray-50 bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                                    >
                                        <span className="text-2xl">{type.icon}</span>
                                        <span className="font-black text-sm">{type.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Title Input */}
                        <div>
                            <label className="block text-sm font-black text-gray-400 mb-3">عنوان المنشور *</label>
                            <input
                                type="text"
                                name="title"
                                value={form.title}
                                onChange={handleChange}
                                placeholder="اكتب عنواناً جذاباً هنا..."
                                className="w-full p-4 rounded-3xl bg-gray-50 border-2 border-transparent focus:border-red-200 focus:bg-white focus:ring-0 font-black text-gray-700 outline-none transition-all"
                            />
                        </div>

                        {/* Content Input */}
                        <div>
                            <label className="block text-sm font-black text-gray-400 mb-3">محتوى المنشور *</label>
                            <textarea
                                name="content"
                                value={form.content}
                                onChange={handleChange}
                                rows={10}
                                placeholder="اكتب محتوى المنشور بالتفصيل هنا..."
                                className="w-full p-6 rounded-[2rem] bg-gray-50 border-2 border-transparent focus:border-red-200 focus:bg-white focus:ring-0 font-bold text-gray-700 outline-none transition-all leading-relaxed"
                            ></textarea>
                        </div>

                        {/* رفع صورة للمنشور */}
                        <div>
                            <label className="block text-sm font-black text-gray-400 mb-3">صورة المنشور (اختياري)</label>
                            <div className="flex justify-center md:justify-start">
                                <ImageUpload
                                    currentImage={form.image}
                                    onUpload={(url) => setForm(prev => ({ ...prev, image: url }))}
                                    onRemove={() => setForm(prev => ({ ...prev, image: '' }))}
                                    folder="posts"
                                    size="lg"
                                    shape="square"
                                    label="اضغط لإضافة صورة للمنشور"
                                />
                            </div>
                        </div>

                        {/* Preview Section */}
                        {(form.title || form.content) && (
                            <div className="pt-8 mt-8 border-t border-dashed border-gray-100">
                                <label className="block text-xs font-black text-gray-300 uppercase mb-4 tracking-widest">معاينة مباشرة:</label>
                                <div className="bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100">
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="px-3 py-1 bg-white rounded-full text-xs font-black shadow-sm">
                                            {TYPES.find(t => t.value === form.type)?.icon} {TYPES.find(t => t.value === form.type)?.label}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-black text-gray-800 mb-2">{form.title || 'عنوان المنشور...'}</h3>
                                    <p className="text-gray-500 text-sm leading-relaxed whitespace-pre-wrap">{form.content || 'المحتوى سيظهر هنا...'}</p>
                                    {form.image && (
                                        <img src={form.image} alt="preview" className="mt-4 rounded-2xl w-full h-48 object-cover border border-gray-200" onError={(e) => (e.currentTarget.style.display = 'none')} />
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Submit Buttons */}
                        <div className="flex flex-col md:flex-row gap-4 pt-4">
                            <Button
                                onClick={() => navigate('/posts')}
                                variant="secondary"
                                className="flex-1 py-4 font-black rounded-3xl"
                            >
                                إلغاء
                            </Button>
                            <Button
                                onClick={() => handleSubmit('draft')}
                                disabled={submitting}
                                className="flex-1 py-4 font-black rounded-3xl bg-gray-100 text-gray-600 hover:bg-gray-200"
                            >
                                {submitting ? '...' : '📝 حفظ كمسودة'}
                            </Button>
                            <Button
                                onClick={() => handleSubmit('published')}
                                disabled={submitting}
                                className="flex-1 py-4 font-black rounded-3xl bg-[#DC2626] text-white hover:bg-red-700 shadow-xl shadow-red-100"
                            >
                                {submitting ? '⏳ جاري الحفظ...' : isEdit ? '✅ تحديث ونشر' : '🚀 نشر مباشرة'}
                            </Button>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}
