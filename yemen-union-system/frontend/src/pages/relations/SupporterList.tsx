import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { Button, StatusBadge, ErrorState, Modal, Input, Select, Textarea } from '../../components/common';
import { useForm } from 'react-hook-form';
import { formatArabicDate, formatCurrency, formatArabicNumber } from '../../utils/formatters';
import type { Supporter, SupportersStats, ApiResponse } from '../../types';

// Scoped Stat Widget
function StatsWidget({ label, value, icon, color }: { label: string, value: number, icon: string, color: string }) {
    const bgMap: any = { red: '#FEF2F2', green: '#ECFDF5', orange: '#FFF7ED', blue: '#EFF6FF' };
    const textMap: any = { red: '#DC2626', green: '#059669', orange: '#D97706', blue: '#2563EB' };

    return (
        <div className="stat-card-std">
            <div className="icon-wrapper" style={{ background: bgMap[color], color: textMap[color] }}>
                {icon}
            </div>
            <div className="info">
                <div className="value">{typeof value === 'number' ? formatArabicNumber(value) : value}</div>
                <div className="label">{label}</div>
            </div>
        </div>
    );
}

export function SupporterList() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState({
        type: '',
        status: '',
        sort: 'newest'
    });
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; supporter: Supporter | null }>({
        isOpen: false,
        supporter: null,
    });
    const [visitModal, setVisitModal] = useState<{ isOpen: boolean; supporter: Supporter | null }>({
        isOpen: false,
        supporter: null,
    });

    // Fetch supporters
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['supporters', search, filters],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (filters.type) params.append('type', filters.type);
            if (filters.status) params.append('status', filters.status);
            params.append('sort', filters.sort);

            const response = await api.get<ApiResponse<Supporter[]>>(`/sponsors?${params}`);
            return response.data;
        },
    });

    // Fetch stats
    const { data: statsData } = useQuery({
        queryKey: ['supporters-stats'],
        queryFn: async () => {
            const response = await api.get<ApiResponse<SupportersStats>>('/sponsors/stats');
            return response.data.data!;
        },
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/sponsors/${id}`);
        },
        onSuccess: () => {
            toast.success('تم حذف الجهة الداعمة بنجاح');
            queryClient.invalidateQueries({ queryKey: ['supporters'] });
            queryClient.invalidateQueries({ queryKey: ['supporters-stats'] });
            setDeleteModal({ isOpen: false, supporter: null });
        },
        onError: () => {
            toast.error('فشل في حذف الجهة الداعمة');
        },
    });

    const supporters = data?.data || [];
    const stats = statsData || {
        total_sponsors: 0,
        active_sponsors: 0,
        total_sponsored: 0,
        total_sponsorships: 0,
        this_month_amount: 0,
        top_sponsors: [],
    };

    return (
        <div className="animate-fadeIn">
            {/* Scoped Page Header */}
            <div className="page-header">
                <div>
                    <h1>الجهات الداعمة</h1>
                    <p>إدارة الجهات والشركاء الداعمين للاتحاد</p>
                </div>
                <div className="flex gap-2">
                    <button className="btn" style={{ background: 'white', border: '1px solid #e2e8f0', color: '#64748b' }} onClick={() => navigate('/relations/sponsorships')}>
                        🤝 سجل الرعايات
                    </button>
                    <button className="btn" style={{ background: 'var(--color-primary)', color: 'white' }} onClick={() => navigate('/relations/sponsors/create')}>
                        <span>+</span> إضافة جهة
                    </button>
                </div>
            </div>

            {/* Scoped Stats Grid */}
            <div className="stats-grid">
                <StatsWidget label="إجمالي الداعمين" value={stats.total_sponsors} icon="🏢" color="blue" />
                <StatsWidget label="داعمين نشطين" value={stats.active_sponsors} icon="✅" color="green" />
                <StatsWidget label="إجمالي الدعم" value={formatCurrency(stats.total_sponsored) as any} icon="💰" color="orange" />
                <StatsWidget label="دعم هذا الشهر" value={formatCurrency(stats.this_month_amount) as any} icon="📅" color="red" />
            </div>

            {/* Scoped Filter Bar */}
            <div className="filter-bar">
                <div className="search-wrapper">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="بحث باسم الجهة، المسؤول..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ width: '100%' }}
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto">
                    <select
                        value={filters.type}
                        onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                        style={{ minWidth: '140px' }}
                    >
                        <option value="">كل الأنواع</option>
                        <option value="organization">منظمة</option>
                        <option value="individual">فرد</option>
                        <option value="company">شركة</option>
                        <option value="government">جهة حكومية</option>
                    </select>

                    <select
                        value={filters.status}
                        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                        style={{ minWidth: '140px' }}
                    >
                        <option value="">كل الحالات</option>
                        <option value="active">نشط</option>
                        <option value="inactive">غير نشط</option>
                    </select>

                    <select
                        value={filters.sort}
                        onChange={(e) => setFilters(prev => ({ ...prev, sort: e.target.value }))}
                        style={{ minWidth: '160px' }}
                    >
                        <option value="newest">الأحدث إضافة</option>
                        <option value="highest_support">الأعلى دعماً</option>
                        <option value="most_visits">الأكثر زيارات</option>
                    </select>
                </div>
            </div>

            {/* Scoped Data Grid */}
            <div className="data-grid">
                {isLoading ? (
                    <div className="col-span-full py-12 text-center text-gray-400">جاري التحميل...</div>
                ) : error ? (
                    <div className="col-span-full py-12 text-center text-red-500">حدث خطأ في تحميل البيانات</div>
                ) : !supporters?.length ? (
                    <div className="col-span-full py-12 text-center bg-white border border-dashed border-gray-200 rounded-xl">
                        <div className="text-4xl mb-3">🤝</div>
                        <h3 className="text-lg font-bold mb-1">لا توجد جهات داعمة</h3>
                        <p className="text-sm text-gray-500 mb-4">ابدأ بإضافة الجهات والأفراد الداعمين للاتحاد</p>
                        <button className="btn" style={{ background: 'var(--color-primary)', color: 'white' }} onClick={() => navigate('/relations/sponsors/create')}>
                            إضافة جهة داعمة
                        </button>
                    </div>
                ) : (
                    supporters.map((supporter) => (
                        <div key={supporter.id} className="data-card group" onClick={() => navigate(`/relations/sponsors/${supporter.id}`)} style={{ cursor: 'pointer' }}>
                            {/* Custom Header Cover */}
                            <div className="cover" style={{ height: '100px', background: 'linear-gradient(to right, #f8fafc, #f1f5f9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <div style={{
                                    width: '60px',
                                    height: '60px',
                                    borderRadius: '12px',
                                    background: 'var(--color-primary)',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '24px',
                                    fontWeight: 700,
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                }}>
                                    {supporter.name.charAt(0)}
                                </div>
                                <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                                    <StatusBadge status={supporter.is_active ? 'active' : 'suspended'} />
                                </div>
                            </div>

                            <div className="body">
                                <h3 className="title" style={{ textAlign: 'center' }}>{supporter.name}</h3>
                                <div className="meta" style={{ justifyContent: 'center', gap: '12px' }}>
                                    <span style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px' }}>
                                        {supporter.type === 'individual' ? 'فرد' : supporter.type === 'company' ? 'شركة' : supporter.type === 'organization' ? 'منظمة' : 'حكومة'}
                                    </span>
                                    {supporter.city && <span>📍 {supporter.city}</span>}
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                                    <div style={{ background: '#fafafa', padding: '8px', borderRadius: '8px', textAlign: 'center' }}>
                                        <div style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{formatCurrency(supporter.total_sponsored || 0)}</div>
                                        <div style={{ fontSize: '10px', color: '#94a3b8' }}>إجمالي الدعم</div>
                                    </div>
                                    <div style={{ background: '#fafafa', padding: '8px', borderRadius: '8px', textAlign: 'center' }}>
                                        <div style={{ fontWeight: 700, color: '#334155' }}>{supporter.contact_person || '-'}</div>
                                        <div style={{ fontSize: '10px', color: '#94a3b8' }}>الممثل</div>
                                    </div>
                                </div>

                                <div className="footer">
                                    <button
                                        className="btn"
                                        style={{ flex: 1, background: '#f8fafc', border: '1px solid #e2e8f0', color: '#64748b', fontSize: '12px', height: '36px' }}
                                        onClick={(e) => { e.stopPropagation(); navigate(`/relations/sponsors/${supporter.id}`); }}
                                    >
                                        عرض
                                    </button>
                                    <button
                                        className="btn"
                                        style={{ flex: 1, background: '#f8fafc', border: '1px solid #e2e8f0', color: '#64748b', fontSize: '12px', height: '36px' }}
                                        onClick={(e) => { e.stopPropagation(); navigate(`/relations/sponsors/${supporter.id}/edit`); }}
                                    >
                                        تعديل
                                    </button>
                                    <button
                                        className="btn"
                                        style={{ flex: 1, background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', fontSize: '12px', height: '36px' }}
                                        onClick={(e) => { e.stopPropagation(); setVisitModal({ isOpen: true, supporter }); }}
                                    >
                                        + زيارة
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal Components */}
            <Modal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, supporter: null })}
                title="تأكيد الحذف"
            >
                <div className="p-6">
                    <p className="text-gray-600 mb-6">
                        هل أنت متأكد من حذف الجهة الداعمة "{deleteModal.supporter?.name}"؟
                    </p>
                    <div className="flex gap-3 justify-end">
                        <Button
                            variant="secondary"
                            onClick={() => setDeleteModal({ isOpen: false, supporter: null })}
                        >
                            إلغاء
                        </Button>
                        <Button
                            variant="danger"
                            onClick={() => deleteModal.supporter && deleteMutation.mutate(deleteModal.supporter.id)}
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending ? 'جاري الحذف...' : 'حذف'}
                        </Button>
                    </div>
                </div>
            </Modal>

            <AddVisitModal
                isOpen={visitModal.isOpen}
                onClose={() => setVisitModal({ isOpen: false, supporter: null })}
                supporter={visitModal.supporter}
            />
        </div>
    );
}

// Add Visit Modal Structure
function AddVisitModal({ isOpen, onClose, supporter }: { isOpen: boolean; onClose: () => void; supporter: Supporter | null }) {
    const queryClient = useQueryClient();
    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        defaultValues: {
            visitor_name: '',
            amount: '',
            activity_id: '',
            description: '',
            visit_date: new Date().toISOString().split('T')[0]
        }
    });

    const { data: activitiesBox } = useQuery({
        queryKey: ['activities-simple'],
        queryFn: async () => {
            const response = await api.get('/activities');
            return response.data.data || [];
        },
        enabled: isOpen,
        staleTime: 5 * 60 * 1000
    });

    const activityOptions = (activitiesBox || []).map((a: any) => ({
        value: a.id,
        label: a.title
    }));

    if (!isOpen && errors.amount) reset();

    const createVisitMutation = useMutation({
        mutationFn: async (data: any) => {
            const finalDescription = `[القائم بالزيارة: ${data.visitor_name}] - ${data.description}`;
            await api.post('/sponsorships', {
                sponsor_id: supporter?.id,
                amount: data.amount || 0,
                category: 'general',
                activity_id: data.activity_id || null,
                notes: finalDescription,
                description_ar: finalDescription,
                received_date: data.visit_date,
                purpose_ar: 'زيارة: ' + (data.activity_id && activitiesBox ? activitiesBox.find((a: any) => a.id == data.activity_id)?.title_ar : 'تواصل عام'),
                status: 'received'
            });
        },
        onSuccess: () => {
            toast.success('تم إضافة الزيارة بنجاح');
            queryClient.invalidateQueries({ queryKey: ['supporters'] });
            onClose();
            reset();
        },
        onError: () => toast.error('فشل في إضافة الزيارة')
    });

    const onSubmit = (data: any) => {
        createVisitMutation.mutate(data);
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`تسجيل زيارة لـ ${supporter?.name}`}>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                <Input label="تاريخ الزيارة" type="date" {...register('visit_date', { required: 'التاريخ مطلوب' })} />
                <Input label="القائم بالزيارة" placeholder="اسم عضو الإدارة" {...register('visitor_name', { required: 'الاسم مطلوب' })} />
                <Select label="نشاط مرتبط (اختياري)" options={activityOptions} placeholder="اختر نشاطاً..." {...register('activity_id')} />
                <Input label="المبلغ (إن وجد)" type="number" placeholder="0.00" {...register('amount')} />
                <Textarea label="تفاصيل الزيارة" rows={3} placeholder="ملخص..." {...register('description', { required: 'التفاصيل مطلوبة' })} />
                <div className="flex gap-3 justify-end mt-6">
                    <Button variant="secondary" type="button" onClick={onClose}>إلغاء</Button>
                    <Button type="submit" loading={createVisitMutation.isPending}>حفظ الزيارة</Button>
                </div>
            </form>
        </Modal>
    );
}
