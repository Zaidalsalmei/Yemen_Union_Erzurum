import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Post } from '../../types';

interface PostsListProps {
    posts: Post[];
    onViewAll: () => void;
}

export function PostsList({ posts, onViewAll }: PostsListProps) {
    const [filter, setFilter] = useState<'all' | 'announcement' | 'event' | 'financial_alert'>('all');
    const navigate = useNavigate();

    const filteredPosts = filter === 'all'
        ? posts
        : posts.filter(p => p.category === filter);

    const getCategoryLabel = (category: string) => {
        const labels: Record<string, string> = {
            announcement: 'إعلان',
            event: 'فعالية',
            financial_alert: 'تنبيه مالي',
            general: 'عام',
        };
        return labels[category] || category;
    };

    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            announcement: '#3B82F6',
            event: '#8B5CF6',
            financial_alert: '#EF4444',
            general: '#6B7280',
        };
        return colors[category] || '#6B7280';
    };

    return (
        <>
            <div className="posts-section">
                <h2 className="posts-section__title">📰 المنشورات والإعلانات</h2>

                <div className="posts-filters">
                    <button
                        className={`filter-btn ${filter === 'all' ? 'filter-btn--active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        الكل
                    </button>
                    <button
                        className={`filter-btn ${filter === 'announcement' ? 'filter-btn--active' : ''}`}
                        onClick={() => setFilter('announcement')}
                    >
                        إعلانات
                    </button>
                    <button
                        className={`filter-btn ${filter === 'event' ? 'filter-btn--active' : ''}`}
                        onClick={() => setFilter('event')}
                    >
                        فعاليات
                    </button>
                    <button
                        className={`filter-btn ${filter === 'financial_alert' ? 'filter-btn--active' : ''}`}
                        onClick={() => setFilter('financial_alert')}
                    >
                        تنبيهات مالية
                    </button>
                </div>

                <div className="posts-list">
                    {filteredPosts.length === 0 ? (
                        <div className="posts-empty">
                            <div className="posts-empty__icon">📭</div>
                            <div className="posts-empty__text">لا توجد منشورات</div>
                        </div>
                    ) : (
                        filteredPosts.slice(0, 5).map((post) => (
                            <article
                                key={post.id}
                                className={`post-item ${!post.is_read ? 'post-item--unread' : ''}`}
                                onClick={() => navigate(`/posts/${post.id}`)}
                            >
                                {!post.is_read && (
                                    <div className="post-item__new-badge">NEW</div>
                                )}

                                <div className="post-item__header">
                                    <h3 className="post-item__title">{post.title}</h3>
                                    <span
                                        className="post-item__category"
                                        style={{
                                            backgroundColor: `${getCategoryColor(post.category)}15`,
                                            color: getCategoryColor(post.category)
                                        }}
                                    >
                                        {getCategoryLabel(post.category)}
                                    </span>
                                </div>

                                <p className="post-item__excerpt">{post.excerpt}</p>

                                <div className="post-item__footer">
                                    <span className="post-item__date">
                                        {new Date(post.created_at).toLocaleDateString('ar-EG')}
                                    </span>
                                    {post.author_name && (
                                        <span className="post-item__author">
                                            ✍️ {post.author_name}
                                        </span>
                                    )}
                                </div>
                            </article>
                        ))
                    )}
                </div>

                <button className="posts-section__view-all" onClick={onViewAll}>
                    عرض كل المنشورات →
                </button>
            </div>

            <style>{`
                .posts-section {
                    background: white;
                    border-radius: 20px;
                    padding: 28px;
                    margin-bottom: 32px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                    border: 1px solid #E0E0E0;
                }

                .posts-section__title {
                    font-size: 20px;
                    font-weight: 700;
                    color: #D60000;
                    margin: 0 0 20px;
                }

                .posts-filters {
                    display: flex;
                    gap: 8px;
                    margin-bottom: 24px;
                    flex-wrap: wrap;
                }

                .filter-btn {
                    padding: 8px 16px;
                    border-radius: 20px;
                    background: white;
                    border: 2px solid #E5E7EB;
                    color: #666;
                    font-weight: 600;
                    font-size: 14px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .filter-btn:hover {
                    border-color: #D60000;
                    color: #D60000;
                }

                .filter-btn--active {
                    background: linear-gradient(135deg, #D60000 0%, #8A0000 100%);
                    color: white;
                    border-color: #D60000;
                }

                .posts-list {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    margin-bottom: 24px;
                }

                .post-item {
                    padding: 20px;
                    border: 1px solid #E5E7EB;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    position: relative;
                    background: white;
                }

                .post-item:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
                    border-color: #D60000;
                }

                .post-item--unread {
                    background: linear-gradient(135deg, #FEF2F2 0%, #FFFFFF 100%);
                    border-color: #FECACA;
                }

                .post-item__new-badge {
                    position: absolute;
                    top: 12px;
                    left: 12px;
                    background: linear-gradient(135deg, #D60000 0%, #8A0000 100%);
                    color: white;
                    padding: 4px 10px;
                    border-radius: 12px;
                    font-size: 11px;
                    font-weight: 800;
                    letter-spacing: 0.5px;
                    box-shadow: 0 2px 8px rgba(214, 0, 0, 0.3);
                    animation: new-badge-pulse 2s infinite;
                }

                @keyframes new-badge-pulse {
                    0%, 100% {
                        box-shadow: 0 2px 8px rgba(214, 0, 0, 0.3);
                    }
                    50% {
                        box-shadow: 0 2px 12px rgba(214, 0, 0, 0.5);
                    }
                }

                .post-item__header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 16px;
                    margin-bottom: 12px;
                }

                .post-item__title {
                    font-size: 18px;
                    font-weight: 700;
                    color: #000;
                    margin: 0;
                    flex: 1;
                }

                .post-item__category {
                    padding: 4px 12px;
                    border-radius: 12px;
                    font-size: 12px;
                    font-weight: 600;
                    flex-shrink: 0;
                }

                .post-item__excerpt {
                    font-size: 14px;
                    color: #666;
                    line-height: 1.6;
                    margin: 0 0 12px;
                }

                .post-item__footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 13px;
                    color: #999;
                }

                .post-item__date {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                .post-item__author {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                .posts-empty {
                    text-align: center;
                    padding: 60px 20px;
                }

                .posts-empty__icon {
                    font-size: 64px;
                    margin-bottom: 16px;
                }

                .posts-empty__text {
                    font-size: 16px;
                    color: #666;
                }

                .posts-section__view-all {
                    width: 100%;
                    padding: 14px;
                    background: white;
                    border: 2px solid #E0E0E0;
                    border-radius: 12px;
                    font-weight: 700;
                    font-size: 15px;
                    color: #D60000;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .posts-section__view-all:hover {
                    background: #FEF2F2;
                    border-color: #D60000;
                    transform: translateY(-2px);
                }

                @media (max-width: 768px) {
                    .post-item__header {
                        flex-direction: column;
                        gap: 8px;
                    }

                    .post-item__category {
                        align-self: flex-start;
                    }
                }
            `}</style>
        </>
    );
}
