import React, { useState } from 'react';
import { Heart, Share2, Check, ArrowUp, Lock } from 'lucide-react';
import { WeddingData } from '../types';

interface FooterProps {
  weddingData: WeddingData;
  onOpenAuthModal?: () => void;
  onOpenShareModal?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  weddingData,
  onOpenAuthModal,
  onOpenShareModal,
}) => {
  const [copied, setCopied] = useState(false);

  const cleanGuestUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}`.replace(/\/$/, '')
    : '';

  const handleShare = () => {
    if (onOpenShareModal) {
      onOpenShareModal();
      return;
    }

    if (navigator.share) {
      navigator
        .share({
          title: `Thiệp Cưới Online: ${weddingData.groom.name} & ${weddingData.bride.name}`,
          text: `Trân trọng kính mời bạn đến dự đám cưới của ${weddingData.groom.fullName} & ${weddingData.bride.fullName}!`,
          url: cleanGuestUrl,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(cleanGuestUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-[#281f19] text-[#e8ded2] pt-20 pb-12 overflow-hidden">
      {/* Decorative top curved border */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10 space-y-6">
        {/* Monogram */}
        <div className="space-y-2">
          <p className="text-stone-400 tracking-[0.3em] text-[10px] uppercase">
            THANK YOU FOR CELEBRATING WITH US
          </p>
          <h2 className="font-script text-5xl sm:text-6xl text-[#f7e6d4] leading-tight">
            {weddingData.groom.name} & {weddingData.bride.name}
          </h2>
          <div className="flex items-center justify-center gap-3 my-2">
            <div className="h-[1px] w-12 bg-stone-700" />
            <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
            <div className="h-[1px] w-12 bg-stone-700" />
          </div>
          <p className="text-xs sm:text-sm text-stone-300 font-light max-w-md mx-auto leading-relaxed">
            Sự hiện diện và lời chúc phúc của quý vị chính là món quà ý nghĩa nhất dành cho chúng mình trong ngày khởi đầu hạnh phúc lứa đôi.
          </p>
        </div>

        {/* Date & Location Reminder */}
        <div className="py-4 border-y border-stone-800 text-xs text-stone-400 space-y-1">
          <div>{weddingData.weddingDateFormatted} ({weddingData.lunarDateFormatted})</div>
          <div>{weddingData.events[weddingData.events.length - 1]?.venueName}</div>
        </div>

        {/* Share Card Link & Back to Top */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold tracking-wide transition-all shadow-sm"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Đã sao chép link thiệp!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-[#deb48b]" />
                <span>Chia sẻ link thiệp cưới</span>
              </>
            )}
          </button>

          <button
            onClick={scrollToTop}
            className="p-2.5 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors border border-stone-700"
            title="Lên đầu trang"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>

        {/* Discreet Host trigger in footer for couple */}
        <div className="pt-8 text-[11px] text-stone-500 flex items-center justify-center gap-2">
          <span>Hạnh phúc đong đầy • Yêu thương gắn kết</span>
          {onOpenAuthModal && (
            <button
              onClick={onOpenAuthModal}
              className="opacity-25 hover:opacity-100 p-1 rounded text-stone-400 hover:text-amber-300 transition-all"
              title="Đăng nhập Chủ Tiệc (Dâu & Rể)"
            >
              <Lock className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </footer>
  );
};
