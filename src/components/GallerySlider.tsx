import React, { useState, useEffect, useCallback } from 'react';
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
} from 'lucide-react';
import { GalleryItem } from '../types';

interface GallerySliderProps {
  items: GalleryItem[];
  onOpenEditModal: () => void;
}

export const GallerySlider: React.FC<GallerySliderProps> = ({ items, onOpenEditModal }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'slider' | 'grid'>('slider');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  }, [items.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex !== null) {
        if (e.key === 'ArrowRight') {
          setLightboxIndex((prev) => (prev !== null ? (prev + 1) % items.length : 0));
        } else if (e.key === 'ArrowLeft') {
          setLightboxIndex((prev) =>
            prev !== null ? (prev - 1 + items.length) % items.length : 0
          );
        } else if (e.key === 'Escape') {
          setLightboxIndex(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, items.length]);

  const currentItem = items[currentIndex] || items[0];

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

          {/* Mode Switcher & Add Photo */}
          <div className="mt-6 flex items-center justify-center gap-3">
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
                <span>Xem lưới</span>
              </button>
            </div>

            <button
              onClick={onOpenEditModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#e2d5c5] hover:bg-[#f6eee3] text-[#8e5c33] text-xs font-semibold shadow-sm transition-all"
              title="Tải thêm ảnh vào album cưới"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Thêm ảnh</span>
            </button>
          </div>
        </div>

        {/* If items is empty */}
        {items.length === 0 ? (
          <div className="max-w-md mx-auto p-8 rounded-3xl bg-white border border-[#eee2d3] text-center shadow-sm space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-[#faf4ec] text-[#9c6a40] flex items-center justify-center">
              <Camera className="w-7 h-7" />
            </div>
            <h3 className="font-serif-display text-xl text-stone-800">Chưa có ảnh trong Album</h3>
            <p className="text-xs text-stone-500 font-light">
              Hãy tải lên những bức ảnh cưới đẹp nhất của bạn để chia sẻ khoảnh khắc tuyệt vời này tới khách mời.
            </p>
            <button
              onClick={onOpenEditModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#a06a3e] hover:bg-[#8b5a33] text-white text-xs font-semibold shadow-md transition-all"
            >
              <Camera className="w-4 h-4" />
              <span>Tải Ảnh Lên Album Cưới</span>
            </button>
          </div>
        ) : viewMode === 'slider' ? (
          <div className="relative max-w-4xl mx-auto">
            {/* Main Active Slide Display */}
            <div className="relative h-[380px] sm:h-[520px] md:h-[600px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-stone-900 group">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentItem.id}
                  src={currentItem.url}
                  alt={currentItem.title}
                  referrerPolicy="no-referrer"
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.5 }}
                  className="w-full h-full object-cover select-none cursor-pointer"
                  onClick={() => setLightboxIndex(currentIndex)}
                />
              </AnimatePresence>

              {/* Caption Overlay */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 sm:p-8 text-white flex items-end justify-between pointer-events-none">
                <div className="max-w-lg">
                  <span className="text-[11px] uppercase tracking-widest text-[#dfb58e] font-semibold">
                    {currentIndex + 1} / {items.length}
                  </span>
                  <h3 className="font-serif-display text-xl sm:text-2xl font-medium mt-0.5">
                    {currentItem.title}
                  </h3>
                  {currentItem.caption && (
                    <p className="text-xs sm:text-sm text-stone-300 font-light mt-1">
                      {currentItem.caption}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => setLightboxIndex(currentIndex)}
                  className="pointer-events-auto p-2.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border border-white/30 transition-transform hover:scale-110"
                  title="Xem phóng to toàn màn hình"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>

              {/* Prev / Next Buttons */}
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/70 hover:bg-white text-stone-800 backdrop-blur-md shadow-lg transition-transform hover:scale-110 opacity-80 group-hover:opacity-100"
                aria-label="Ảnh trước"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/70 hover:bg-white text-stone-800 backdrop-blur-md shadow-lg transition-transform hover:scale-110 opacity-80 group-hover:opacity-100"
                aria-label="Ảnh kế tiếp"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Thumbnail Strip */}
            <div className="mt-4 flex items-center justify-center gap-2 overflow-x-auto py-2 px-1">
              {items.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`relative shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden transition-all duration-300 ${
                    idx === currentIndex
                      ? 'ring-3 ring-[#a06a3e] scale-105 shadow-md'
                      : 'opacity-55 hover:opacity-100'
                  }`}
                >
                  <img
                    src={item.url}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* View Mode: MASONRY / GRID */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {items.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                onClick={() => setLightboxIndex(idx)}
                className="group relative h-72 rounded-2xl overflow-hidden shadow-md cursor-pointer bg-stone-100"
              >
                <img
                  src={item.url}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end text-white">
                  <h4 className="font-serif-display text-base font-semibold">{item.title}</h4>
                  {item.caption && <p className="text-xs text-stone-300 mt-0.5">{item.caption}</p>}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Lightbox Modal */}
      <AnimatePresence>
        {lightboxIndex !== null && (
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
            >
              <X className="w-6 h-6" />
            </button>

            {/* Prev Image */}
            <button
              onClick={() =>
                setLightboxIndex((prev) => (prev !== null ? (prev - 1 + items.length) % items.length : 0))
              }
              className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Next Image */}
            <button
              onClick={() =>
                setLightboxIndex((prev) => (prev !== null ? (prev + 1) % items.length : 0))
              }
              className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Main Lightbox Content */}
            <div className="max-w-5xl max-h-[85vh] flex flex-col items-center">
              <img
                src={items[lightboxIndex]?.url}
                alt={items[lightboxIndex]?.title}
                referrerPolicy="no-referrer"
                className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl"
              />
              <div className="mt-4 text-center text-white">
                <h4 className="font-serif-display text-lg font-medium">
                  {items[lightboxIndex]?.title}
                </h4>
                {items[lightboxIndex]?.caption && (
                  <p className="text-xs text-stone-300 font-light mt-1">
                    {items[lightboxIndex]?.caption}
                  </p>
                )}
                <span className="text-[11px] text-[#e0b790] block mt-1">
                  {lightboxIndex + 1} / {items.length}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
