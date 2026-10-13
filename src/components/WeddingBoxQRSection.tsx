import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Gift,
  ShieldCheck,
  Copy,
  Check,
  Download,
  CreditCard,
  Sparkles,
  QrCode,
  Pencil,
} from 'lucide-react';
import { WeddingData, BankAccount } from '../types';
import { getVietQrUrl } from '../utils/weddingHelpers';

interface WeddingBoxQRSectionProps {
  weddingData: WeddingData;
  onOpenEditModal?: () => void;
}

export const WeddingBoxQRSection: React.FC<WeddingBoxQRSectionProps> = ({
  weddingData,
  onOpenEditModal,
}) => {
  const [activeTab, setActiveTab] = useState<'groom' | 'bride'>('groom');
  const [copiedAcc, setCopiedAcc] = useState(false);

  const currentAccount: BankAccount =
    activeTab === 'groom'
      ? weddingData.bankAccounts.groom
      : weddingData.bankAccounts.bride;

  const memoText = `Mung cuoi ${activeTab === 'groom' ? weddingData.groom.name : weddingData.bride.name}`;

  // If custom QR uploaded, use it; otherwise use VietQR standard
  const qrImageUrl =
    currentAccount.customQrUrl && currentAccount.customQrUrl.trim() !== ''
      ? currentAccount.customQrUrl
      : getVietQrUrl(
          currentAccount.bankId,
          currentAccount.accountNumber,
          currentAccount.accountHolder,
          0,
          memoText
        );

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAcc(true);
    setTimeout(() => setCopiedAcc(false), 2500);
  };

  return (
    <section id="wedding-box" className="py-24 bg-[#f8f2e9] relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#a06a3e] font-semibold mb-2">
            <Gift className="w-3.5 h-3.5" />
            <span>HỘP MỪNG CƯỚI TRỰC TUYẾN</span>
            <Gift className="w-3.5 h-3.5" />
          </div>
          <h2 className="font-serif-display text-3xl sm:text-5xl text-[#2c221b] font-normal mb-4">
            Gửi Quà Mừng & Chúc Phúc
          </h2>
          <p className="text-stone-500 text-sm font-light leading-relaxed">
            Dành cho những người thân, bạn bè ở xa hoặc có nhu cầu gửi lời chúc mừng cùng món quà ý nghĩa một cách bảo mật, tiện lợi nhất.
          </p>
        </div>

        {/* Tab Switcher: Nhà Trai vs Nhà Gái & Chỉnh sửa */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          <div className="bg-[#ede1d2] p-1.5 rounded-2xl flex items-center gap-2 shadow-inner">
            <button
              onClick={() => {
                setActiveTab('groom');
                setCopiedAcc(false);
              }}
              className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'groom'
                  ? 'bg-white text-[#8d582c] shadow-md'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <CreditCard className="w-4 h-4 text-blue-600" />
              <span>Mừng Nhà Trai ({weddingData.groom.name})</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('bride');
                setCopiedAcc(false);
              }}
              className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'bride'
                  ? 'bg-white text-[#8d582c] shadow-md'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <CreditCard className="w-4 h-4 text-rose-500" />
              <span>Mừng Nhà Gái ({weddingData.bride.name})</span>
            </button>
          </div>

          {onOpenEditModal && (
            <button
              onClick={onOpenEditModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-white border border-[#e2d5c5] hover:bg-[#f6eee3] text-[#8e5c33] text-xs font-semibold shadow-xs transition-all"
              title="Đổi số tài khoản ngân hàng hoặc tải ảnh mã QR của bạn"
            >
              <QrCode className="w-4 h-4 text-[#a06a3e]" />
              <span>Cập nhật STK / Ảnh QR</span>
            </button>
          )}
        </div>

        {/* Main Bank QR Card */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-[#e5d8c8] grid grid-cols-1 md:grid-cols-12 gap-8 items-center"
        >
          {/* QR Image Column (Left 5 cols) */}
          <div className="md:col-span-5 flex flex-col items-center justify-center text-center">
            <div
              onClick={onOpenEditModal}
              className={`p-3 bg-white rounded-2xl border-2 border-[#eeddcb] shadow-md inline-block relative group ${
                onOpenEditModal ? 'cursor-pointer hover:border-[#a06a3e] transition-all' : ''
              }`}
              title={onOpenEditModal ? 'Nhấp để thay đổi tài khoản hoặc tải ảnh QR của bạn' : undefined}
            >
              <img
                src={qrImageUrl}
                alt={`Mã QR Mừng Cưới ${currentAccount.accountHolder}`}
                className="w-56 h-56 sm:w-64 sm:h-64 object-contain rounded-xl"
              />
              <div className="absolute top-2 right-2 bg-emerald-600 text-white p-1 rounded-full shadow" title="Mã VietQR Bảo Mật">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              {onOpenEditModal && (
                <div className="absolute bottom-2 right-2 bg-[#a06a3e] hover:bg-[#88572f] text-white p-1.5 rounded-full shadow-md group-hover:scale-110 transition-transform flex items-center justify-center">
                  <Pencil className="w-3.5 h-3.5" />
                </div>
              )}
            </div>

            <a
              href={qrImageUrl}
              download={`vietqr_${activeTab}_dam_cuoi.png`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-xs text-[#9c6a40] hover:text-[#784d28] font-medium"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Tải ảnh mã QR về máy</span>
            </a>
          </div>

          {/* Account Details & Amount Preset (Right 7 cols) */}
          <div className="md:col-span-7 space-y-5">
            {/* Account Information Box */}
            <div className="bg-[#fcf9f5] rounded-2xl p-4 sm:p-5 border border-[#ede1d3] space-y-3">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-stone-500 block">
                  Ngân Hàng Tiếp Nhận
                </span>
                <span className="font-semibold text-stone-800 text-sm sm:text-base">
                  {currentAccount.bankName}
                </span>
              </div>

              <div>
                <span className="text-[11px] uppercase tracking-wider text-stone-500 block">
                  Chủ Tài Khoản
                </span>
                <span className="font-semibold text-[#8b5a36] text-sm sm:text-base tracking-wide">
                  {currentAccount.accountHolder}
                </span>
              </div>

              <div>
                <span className="text-[11px] uppercase tracking-wider text-stone-500 block">
                  Số Tài Khoản
                </span>
                <div className="flex items-center justify-between gap-2 mt-0.5">
                  <span className="font-mono font-bold text-lg sm:text-xl text-stone-900 tracking-wider">
                    {currentAccount.accountNumber}
                  </span>
                  <button
                    onClick={() => handleCopy(currentAccount.accountNumber)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-xs font-semibold text-stone-700 shadow-sm transition-all"
                  >
                    {copiedAcc ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Đã chép</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Sao chép STK</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
