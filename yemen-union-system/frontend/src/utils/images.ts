import { API_BASE_URL } from '../services/api';

/**
 * دالة لتحويل المسار النسبي للصورة إلى رابط كامل يعمل في المتصفح
 * @param path المسار النسبي (مثل /uploads/profiles/img.jpg)
 * @returns الرابط الكامل (مثل http://localhost:8000/uploads/profiles/img.jpg)
 */
export const getStorageUrl = (path: string | null | undefined): string => {
    if (!path) return '';

    // إذا كان الرابط كاملاً بالفعل أو عبارة عن data:uri
    if (path.startsWith('http') || path.startsWith('data:')) {
        return path;
    }

    // إذا كان المسار يبدأ بـ /uploads أو uploads فهو من السيرفر
    if (path.startsWith('/uploads') || path.startsWith('uploads')) {
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        const baseUrl = API_BASE_URL.replace('/api', '');
        return `${baseUrl}${cleanPath}`;
    }

    // غير ذلك، نفترض أنه ملف في مجلد public للفرونت إند (مثل /logo.jpg)
    return path;
};

/**
 * الحصول على رابط شعار الاتحاد الافتراضي أو المرفوع
 * @param settingsLogoPath المسار المخزن في الإعدادات
 */
export const getLogoUrl = (settingsLogoPath?: string | null): string => {
    if (settingsLogoPath) {
        return getStorageUrl(settingsLogoPath);
    }
    // الشعار الافتراضي من مجلد public في الفرونت اند
    return '/logo.jpg';
};
