import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface SearchResult {
    id: string;
    title: string;
    subtitle?: string;
    type: 'page' | 'user' | 'activity' | 'membership' | 'sponsor';
    icon: string;
    path: string;
}

const STATIC_PAGES: SearchResult[] = [
    { id: 'dashboard', title: 'لوحة التحكم', type: 'page', icon: '🏠', path: '/' },
    { id: 'users', title: 'الأعضاء', subtitle: 'إدارة الأعضاء', type: 'page', icon: '👥', path: '/users' },
    { id: 'users-create', title: 'إضافة عضو جديد', type: 'page', icon: '➕', path: '/users/create' },
    { id: 'memberships', title: 'الاشتراكات', subtitle: 'إدارة الاشتراكات', type: 'page', icon: '💳', path: '/memberships' },
    { id: 'memberships-create', title: 'إضافة اشتراك جديد', type: 'page', icon: '➕', path: '/memberships/create' },
    { id: 'activities', title: 'الأنشطة', subtitle: 'إدارة الأنشطة والفعاليات', type: 'page', icon: '📅', path: '/activities' },
    { id: 'activities-create', title: 'إضافة نشاط جديد', type: 'page', icon: '➕', path: '/activities/create' },
    { id: 'calendar', title: 'التقويم', type: 'page', icon: '📆', path: '/calendar' },
    { id: 'sponsors', title: 'الداعمين', subtitle: 'إدارة الجهات الداعمة', type: 'page', icon: '🤝', path: '/relations/sponsors' },
    { id: 'sponsors-create', title: 'إضافة داعم جديد', type: 'page', icon: '➕', path: '/relations/sponsors/create' },
    { id: 'sponsorships', title: 'الرعايات', subtitle: 'إدارة التبرعات', type: 'page', icon: '💰', path: '/relations/sponsorships' },
    { id: 'finance', title: 'المالية', subtitle: 'الإدارة المالية', type: 'page', icon: '💵', path: '/finance' },
    { id: 'reports', title: 'التقارير', type: 'page', icon: '📊', path: '/reports' },
    { id: 'settings', title: 'الإعدادات', type: 'page', icon: '⚙️', path: '/settings' },
];

interface GlobalSearchProps {
    isOpen: boolean;
    onClose: () => void;
}

export function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    // Focus input when opened
    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
            setQuery('');
            setResults(STATIC_PAGES.slice(0, 6));
            setSelectedIndex(0);
        }
    }, [isOpen]);

    // Search logic
    useEffect(() => {
        if (!query.trim()) {
            setResults(STATIC_PAGES.slice(0, 6));
            return;
        }

        const filtered = STATIC_PAGES.filter(
            item =>
                item.title.includes(query) ||
                item.subtitle?.includes(query) ||
                item.path.includes(query)
        );
        setResults(filtered);
        setSelectedIndex(0);
    }, [query]);

    // Keyboard navigation
    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    setSelectedIndex(i => Math.min(i + 1, results.length - 1));
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setSelectedIndex(i => Math.max(i - 1, 0));
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (results[selectedIndex]) {
                        navigate(results[selectedIndex].path);
                        onClose();
                    }
                    break;
                case 'Escape':
                    onClose();
                    break;
            }
        },
        [results, selectedIndex, navigate, onClose]
    );

    // Handle result click
    const handleResultClick = (result: SearchResult) => {
        navigate(result.path);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="global-search-overlay" onClick={onClose}>
            <div className="global-search-container" onClick={e => e.stopPropagation()}>
                {/* Search Input */}
                <div className="search-input-wrapper">
                    <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.35-4.35" />
                    </svg>
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="ابحث عن صفحة أو إجراء..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="search-input"
                    />
                    <div className="search-shortcut">ESC للإغلاق</div>
                </div>

                {/* Results */}
                <div className="search-results">
                    {results.length === 0 ? (
                        <div className="no-results">
                            <span className="no-results-icon">🔍</span>
                            <p>لا توجد نتائج لـ "{query}"</p>
                        </div>
                    ) : (
                        results.map((result, index) => (
                            <div
                                key={result.id}
                                className={`search-result-item ${index === selectedIndex ? 'selected' : ''}`}
                                onClick={() => handleResultClick(result)}
                                onMouseEnter={() => setSelectedIndex(index)}
                            >
                                <span className="result-icon">{result.icon}</span>
                                <div className="result-content">
                                    <span className="result-title">{result.title}</span>
                                    {result.subtitle && (
                                        <span className="result-subtitle">{result.subtitle}</span>
                                    )}
                                </div>
                                <span className="result-type">
                                    {result.type === 'page' ? 'صفحة' : result.type}
                                </span>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="search-footer">
                    <div className="search-hint">
                        <kbd>↑</kbd><kbd>↓</kbd> للتنقل
                    </div>
                    <div className="search-hint">
                        <kbd>Enter</kbd> للفتح
                    </div>
                </div>
            </div>

            <style>{`
                .global-search-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.5);
                    backdrop-filter: blur(4px);
                    z-index: 9999;
                    display: flex;
                    align-items: flex-start;
                    justify-content: center;
                    padding-top: 15vh;
                    animation: fadeIn 0.15s ease-out;
                }

                .global-search-container {
                    width: 100%;
                    max-width: 600px;
                    background: white;
                    border-radius: 16px;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                    overflow: hidden;
                    animation: slideDown 0.2s ease-out;
                }

                .search-input-wrapper {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 16px 20px;
                    border-bottom: 1px solid #E5E7EB;
                }

                .search-icon {
                    width: 24px;
                    height: 24px;
                    color: #9CA3AF;
                    flex-shrink: 0;
                }

                .search-input {
                    flex: 1;
                    border: none;
                    outline: none;
                    font-size: 1.1rem;
                    background: transparent;
                    color: #111827;
                }

                .search-input::placeholder {
                    color: #9CA3AF;
                }

                .search-shortcut {
                    font-size: 0.75rem;
                    color: #9CA3AF;
                    padding: 4px 8px;
                    background: #F3F4F6;
                    border-radius: 6px;
                }

                .search-results {
                    max-height: 400px;
                    overflow-y: auto;
                    padding: 8px;
                }

                .search-result-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 16px;
                    border-radius: 10px;
                    cursor: pointer;
                    transition: all 0.15s ease;
                }

                .search-result-item:hover,
                .search-result-item.selected {
                    background: #F3F4F6;
                }

                .search-result-item.selected {
                    background: #FEE2E2;
                }

                .result-icon {
                    font-size: 1.5rem;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #F9FAFB;
                    border-radius: 10px;
                }

                .result-content {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }

                .result-title {
                    font-weight: 600;
                    color: #111827;
                }

                .result-subtitle {
                    font-size: 0.85rem;
                    color: #6B7280;
                }

                .result-type {
                    font-size: 0.75rem;
                    color: #9CA3AF;
                    padding: 4px 8px;
                    background: #F9FAFB;
                    border-radius: 4px;
                }

                .no-results {
                    text-align: center;
                    padding: 40px 20px;
                    color: #6B7280;
                }

                .no-results-icon {
                    font-size: 3rem;
                    display: block;
                    margin-bottom: 12px;
                    opacity: 0.5;
                }

                .search-footer {
                    display: flex;
                    gap: 20px;
                    justify-content: center;
                    padding: 12px 20px;
                    border-top: 1px solid #E5E7EB;
                    background: #F9FAFB;
                }

                .search-hint {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 0.8rem;
                    color: #6B7280;
                }

                .search-hint kbd {
                    padding: 2px 6px;
                    background: white;
                    border: 1px solid #D1D5DB;
                    border-radius: 4px;
                    font-size: 0.75rem;
                    font-family: inherit;
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-20px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
            `}</style>
        </div>
    );
}
