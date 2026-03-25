import { useBranding } from '../../contexts/BrandingContext';

// Default logo SVG with UTF-8 encoding support for Arabic text
const DEFAULT_LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
  <circle cx="100" cy="100" r="90" stroke="currentColor" stroke-width="4" fill="none" opacity="0.3"/>
  <circle cx="100" cy="100" r="70" stroke="currentColor" stroke-width="2" fill="none" opacity="0.2"/>
  <path d="M100 30 L100 170" stroke="currentColor" stroke-width="3" opacity="0.3"/>
  <path d="M30 100 L170 100" stroke="currentColor" stroke-width="3" opacity="0.3"/>
  <text x="100" y="90" text-anchor="middle" font-size="24" font-weight="bold" fill="currentColor" opacity="0.4">اتحاد</text>
  <text x="100" y="120" text-anchor="middle" font-size="20" fill="currentColor" opacity="0.4">الطلاب</text>
  <text x="100" y="145" text-anchor="middle" font-size="18" fill="currentColor" opacity="0.4">اليمنيين</text>
</svg>`;

// Use encodeURIComponent for proper Unicode (Arabic) support
const DEFAULT_LOGO = `data:image/svg+xml,${encodeURIComponent(DEFAULT_LOGO_SVG)}`;

export function BackgroundWatermark() {
    const { settings } = useBranding();

    if (!settings.showWatermark) {
        return null;
    }

    const logoUrl = settings.logoUrl || DEFAULT_LOGO;
    const opacity = settings.watermarkOpacity;

    return (
        <div
            className="background-watermark"
            style={{
                opacity,
            }}
        >
            <div
                className="watermark-image"
                style={{
                    backgroundImage: `url(${logoUrl})`,
                }}
            />
        </div>
    );
}
