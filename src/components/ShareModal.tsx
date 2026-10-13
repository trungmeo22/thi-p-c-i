import React, { useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Link as LinkIcon,
  UserCheck,
  Send,
  HelpCircle,
  Eye,
  Lock,
} from 'lucide-react';
import { WeddingData } from '../types';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  weddingData: WeddingData;
  onPreviewAsGuest?: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  weddingData,
  onPreviewAsGuest,
}) => {
  const [guestNameInput, setGuestNameInput] = useState('');
  const [copiedType, setCopiedType] = useState<'clean' | 'custom' | 'admin' | null>(null);
  const [activeTab, setActiveTab] = useState<'links' | 'guide'>('links');

  if (!isOpen) return null;

  // Base URL (Vercel domain or current host without query parameters)
  const baseUrl = `${window.location.origin}${window.location.pathname}`.replace(/\/$/, '');

  // 1. Clean guest URL (100% no admin buttons, no customize buttons)
  const cleanGuestUrl = baseUrl;

  // 2. Personalized guest URL (with ?to=GuestName)
  const encodedGuestName = encodeURIComponent(guestNameInput.trim());
  const customGuestUrl = guestNameInput.trim()
    ? `${baseUrl}?to=${encodedGuestName}`
    : `${baseUrl}?to=Anh+Chị`;

  const customMessage = `💌 Trân trọng kính mời ${
    guestNameInput.trim() || '[Tên khách mời]'
  } tới dự Lễ Thành Hôn của ${weddingData.groom.name} & ${weddingData.bride.name} vào ngày ${
    weddingData.weddingDateFormatted
  }!\n👉 Xem thiệp cưới & dẫn đường tại: ${customGuestUrl}`;

  // 3. Secret Admin URL for Bride & Groom only
  const adminUrl = `${baseUrl}?admin=true`;
  const pin = weddingData.adminPin || '2811';

  const copyToClipboard = (text: string, type: 'clean' | 'custom' | 'admin') => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleShareZaloOrSocial = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `Thiệp Cưới: ${weddingData.groom.name} & ${weddingData.bride.name}`,
          text: customMessage,
          url: customGuestUrl,
        })
        .catch(() => {});
    } else {
      copyToClipboard(customMessage, 'custom');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#fdfbf7] rounded-3xl shadow-2xl border border-[#ecdccb] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Accent Gradient */}
        <div className="h-2 bg-gradient-to-r from-[#9b663b] via-[#e5a855] to-[#9b663b]" />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-[#eee3d5] flex items-center justify-between bg-[#fbf6ef]/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#9b663b]/10 border border-[#9b663b]/25 flex items-center justify-center text-[#9b663b]">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-[#342419]">
                Chia Sẻ Link Thiệp Cưới
              </h3>
              <p className="text-xs text-stone-500">
                Lấy link gửi khách mời (không chứa nút tùy biến) hoặc link quản trị
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="flex border-b border-[#eee3d5] bg-stone-50/70 text-xs font-medium">
          <button
            onClick={() => setActiveTab('links')}
            className={`flex-1 py-3 px-4 text-center transition-colors border-b-2 ${
              activeTab === 'links'
                ? 'border-[#9b663b] text-[#9b663b] font-semibold bg-white'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            Lấy Link Gửi Khách
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`flex-1 py-3 px-4 text-center transition-colors border-b-2 flex items-center justify-center gap-1.5 ${
              activeTab === 'guide'
                ? 'border-[#9b663b] text-[#9b663b] font-semibold bg-white'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Cách Deploy Vercel</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {activeTab === 'links' ? (
            <>
              {/* SECTION 1: Clean Public Guest Link */}
              <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center">
                      1
                    </span>
                    <h4 className="text-sm font-bold text-stone-800">
                      Link Gửi Khách Mời Chung (Chuẩn & Sạch 100%)
                    </h4>
                  </div>
                  <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Không có nút tùy chỉnh
                  </span>
                </div>

                <p className="text-xs text-stone-500 leading-relaxed">
                  Gửi link này qua Zalo, Facebook, SMS cho khách. Khách mở ra chỉ thấy thiệp cưới thuần túy, nhạc nền, bản đồ, album và form RSVP — <strong>hoàn toàn không có nút tùy biến hay sửa thiệp</strong>.
                </p>

                <div className="flex items-center gap-2">
                  <div className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono text-stone-700 truncate select-all">
                    {cleanGuestUrl}
                  </div>
                  <button
                    onClick={() => copyToClipboard(cleanGuestUrl, 'clean')}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#9b663b] hover:bg-[#86542c] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors shrink-0"
                  >
                    {copiedType === 'clean' ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-300" />
                        <span>Đã copy</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* SECTION 2: Personalized Guest Link */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/50 to-orange-50/30 border border-amber-200/80 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center">
                      2
                    </span>
                    <h4 className="text-sm font-bold text-[#452b1b] flex items-center gap-1.5">
                      <span>Tạo Link Thiệp Đích Danh Từng Khách</span>
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    </h4>
                  </div>
                  <span className="text-[11px] text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-full">
                    Rất trang trọng
                  </span>
                </div>

                <p className="text-xs text-stone-600">
                  Nhập tên khách mời bên dưới để tạo lời mời riêng (khi khách mở sẽ thấy dòng chữ trang trọng <em>"Trân trọng kính mời: [Tên khách]"</em> và tự điền tên vào RSVP):
                </p>

                <div>
                  <label className="block text-[11px] font-medium text-stone-600 mb-1">
                    Tên khách mời hoặc xưng hô:
                  </label>
                  <input
                    type="text"
                    value={guestNameInput}
                    onChange={(e) => setGuestNameInput(e.target.value)}
                    placeholder="Ví dụ: Anh Nam, Gia đình Bác Hùng, Bạn Linh c3..."
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#9b663b]/30"
                  />
                </div>

                {/* Personalized Link Preview */}
                <div className="p-2.5 bg-white/90 rounded-xl border border-amber-200/60 text-xs space-y-2">
                  <div className="font-mono text-[11px] text-stone-600 truncate">
                    {customGuestUrl}
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      onClick={() => copyToClipboard(customMessage, 'custom')}
                      className="flex-1 min-w-[140px] flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#9b663b] hover:bg-[#86542c] text-white rounded-lg text-xs font-medium transition-colors"
                    >
                      {copiedType === 'custom' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-300" />
                          <span>Đã copy lời mời!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Tin Nhắn Kèm Link</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleShareZaloOrSocial}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors"
                      title="Gửi nhanh qua Zalo / Chia sẻ"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Gửi Nhanh</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* SECTION 3: Secret Host / Admin Link for Bride & Groom */}
              <div className="p-4 rounded-2xl bg-stone-900 text-stone-200 shadow-md space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-amber-400 text-stone-900 font-bold text-xs flex items-center justify-center">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                    <h4 className="text-sm font-bold text-amber-300">
                      Link Quản Trị Bí Mật (Chỉ Dành Cho Dâu & Rể)
                    </h4>
                  </div>
                  <span className="text-[11px] font-mono text-amber-300 bg-stone-800 px-2 py-0.5 rounded-md border border-stone-700">
                    PIN: {pin}
                  </span>
                </div>

                <p className="text-xs text-stone-400 leading-relaxed">
                  Lưu link này vào <strong>Bookmark điện thoại hoặc máy tính của 2 bạn</strong>. Chỉ khi mở qua link có <code className="text-amber-300 font-mono">?admin=true</code> (hoặc bấm 3 lần vào logo) thì mới hiện quyền chỉnh sửa!
                </p>

                <div className="flex items-center gap-2">
                  <div className="flex-1 px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-xs font-mono text-amber-200 truncate select-all">
                    {adminUrl}
                  </div>
                  <button
                    onClick={() => copyToClipboard(adminUrl, 'admin')}
                    className="flex items-center gap-1.5 px-3 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-xl text-xs shadow-xs transition-colors shrink-0"
                  >
                    {copiedType === 'admin' ? (
                      <>
                        <Check className="w-4 h-4 text-stone-950" />
                        <span>Đã copy</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy Link Admin</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Tab: Guide on Vercel Deployment */
            <div className="space-y-4 text-xs text-stone-700 leading-relaxed">
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-2">
                <h4 className="text-sm font-bold text-blue-900 flex items-center gap-2">
                  <span>Quy Trình Deploy Lên Vercel & Chia Sẻ Link</span>
                </h4>
                <p className="text-blue-800">
                  Dưới đây là các bước đơn giản nhất để đưa website thiệp cưới lên Vercel:
                </p>
              </div>

              <ol className="space-y-3 pl-4 list-decimal marker:font-bold marker:text-[#9b663b]">
                <li className="pl-1">
                  <strong>Đẩy code lên GitHub:</strong> Push toàn bộ mã nguồn của dự án lên GitHub repository cá nhân của bạn.
                </li>
                <li className="pl-1">
                  <strong>Tạo Project trên Vercel:</strong> Vào{' '}
                  <a
                    href="https://vercel.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 underline font-semibold"
                  >
                    vercel.com
                  </a>
                  , chọn <em>"Add New..." &gt; "Project"</em>, sau đó chọn repository vừa tạo.
                </li>
                <li className="pl-1">
                  <strong>Cấu hình build:</strong> Vercel sẽ tự nhận diện Vite React. Bạn chỉ cần bấm <strong>"Deploy"</strong>.
                </li>
                <li className="pl-1">
                  <strong>Sau khi Deploy thành công:</strong> Vercel cấp cho bạn tên miền chính thức, ví dụ:
                  <div className="my-1.5 p-2 bg-stone-100 rounded-lg font-mono text-[11px] text-stone-800 border border-stone-200">
                    https://thiepcuoi-minhtrung-thuhuyen.vercel.app
                  </div>
                </li>
                <li className="pl-1">
                  <strong>Cách chia sẻ an toàn:</strong>
                  <ul className="list-disc pl-4 mt-1 space-y-1 text-stone-600">
                    <li>
                      <strong>Gửi cho khách mời:</strong> Gửi đúng link gốc{' '}
                      <code className="text-emerald-700 font-semibold font-mono">
                        https://thiepcuoi-...vercel.app
                      </code>
                      . Khách mở ra sẽ là thiệp cưới nguyên bản, không có bất kỳ nút tùy chỉnh nào!
                    </li>
                    <li>
                      <strong>Dành cho bạn (Chủ tiệc):</strong> Chỉ bạn mới mở link có đuôi{' '}
                      <code className="text-amber-700 font-semibold font-mono">
                        ?admin=true
                      </code>{' '}
                      và nhập mã PIN ({pin}) để sửa dữ liệu hoặc xem danh sách khách mời RSVP!
                    </li>
                  </ul>
                </li>
              </ol>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#eee3d5] bg-stone-50 flex items-center justify-between">
          {onPreviewAsGuest && (
            <button
              onClick={() => {
                onClose();
                onPreviewAsGuest();
              }}
              className="flex items-center gap-1.5 text-xs text-stone-600 hover:text-stone-900 font-medium px-3 py-1.5 rounded-lg hover:bg-stone-200/60 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Khóa & xem thử với vai trò khách</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="ml-auto px-5 py-2 bg-stone-800 hover:bg-stone-900 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            Đã Hiểu & Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
