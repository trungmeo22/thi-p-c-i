import React, { useState } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  MessageSquareHeart,
  Send,
  Heart,
  Mail,
  Sparkles,
  CheckCircle2,
  Tag,
} from 'lucide-react';
import { WeddingWish } from '../types';

interface WishesSectionProps {
  wishes: WeddingWish[];
  adminEmail: string;
  onAddWish: (wish: WeddingWish) => void;
  onLikeWish: (wishId: string) => void;
}

export const WishesSection: React.FC<WishesSectionProps> = ({
  wishes,
  adminEmail,
  onAddWish,
  onLikeWish,
}) => {
  const [senderName, setSenderName] = useState('');
  const [relationship, setRelationship] = useState('Bạn bè');
  const [message, setMessage] = useState('');
  const [sendToAdminEmail, setSendToAdminEmail] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const quickWishes = [
    'Chúc hai bạn trăm năm hạnh phúc, đầu bạc răng long!',
    'Chúc đôi tân lang tân nương vạn sự cát tường, sớm sinh quý tử!',
    'Chúc tổ ấm nhỏ luôn tràn ngập tiếng cười và yêu thương đong đầy!',
    'Hôn nhân viên mãn, tình nồng thắm mãi như ngày đầu gặp nhau!',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName.trim() || !message.trim()) return;

    const newWish: WeddingWish = {
      id: `w-${Date.now()}`,
      senderName: senderName.trim(),
      relationship: relationship.trim(),
      message: message.trim(),
      createdAt: new Date().toISOString(),
      likes: 1,
      isLiked: true,
    };

    onAddWish(newWish);

    // If email dispatch requested, prepare mailto link for admin email trungvp195@gmail.com
    if (sendToAdminEmail && adminEmail) {
      const emailSubject = encodeURIComponent(`[Lời chúc đám cưới] Từ ${senderName.trim()} (${relationship})`);
      const emailBody = encodeURIComponent(
        `Kính gửi cô dâu & chú rể,\n\n` +
        `Khách mời: ${senderName.trim()} (${relationship})\n` +
        `Nội dung lời chúc:\n"${message.trim()}"\n\n` +
        `Thời gian gửi: ${new Date().toLocaleString('vi-VN')}\n` +
        `Email admin quản lý: ${adminEmail}`
      );
      // Trigger mailto in background window/iframe or popup
      const mailtoUrl = `mailto:${adminEmail}?subject=${emailSubject}&body=${emailBody}`;
      // Open mail client
      window.open(mailtoUrl, '_blank');
    }

    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#f43f5e', '#ec4899', '#fb7185', '#b8855b'],
    });

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setSenderName('');
      setMessage('');
    }, 4000);
  };

  return (
    <section id="wishes" className="py-24 bg-[#faf7f2] relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#a06a3e] font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SỔ LƯU BÚT CHÚC MỪNG</span>
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <h2 className="font-serif-display text-3xl sm:text-5xl text-[#2d221b] font-normal mb-4">
            Gửi Lời Chúc Đến Cặp Đôi
          </h2>
          <p className="text-stone-500 text-sm font-light leading-relaxed">
            Những lời chúc tốt đẹp của quý vị sẽ được lưu giữ trên thiệp và đồng thời gửi trực tiếp tới email admin:{' '}
            <strong className="text-[#a06a3e] font-medium">{adminEmail}</strong>.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Wish Input Form (Left 5 Cols) */}
          <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl shadow-lg border border-[#e8ded2]">
            <div className="flex items-center gap-2 mb-6 pb-3 border-b border-stone-100">
              <MessageSquareHeart className="w-5 h-5 text-rose-500" />
              <h3 className="font-semibold text-stone-800 text-base">Viết Lời Chúc Yêu Thương</h3>
            </div>

            {submitted ? (
              <div className="text-center py-8 space-y-3 bg-rose-50/60 rounded-2xl p-6 border border-rose-100">
                <CheckCircle2 className="w-12 h-12 text-rose-500 mx-auto" />
                <h4 className="font-medium text-stone-800 text-base">Cảm Ơn Lời Chúc Của Bạn!</h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Lời chúc đã được lưu vào sổ lưu bút và gửi tới email của gia đình ({adminEmail}).
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                    Họ Và Tên Của Bạn *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Nguyễn Tuấn Minh"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b8855b]/50 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                    Mối Quan Hệ Với Cặp Đôi
                  </label>
                  <select
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b8855b]/50 transition-all"
                  >
                    <option value="Bạn Cô Dâu">Bạn Cô Dâu</option>
                    <option value="Bạn Chú Rể">Bạn Chú Rể</option>
                    <option value="Đồng Nghiệp">Đồng Nghiệp</option>
                    <option value="Họ Hàng Nhà Trai">Họ Hàng Nhà Trai</option>
                    <option value="Họ Hàng Nhà Gái">Họ Hàng Nhà Gái</option>
                    <option value="Người Thân">Người Thân / Anh Chị Em</option>
                    <option value="Bạn Chung Cả Hai">Bạn Chung Cả Hai</option>
                  </select>
                </div>

                {/* Quick wish recommendations */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                    Gợi Ý Nhanh Lời Chúc Ý Nghĩa
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {quickWishes.map((txt, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setMessage(txt)}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-[#f5ede3] text-stone-600 hover:text-[#88572e] border border-stone-200 text-left transition-colors"
                      >
                        {txt}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                    Nội Dung Lời Chúc *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Hãy viết những lời chúc ngọt ngào nhất gửi đến tân lang và tân nương..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b8855b]/50 transition-all"
                  />
                </div>

                {/* Email dispatch checkbox */}
                <div className="pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-600">
                    <input
                      type="checkbox"
                      checked={sendToAdminEmail}
                      onChange={(e) => setSendToAdminEmail(e.target.checked)}
                      className="w-4 h-4 rounded text-[#a06a3e] accent-[#a06a3e]"
                    />
                    <span>
                      Gửi kèm thông báo đến email admin:{' '}
                      <strong className="text-stone-800">{adminEmail}</strong>
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-semibold text-xs sm:text-sm uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Heart className="w-4 h-4 fill-white" />
                  <span>Gửi Lời Chúc Phúc</span>
                </button>
              </form>
            )}
          </div>

          {/* Wishes List Stream (Right 7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                Sổ Lưu Bút ({wishes.length} Lời Chúc)
              </span>
              <span className="text-xs text-[#a06a3e] font-medium flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> Ngập tràn yêu thương
              </span>
            </div>

            <div className="space-y-3.5 max-h-[560px] overflow-y-auto pr-1">
              {wishes.map((wish, index) => (
                <motion.div
                  key={wish.id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="bg-white p-5 rounded-2xl shadow-sm border border-[#e8ded2] hover:border-[#dfc6af] transition-colors"
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#ead7c3] to-[#f7eee5] text-[#83532c] font-bold text-xs flex items-center justify-center border border-[#dec6ae]">
                        {wish.senderName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-semibold text-stone-800 text-sm">
                          {wish.senderName}
                        </h4>
                        <span className="inline-flex items-center gap-1 text-[10px] text-[#9c6a40] font-medium bg-[#fcf5ed] px-2 py-0.5 rounded-md">
                          <Tag className="w-2.5 h-2.5" />
                          {wish.relationship}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onLikeWish(wish.id)}
                      className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border transition-all ${
                        wish.isLiked
                          ? 'bg-rose-50 border-rose-200 text-rose-600'
                          : 'bg-stone-50 border-stone-200 text-stone-500 hover:text-rose-500'
                      }`}
                      title="Thả tim lời chúc"
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${wish.isLiked ? 'fill-rose-500 text-rose-500' : ''}`}
                      />
                      <span className="font-semibold text-[11px]">{wish.likes}</span>
                    </button>
                  </div>

                  <p className="text-stone-700 text-xs sm:text-sm font-light leading-relaxed pl-11">
                    "{wish.message}"
                  </p>

                  <div className="mt-2 text-right text-[10px] text-stone-400">
                    {new Date(wish.createdAt).toLocaleDateString('vi-VN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
