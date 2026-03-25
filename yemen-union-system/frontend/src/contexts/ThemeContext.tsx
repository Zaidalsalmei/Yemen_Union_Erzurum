import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
    theme: Theme;
    isDark: boolean;
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
}

interface ThemeProviderProps {
    children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
    const [theme, setTheme] = useState<Theme>(() => {
        const saved = localStorage.getItem('theme') as Theme;
        return saved || 'system';
    });

    const [isDark, setIsDark] = useState(false);

    // Update dark mode based on theme setting
    useEffect(() => {
        const updateDarkMode = () => {
            let dark = false;

            if (theme === 'dark') {
                dark = true;
            } else if (theme === 'system') {
                dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            }

            setIsDark(dark);
            document.documentElement.classList.toggle('dark', dark);
            document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
        };

        updateDarkMode();

        // Listen for system theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            if (theme === 'system') {
                updateDarkMode();
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme]);

    // Save theme preference
    useEffect(() => {
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
    };

    return (
        <ThemeContext.Provider value={{ theme, isDark, setTheme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

// Theme Toggle Button Component
export function ThemeToggle({ className = '' }: { className?: string }) {
    const { isDark, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className={`theme-toggle ${className}`}
            aria-label={isDark ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الليلي'}
            title={isDark ? 'الوضع الفاتح' : 'الوضع الليلي'}
        >
            <div className="toggle-track">
                <div className={`toggle-thumb ${isDark ? 'dark' : ''}`}>
                    {isDark ? (
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                        </svg>
                    ) : (
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
                        </svg>
                    )}
                </div>
            </div>

            <style>{`
                .theme-toggle {
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 4px;
                    border-radius: 50px;
                    transition: all 0.3s ease;
                }

                .theme-toggle:hover {
                    background: var(--hover-bg, rgba(0, 0, 0, 0.05));
                }

                .toggle-track {
                    width: 52px;
                    height: 28px;
                    background: linear-gradient(135deg, #E5E7EB 0%, #D1D5DB 100%);
                    border-radius: 50px;
                    position: relative;
                    transition: all 0.3s ease;
                }

                .dark .toggle-track {
                    background: linear-gradient(135deg, #374151 0%, #1F2937 100%);
                }

                .toggle-thumb {
                    position: absolute;
                    top: 2px;
                    right: 2px;
                    width: 24px;
                    height: 24px;
                    background: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }

                .toggle-thumb.dark {
                    right: auto;
                    left: 2px;
                    background: #1F2937;
                }

                .toggle-thumb svg {
                    width: 14px;
                    height: 14px;
                    color: #F59E0B;
                }

                .toggle-thumb.dark svg {
                    color: #FCD34D;
                }
            `}</style>
        </button>
    );
}
