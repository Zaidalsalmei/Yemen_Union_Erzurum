import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import api from '../services/api';

// ============================================
// TYPES
// ============================================
interface BrandingSettings {
    logoUrl: string | null;
    unionName: string;
    showWatermark: boolean;
    watermarkOpacity: number;
    primaryColor: string;
    accentColor: string;
    sidebarColor: string;
    sidebarTextColor: string;
}

interface BrandingContextType {
    settings: BrandingSettings;
    updateLogo: (file: File) => Promise<void>;
    removeLogo: () => Promise<void>;
    toggleWatermark: () => void;
    setWatermarkOpacity: (opacity: number) => void;
    updateThemeColors: (colors: Partial<BrandingSettings>) => void;
    saveBranding: () => Promise<void>;
    isUploading: boolean;
    isSaving: boolean;
    isLoading: boolean;
}

// ============================================
// DEFAULT VALUES
// ============================================
const DEFAULT_SETTINGS: BrandingSettings = {
    logoUrl: null,
    unionName: 'اتحاد الطلاب اليمنيين',
    showWatermark: true,
    watermarkOpacity: 0.05,
    primaryColor: '#DC2626',
    accentColor: '#F59E0B',
    sidebarColor: '#1F2937',
    sidebarTextColor: '#FFFFFF',
};

const STORAGE_KEY = 'branding_settings';

// ============================================
// CONTEXT
// ============================================
const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

export function useBranding() {
    const context = useContext(BrandingContext);
    if (!context) {
        throw new Error('useBranding must be used within BrandingProvider');
    }
    return context;
}

// ============================================
// PROVIDER
// ============================================
interface BrandingProviderProps {
    children: ReactNode;
}

export function BrandingProvider({ children }: BrandingProviderProps) {
    const [settings, setSettings] = useState<BrandingSettings>(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
            } catch {
                return DEFAULT_SETTINGS;
            }
        }
        return DEFAULT_SETTINGS;
    });

    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // ✅ FIX: Prevent multiple API calls
    const hasFetched = useRef(false);

    // Apply CSS variables for theme colors
    useEffect(() => {
        const root = document.documentElement;
        root.style.setProperty('--primary-color', settings.primaryColor);
        root.style.setProperty('--accent-color', settings.accentColor);
        root.style.setProperty('--sidebar-color', settings.sidebarColor);
        root.style.setProperty('--sidebar-text-color', settings.sidebarTextColor);
    }, [settings.primaryColor, settings.accentColor, settings.sidebarColor, settings.sidebarTextColor]);

    // ✅ FIX: Load settings from API ONLY ONCE
    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;

        const loadSettings = async () => {
            try {
                const response = await api.get('/settings/branding');
                if (response.data?.data) {
                    const apiSettings = response.data.data;
                    setSettings(prev => ({
                        ...prev,
                        logoUrl: apiSettings.logo_path || prev.logoUrl,
                        unionName: apiSettings.union_name_ar || prev.unionName,
                        showWatermark: apiSettings.watermark_enabled ?? prev.showWatermark,
                        watermarkOpacity: parseFloat(apiSettings.watermark_opacity) || prev.watermarkOpacity,
                        primaryColor: apiSettings.primary_color || prev.primaryColor,
                        accentColor: apiSettings.accent_color || prev.accentColor,
                        sidebarColor: apiSettings.sidebar_color || prev.sidebarColor,
                        sidebarTextColor: apiSettings.sidebar_text_color || prev.sidebarTextColor,
                    }));
                }
            } catch {
                // ✅ FIX: Silently use local/default settings — NO retry!
                console.log('Using local branding settings');
            } finally {
                setIsLoading(false);
            }
        };

        loadSettings();
    }, []); // ✅ Empty array = run once only

    // Save to localStorage when settings change
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }, [settings]);

    const updateLogo = async (file: File): Promise<void> => {
        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('logo', file);
            try {
                const response = await api.post('/settings/branding/logo', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                if (response.data?.data?.logo_path) {
                    setSettings(prev => ({ ...prev, logoUrl: response.data.data.logo_path }));
                    return;
                }
            } catch {
                // Fall back to base64
            }
            const reader = new FileReader();
            const base64Url = await new Promise<string>((resolve, reject) => {
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
            setSettings(prev => ({ ...prev, logoUrl: base64Url }));
        } finally {
            setIsUploading(false);
        }
    };

    const removeLogo = async () => {
        try {
            await api.delete('/settings/branding/logo');
        } catch { /* Continue */ }
        setSettings(prev => ({ ...prev, logoUrl: null }));
    };

    const toggleWatermark = () => {
        setSettings(prev => ({ ...prev, showWatermark: !prev.showWatermark }));
    };

    const setWatermarkOpacity = (opacity: number) => {
        setSettings(prev => ({
            ...prev,
            watermarkOpacity: Math.max(0.02, Math.min(0.15, opacity)),
        }));
    };

    const updateThemeColors = useCallback((colors: Partial<BrandingSettings>) => {
        setSettings(prev => ({ ...prev, ...colors }));
    }, []);

    const saveBranding = async () => {
        setIsSaving(true);
        try {
            await api.put('/settings/branding', {
                union_name_ar: settings.unionName,
                watermark_enabled: settings.showWatermark,
                watermark_opacity: settings.watermarkOpacity.toString(),
                primary_color: settings.primaryColor,
                accent_color: settings.accentColor,
                sidebar_color: settings.sidebarColor,
                sidebar_text_color: settings.sidebarTextColor,
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <BrandingContext.Provider value={{
            settings, updateLogo, removeLogo, toggleWatermark,
            setWatermarkOpacity, updateThemeColors, saveBranding,
            isUploading, isSaving, isLoading,
        }}>
            {children}
        </BrandingContext.Provider>
    );
}