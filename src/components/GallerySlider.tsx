import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  LayoutGrid,
  SlidersHorizontal,
  Sparkles,
  Camera,
  Loader2,
  Image as ImageIcon,
} from 'lucide-react';
import { GalleryItem } from '../types';

interface GallerySliderProps {
  items: GalleryItem[];
  onOpenEditModal?: () => void;
}

const INITIAL_GRID_DISPLAY_COUNT = 12;

export const GallerySlider: React.FC<GallerySliderProps> = ({ items, onOpenEditModal }) => {
  // Filter out any items with missing or invalid URLs
  const safeItems = useMemo(
    () =>
      (items || []).filter(
        (item) => item && typeof item.url === 'string' && item.url.trim().length > 0
      ),
    [items]
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'slider' | 'grid'>('slider');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isSlideLoaded, setIsSlideLoaded] = useState(false);
  const [gridDisplayCount, setGridDisplayCount] = useState(INITIAL_GRID_DISPLAY_COUNT);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});

  const thumbnailStripRef = useRef<HTMLDivElement>(null);

  // Keep currentIndex in bounds if safeItems change
  useEffect(() => {
    if (safeItems.length > 0 && currentIndex >= safeItems.length) {
      setCurrentIndex(0);
    }
  }, [safeItems.length, currentIndex]);

  // Reset slide loaded state when active slide changes
  useEffect(() => {
    setIsSlideLoaded(false);
  }, [currentIndex]);

  // Auto-scroll thumbnail strip so active thumbnail is centered
  useEffect(() => {
    if (thumbnailStripRef.current) {
      const activeThumb = thumbnailStripRef.current.querySelector<HTMLButtonElement>(
        `[data-thumb-index="${currentIndex}"]`
      );
      if (activeThumb) {
        activeThumb.scrollIntoView({
          behavior: 'smooth',
          inline: 'center',
          block: 'nearest',
        });
      }
    }
  }, [currentIndex]);

  const nextSlide = useCallback(() => {
    if (safeItems.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % safeItems.length);
  }, [safeItems.length]);

  const prevSlide = useCallback(() => {
    if (safeItems.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + safeItems.length) % safeItems.length);
  }, [safeItems.length]);

  // Preload adjacent slides in the background so next/prev clicks are instantaneous
  useEffect(() => {
    if (safeItems.length <= 1) return;
    const nextIdx = (currentIndex + 1) % safeItems.length;
    const prevIdx = (currentIndex - 1 + safeItems.length) % safeItems.length;

    const preloadUrls = [safeItems[nextIdx]?.url, safeItems[prevIdx]?.url].filter(Boolean);
    preloadUrls.forEach((url) => {
      if (url && !url.startsWith('data:')) {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.as = 'image';
        link.href = url;
        document.head.appendChild(link);
        setTimeout(() => link.remove(), 10000);
      }
    });
  }, [currentIndex, safeItems]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex !== null && safeItems.length > 0) {
        if (e.key === 'ArrowRight') {
          setLightboxIndex((prev) => (prev !== null ? (prev + 1) % safeItems.length : 0));
        } else if (e.key === 'ArrowLeft') {
          setLightboxIndex((prev) =>
            prev !== null ? (prev - 1 + safeItems.length) % safeItems.length : 0
          );
        } else if (e.key === 'Escape') {
          setLightboxIndex(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, safeItems.length]);

  const activeIndex = safeItems.length > 0 ? Math.min(currentIndex, safeItems.length - 1) : 0;
  const currentItem = safeItems[activeIndex];

  // Grid view items (respecting load more limit for smooth scrolling with large albums)
  const visibleGridItems = useMemo(
    () => safeItems.slice(0, gridDisplayCount),
    [safeItems, gridDisplayCount]
  );

  const handleImageLoaded = (id: string) => {
    setLoadedImages((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <section id="gallery" className="py-24 bg-[#faf7f2] relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#a06a3e] font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>KHOẢNH KHẮC NGỌT NGÀO</span>
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <h2 className="font-serif-display text-3xl sm:text-5xl text-[#2f241d] font-normal mb-4">
            Album Ảnh Cưới
          </h2>
          <p className="text-stone-500 text-sm font-light leading-relaxed">
            Mỗi bức hình là một mảnh ghép lưu giữ trọn vẹn những cảm xúc chân thành và đắm say nhất của chúng mình.
          </p>

          {/* Mode Switcher & Management Button */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <div className="bg-[#eee3d5] p-1 rounded-2xl flex items-center gap-1 shadow-inner">
              <button
                onClick={() => setViewMode('slider')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  viewMode === 'slider'
                    ? 'bg-white text-[#915e34] shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Slide trượt</span>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white text-[#915e34] shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Xem lưới ({safeItems.length})</span>
              </button>
            </div>

            {onOpenEditModal && (
              <button
                onClick={onOpenEditModal}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#a06a3e] hover:bg-[#88572f] text-white text-xs font-semibold shadow-sm transition-all"
                title="Tải ảnh cưới của bạn lên hoặc xóa ảnh mẫu"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Quản lý & Tải album ảnh</span>
              </button>
            )}
          </div>
        </div>

        {/* If album is empty */}
        {safeItems.length === 0 ? (
          <div className="max-w-md mx-auto p-8 rounded-3xl bg-white border border-[#eee2d3] text-center shadow-sm space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-[#faf4ec] text-[#9c6a40] flex items-center justify-center">
              <Camera className="w-7 h-7" />
            </div>
            <h3 className="font-serif-display text-xl text-stone-800">Chưa có ảnh trong Album</h3>
            <p className="text-xs text-stone-500 font-light">
              Hãy tải lên những bức ảnh cưới đẹp nhất của bạn để chia sẻ khoảnh khắc tuyệt vời này tới khách mời.
            </p>
            {onOpenEditModal && (
              <button
                onClick={onOpenEditModal}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#a06a3e] hover:bg-[#8b5a33] text-white text-xs font-semibold shadow-md transition-all"
              >
                <Camera className="w-4 h-4" />
                <span>Tải Ảnh Lên Album Cưới</span>
              </button>
            )}
          </div>
        ) : viewMode === 'slider' && currentItem ? (
          /* SLIDER MODE */
          <div className="relative max-w-4xl mx-auto">
            {/* Main Active Slide Display */}
            <div className="relative h-[380px] sm:h-[520px] md:h-[600px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-stone-900 group">
              <img
                key={`slide-${currentItem.id || activeIndex}`}
                src={currentItem.url}
                alt={currentItem.title || 'Ảnh cưới'}
                loading="eager"
                decoding="async"
                className="w-full h-full object-cover select-none cursor-pointer transition-transform duration-500 hover:scale-[1.02]"
                onClick={() => setLightboxIndex(activeIndex)}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=85';
                }}
              />

              {/* Caption Overlay */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-6 sm:p-8 text-white flex items-end justify-between pointer-events-none">
                <div className="max-w-lg">
                  <span className="text-[11px] uppercase tracking-widest text-[#dfb58e] font-semibold">
                    {activeIndex + 1} / {safeItems.length}
                  </span>
                  <h3 className="font-serif-display text-xl sm:text-2xl font-medium mt-0.5">
                    {currentItem.title || 'Khoảnh khắc hạnh phúc'}
                  </h3>
                  {currentItem.caption && (
                    <p className="text-xs sm:text-sm text-stone-300 font-light mt-1">
                      {currentItem.caption}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => setLightboxIndex(activeIndex)}
                  className="pointer-events-auto p-2.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border border-white/30 transition-transform hover:scale-110 shadow-md"
                  title="Xem phóng to toàn màn hình"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>

              {/* Prev / Next Buttons */}
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/75 hover:bg-white text-stone-800 backdrop-blur-md shadow-lg transition-transform hover:scale-110 opacity-80 group-hover:opacity-100"
                aria-label="Ảnh trước"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/75 hover:bg-white text-stone-800 backdrop-blur-md shadow-lg transition-transform hover:scale-110 opacity-80 group-hover:opacity-100"
                aria-label="Ảnh kế tiếp"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Thumbnail Strip with Native Lazy Loading & Horizontal Scroll */}
            <div
              ref={thumbnailStripRef}
              className="mt-4 flex items-center justify-start sm:justify-center gap-2 overflow-x-auto py-2 px-1 scrollbar-thin scrollbar-thumb-stone-300"
            >
              {safeItems.map((item, idx) => (
                <button
                  key={item.id || idx}
                  data-thumb-index={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`relative shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden transition-all duration-300 ${
                    idx === activeIndex
                      ? 'ring-3 ring-[#a06a3e] scale-105 shadow-md'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                  title={item.title || `Ảnh #${idx + 1}`}
                >
                  <img
                    src={item.url}
                    alt={item.title || `Thumbnail ${idx + 1}`}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=400&q=70';
                    }}
                  />
                  <span className="absolute bottom-1 right-1 px-1 rounded bg-black/60 text-[9px] text-white font-mono">
                    {idx + 1}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* GRID VIEW WITH LAZY LOADING, SKELETONS, & LOAD MORE */
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {visibleGridItems.map((item, idx) => {
                const itemId = item.id || `grid-${idx}`;
                const isLoaded = loadedImages[itemId];

                return (
                  <motion.div
                    key={itemId}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.35, delay: Math.min(idx * 0.04, 0.3) }}
                    onClick={() => setLightboxIndex(idx)}
                    className="group relative h-72 rounded-2xl overflow-hidden shadow-md cursor-pointer bg-stone-100"
                  >
                    <img
                      src={item.url}
                      alt={item.title || 'Ảnh cưới'}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-108 transition-all duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80';
                      }}
                    />

                    {/* Gradient title overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end text-white">
                      <span className="text-[10px] uppercase tracking-wider text-[#dfb58e] font-semibold">
                        Ảnh #{idx + 1}
                      </span>
                      <h4 className="font-serif-display text-base font-semibold">{item.title}</h4>
                      {item.caption && <p className="text-xs text-stone-300 mt-0.5">{item.caption}</p>}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Load More Button for Large Albums (e.g. > 12 photos) */}
            {gridDisplayCount < safeItems.length && (
              <div className="text-center pt-4">
                <button
                  onClick={() =>
                    setGridDisplayCount((prev) => Math.min(prev + 12, safeItems.length))
                  }
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white hover:bg-stone-50 border border-[#dfd0c0] text-[#8c5930] text-xs font-semibold shadow-sm transition-all hover:shadow"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    Xem thêm {safeItems.length - gridDisplayCount} ảnh khác trong album ({gridDisplayCount}/{safeItems.length})
                  </span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Fullscreen Lightbox Modal */}
      <AnimatePresence>
        {lightboxIndex !== null && safeItems[lightboxIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
          >
            {/* Close Lightbox */}
            <button
              onClick={() => setLightboxIndex(null)}
              className="absolute top-6 right-6 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Đóng xem phóng to"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Prev Image */}
            <button
              onClick={() =>
                setLightboxIndex((prev) =>
                  prev !== null ? (prev - 1 + safeItems.length) % safeItems.length : 0
                )
              }
              className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors"
              title="Ảnh trước"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Next Image */}
            <button
              onClick={() =>
                setLightboxIndex((prev) => (prev !== null ? (prev + 1) % safeItems.length : 0))
              }
              className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors"
              title="Ảnh sau"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Main Lightbox Content */}
            <div className="max-w-5xl max-h-[85vh] flex flex-col items-center">
              <img
                src={safeItems[lightboxIndex]?.url}
                alt={safeItems[lightboxIndex]?.title}
                loading="eager"
                decoding="async"
                className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl"
              />
              <div className="mt-4 text-center text-white">
                <h4 className="font-serif-display text-lg font-medium">
                  {safeItems[lightboxIndex]?.title}
                </h4>
                {safeItems[lightboxIndex]?.caption && (
                  <p className="text-xs text-stone-300 font-light mt-1">
                    {safeItems[lightboxIndex]?.caption}
                  </p>
                )}
                <span className="text-[11px] text-[#e0b790] block mt-1">
                  {lightboxIndex + 1} / {safeItems.length}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
