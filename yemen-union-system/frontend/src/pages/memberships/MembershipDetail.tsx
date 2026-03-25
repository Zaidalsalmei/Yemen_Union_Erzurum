import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { Button, LoadingPage, ErrorState } from '../../components/common';
import { formatArabicDate, formatCurrency, getDaysRemaining } from '../../utils/formatters';

export function MembershipDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: membership, isLoading, error, refetch } = useQuery({
        queryKey: ['membership', id],
        queryFn: async () => {
            const response = await api.get<any>(`/memberships/${id}`);
            return response.data.data;
        },
    });

    const updateStatusMutation = useMutation({
        mutationFn: async ({ status, rejection_reason }: { status: string, rejection_reason?: string }) => {
            await api.put(`/memberships/${id}`, { status, rejection_reason });
        },
        onSuccess: () => {
            toast.success('تم تحديث حالة الاشتراك بنجاح');
            queryClient.invalidateQueries({ queryKey: ['membership', id] });
            queryClient.invalidateQueries({ queryKey: ['memberships'] });
        },
        onError: () => {
            toast.error('حدث خطأ في التحديث');
        },
    });

    const handleApprove = () => {
        if (window.confirm('هل أنت متأكد من الموافقة وتفعيل هذا الاشتراك؟')) {
            updateStatusMutation.mutate({ status: 'active' });
        }
    };

    const handleReject = () => {
        const reason = window.prompt('سبب الرفض (اختياري):');
        if (reason !== null) {
            updateStatusMutation.mutate({ status: 'rejected', rejection_reason: reason });
        }
    };

    const handleCancel = () => {
        if (window.confirm('هل أنت متأكد من إلغاء هذا الاشتراك؟ (سيتم إيقافه فوراً)')) {
            updateStatusMutation.mutate({ status: 'cancelled' });
        }
    };

    if (isLoading) {
        return <LoadingPage message="جاري تحميل بيانات الاشتراك..." />;
    }

    if (error || !membership) {
        return <ErrorState onRetry={() => refetch()} />;
    }

    const isActive = membership.status === 'active' && new Date(membership.end_date) > new Date();
    const isPending = membership.status === 'pending';
    const isRejected = membership.status === 'rejected';
    const isCancelled = membership.status === 'cancelled';
    const daysRemaining = isActive ? getDaysRemaining(membership.end_date) : 0;

    const getStatusInfo = () => {
        if (isPending) return { label: 'طلب قيد المراجعة', badge: 'warning', icon: '⏳', desc: 'بانتظار موافقة الإدارة' };
        if (isRejected) return { label: 'مرفوض', badge: 'danger', icon: '❌', desc: membership.rejection_reason || 'تم رفض الطلب' };
        if (isCancelled) return { label: 'ملغى', badge: 'secondary', icon: '🚫', desc: 'تم إلغاء الاشتراك' };
        if (isActive) {
            return { label: 'ساري المفعول', badge: 'success', icon: '✅', desc: `متبقي ${daysRemaining} يوم` };
        }
        return { label: 'منتهي', badge: 'danger', icon: '⏰', desc: 'انتهت مدة الاشتراك' };
    };

    const sInfo = getStatusInfo();

    return (
        <div className="flex-column gap-xl animate-fadeIn">
            {/* Header */}
            <div className="flex-between" style={{ flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <div className="text-sm text-muted mb-2 flex items-center gap-2">
                        <Link to="/" className="text-muted hover">الرئيسية</Link>
                        <span>/</span>
                        <Link to="/memberships" className="text-muted hover">الاشتراكات</Link>
                        <span>/</span>
                        <span className="font-bold">طلب #{membership.id}</span>
                    </div>
                    <h1 className="text-2xl font-bold flex gap-2 items-center">
                        تفاصيل الاشتراك
                    </h1>
                </div>
                <div>
                    <Button variant="secondary" onClick={() => navigate('/memberships')}>
                        العودة للقائمة
                    </Button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '24px' }}>

                {/* Status Sidebar */}
                <aside className="card text-center flex-column gap-lg" style={{ alignSelf: 'start' }}>
                    <div>
                        <div className="mx-auto flex items-center justify-center font-black" style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#F3F4F6', fontSize: '48px', marginBottom: '16px' }}>
                            {sInfo.icon}
                        </div>
                        <h2 className="text-2xl font-bold mb-2">
                            {sInfo.label}
                        </h2>
                        <span className={`badge badge-${sInfo.badge} mt-2 text-sm px-3 py-1 font-bold`}>
                            {sInfo.desc}
                        </span>

                        <div className="mt-8 flex-column gap-md">
                            {isPending && (
                                <>
                                    <Button fullWidth onClick={handleApprove} variant="primary">
                                        موافقة وتفعيل
                                    </Button>
                                    <Button fullWidth variant="danger" onClick={handleReject}>
                                        رفض الطلب
                                    </Button>
                                </>
                            )}
                            {isActive && (
                                <Button fullWidth variant="danger" onClick={handleCancel}>
                                    إلغاء الاشتراك
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="card text-center p-4 mt-4" style={{ background: '#111827', color: 'white' }}>
                        <div className="text-sm font-bold opacity-75 mb-1">المبلغ (₺)</div>
                        <div className="text-3xl font-black">{membership.amount}</div>
                    </div>
                </aside>

                {/* Details Section */}
                <div className="flex-column gap-md">

                    {/* Member Info */}
                    <div className="card p-0">
                        <div className="card-header border-b p-4 text-lg font-bold">
                            معلومات العضو
                        </div>
                        <div className="p-4">
                            <div className="flex items-center gap-4" style={{ flexWrap: 'wrap' }}>
                                <div className="flex items-center justify-center font-black" style={{ width: '64px', height: '64px', borderRadius: '16px', background: '#F3F4F6', color: '#4B5563', fontSize: '32px' }}>
                                    {membership.user_name?.charAt(0) || '?'}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h4 className="text-xl font-bold mb-1">{membership.user_name || 'غير معروف'}</h4>
                                    <div className="flex gap-4 mt-2" style={{ flexWrap: 'wrap' }}>
                                        <div className="badge badge-secondary font-mono" dir="ltr">📱 {membership.user_phone || '-'}</div>
                                    </div>
                                </div>
                                <div>
                                    <Link to={`/users/${membership.user_id}`}>
                                        <Button variant="outline">ملف العضو</Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Subscription Data */}
                    <div className="card p-0 mt-4">
                        <div className="card-header border-b p-4 text-lg font-bold">
                            تفاصيل الباقة والدفع
                        </div>
                        <div className="p-4">
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
                                <div>
                                    <div className="text-sm font-bold text-muted mb-1">نوع الباقة</div>
                                    <div className="font-bold" style={{ fontSize: '18px' }}>{getPackageInfo(membership.package_type)}</div>
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-muted mb-1">طريقة الدفع</div>
                                    <div className="font-bold" style={{ fontSize: '18px' }}>{getPaymentMethodLabel(membership.payment_method)}</div>
                                </div>

                                {membership.start_date && (
                                    <>
                                        <div>
                                            <div className="text-sm font-bold text-muted mb-1">تاريخ التفعيل</div>
                                            <div className="font-bold" style={{ fontSize: '18px' }}>{formatArabicDate(membership.start_date)}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-muted mb-1">تاريخ الانتهاء</div>
                                            <div className="font-bold" style={{ fontSize: '18px' }}>{formatArabicDate(membership.end_date)}</div>
                                        </div>
                                    </>
                                )}

                                {membership.approved_by_name && (
                                    <div className="card p-4 mt-2 bg-light border" style={{ gridColumn: '1 / -1' }}>
                                        <div className="text-sm text-muted font-bold mb-1">اعتمد بواسطة</div>
                                        <div className="font-bold flex items-center gap-2">
                                            <span>🧑‍💼</span> {membership.approved_by_name}
                                        </div>
                                        {membership.approved_at && (
                                            <div className="text-sm text-muted mt-1">{formatArabicDate(membership.approved_at)}</div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Payment Proof */}
                            {membership.payment_proof && (
                                <div className="mt-8 pt-6 border-t">
                                    <h4 className="font-bold mb-4 flex items-center gap-2">
                                        <span>🧾</span> إيصال الدفع / المرفق
                                    </h4>
                                    <div className="p-4 rounded border" style={{ background: '#F9FAFB' }}>
                                        <img
                                            src={membership.payment_proof}
                                            alt="إيصال الدفع"
                                            style={{ width: '100%', maxHeight: '400px', objectFit: 'contain', borderRadius: '8px' }}
                                        />
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

function getPackageInfo(type: string) {
    switch (type) {
        case 'annual': return 'اشتراك سنوي (سنة كاملة)';
        case 'semester': return 'اشتراك فصلي (6 أشهر)';
        case 'monthly': return 'اشتراك شهري (شهر واحد)';
        default: return type || 'غير محدد';
    }
}

function getPaymentMethodLabel(method: string) {
    switch (method) {
        case 'cash': return '💵 نقداً';
        case 'bank_transfer': return '🏦 تحويل بنكي';
        case 'credit_card': return '💳 بطاقة إلكترونية';
        default: return method || 'لم يحدد بعد';
    }
}

