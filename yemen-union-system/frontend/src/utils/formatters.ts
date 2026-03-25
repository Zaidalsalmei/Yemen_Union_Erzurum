import { format, formatDistanceToNow, isAfter, isBefore, addDays } from 'date-fns';
import { ar } from 'date-fns/locale';

/**
 * Format date in Arabic
 */
export function formatArabicDate(date: string | Date): string {
    return format(new Date(date), 'dd MMMM yyyy', { locale: ar });
}

/**
 * Format date and time in Arabic
 */
export function formatArabicDateTime(date: string | Date): string {
    return format(new Date(date), 'dd MMMM yyyy - HH:mm', { locale: ar });
}

/**
 * Format short date
 */
export function formatShortDate(date: string | Date): string {
    return format(new Date(date), 'dd/MM/yyyy', { locale: ar });
}

/**
 * Format relative time in Arabic
 */
export function formatRelativeTime(date: string | Date): string {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ar });
}

/**
 * Format number with Arabic numerals
 */
export function formatArabicNumber(num: number): string {
    return new Intl.NumberFormat('ar-EG').format(num);
}

/**
 * Format currency in Arabic
 */
export function formatCurrency(amount: number, currency: string = 'TRY'): string {
    const formatted = new Intl.NumberFormat('ar-EG', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount);

    const symbols: Record<string, string> = {
        TRY: '₺',
        USD: '$',
        EUR: '€',
        SAR: 'ر.س',
        YER: 'ر.ي',
    };

    return `${formatted} ${symbols[currency] || currency}`;
}

/**
 * Get status label in Arabic
 */
export function getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
        pending: 'قيد الانتظار',
        active: 'نشط',
        suspended: 'معلق',
        banned: 'محظور',
        expired: 'منتهي',
        cancelled: 'ملغي',
        refunded: 'مسترد',
        draft: 'مسودة',
        published: 'منشور',
        ongoing: 'جاري',
        completed: 'مكتمل',
        approved: 'معتمد',
        rejected: 'مرفوض',
        paid: 'مدفوع',
        registered: 'مسجل',
        confirmed: 'مؤكد',
        attended: 'حاضر',
        no_show: 'غائب',
    };

    return labels[status] || status;
}

/**
 * Get status color class
 */
export function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
        pending: 'badge-warning',
        active: 'badge-success',
        suspended: 'badge-warning',
        banned: 'badge-danger',
        expired: 'badge-gray',
        cancelled: 'badge-danger',
        refunded: 'badge-info',
        draft: 'badge-gray',
        published: 'badge-success',
        ongoing: 'badge-info',
        completed: 'badge-success',
        approved: 'badge-success',
        rejected: 'badge-danger',
        paid: 'badge-success',
    };

    return colors[status] || 'badge-gray';
}

/**
 * Check if date is expired
 */
export function isExpired(date: string | Date): boolean {
    return isBefore(new Date(date), new Date());
}

/**
 * Check if date is within days
 */
export function isWithinDays(date: string | Date, days: number): boolean {
    const targetDate = new Date(date);
    const futureDate = addDays(new Date(), days);
    return isAfter(targetDate, new Date()) && isBefore(targetDate, futureDate);
}

/**
 * Get days remaining
 */
export function getDaysRemaining(date: string | Date): number {
    const target = new Date(date);
    const now = new Date();
    const diff = target.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Truncate text
 */
export function truncate(text: string, length: number): string {
    if (text.length <= length) return text;
    return text.slice(0, length) + '...';
}

/**
 * Format phone number
 */
export function formatPhoneNumber(phone: string): string {
    if (!phone) return '';
    // Format as XXX XXX XXXX
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
}
