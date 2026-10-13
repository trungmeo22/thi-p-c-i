import React, { useState } from 'react';
import {
  X,
  Upload,
  Save,
  RotateCcw,
  Calendar,
  MapPin,
  Heart,
  CreditCard,
  Music,
  Image as ImageIcon,
  Images,
  User,
  Sparkles,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  QrCode,
  Check,
  Navigation,
  ExternalLink,
  Compass,
} from 'lucide-react';
import { WeddingData, GalleryItem } from '../types';
import { POPULAR_BANKS, INITIAL_WEDDING_DATA } from '../data/defaultWeddingData';
import { getVietQrUrl } from '../utils/weddingHelpers';

interface EditWeddingModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: WeddingData;
  onSave: (updatedData: WeddingData) => void;
  onReset: () => void;
}

export const EditWeddingModal: React.FC<EditWeddingModalProps> = ({
  isOpen,
  onClose,
  data,
  onSave,
  onReset,
}) => {
  const [formData, setFormData] = useState<WeddingData>(data);
  const [activeTab, setActiveTab] = useState<
    'couple' | 'gallery' | 'banks' | 'datetime' | 'venues' | 'photos'
  >('couple');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New photo input state
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoTitle, setNewPhotoTitle] = useState('');
  const [newPhotoCaption, setNewPhotoCaption] = useState('');

  if (!isOpen) return null;

  // Helper to handle local file upload to Base64
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    onSuccess: (base64Url: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        onSuccess(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Multiple album files upload handler
  const handleAlbumMultipleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const promises: Promise<string>[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      promises.push(
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            if (typeof event.target?.result === 'string') {
              resolve(event.target.result);
            }
          };
          reader.readAsDataURL(file);
        })
      );
    }

    Promise.all(promises).then((urls) => {
      const newItems: GalleryItem[] = urls.map((url, i) => ({
        id: `album_${Date.now()}_${i}`,
        url,
        title: `Khoảnh khắc đẹp ${formData.gallery.length + i + 1}`,
        caption: 'Hạnh phúc ngày chung đôi',
      }));
      setFormData((prev) => ({
        ...prev,
        gallery: [...prev.gallery, ...newItems],
      }));
    });
    e.target.value = '';
  };

  const handleAddPhotoByUrl = () => {
    if (!newPhotoUrl.trim()) return;
    const newItem: GalleryItem = {
      id: `album_${Date.now()}`,
      url: newPhotoUrl.trim(),
      title: newPhotoTitle.trim() || `Ảnh cưới ${formData.gallery.length + 1}`,
      caption: newPhotoCaption.trim() || undefined,
    };
    setFormData((prev) => ({
      ...prev,
      gallery: [...prev.gallery, newItem],
    }));
    setNewPhotoUrl('');
    setNewPhotoTitle('');
    setNewPhotoCaption('');
  };

  const handleRemovePhoto = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      gallery: prev.gallery.filter((item) => item.id !== id),
    }));
  };

  const handleMovePhoto = (index: number, direction: 'up' | 'down') => {
    const newGallery = [...formData.gallery];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newGallery.length) return;
    const temp = newGallery[index];
    newGallery[index] = newGallery[targetIndex];
    newGallery[targetIndex] = temp;
    setFormData((prev) => ({
      ...prev,
      gallery: newGallery,
    }));
  };

  const handleRestoreDefaultGallery = () => {
    if (window.confirm('Khôi phục lại toàn bộ ảnh cưới mẫu ban đầu?')) {
      setFormData((prev) => ({
        ...prev,
        gallery: INITIAL_WEDDING_DATA.gallery,
      }));
    }
  };

  const handleAutoGenerateMapUrl = (idx: number) => {
    const event = formData.events[idx];
    const query = event.mapQuery?.trim() || event.address?.trim() || event.venueName?.trim();
    if (!query) return;
    const generatedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
    const updated = [...formData.events];
    updated[idx] = {
      ...updated[idx],
      mapQuery: query,
      mapEmbedUrl: generatedUrl,
    };
    setFormData({ ...formData, events: updated });
  };

  const handleMapEmbedUrlChange = (idx: number, rawInput: string) => {
    let finalUrl = rawInput.trim();
    // If user pasted an iframe tag, extract src
    const match = rawInput.match(/src=["']([^"']+)["']/);
    if (match && match[1]) {
      finalUrl = match[1];
    }
    const updated = [...formData.events];
    updated[idx] = {
      ...updated[idx],
      mapEmbedUrl: finalUrl,
    };
    setFormData({ ...formData, events: updated });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-[#fcfaf7]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#f4ebe0] text-[#915e34]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-stone-800 text-base sm:text-lg">
                Tùy Biến Thông Tin Thiệp Cưới
              </h3>
              <p className="text-xs text-stone-500">
                Tải ảnh, đổi thông tin cô dâu chú rể, ngày giờ đếm ngược, địa điểm và mã QR ngân hàng.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Khôi phục toàn bộ thông tin về mặc định ban đầu?')) {
                  onReset();
                  onClose();
                }
              }}
              className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-stone-100 transition-colors"
              title="Khôi phục mặc định"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-stone-200 bg-stone-50 px-4 sm:px-6 overflow-x-auto">
          {[
            { id: 'couple', label: 'Cô Dâu & Chú Rể', icon: Heart },
            { id: 'gallery', label: 'Album Ảnh Cưới', icon: Images },
            { id: 'banks', label: 'Tài Khoản & Ảnh QR', icon: CreditCard },
            { id: 'datetime', label: 'Ngày Giờ & Đếm Ngược', icon: Calendar },
            { id: 'venues', label: 'Địa Điểm & Bản Đồ', icon: MapPin },
            { id: 'photos', label: 'Ảnh Bìa & Nhạc Nền', icon: ImageIcon },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-3 sm:px-4 text-xs font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-[#a06a3e] text-[#a06a3e] bg-white'
                    : 'border-transparent text-stone-600 hover:text-stone-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-xs sm:text-sm">
          {/* TAB: COUPLE */}
          {activeTab === 'couple' && (
            <div className="space-y-6">
              {/* Groom Details */}
              <div className="p-4 rounded-2xl bg-[#faf6f0] border border-[#eee2d3] space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-[#e9ded0]">
                  <User className="w-4 h-4 text-blue-600" />
                  <h4 className="font-semibold text-stone-800 text-sm uppercase tracking-wide">
                    Thông Tin Chú Rể (Nhà Trai)
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      Tên gọi hiển thị
                    </label>
                    <input
                      type="text"
                      value={formData.groom.name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          groom: { ...formData.groom, name: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      Họ và tên đầy đủ
                    </label>
                    <input
                      type="text"
                      value={formData.groom.fullName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          groom: { ...formData.groom, fullName: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      Thân phụ (Bố chú rể)
                    </label>
                    <input
                      type="text"
                      value={formData.groom.fatherName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          groom: { ...formData.groom, fatherName: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      Thân mẫu (Mẹ chú rể)
                    </label>
                    <input
                      type="text"
                      value={formData.groom.motherName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          groom: { ...formData.groom, motherName: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    Ảnh chân dung Chú rể
                  </label>
                  <div className="flex items-center gap-3">
                    <img
                      src={formData.groom.avatar}
                      alt="Groom avatar"
                      className="w-12 h-12 rounded-full object-cover border border-stone-300"
                    />
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        placeholder="Link ảnh online (URL)..."
                        value={formData.groom.avatar}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            groom: { ...formData.groom, avatar: e.target.value },
                          })
                        }
                        className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-stone-300 text-xs focus:outline-none"
                      />
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-300 text-xs font-medium text-stone-700 shrink-0">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Tải tệp ảnh</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            handleFileUpload(e, (url) =>
                              setFormData({
                                ...formData,
                                groom: { ...formData.groom, avatar: url },
                              })
                            )
                          }
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bride Details */}
              <div className="p-4 rounded-2xl bg-[#faf6f0] border border-[#eee2d3] space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-[#e9ded0]">
                  <User className="w-4 h-4 text-rose-600" />
                  <h4 className="font-semibold text-stone-800 text-sm uppercase tracking-wide">
                    Thông Tin Cô Dâu (Nhà Gái)
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      Tên gọi hiển thị
                    </label>
                    <input
                      type="text"
                      value={formData.bride.name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bride: { ...formData.bride, name: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      Họ và tên đầy đủ
                    </label>
                    <input
                      type="text"
                      value={formData.bride.fullName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bride: { ...formData.bride, fullName: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      Thân phụ (Bố cô dâu)
                    </label>
                    <input
                      type="text"
                      value={formData.bride.fatherName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bride: { ...formData.bride, fatherName: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      Thân mẫu (Mẹ cô dâu)
                    </label>
                    <input
                      type="text"
                      value={formData.bride.motherName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bride: { ...formData.bride, motherName: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    Ảnh chân dung Cô dâu
                  </label>
                  <div className="flex items-center gap-3">
                    <img
                      src={formData.bride.avatar}
                      alt="Bride avatar"
                      className="w-12 h-12 rounded-full object-cover border border-stone-300"
                    />
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        placeholder="Link ảnh online (URL)..."
                        value={formData.bride.avatar}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            bride: { ...formData.bride, avatar: e.target.value },
                          })
                        }
                        className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-stone-300 text-xs focus:outline-none"
                      />
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-300 text-xs font-medium text-stone-700 shrink-0">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Tải tệp ảnh</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            handleFileUpload(e, (url) =>
                              setFormData({
                                ...formData,
                                bride: { ...formData.bride, avatar: url },
                              })
                            )
                          }
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: DATETIME & COUNTDOWN */}
          {activeTab === 'datetime' && (
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                  Mốc thời gian kích hoạt đếm ngược (ISO Format / Thời gian chính thức) *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.targetDateTime.slice(0, 16)}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      targetDateTime: `${e.target.value}:00`,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 focus:outline-none"
                />
                <p className="text-[10px] text-stone-400 mt-1">
                  Đồng hồ đếm ngược trên landing page sẽ tự động đếm từng giây đến thời điểm này.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                  Dòng chữ ngày cưới hiển thị trên thiệp
                </label>
                <input
                  type="text"
                  value={formData.weddingDateFormatted}
                  onChange={(e) =>
                    setFormData({ ...formData, weddingDateFormatted: e.target.value })
                  }
                  placeholder="VD: Thứ Bảy, 28 Tháng 11, 2026"
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                  Ngày Âm Lịch
                </label>
                <input
                  type="text"
                  value={formData.lunarDateFormatted}
                  onChange={(e) =>
                    setFormData({ ...formData, lunarDateFormatted: e.target.value })
                  }
                  placeholder="VD: Tức ngày 20 tháng 10 năm Bính Ngọ"
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                  Lời trích dẫn / Châm ngôn tình yêu (Quote)
                </label>
                <textarea
                  rows={2}
                  value={formData.heroQuote}
                  onChange={(e) =>
                    setFormData({ ...formData, heroQuote: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* TAB: VENUES & MAP */}
          {activeTab === 'venues' && (
            <div className="space-y-6">
              {/* Guidance card */}
              <div className="p-4 rounded-2xl bg-[#faf5ee] border border-[#eedecf] flex items-start gap-3">
                <div className="p-2 rounded-xl bg-white text-[#9b683e] shadow-sm shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4 text-rose-500" />
                </div>
                <div className="text-xs text-stone-600 space-y-1">
                  <h4 className="font-semibold text-stone-800 text-sm">
                    Định Vị & Chỉnh Chính Xác Vị Trí Bản Đồ
                  </h4>
                  <p className="font-light leading-relaxed">
                    Bạn có thể điền địa chỉ, nhập <strong>tọa độ GPS chính xác</strong> (ví dụ: <code className="bg-white px-1.5 py-0.5 rounded border border-stone-300 text-stone-800">10.778786, 106.698345</code>), hoặc dán link nhúng Google Maps iframe. Hệ thống sẽ tự động ghim đúng vị trí trên bản đồ thiệp cưới để khách mời dễ dàng chỉ đường.
                  </p>
                </div>
              </div>

              {formData.events.map((event, idx) => {
                const previewSrc =
                  event.mapEmbedUrl && event.mapEmbedUrl.trim() !== ''
                    ? event.mapEmbedUrl
                    : `https://maps.google.com/maps?q=${encodeURIComponent(
                        event.mapQuery || event.address || event.venueName
                      )}&t=&z=16&ie=UTF8&iwloc=&output=embed`;

                return (
                  <div
                    key={event.id}
                    className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-stone-100">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#f4ece3] text-[#915e34] font-bold text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <h4 className="font-semibold text-stone-800 text-sm">
                          {event.title}
                        </h4>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-stone-100 text-stone-700">
                          {event.side === 'groom'
                            ? 'Nhà Trai'
                            : event.side === 'bride'
                            ? 'Nhà Gái'
                            : 'Lễ Cưới'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                          Tên sự kiện
                        </label>
                        <input
                          type="text"
                          value={event.title}
                          onChange={(e) => {
                            const updated = [...formData.events];
                            updated[idx].title = e.target.value;
                            setFormData({ ...formData, events: updated });
                          }}
                          className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 focus:outline-none focus:bg-white text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                          Thời gian tổ chức
                        </label>
                        <input
                          type="text"
                          value={event.time}
                          onChange={(e) => {
                            const updated = [...formData.events];
                            updated[idx].time = e.target.value;
                            setFormData({ ...formData, events: updated });
                          }}
                          placeholder="VD: 09:00 AM"
                          className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 focus:outline-none focus:bg-white text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                          Tên địa điểm / Hội trường / Tư gia
                        </label>
                        <input
                          type="text"
                          value={event.venueName}
                          onChange={(e) => {
                            const updated = [...formData.events];
                            updated[idx].venueName = e.target.value;
                            setFormData({ ...formData, events: updated });
                          }}
                          className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 focus:outline-none focus:bg-white text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                          Địa chỉ chi tiết
                        </label>
                        <input
                          type="text"
                          value={event.address}
                          onChange={(e) => {
                            const updated = [...formData.events];
                            updated[idx].address = e.target.value;
                            setFormData({ ...formData, events: updated });
                          }}
                          className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 focus:outline-none focus:bg-white text-xs"
                        />
                      </div>
                    </div>

                    {/* Precise Map Location Configuration */}
                    <div className="pt-3 border-t border-stone-100 space-y-3 bg-[#fbf9f6] p-4 rounded-xl border">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-[#8b5a36]">
                        <Compass className="w-4 h-4 text-[#8b5a36]" />
                        <span>Chỉnh vị trí chính xác trên Google Maps</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-medium text-stone-600 mb-1">
                            Tọa độ GPS (Vĩ độ, Kinh độ) hoặc Tên địa điểm chính xác
                          </label>
                          <input
                            type="text"
                            value={event.mapQuery || ''}
                            onChange={(e) => {
                              const updated = [...formData.events];
                              updated[idx].mapQuery = e.target.value;
                              setFormData({ ...formData, events: updated });
                            }}
                            placeholder="VD: 10.778786, 106.698345 hoặc Diamond Place 15A Hồ Văn Huê"
                            className="w-full px-3 py-1.5 rounded-lg bg-white border border-stone-300 text-xs focus:outline-none"
                          />
                          <p className="text-[10px] text-stone-400 mt-1">
                            Mẹo: Có thể sao chép trực tiếp cặp số tọa độ từ Google Maps và dán vào đây.
                          </p>
                        </div>

                        <div>
                          <label className="block text-[10px] font-medium text-stone-600 mb-1">
                            Link nhúng Google Maps (Embed URL hoặc mã iframe)
                          </label>
                          <input
                            type="text"
                            value={event.mapEmbedUrl || ''}
                            onChange={(e) => handleMapEmbedUrlChange(idx, e.target.value)}
                            placeholder="https://www.google.com/maps/embed?... hoặc <iframe...>"
                            className="w-full px-3 py-1.5 rounded-lg bg-white border border-stone-300 text-xs focus:outline-none"
                          />
                          <p className="text-[10px] text-stone-400 mt-1">
                            Có thể dán mã nhúng iframe trực tiếp từ mục &ldquo;Chia sẻ bản đồ&rdquo; của Google Maps.
                          </p>
                        </div>
                      </div>

                      {/* Map Action Buttons */}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleAutoGenerateMapUrl(idx)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#9e673a] hover:bg-[#83522b] text-white text-xs font-semibold shadow-sm transition-all"
                        >
                          <Compass className="w-3.5 h-3.5" />
                          <span>Tự động định vị từ địa chỉ / tọa độ</span>
                        </button>

                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                            event.mapQuery || event.address || event.venueName
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-stone-50 border border-stone-300 text-stone-700 text-xs font-medium transition-all"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-stone-500" />
                          <span>Mở xem trên Google Maps</span>
                        </a>
                      </div>

                      {/* Live Mini Preview */}
                      <div className="pt-2">
                        <span className="block text-[10px] font-medium text-stone-500 mb-1.5">
                          Xem trước vị trí ghim bản đồ hiển thị trên thiệp:
                        </span>
                        <div className="w-full h-44 rounded-xl overflow-hidden border border-stone-200 bg-stone-100 shadow-inner">
                          <iframe
                            title={`Xem trước bản đồ ${event.venueName}`}
                            src={previewSrc}
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            className="w-full h-full"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB: WEDDING ALBUM GALLERY */}
          {activeTab === 'gallery' && (
            <div className="space-y-6">
              {/* Header Info & Action */}
              <div className="p-4 rounded-2xl bg-[#faf5ee] border border-[#ebdccb] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Images className="w-4 h-4 text-[#9b683e]" />
                    <h4 className="font-semibold text-stone-800 text-sm uppercase tracking-wide">
                      Quản Lý & Tải Album Ảnh Cưới
                    </h4>
                  </div>
                  <p className="text-xs text-stone-500 mt-1">
                    Đang có <span className="font-bold text-[#9b683e]">{formData.gallery.length}</span> bức ảnh hiển thị trên slide trượt và album lưới của thiệp cưới.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRestoreDefaultGallery}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-stone-50 border border-[#dfcebc] text-stone-700 text-xs font-medium shadow-sm transition-all shrink-0 self-start sm:self-auto"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
                  <span>Khôi phục ảnh mẫu</span>
                </button>
              </div>

              {/* Upload New Photos Section */}
              <div className="p-4 rounded-2xl bg-white border-2 border-dashed border-[#e2d2c1] space-y-4">
                <div className="text-center py-2">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-[#f7efe5] text-[#9b683e] flex items-center justify-center mb-2">
                    <Upload className="w-6 h-6" />
                  </div>
                  <h5 className="font-semibold text-stone-800 text-sm">
                    Tải ảnh cưới mới lên album
                  </h5>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Hỗ trợ tệp PNG, JPG, JPEG, WEBP. Bạn có thể chọn cùng lúc nhiều ảnh từ máy tính hoặc điện thoại.
                  </p>
                  <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 mt-3 rounded-xl bg-[#a06a3e] hover:bg-[#88572f] text-white text-xs font-semibold shadow-md transition-all">
                    <Upload className="w-4 h-4" />
                    <span>Chọn tệp ảnh từ máy tính / điện thoại</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleAlbumMultipleUpload}
                    />
                  </label>
                </div>

                {/* Or add by URL */}
                <div className="pt-3 border-t border-stone-100">
                  <span className="block text-[11px] font-semibold text-stone-600 mb-2 uppercase tracking-wider">
                    Hoặc thêm ảnh nhanh qua đường liên kết (URL):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                    <div className="sm:col-span-5">
                      <input
                        type="text"
                        placeholder="Dán link ảnh (https://...)"
                        value={newPhotoUrl}
                        onChange={(e) => setNewPhotoUrl(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 text-xs focus:outline-none focus:bg-white"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <input
                        type="text"
                        placeholder="Tiêu đề ảnh (tùy chọn)"
                        value={newPhotoTitle}
                        onChange={(e) => setNewPhotoTitle(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 text-xs focus:outline-none focus:bg-white"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <input
                        type="text"
                        placeholder="Chú thích (tùy chọn)"
                        value={newPhotoCaption}
                        onChange={(e) => setNewPhotoCaption(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 text-xs focus:outline-none focus:bg-white"
                      />
                    </div>
                    <div className="sm:col-span-1">
                      <button
                        type="button"
                        onClick={handleAddPhotoByUrl}
                        disabled={!newPhotoUrl.trim()}
                        className="w-full h-full min-h-[36px] flex items-center justify-center rounded-xl bg-stone-800 hover:bg-stone-900 disabled:opacity-40 text-white text-xs font-semibold shadow-sm transition-all"
                        title="Thêm ảnh này vào album"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Photos List Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="font-semibold text-stone-800 text-xs uppercase tracking-wider">
                    Danh Sách Ảnh Trong Album ({formData.gallery.length} ảnh)
                  </h5>
                  <span className="text-[11px] text-stone-400">
                    Bấm mũi tên để đổi thứ tự ảnh hoặc bấm nút thùng rác để xóa
                  </span>
                </div>

                {formData.gallery.length === 0 ? (
                  <div className="p-8 text-center bg-stone-50 rounded-2xl border border-dashed border-stone-300 text-stone-400 text-xs">
                    Chưa có ảnh nào trong album. Hãy bấm chọn tệp ở trên để tải ảnh lên!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
                    {formData.gallery.map((photo, index) => (
                      <div
                        key={photo.id}
                        className="p-3 rounded-2xl bg-stone-50 hover:bg-stone-100/80 border border-stone-200 transition-colors flex gap-3 relative group"
                      >
                        {/* Thumbnail */}
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-stone-200 border border-stone-300 shrink-0 relative">
                          <img
                            src={photo.url}
                            alt={photo.title}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-black/60 text-white font-mono text-[10px] font-bold">
                            #{index + 1}
                          </span>
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0 space-y-2">
                          <div>
                            <label className="block text-[10px] font-medium text-stone-500 mb-0.5">
                              Tiêu đề ảnh
                            </label>
                            <input
                              type="text"
                              value={photo.title}
                              onChange={(e) => {
                                const updated = [...formData.gallery];
                                updated[index] = { ...updated[index], title: e.target.value };
                                setFormData({ ...formData, gallery: updated });
                              }}
                              className="w-full px-2.5 py-1 rounded-lg bg-white border border-stone-300 text-xs focus:outline-none"
                              placeholder="Tiêu đề ảnh..."
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-medium text-stone-500 mb-0.5">
                              Chú thích
                            </label>
                            <input
                              type="text"
                              value={photo.caption || ''}
                              onChange={(e) => {
                                const updated = [...formData.gallery];
                                updated[index] = { ...updated[index], caption: e.target.value };
                                setFormData({ ...formData, gallery: updated });
                              }}
                              className="w-full px-2.5 py-1 rounded-lg bg-white border border-stone-300 text-xs focus:outline-none"
                              placeholder="Chú thích thêm..."
                            />
                          </div>
                        </div>

                        {/* Order & Delete Actions */}
                        <div className="flex flex-col justify-between items-center shrink-0 pl-1 border-l border-stone-200">
                          <div className="flex flex-col gap-1">
                            <button
                              type="button"
                              onClick={() => handleMovePhoto(index, 'up')}
                              disabled={index === 0}
                              className="p-1 rounded-md text-stone-500 hover:text-stone-800 hover:bg-stone-200 disabled:opacity-20 transition-colors"
                              title="Chuyển lên trước"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMovePhoto(index, 'down')}
                              disabled={index === formData.gallery.length - 1}
                              className="p-1 rounded-md text-stone-500 hover:text-stone-800 hover:bg-stone-200 disabled:opacity-20 transition-colors"
                              title="Chuyển xuống sau"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(photo.id)}
                            className="p-1 rounded-md text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Xóa ảnh này khỏi album"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: BANK ACCOUNTS & QR */}
          {activeTab === 'banks' && (
            <div className="space-y-6">
              {/* Groom's Bank */}
              <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-blue-100">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <h4 className="font-semibold text-blue-900 text-xs uppercase tracking-wider">
                    Tài Khoản Mừng Cưới Nhà Trai
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-medium text-stone-600 mb-1">Ngân hàng</label>
                    <select
                      value={formData.bankAccounts.groom.bankId}
                      onChange={(e) => {
                        const selectedBank = POPULAR_BANKS.find((b) => b.id === e.target.value);
                        setFormData({
                          ...formData,
                          bankAccounts: {
                            ...formData.bankAccounts,
                            groom: {
                              ...formData.bankAccounts.groom,
                              bankId: e.target.value,
                              bankName: selectedBank?.name || e.target.value,
                            },
                          },
                        });
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs"
                    >
                      {POPULAR_BANKS.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-stone-600 mb-1">Số tài khoản</label>
                    <input
                      type="text"
                      value={formData.bankAccounts.groom.accountNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bankAccounts: {
                            ...formData.bankAccounts,
                            groom: {
                              ...formData.bankAccounts.groom,
                              accountNumber: e.target.value,
                            },
                          },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-stone-600 mb-1">Tên chủ tài khoản (In hoa)</label>
                    <input
                      type="text"
                      value={formData.bankAccounts.groom.accountHolder}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bankAccounts: {
                            ...formData.bankAccounts,
                            groom: {
                              ...formData.bankAccounts.groom,
                              accountHolder: e.target.value.toUpperCase(),
                            },
                          },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 uppercase text-xs"
                    />
                  </div>
                </div>

                {/* QR Code Upload / Customization for Groom */}
                <div className="pt-3 border-t border-blue-100">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    {/* Live Preview of Groom QR */}
                    <div className="w-20 h-20 bg-white p-1 rounded-xl border border-blue-200 shadow-sm flex items-center justify-center shrink-0">
                      <img
                        src={
                          formData.bankAccounts.groom.customQrUrl &&
                          formData.bankAccounts.groom.customQrUrl.trim() !== ''
                            ? formData.bankAccounts.groom.customQrUrl
                            : getVietQrUrl(
                                formData.bankAccounts.groom.bankId,
                                formData.bankAccounts.groom.accountNumber,
                                formData.bankAccounts.groom.accountHolder,
                                0,
                                `Mung cuoi ${formData.groom.name}`
                              )
                        }
                        alt="QR Nhà Trai"
                        className="w-full h-full object-contain rounded-lg"
                      />
                    </div>
                    <div className="flex-1 space-y-1.5 w-full">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-semibold text-blue-900 flex items-center gap-1.5">
                          <QrCode className="w-3.5 h-3.5 text-blue-600" />
                          <span>Ảnh Mã QR Tài Khoản Nhà Trai</span>
                        </label>
                        {formData.bankAccounts.groom.customQrUrl ? (
                          <button
                            type="button"
                            onClick={() =>
                              setFormData({
                                ...formData,
                                bankAccounts: {
                                  ...formData.bankAccounts,
                                  groom: {
                                    ...formData.bankAccounts.groom,
                                    customQrUrl: '',
                                  },
                                },
                              })
                            }
                            className="text-[10px] text-rose-600 hover:text-rose-700 underline font-medium"
                          >
                            Xóa ảnh tự tải (Dùng lại VietQR)
                          </button>
                        ) : (
                          <span className="text-[10px] text-emerald-700 font-medium">
                            ✓ Đang tạo mã VietQR tự động
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Dán link ảnh mã QR nếu có..."
                          value={formData.bankAccounts.groom.customQrUrl || ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              bankAccounts: {
                                ...formData.bankAccounts,
                                groom: {
                                  ...formData.bankAccounts.groom,
                                  customQrUrl: e.target.value,
                                },
                              },
                            })
                          }
                          className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-stone-300 text-xs focus:outline-none"
                        />
                        <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-sm shrink-0 transition-colors">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Tải ảnh QR</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              handleFileUpload(e, (url) =>
                                setFormData({
                                  ...formData,
                                  bankAccounts: {
                                    ...formData.bankAccounts,
                                    groom: {
                                      ...formData.bankAccounts.groom,
                                      customQrUrl: url,
                                    },
                                  },
                                })
                              )
                            }
                          />
                        </label>
                      </div>
                      <p className="text-[10px] text-stone-500">
                        Tải lên ảnh mã QR chụp từ ứng dụng ngân hàng của chú rể hoặc để trống để hệ thống tự động sinh mã VietQR NAPAS 24/7.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bride's Bank */}
              <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-rose-100">
                  <CreditCard className="w-4 h-4 text-rose-600" />
                  <h4 className="font-semibold text-rose-900 text-xs uppercase tracking-wider">
                    Tài Khoản Mừng Cưới Nhà Gái
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-medium text-stone-600 mb-1">Ngân hàng</label>
                    <select
                      value={formData.bankAccounts.bride.bankId}
                      onChange={(e) => {
                        const selectedBank = POPULAR_BANKS.find((b) => b.id === e.target.value);
                        setFormData({
                          ...formData,
                          bankAccounts: {
                            ...formData.bankAccounts,
                            bride: {
                              ...formData.bankAccounts.bride,
                              bankId: e.target.value,
                              bankName: selectedBank?.name || e.target.value,
                            },
                          },
                        });
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs"
                    >
                      {POPULAR_BANKS.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-stone-600 mb-1">Số tài khoản</label>
                    <input
                      type="text"
                      value={formData.bankAccounts.bride.accountNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bankAccounts: {
                            ...formData.bankAccounts,
                            bride: {
                              ...formData.bankAccounts.bride,
                              accountNumber: e.target.value,
                            },
                          },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-stone-600 mb-1">Tên chủ tài khoản (In hoa)</label>
                    <input
                      type="text"
                      value={formData.bankAccounts.bride.accountHolder}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bankAccounts: {
                            ...formData.bankAccounts,
                            bride: {
                              ...formData.bankAccounts.bride,
                              accountHolder: e.target.value.toUpperCase(),
                            },
                          },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 uppercase text-xs"
                    />
                  </div>
                </div>

                {/* QR Code Upload / Customization for Bride */}
                <div className="pt-3 border-t border-rose-100">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    {/* Live Preview of Bride QR */}
                    <div className="w-20 h-20 bg-white p-1 rounded-xl border border-rose-200 shadow-sm flex items-center justify-center shrink-0">
                      <img
                        src={
                          formData.bankAccounts.bride.customQrUrl &&
                          formData.bankAccounts.bride.customQrUrl.trim() !== ''
                            ? formData.bankAccounts.bride.customQrUrl
                            : getVietQrUrl(
                                formData.bankAccounts.bride.bankId,
                                formData.bankAccounts.bride.accountNumber,
                                formData.bankAccounts.bride.accountHolder,
                                0,
                                `Mung cuoi ${formData.bride.name}`
                              )
                        }
                        alt="QR Nhà Gái"
                        className="w-full h-full object-contain rounded-lg"
                      />
                    </div>
                    <div className="flex-1 space-y-1.5 w-full">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-semibold text-rose-900 flex items-center gap-1.5">
                          <QrCode className="w-3.5 h-3.5 text-rose-600" />
                          <span>Ảnh Mã QR Tài Khoản Nhà Gái</span>
                        </label>
                        {formData.bankAccounts.bride.customQrUrl ? (
                          <button
                            type="button"
                            onClick={() =>
                              setFormData({
                                ...formData,
                                bankAccounts: {
                                  ...formData.bankAccounts,
                                  bride: {
                                    ...formData.bankAccounts.bride,
                                    customQrUrl: '',
                                  },
                                },
                              })
                            }
                            className="text-[10px] text-rose-600 hover:text-rose-700 underline font-medium"
                          >
                            Xóa ảnh tự tải (Dùng lại VietQR)
                          </button>
                        ) : (
                          <span className="text-[10px] text-emerald-700 font-medium">
                            ✓ Đang tạo mã VietQR tự động
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Dán link ảnh mã QR nếu có..."
                          value={formData.bankAccounts.bride.customQrUrl || ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              bankAccounts: {
                                ...formData.bankAccounts,
                                bride: {
                                  ...formData.bankAccounts.bride,
                                  customQrUrl: e.target.value,
                                },
                              },
                            })
                          }
                          className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-stone-300 text-xs focus:outline-none"
                        />
                        <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium shadow-sm shrink-0 transition-colors">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Tải ảnh QR</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              handleFileUpload(e, (url) =>
                                setFormData({
                                  ...formData,
                                  bankAccounts: {
                                    ...formData.bankAccounts,
                                    bride: {
                                      ...formData.bankAccounts.bride,
                                      customQrUrl: url,
                                    },
                                  },
                                })
                              )
                            }
                          />
                        </label>
                      </div>
                      <p className="text-[10px] text-stone-500">
                        Tải lên ảnh mã QR chụp từ ứng dụng ngân hàng của cô dâu hoặc để trống để hệ thống tự động sinh mã VietQR NAPAS 24/7.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: PHOTOS & MUSIC */}
          {activeTab === 'photos' && (
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                  Ảnh bìa chính (Hero Banner Background)
                </label>
                <div className="flex items-center gap-3">
                  <img
                    src={formData.coverImage}
                    alt="Cover preview"
                    className="w-16 h-12 rounded-lg object-cover border border-stone-300"
                  />
                  <input
                    type="text"
                    value={formData.coverImage}
                    onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                    className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-stone-300 text-xs focus:outline-none"
                    placeholder="Nhập đường link ảnh..."
                  />
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-300 text-xs font-medium text-stone-700 shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Tải tệp ảnh</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        handleFileUpload(e, (url) =>
                          setFormData({ ...formData, coverImage: url })
                        )
                      }
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                  Tên bài hát và đường dẫn nhạc nền (.mp3)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Tên bài hát"
                    value={formData.audioTrack.title}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        audioTrack: { ...formData.audioTrack, title: e.target.value },
                      })
                    }
                    className="px-3 py-2 rounded-xl bg-white border border-stone-300"
                  />
                  <input
                    type="text"
                    placeholder="Link tệp âm thanh (mp3)"
                    value={formData.audioTrack.src}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        audioTrack: { ...formData.audioTrack, src: e.target.value },
                      })
                    }
                    className="px-3 py-2 rounded-xl bg-white border border-stone-300"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Footer Save Actions */}
          <div className="pt-4 border-t border-stone-200 flex items-center justify-between">
            {saveSuccess ? (
              <span className="text-emerald-700 font-semibold text-xs">
                ✓ Đã lưu thay đổi thành công!
              </span>
            ) : (
              <span className="text-stone-400 text-xs">
                Mọi thông tin sẽ được cập nhật trực tiếp trên landing page.
              </span>
            )}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 text-xs font-medium"
              >
                Đóng
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#a06a3e] hover:bg-[#8b5a33] text-white text-xs font-semibold shadow-md flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Lưu Cập Nhật</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
