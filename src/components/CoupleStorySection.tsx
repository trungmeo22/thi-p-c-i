import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Camera } from 'lucide-react';
import { WeddingData } from '../types';

interface CoupleStorySectionProps {
  weddingData: WeddingData;
  onOpenEditModal?: () => void;
}

export const CoupleStorySection: React.FC<CoupleStorySectionProps> = ({
  weddingData,
  onOpenEditModal,
}) => {
  return (
    <section id="couple" className="py-24 bg-[#faf7f2] relative overflow-hidden">
      {/* Decorative floral circles */}
      <div className="absolute top-12 left-0 w-48 h-48 bg-rose-100/40 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-12 right-0 w-48 h-48 bg-amber-100/40 rounded-full blur-2xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#a37248] font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>CẶP ĐÔI NHÂN DUYÊN</span>
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <h2 className="font-serif-display text-3xl sm:text-5xl text-[#2e231c] font-normal mb-4">
            Chú Rể & Cô Dâu
          </h2>
          <p className="text-stone-500 text-sm font-light leading-relaxed">
            Hai con người, hai tính cách, cùng chung một nhịp đập yêu thương để cùng nhau xây đắp tổ ấm vững bền.
          </p>
        </div>

        {/* Groom & Bride Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 items-stretch">
          {/* Groom Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-[#eadecd] flex flex-col items-center text-center relative group hover:shadow-xl transition-all"
          >
            <div className="relative mb-6">
              <div
                onClick={onOpenEditModal}
                className={`w-48 h-48 sm:w-56 sm:h-56 rounded-full overflow-hidden border-4 border-[#eeddcb] p-1.5 shadow-inner ${
                  onOpenEditModal ? 'cursor-pointer group/avatar' : ''
                }`}
                title={onOpenEditModal ? 'Bấm để thay đổi ảnh Chú Rể' : undefined}
              >
                <img
                  src={weddingData.groom.avatar}
                  alt={weddingData.groom.fullName}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform duration-500"
                />
                {onOpenEditModal && (
                  <div className="absolute inset-0 bg-black/30 rounded-full opacity-0 group-hover/avatar:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-medium gap-1 pointer-events-none">
                    <Camera className="w-6 h-6 text-white drop-shadow" />
                    <span className="drop-shadow text-[11px]">Đổi ảnh chú rể</span>
                  </div>
                )}
              </div>
              {onOpenEditModal && (
                <button
                  onClick={onOpenEditModal}
                  className="absolute bottom-2 right-2 p-2.5 rounded-full bg-white text-stone-700 shadow-lg border border-[#e8dacb] hover:bg-[#8e5c33] hover:text-white transition-all transform hover:scale-110 active:scale-95"
                  title="Thay đổi ảnh chú rể"
                >
                  <Camera className="w-4 h-4" />
                </button>
              )}
            </div>

            <span className="text-[11px] uppercase tracking-[0.25em] text-[#9b663b] font-semibold bg-[#faf1e8] px-3 py-1 rounded-full mb-3">
              CHÚ RỂ (GROOM)
            </span>
            <h3 className="font-serif-display text-2xl sm:text-3xl text-stone-800 font-medium">
              {weddingData.groom.fullName}
            </h3>

            {/* Parents */}
            <div className="mt-4 text-xs text-stone-500 space-y-1 bg-[#fcfaf7] px-4 py-3 rounded-xl w-full border border-[#f0e7dc]">
              <div>
                <span className="font-medium text-stone-700">Thân phụ: </span>
                {weddingData.groom.fatherName}
              </div>
              <div>
                <span className="font-medium text-stone-700">Thân mẫu: </span>
                {weddingData.groom.motherName}
              </div>
            </div>
          </motion.div>

          {/* Bride Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-[#eadecd] flex flex-col items-center text-center relative group hover:shadow-xl transition-all"
          >
            <div className="relative mb-6">
              <div
                onClick={onOpenEditModal}
                className={`w-48 h-48 sm:w-56 sm:h-56 rounded-full overflow-hidden border-4 border-[#eeddcb] p-1.5 shadow-inner ${
                  onOpenEditModal ? 'cursor-pointer group/avatar' : ''
                }`}
                title={onOpenEditModal ? 'Bấm để thay đổi ảnh Cô Dâu' : undefined}
              >
                <img
                  src={weddingData.bride.avatar}
                  alt={weddingData.bride.fullName}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform duration-500"
                />
                {onOpenEditModal && (
                  <div className="absolute inset-0 bg-black/30 rounded-full opacity-0 group-hover/avatar:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-medium gap-1 pointer-events-none">
                    <Camera className="w-6 h-6 text-white drop-shadow" />
                    <span className="drop-shadow text-[11px]">Đổi ảnh cô dâu</span>
                  </div>
                )}
              </div>
              {onOpenEditModal && (
                <button
                  onClick={onOpenEditModal}
                  className="absolute bottom-2 right-2 p-2.5 rounded-full bg-white text-rose-700 shadow-lg border border-rose-200 hover:bg-rose-600 hover:text-white transition-all transform hover:scale-110 active:scale-95"
                  title="Thay đổi ảnh cô dâu"
                >
                  <Camera className="w-4 h-4" />
                </button>
              )}
            </div>

            <span className="text-[11px] uppercase tracking-[0.25em] text-[#9b663b] font-semibold bg-[#faf1e8] px-3 py-1 rounded-full mb-3">
              CÔ DÂU (BRIDE)
            </span>
            <h3 className="font-serif-display text-2xl sm:text-3xl text-stone-800 font-medium">
              {weddingData.bride.fullName}
            </h3>

            {/* Parents */}
            <div className="mt-4 text-xs text-stone-500 space-y-1 bg-[#fcfaf7] px-4 py-3 rounded-xl w-full border border-[#f0e7dc]">
              <div>
                <span className="font-medium text-stone-700">Thân phụ: </span>
                {weddingData.bride.fatherName}
              </div>
              <div>
                <span className="font-medium text-stone-700">Thân mẫu: </span>
                {weddingData.bride.motherName}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
