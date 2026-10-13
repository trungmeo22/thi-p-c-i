import React from 'react';
import { motion } from 'motion/react';
import { Calendar, Heart, MapPin, ChevronDown, Sparkles } from 'lucide-react';
import { WeddingData } from '../types';

interface HeroSectionProps {
  weddingData: WeddingData;
  onOpenEditModal?: () => void;
  guestName?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  weddingData,
  onOpenEditModal,
  guestName,
}) => {
  return (
    <section
      id="top"
      className="relative min-h-screen flex items-center justify-center text-center overflow-hidden"
    >
      {/* Background Image with smooth zoom motion and warm romantic overlay */}
      <motion.div
        initial={{ scale: 1.08 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.8, ease: 'easeOut' }}
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${weddingData.coverImage})`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-black/35 backdrop-blur-[0.5px]" />
      </motion.div>

      {/* Decorative Golden Corner Frames */}
      <div className="absolute top-16 left-6 w-20 h-20 border-t-2 border-l-2 border-[#e8cbb0]/60 pointer-events-none hidden sm:block"></div>
      <div className="absolute top-16 right-6 w-20 h-20 border-t-2 border-r-2 border-[#e8cbb0]/60 pointer-events-none hidden sm:block"></div>
      <div className="absolute bottom-16 left-6 w-20 h-20 border-b-2 border-l-2 border-[#e8cbb0]/60 pointer-events-none hidden sm:block"></div>
      <div className="absolute bottom-16 right-6 w-20 h-20 border-b-2 border-r-2 border-[#e8cbb0]/60 pointer-events-none hidden sm:block"></div>

      {/* Main Hero Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-24 flex flex-col items-center text-white">
        {/* Personalized Guest Badge (If link was sent with ?to=Name or ?guest=Name) */}
        {guestName && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="mb-4 inline-flex items-center gap-2.5 px-5 py-2 rounded-2xl bg-gradient-to-r from-stone-900/80 via-amber-950/80 to-stone-900/80 backdrop-blur-md border border-amber-300/40 text-[#fbf5eb] shadow-xl"
          >
            <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
            <span className="text-xs sm:text-sm font-medium tracking-wide">
              Trân trọng kính mời:{' '}
              <span className="font-bold text-amber-200 underline decoration-amber-400/60 decoration-1 underline-offset-4">
                {guestName}
              </span>
            </span>
          </motion.div>
        )}

        {/* Tagline / Invitation banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-[#f5e1cb] text-xs sm:text-sm font-medium tracking-[0.25em] uppercase mb-4"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>{weddingData.heroTagline}</span>
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
        </motion.div>

        {/* Wedding Title / Monogram */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.35 }}
          className="text-stone-300 tracking-[0.3em] text-xs uppercase mb-2"
        >
          LỄ THÀNH HÔN & VU QUY
        </motion.p>

        {/* Groom & Bride Names */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.4 }}
          className="my-3 sm:my-5"
        >
          <h1 className="font-script text-5xl sm:text-7xl md:text-8xl lg:text-9xl text-[#fbf6f0] leading-tight drop-shadow-md">
            {weddingData.groom.name}
          </h1>
          <div className="flex items-center justify-center gap-4 my-1 sm:my-2">
            <div className="h-[1px] w-12 sm:w-20 bg-gradient-to-r from-transparent via-[#f5d5b5] to-transparent" />
            <div className="p-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-rose-300">
              <Heart className="w-4 h-4 sm:w-5 sm:h-5 fill-rose-400" />
            </div>
            <div className="h-[1px] w-12 sm:w-20 bg-gradient-to-r from-transparent via-[#f5d5b5] to-transparent" />
          </div>
          <h1 className="font-script text-5xl sm:text-7xl md:text-8xl lg:text-9xl text-[#fbf6f0] leading-tight drop-shadow-md">
            {weddingData.bride.name}
          </h1>
        </motion.div>

        {/* Wedding Date & Venue Tag */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-3 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 text-stone-200 text-sm sm:text-base font-light"
        >
          <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full border border-white/15">
            <Calendar className="w-4 h-4 text-[#e0b790]" />
            <span className="font-serif-display font-medium tracking-wide">
              {weddingData.weddingDateFormatted}
            </span>
          </div>
          <div className="text-xs sm:text-sm text-stone-300 italic">
            ({weddingData.lunarDateFormatted})
          </div>
        </motion.div>

        {/* Romantic quote */}
        <motion.blockquote
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.75 }}
          className="mt-6 max-w-xl mx-auto text-xs sm:text-sm italic font-cormorant text-stone-300 leading-relaxed"
        >
          “{weddingData.heroQuote}”
        </motion.blockquote>

        {/* Action Call to Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4"
        >
          <a
            href="#rsvp"
            className="px-6 py-3 rounded-full bg-gradient-to-r from-[#b37f52] to-[#c99a6f] hover:from-[#a06d42] hover:to-[#b6875d] text-white font-medium text-xs sm:text-sm uppercase tracking-wider shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
          >
            Xác Nhận Tham Dự
          </a>
          <a
            href="#wishes"
            className="px-6 py-3 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white font-medium text-xs sm:text-sm uppercase tracking-wider shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
          >
            Gửi Lời Chúc Mừng
          </a>
          <a
            href="#wedding-box"
            className="px-5 py-3 rounded-full bg-stone-900/60 hover:bg-stone-900/80 backdrop-blur-md border border-amber-300/40 text-[#f7dfc6] font-medium text-xs sm:text-sm uppercase tracking-wider transition-all"
          >
            Mừng Cưới
          </a>
        </motion.div>
      </div>

      {/* Down indicator */}
      <a
        href="#couple"
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 text-white/70 hover:text-white flex flex-col items-center gap-1 transition-colors animate-bounce"
        aria-label="Cuộn xuống xem thiệp"
      >
        <span className="text-[10px] uppercase tracking-widest font-light">Cuộn xuống</span>
        <ChevronDown className="w-5 h-5" />
      </a>
    </section>
  );
};
