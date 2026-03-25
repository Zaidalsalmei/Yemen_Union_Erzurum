import { useState } from 'react';
import type { ActivityStatus, ActivityType, ActivityCategory } from '../../types';

export interface ActivityFiltersState {
    status: ActivityStatus | 'all';
    type: ActivityType | 'all';
    category: number | 'all';
    dateRange: 'all' | 'today' | 'this_week' | 'this_month' | 'upcoming' | 'past';
    priceRange: 'all' | 'free' | 'paid';
    seatsAvailable: 'all' | 'available' | 'full';
    search: string;
    sortBy: 'date_asc' | 'date_desc' | 'title' | 'popularity' | 'rating';
}

interface ActivityFiltersProps {
    filters: ActivityFiltersState;
    onFilterChange: (filters: ActivityFiltersState) => void;
    categories?: ActivityCategory[];
    totalResults?: number;
}

const STATUS_OPTIONS = [
    { value: 'all', label: 'الكل', icon: '📋' },
    { value: 'draft', label: 'مسودة', icon: '📝' },
    { value: 'published', label: 'منشور', icon: '✅' },
    { value: 'registration_open', label: 'التسجيل مفتوح', icon: '📖' },
    { value: 'registration_closed', label: 'التسجيل مغلق', icon: '🔒' },
    { value: 'in_progress', label: 'جاري', icon: '▶️' },
    { value: 'completed', label: 'مكتمل', icon: '🏆' },
    { value: 'cancelled', label: 'ملغي', icon: '❌' },
];

const TYPE_OPTIONS = [
    { value: 'all', label: 'جميع الأنواع', icon: '🎯' },
    { value: 'workshop', label: 'ورشة عمل', icon: '🛠️' },
    { value: 'seminar', label: 'ندوة', icon: '🎤' },
    { value: 'trip', label: 'رحلة', icon: '🚌' },
    { value: 'meeting', label: 'اجتماع', icon: '👥' },
    { value: 'social', label: 'اجتماعي', icon: '🎉' },
    { value: 'sports', label: 'رياضي', icon: '⚽' },
    { value: 'cultural', label: 'ثقافي', icon: '📚' },
    { value: 'other', label: 'أخرى', icon: '📌' },
];

const DATE_OPTIONS = [
    { value: 'all', label: 'جميع التواريخ' },
    { value: 'today', label: 'اليوم' },
    { value: 'this_week', label: 'هذا الأسبوع' },
    { value: 'this_month', label: 'هذا الشهر' },
    { value: 'upcoming', label: 'قادمة' },
    { value: 'past', label: 'سابقة' },
];

const SORT_OPTIONS = [
    { value: 'date_desc', label: 'الأحدث أولاً' },
    { value: 'date_asc', label: 'الأقدم أولاً' },
    { value: 'title', label: 'الاسم (أ-ي)' },
    { value: 'popularity', label: 'الأكثر شعبية' },
    { value: 'rating', label: 'الأعلى تقييماً' },
];

export function ActivityFilters({
    filters,
    onFilterChange,
    categories = [],
    totalResults
}: ActivityFiltersProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const updateFilter = <K extends keyof ActivityFiltersState>(
        key: K,
        value: ActivityFiltersState[K]
    ) => {
        onFilterChange({ ...filters, [key]: value });
    };

    const resetFilters = () => {
        onFilterChange({
            status: 'all',
            type: 'all',
            category: 'all',
            dateRange: 'all',
            priceRange: 'all',
            seatsAvailable: 'all',
            search: '',
            sortBy: 'date_desc',
        });
    };

    const hasActiveFilters =
        filters.status !== 'all' ||
        filters.type !== 'all' ||
        filters.category !== 'all' ||
        filters.dateRange !== 'all' ||
        filters.priceRange !== 'all' ||
        filters.seatsAvailable !== 'all' ||
        filters.search !== '';

    return (
        <div className="activity-filters">
            {/* Search Bar */}
            <div className="filters-search-row">
                <div className="search-input-wrapper">
                    <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="ابحث عن نشاط..."
                        value={filters.search}
                        onChange={(e) => updateFilter('search', e.target.value)}
                        className="filters-search-input"
                    />
                    {filters.search && (
                        <button
                            className="search-clear-btn"
                            onClick={() => updateFilter('search', '')}
                        >
                            ✕
                        </button>
                    )}
                </div>

                <div className="filters-actions">
                    <button
                        className={`filter-toggle-btn ${isExpanded ? 'active' : ''}`}
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        الفلاتر
                        {hasActiveFilters && <span className="filter-badge">!</span>}
                    </button>

                    <select
                        value={filters.sortBy}
                        onChange={(e) => updateFilter('sortBy', e.target.value as typeof filters.sortBy)}
                        className="sort-select"
                    >
                        {SORT_OPTIONS.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Quick Status Filters */}
            <div className="quick-filters">
                {STATUS_OPTIONS.slice(0, 5).map(option => (
                    <button
                        key={option.value}
                        className={`quick-filter-btn ${filters.status === option.value ? 'active' : ''}`}
                        onClick={() => updateFilter('status', option.value as typeof filters.status)}
                    >
                        <span>{option.icon}</span>
                        {option.label}
                    </button>
                ))}
            </div>

            {/* Expanded Filters */}
            {isExpanded && (
                <div className="expanded-filters animate-fadeIn">
                    <div className="filters-grid">
                        {/* Status */}
                        <div className="filter-group">
                            <label className="filter-label">الحالة</label>
                            <select
                                value={filters.status}
                                onChange={(e) => updateFilter('status', e.target.value as typeof filters.status)}
                                className="filter-select"
                            >
                                {STATUS_OPTIONS.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.icon} {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Type */}
                        <div className="filter-group">
                            <label className="filter-label">النوع</label>
                            <select
                                value={filters.type}
                                onChange={(e) => updateFilter('type', e.target.value as typeof filters.type)}
                                className="filter-select"
                            >
                                {TYPE_OPTIONS.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.icon} {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Category */}
                        {categories.length > 0 && (
                            <div className="filter-group">
                                <label className="filter-label">التصنيف</label>
                                <select
                                    value={filters.category}
                                    onChange={(e) => updateFilter('category', e.target.value === 'all' ? 'all' : Number(e.target.value))}
                                    className="filter-select"
                                >
                                    <option value="all">جميع التصنيفات</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.icon} {cat.name_ar}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Date Range */}
                        <div className="filter-group">
                            <label className="filter-label">الفترة الزمنية</label>
                            <select
                                value={filters.dateRange}
                                onChange={(e) => updateFilter('dateRange', e.target.value as typeof filters.dateRange)}
                                className="filter-select"
                            >
                                {DATE_OPTIONS.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Price */}
                        <div className="filter-group">
                            <label className="filter-label">السعر</label>
                            <div className="filter-radio-group">
                                {[
                                    { value: 'all', label: 'الكل' },
                                    { value: 'free', label: 'مجاني' },
                                    { value: 'paid', label: 'مدفوع' },
                                ].map(option => (
                                    <label key={option.value} className="filter-radio">
                                        <input
                                            type="radio"
                                            name="priceRange"
                                            value={option.value}
                                            checked={filters.priceRange === option.value}
                                            onChange={(e) => updateFilter('priceRange', e.target.value as typeof filters.priceRange)}
                                        />
                                        <span>{option.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Seats */}
                        <div className="filter-group">
                            <label className="filter-label">المقاعد</label>
                            <div className="filter-radio-group">
                                {[
                                    { value: 'all', label: 'الكل' },
                                    { value: 'available', label: 'متاح' },
                                    { value: 'full', label: 'ممتلئ' },
                                ].map(option => (
                                    <label key={option.value} className="filter-radio">
                                        <input
                                            type="radio"
                                            name="seatsAvailable"
                                            value={option.value}
                                            checked={filters.seatsAvailable === option.value}
                                            onChange={(e) => updateFilter('seatsAvailable', e.target.value as typeof filters.seatsAvailable)}
                                        />
                                        <span>{option.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Filter Actions */}
                    <div className="filter-footer">
                        {totalResults !== undefined && (
                            <span className="results-count">
                                {totalResults} نتيجة
                            </span>
                        )}
                        {hasActiveFilters && (
                            <button className="reset-filters-btn" onClick={resetFilters}>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                إعادة ضبط
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
