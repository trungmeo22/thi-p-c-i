import React, { useState } from 'react';
import { Lock, KeyRound, Eye, EyeOff, ShieldCheck, X, Sparkles } from 'lucide-react';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentPin: string;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentPin,
}) => {
  const [pinInput, setPinInput] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const effectivePin = currentPin || '2811';

    if (pinInput.trim() === effectivePin.trim()) {
      setErrorMessage('');
      if (rememberMe) {
        localStorage.setItem('wedding_host_authenticated', 'true');
      } else {
        sessionStorage.setItem('wedding_host_authenticated', 'true');
      }
      onSuccess();
      onClose();
    } else {
      setErrorMessage('Mã PIN không chính xác! Vui lòng kiểm tra lại (Mặc định: 2811).');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#fdfbf7] rounded-3xl shadow-2xl border border-[#ecdccb] overflow-hidden">
        {/* Decorative Top Accent */}
        <div className="h-2 bg-gradient-to-r from-[#9b663b] via-[#d4af37] to-[#9b663b]" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          title="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          {/* Header Icon */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#f5ede4] to-[#ecdccb] border border-[#ddcaa8] flex items-center justify-center shadow-inner mb-3">
              <KeyRound className="w-8 h-8 text-[#905f37]" />
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase text-[#905f37] mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Khu Vực Quản Trị</span>
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <h3 className="font-serif-display text-2xl text-[#31251e] font-normal">
              Xác Thực Dâu & Rể
            </h3>
            <p className="text-stone-500 text-xs mt-1.5 leading-relaxed max-w-xs">
              Tính năng tùy biến thông tin thiệp và quản lý danh sách khách mời chỉ dành riêng cho Chủ tiệc.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Nhập Mã PIN Quản Trị:
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPin ? 'text' : 'password'}
                  inputMode="numeric"
                  autoFocus
                  required
                  placeholder="Nhập mã PIN (VD: 2811)..."
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  className="w-full pl-10 pr-11 py-2.5 bg-white border border-stone-300 rounded-2xl text-stone-800 text-center text-lg font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-[#9b663b]/30 focus:border-[#9b663b] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-600 transition-colors"
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {errorMessage ? (
                <p className="text-xs text-rose-500 mt-1.5 text-center font-medium">
                  {errorMessage}
                </p>
              ) : (
                <p className="text-[11px] text-stone-400 mt-1.5 text-center">
                  Mã PIN mặc định: <span className="font-semibold text-[#905f37]">2811</span> (ngày cưới)
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-[#9b663b] border-stone-300 focus:ring-[#9b663b]"
              />
              <label htmlFor="rememberMe" className="text-xs text-stone-600 cursor-pointer select-none">
                Ghi nhớ đăng nhập trên thiết bị này
              </label>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-4 rounded-xl border border-stone-300 text-stone-600 text-xs font-semibold hover:bg-stone-100 transition-colors"
              >
                Hủy Bỏ
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#9b663b] to-[#b8855b] hover:from-[#88572f] hover:to-[#a4734b] text-white text-xs font-semibold shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Mở Khóa Quản Trị</span>
              </button>
            </div>
          </form>

          {/* Privacy Note */}
          <div className="mt-5 pt-4 border-t border-[#eee4d6] text-center">
            <p className="text-[11px] text-stone-400 leading-normal">
              Khách mời xem thiệp sẽ không thể tùy biến hay chỉnh sửa nội dung thiệp nếu không có mã PIN này.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
