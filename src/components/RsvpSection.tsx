import React, { useState } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { CheckCircle2, Send, Users, Sparkles, Heart, AlertCircle } from 'lucide-react';
import { GuestRSVP } from '../types';

interface RsvpSectionProps {
  onAddGuest: (guest: GuestRSVP) => void;
  guestName?: string;
}

export const RsvpSection: React.FC<RsvpSectionProps> = ({ onAddGuest, guestName }) => {
  const [formData, setFormData] = useState({
    name: guestName || '',
    phone: '',
    email: '',
    guestSide: 'groom' as 'groom' | 'bride' | 'both',
    attendance: 'attending' as 'attending' | 'not_attending' | 'tentative',
    guestCount: 1,
    needTransportation: false,
    notes: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#b8855b', '#e0b790', '#f43f5e', '#fbbf24', '#fbcfe8'],
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMsg('Vui lòng nhập họ và tên của bạn.');
      return;
    }
    if (!formData.phone.trim()) {
      setErrorMsg('Vui lòng nhập số điện thoại để gia đình tiện liên hệ.');
      return;
    }
    setErrorMsg('');

    const newGuest: GuestRSVP = {
      id: `g-${Date.now()}`,
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      guestSide: formData.guestSide,
      attendance: formData.attendance,
      guestCount: formData.attendance === 'not_attending' ? 0 : Number(formData.guestCount),
      needTransportation: formData.needTransportation,
      notes: formData.notes.trim(),
      createdAt: new Date().toISOString(),
    };

    onAddGuest(newGuest);
    setSubmitted(true);
    triggerConfetti();
  };

  const handleReset = () => {
    setSubmitted(false);
    setFormData({
      name: '',
      phone: '',
      email: '',
      guestSide: 'groom',
      attendance: 'attending',
      guestCount: 1,
      needTransportation: false,
      notes: '',
    });
  };

  return (
    <section id="rsvp" className="py-24 bg-[#f8f2e9] relative overflow-hidden">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-0 right-10 w-72 h-72 bg-amber-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-72 h-72 bg-rose-200/30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Heading */}
        <div className="text-center max-w-xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#a06a3e] font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>XÁC NHẬN THAM DỰ</span>
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <h2 className="font-serif-display text-3xl sm:text-5xl text-[#2e231c] font-normal mb-4">
            Sổ Đăng Ký Khách Mời
          </h2>
          <p className="text-stone-500 text-sm font-light leading-relaxed">
            Để gia đình chuẩn bị chu đáo nhất cho buổi tiệc, xin quý khách vui lòng phản hồi trước ngày{' '}
            <strong className="text-stone-700 font-semibold">20 / 11 / 2026</strong>.
          </p>
        </div>

        {/* Card Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-[#e8ded2]"
        >
          {submitted ? (
            <div className="text-center py-10 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="font-serif-display text-2xl sm:text-3xl text-stone-800 font-medium">
                Cảm Ơn Quý Khách Đã Xác Nhận!
              </h3>
              <p className="text-stone-600 text-sm max-w-md mx-auto leading-relaxed">
                Thông tin của bạn đã được gửi thành công đến gia đình hai bên. Chúng tôi rất mong được đón tiếp bạn trong ngày vui!
              </p>
              <div className="pt-4">
                <button
                  onClick={handleReset}
                  className="px-6 py-2.5 rounded-full bg-[#f4ebe1] text-[#86562f] hover:bg-[#ebdccf] text-xs font-semibold tracking-wide transition-all shadow-sm"
                >
                  Xác nhận thêm người khác
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Guest Side Radio Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2">
                  Bạn Là Khách Của Ai? *
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { key: 'groom', label: 'Nhà Trai' },
                    { key: 'bride', label: 'Nhà Gái' },
                    { key: 'both', label: 'Cả Hai Bên' },
                  ].map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, guestSide: item.key as any })
                      }
                      className={`py-3 px-2 rounded-2xl text-xs sm:text-sm font-semibold border transition-all ${
                        formData.guestSide === item.key
                          ? 'bg-[#faf1e7] border-[#b8855b] text-[#8b5a36] shadow-sm ring-1 ring-[#b8855b]'
                          : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                    Họ Và Tên Của Bạn *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Nguyễn Văn Nam"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b8855b]/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                    Số Điện Thoại Liên Hệ *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="VD: 0912 345 678"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b8855b]/50 transition-all"
                  />
                </div>
              </div>

              {/* Attendance Status */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2">
                  Bạn Sẽ Đến Chung Vui Chứ? *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { key: 'attending', label: 'Chắc chắn tham dự' },
                    { key: 'tentative', label: 'Chưa chắc chắn' },
                    { key: 'not_attending', label: 'Rất tiếc không thể đến' },
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, attendance: opt.key as any })
                      }
                      className={`p-3 rounded-2xl text-xs sm:text-sm font-medium border text-center transition-all ${
                        formData.attendance === opt.key
                          ? 'bg-[#b8855b] border-[#b8855b] text-white shadow-md'
                          : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* If Attending, Number of Guests & Shuttle */}
              {formData.attendance !== 'not_attending' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                      Số Lượng Người Đi Cùng (Bao gồm bạn)
                    </label>
                    <select
                      value={formData.guestCount}
                      onChange={(e) =>
                        setFormData({ ...formData, guestCount: Number(e.target.value) })
                      }
                      className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b8855b]/50 transition-all"
                    >
                      <option value={1}>1 người (Chỉ mình tôi)</option>
                      <option value={2}>2 người (Đi cùng người thương/bạn)</option>
                      <option value={3}>3 người (Gia đình 3 người)</option>
                      <option value={4}>4 người (Gia đình 4 người)</option>
                      <option value={5}>5+ người (Gia đình đông người)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                      Nhu Cầu Xe Đưa Đón Của Gia Đình
                    </label>
                    <div className="flex items-center gap-3 pt-2">
                      <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-700">
                        <input
                          type="checkbox"
                          checked={formData.needTransportation}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              needTransportation: e.target.checked,
                            })
                          }
                          className="w-4 h-4 rounded text-[#b8855b] accent-[#b8855b] focus:ring-0"
                        />
                        <span>Cần xe đưa đón tập trung</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Note / Dietary */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                  Ghi Chú Đặc Biệt (Ăn chay / Dị ứng thức ăn...)
                </label>
                <textarea
                  rows={3}
                  placeholder="VD: Tôi ăn chay trường, hoặc lưu ý về dị ứng hải sản..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b8855b]/50 transition-all"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#a06a3e] to-[#ba865c] hover:from-[#8d5b32] hover:to-[#a7744b] text-white font-semibold text-sm uppercase tracking-wider shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Gửi Xác Nhận Tham Dự</span>
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
};
