import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
    Users,
    CreditCard,
    Calendar,
    Check,
    ChevronRight,
    ChevronLeft,
    Search,
    User,
    FileText,
    CheckCircle2
} from 'lucide-react';
import api from '../../services/api';

// --- Types ---
interface UserOption {
    id: number;
    full_name: string;
    email: string;
    phone_number: string;
}

interface PackageOption {
    id: number;
    name: string;
    type: 'annual' | 'semester' | 'monthly';
    price: number;
    currency: string;
    duration_days: number;
    features: string[];
}

export function MembershipCreate() {
    const navigate = useNavigate();

    // --- State ---
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Step 1: User Selection
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<UserOption[]>([]);
    const [selectedUser, setSelectedUser] = useState<UserOption | null>(null);
    const [isSearching, setIsSearching] = useState(false);

    // Step 2: Package Selection
    const [packages, setPackages] = useState<PackageOption[]>([]);
    const [selectedPackage, setSelectedPackage] = useState<PackageOption | null>(null);
    const [loadingPackages, setLoadingPackages] = useState(true);

    // Step 3: Payment Details
    const [formData, setFormData] = useState({
        payment_method: 'cash',
        start_date: new Date().toISOString().split('T')[0],
        reference_number: '',
        notes: ''
    });

    // --- Effects ---
    useEffect(() => {
        fetchPackages();
        searchUsers(); // Fetch initial users
    }, []);

    useEffect(() => {
        // Only search if empty (to show default list) or more than 2 characters
        if (searchQuery.length === 0 || searchQuery.length > 2) {
            const delayDebounceFn = setTimeout(() => {
                searchUsers();
            }, 500);
            return () => clearTimeout(delayDebounceFn);
        } else {
            // Keep results if 1 or 2 characters to avoid flickering, 
            // or clear them if you want strictly > 2
            // setSearchResults([]); 
        }
    }, [searchQuery]);

    // --- Data Fetching ---
    const fetchPackages = async () => {
        try {
            const response = await api.get('/memberships/packages');
            if (response.data.success) {
                // Ensure order: monthly, then semester, then annual (for RTL: left to right logically, displayed right to left)
                const sortedPackages = response.data.data.sort((a: PackageOption, b: PackageOption) => {
                    const order = { 'monthly': 1, 'semester': 2, 'annual': 3 };
                    return (order[a.type] || 99) - (order[b.type] || 99);
                });
                setPackages(sortedPackages);
            }
        } catch (error) {
            toast.error('حدث خطأ أثناء جلب الباقات المتاحة');
        } finally {
            setLoadingPackages(false);
        }
    };

    const searchUsers = async () => {
        setIsSearching(true);
        try {
            const response = await api.get(`/users?search=${searchQuery}&per_page=5`);
            if (response.data.success) {
                // The paginated response puts the array directly in response.data.data
                setSearchResults(Array.isArray(response.data.data) ? response.data.data : []);
            }
        } catch (error) {
            console.error('Error searching users:', error);
        } finally {
            setIsSearching(false);
        }
    };

    // --- Calculation ---
    const getEndDate = () => {
        if (!selectedPackage || !formData.start_date) return '';
        const d = new Date(formData.start_date);
        d.setDate(d.getDate() + selectedPackage.duration_days);
        return d.toISOString().split('T')[0];
    };

    // --- Handlers ---
    const handleNext = () => {
        if (step === 1 && !selectedUser) {
            toast.error('الرجاء تحديد عضو أولاً');
            return;
        }
        if (step === 2 && !selectedPackage) {
            toast.error('الرجاء اختيار باقة أولاً');
            return;
        }
        setStep(prev => Math.min(prev + 1, 4));
    };

    const handlePrev = () => {
        setStep(prev => Math.max(prev - 1, 1));
    };

    const handleSubmit = async () => {
        if (!selectedUser || !selectedPackage) return;

        setLoading(true);
        try {
            const payload = {
                user_id: selectedUser.id,
                package_type: selectedPackage.type,
                amount: selectedPackage.price,
                currency: selectedPackage.currency,
                payment_method: formData.payment_method,
                payment_date: new Date().toISOString().split('T')[0],
                start_date: formData.start_date,
                end_date: getEndDate(),
                notes: formData.reference_number ? `رقم المرجع: ${formData.reference_number}\n${formData.notes}` : formData.notes,
                status: 'active'
            };

            const response = await api.post('/memberships', payload);

            if (response.data.success) {
                toast.success('تم إنشاء الاشتراك بنجاح');
                navigate('/memberships');
            } else {
                toast.error(response.data.message || 'حدث خطأ أثناء إنشاء الاشتراك');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'حدث خطأ في الاتصال بالخادم');
        } finally {
            setLoading(false);
        }
    };

    // --- Render Helpers ---
    const renderStepper = () => (
        <div className="mb-8 w-full">
            <div className="flex items-center justify-between relative w-full">
                <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-gray-200 -z-10" />
                {[
                    { number: 1, title: 'اختيار العضو', icon: Users },
                    { number: 2, title: 'اختيار الباقة', icon: CreditCard },
                    { number: 3, title: 'تفاصيل الدفع', icon: FileText },
                    { number: 4, title: 'تأكيد وحفظ', icon: CheckCircle2 }
                ].map((s) => {
                    const isActive = step === s.number;
                    const isCompleted = step > s.number;
                    const Icon = s.icon;
                    return (
                        <div key={s.number} className="flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 ${isActive ? 'bg-red-600 border-red-100 text-white' :
                                isCompleted ? 'bg-red-600 border-white text-white' :
                                    'bg-white border-gray-200 text-gray-400'
                                } transition-colors duration-300`}>
                                {isCompleted ? <Check size={20} /> : <Icon size={20} />}
                            </div>
                            <span className={`mt-2 text-sm font-medium ${isActive ? 'text-red-600' :
                                isCompleted ? 'text-gray-900' :
                                    'text-gray-400'
                                }`}>
                                {s.title}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    const renderStep1 = () => (
        <div className="space-y-6 animate-fadeIn">
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Search className="text-red-600" size={24} />
                    ابحث عن العضو
                </h3>

                <div className="relative mb-6">
                    <input
                        type="text"
                        placeholder="اكتب اسم العضو، الإيميل، أو رقم الهاتف..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-shadow"
                        dir="rtl"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        {isSearching ? (
                            <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Search className="text-gray-400" size={20} />
                        )}
                    </div>
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && !selectedUser && (
                    <div className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden divide-y divide-gray-100 mb-6">
                        {searchResults.map((user) => (
                            <button
                                key={user.id}
                                onClick={() => {
                                    setSelectedUser(user);
                                    setSearchQuery('');
                                    setSearchResults([]);
                                }}
                                className="w-full text-right p-4 hover:bg-red-50 transition-colors flex items-center justify-between group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900 group-hover:text-red-700">{user.full_name}</div>
                                        <div className="text-sm text-gray-500 flex gap-4">
                                            <span>{user.email}</span>
                                            {user.phone_number && <span>• {user.phone_number}</span>}
                                        </div>
                                    </div>
                                </div>
                                <ChevronLeft className="text-gray-400 group-hover:text-red-600" size={20} />
                            </button>
                        ))}
                    </div>
                )}

                {/* Selected User Card */}
                {selectedUser && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center text-white shadow-sm">
                                <User size={24} />
                            </div>
                            <div>
                                <div className="text-sm font-medium text-red-600 mb-1">العضو المحدد</div>
                                <div className="font-bold text-gray-900 text-lg">{selectedUser.full_name}</div>
                                <div className="text-sm text-gray-600">{selectedUser.email}</div>
                            </div>
                        </div>
                        <button
                            onClick={() => setSelectedUser(null)}
                            className="bg-white px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
                        >
                            تغيير العضو
                        </button>
                    </div>
                )}
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-6 animate-fadeIn">
            {loadingPackages ? (
                <div className="flex justify-center py-12">
                    <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {packages.map((pkg) => {
                        const isSelected = selectedPackage?.id === pkg.id;
                        return (
                            <div
                                key={pkg.id}
                                onClick={() => setSelectedPackage(pkg)}
                                className={`relative flex flex-col bg-white rounded-2xl border-2 transition-all duration-300 cursor-pointer overflow-hidden
                                    ${isSelected ? 'border-red-600 shadow-md transform -translate-y-1' : 'border-gray-200 hover:border-red-300 hover:shadow-sm'}`}
                            >
                                {isSelected && (
                                    <div className="absolute top-0 right-0 w-12 h-12 overflow-hidden z-10">
                                        <div className="absolute -top-6 -right-6 bg-red-600 text-white w-24 h-24 transform rotate-45 flex items-end justify-center pb-2">
                                            <Check size={20} className="transform -rotate-45" />
                                        </div>
                                    </div>
                                )}

                                <div className={`p-6 text-center border-b ${isSelected ? 'bg-red-50/50' : ''}`}>
                                    <h3 className="text-xl font-bold text-gray-900 mb-1">{pkg.name}</h3>
                                    <p className="text-sm text-gray-500 mb-4">
                                        {pkg.type === 'monthly' ? 'شهر واحد' :
                                            pkg.type === 'semester' ? 'فصلي' : 'سنة كاملة'}
                                    </p>
                                    <div className="bg-gray-50 rounded-xl p-4 inline-block w-full">
                                        <div className="text-3xl font-black text-red-600">
                                            {pkg.price}
                                        </div>
                                        <div className="text-sm font-medium text-gray-500 mt-1">{pkg.currency}</div>
                                    </div>
                                </div>

                                <div className="p-6 flex-grow flex flex-col">
                                    <ul className="space-y-3 mb-6 flex-grow">
                                        {pkg.features?.map((feature, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                                                <CheckCircle2 className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <button
                                        className={`w-full py-3 px-4 rounded-xl font-bold transition-colors ${isSelected
                                            ? 'bg-red-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        انقر للاختيار
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );

    const renderStep3 = () => (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm animate-fadeIn">
            <h3 className="text-lg font-bold text-gray-900 mb-6 border-b pb-4">معلومات الدفع والتاريخ</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">طريقة الدفع</label>
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { id: 'cash', label: 'نقداً', icon: '💵' },
                            { id: 'bank_transfer', label: 'تحويل بنكي', icon: '🏦' },
                            { id: 'card', label: 'بطاقة', icon: '💳' },
                        ].map(method => (
                            <button
                                key={method.id}
                                onClick={() => setFormData({ ...formData, payment_method: method.id })}
                                className={`flex flex-col items-center justify-center py-3 px-2 border-2 rounded-lg transition-colors ${formData.payment_method === method.id
                                    ? 'border-red-600 bg-red-50 text-red-700 font-bold'
                                    : 'border-gray-200 bg-white text-gray-600 hover:border-red-200 hover:bg-gray-50'
                                    }`}
                            >
                                <span className="text-2xl mb-1">{method.icon}</span>
                                <span className="text-sm">{method.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">تاريخ البداية</label>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <input
                                type="date"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                value={formData.start_date}
                                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                required
                            />
                        </div>
                    </div>
                    {selectedPackage && (
                        <p className="mt-2 text-sm text-gray-500 flex items-center gap-1">
                            <Calendar size={14} />
                            ينتهي في: <span className="font-bold text-gray-900 dir-ltr">{getEndDate()}</span>
                        </p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">رقم المرجع (إن وجد)</label>
                    <input
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        placeholder="رقم العملية / الحوالة البنكية..."
                        value={formData.reference_number}
                        onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ملاحظات إضافية</label>
                    <input
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        placeholder="أي ملاحظات حول الدفع أو الاشتراك..."
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                </div>
            </div>
        </div>
    );

    const renderStep4 = () => (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm animate-fadeIn">
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check size={32} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">مراجعة الاشتراك</h3>
                <p className="text-gray-500 mt-2">يرجى التأكد من البيانات أدناه قبل حفظ الاشتراك واعتماده</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 mb-8 max-w-2xl mx-auto border border-gray-200">
                <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                        <span className="text-gray-500 font-medium">اسم العضو</span>
                        <span className="font-bold text-gray-900">{selectedUser?.full_name}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                        <span className="text-gray-500 font-medium">الباقة المختارة</span>
                        <div className="text-left">
                            <span className="font-bold text-gray-900 block">{selectedPackage?.name}</span>
                            <span className="text-sm font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                                {selectedPackage?.price} {selectedPackage?.currency}
                            </span>
                        </div>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                        <span className="text-gray-500 font-medium">طريقة الدفع</span>
                        <span className="font-bold text-gray-900">
                            {formData.payment_method === 'cash' ? 'نقداً 💵' :
                                formData.payment_method === 'bank_transfer' ? 'تحويل بنكي 🏦' : 'بطاقة 💳'}
                        </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                        <span className="text-gray-500 font-medium">تاريخ الاشتراك</span>
                        <span className="font-bold text-gray-900 dir-ltr">{formData.start_date}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                        <span className="text-gray-500 font-medium">تاريخ الانتهاء</span>
                        <span className="font-bold text-gray-900 dir-ltr">{getEndDate()}</span>
                    </div>
                    {(formData.reference_number || formData.notes) && (
                        <div className="flex justify-between items-start py-2 border-b border-gray-200">
                            <span className="text-gray-500 font-medium whitespace-nowrap ml-4">الملاحظات</span>
                            <span className="text-gray-900 text-sm overflow-hidden text-left">
                                {formData.reference_number ? `المرجع: ${formData.reference_number} | ` : ''}
                                {formData.notes}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-center">
                <div className="bg-red-50 text-red-700 px-6 py-4 rounded-lg flex items-start gap-3 max-w-2xl w-full">
                    <span className="text-xl">⚠️</span>
                    <p className="text-sm font-medium">عند الضغط على حفظ، سيتم اعتماد الاشتراك فوراً وتفعيله بحالة "نشط" وسيتمكن العضو من الاستفادة من مميزات الباقة على الفور.</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="w-full max-w-6xl mx-auto p-4 md:p-6 pb-24" dir="rtl">
            <div className="mb-8 w-full text-right">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">إنشاء اشتراك جديد</h1>
                <p className="text-gray-500">قم بإنشاء وتفعيل اشتراك لعضو بخطوات بسيطة بصفتك مدير.</p>
            </div>

            {/* Stepper Header */}
            {renderStepper()}

            {/* Step Content */}
            <div className="min-h-[400px] w-full">
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
                {step === 4 && renderStep4()}
            </div>

            {/* Footer Buttons */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40 transition-all md:pl-64">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <button
                        onClick={handlePrev}
                        disabled={step === 1 || loading}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${step === 1
                            ? 'text-gray-400 cursor-not-allowed opacity-50'
                            : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                            }`}
                    >
                        <ChevronRight size={20} />
                        السابق
                    </button>

                    {step < 4 ? (
                        <button
                            onClick={handleNext}
                            className="flex items-center gap-2 px-8 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 shadow-md transition-all shadow-red-200"
                        >
                            التالي
                            <ChevronLeft size={20} />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 shadow-md transition-all shadow-green-200 disabled:opacity-75 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Check size={20} />
                            )}
                            حفظ واعتماد الاشتراك
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
