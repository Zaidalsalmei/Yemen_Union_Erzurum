import { useState } from 'react';
import type { Activity } from '../../types';

interface ActivityGalleryProps {
    images: string[];
    coverImage?: string;
}

export function ActivityGallery({ images, coverImage }: ActivityGalleryProps) {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const allImages = coverImage ? [coverImage, ...images] : images;
    const displayImages = allImages.slice(0, 4);
    const remainingCount = allImages.length - 4;

    if (allImages.length === 0) return null;

    return (
        <>
            <div className="activity-gallery">
                <div className="gallery-grid">
                    {displayImages.map((image, idx) => (
                        <div
                            key={idx}
                            className={`gallery-item ${idx === 3 && remainingCount > 0 ? 'more' : ''}`}
                            onClick={() => setSelectedImage(image)}
                        >
                            <img src={image} alt={`صورة ${idx + 1}`} />
                            {idx === 3 && remainingCount > 0 && (
                                <div className="gallery-more-overlay">
                                    <span className="gallery-more-count">+{remainingCount}</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Lightbox */}
            {selectedImage && (
                <div
                    className="lightbox-overlay"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="lightbox-content" onClick={e => e.stopPropagation()}>
                        <button
                            className="lightbox-close"
                            onClick={() => setSelectedImage(null)}
                        >
                            ✕
                        </button>
                        <img src={selectedImage} alt="صورة مكبرة" />
                        <div className="lightbox-nav">
                            <button
                                onClick={() => {
                                    const currentIdx = allImages.indexOf(selectedImage);
                                    const prevIdx = currentIdx > 0 ? currentIdx - 1 : allImages.length - 1;
                                    setSelectedImage(allImages[prevIdx]);
                                }}
                            >
                                ‹
                            </button>
                            <span>{allImages.indexOf(selectedImage) + 1} / {allImages.length}</span>
                            <button
                                onClick={() => {
                                    const currentIdx = allImages.indexOf(selectedImage);
                                    const nextIdx = currentIdx < allImages.length - 1 ? currentIdx + 1 : 0;
                                    setSelectedImage(allImages[nextIdx]);
                                }}
                            >
                                ›
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
