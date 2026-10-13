import React, { useState, useEffect } from 'react';
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
  Clock,
  Pencil,
  Lock,
  Loader2,
  AlertCircle,
  Camera,
  Users,
} from 'lucide-react';
import { WeddingData, GalleryItem, WeddingEvent } from '../types';
import { POPULAR_BANKS, INITIAL_WEDDING_DATA } from '../data/defaultWeddingData';
import { getVietQrUrl, compressImageFile } from '../utils/weddingHelpers';

interface EditWeddingModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: WeddingData;
  onSave: (updatedData: WeddingData) => void | Promise<void>;
  onReset: () => void;
  initialTab?: 'couple' | 'gallery' | 'banks' | 'datetime' | 'venues' | 'photos';
}

export const EditWeddingModal: React.FC<EditWeddingModalProps> = ({
  isOpen,
  onClose,
  data,
  onSave,
  onReset,
  initialTab,
}) => {
  const [formData, setFormData] = useState<WeddingData>(data);
  const [activeTab, setActiveTab] = useState<
    'couple' | 'gallery' | 'banks' | 'datetime' | 'venues' | 'photos'
  >(initialTab || 'couple');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isCompressingPhotos, setIsCompressingPhotos] = useState(false);

  // Only initialize formData when modal transitions from closed to open
  // This prevents background snapshot updates from resetting the user's in-progress changes!
  const prevIsOpenRef = React.useRef(false);
  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      setFormData(data);
      setSaveError(null);
      if (initialTab) {
        setActiveTab(initialTab);
      }
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, initialTab, data]);

  // New photo input state
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoTitle, setNewPhotoTitle] = useState('');
  const [newPhotoCaption, setNewPhotoCaption] = useState('');

  if (!isOpen) return null;

  // Helper to handle local file upload with auto-compression to ensure fast Firestore sync
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    onSuccess: (base64Url: string) => void,
    maxDim: number = 800
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageFile(file, maxDim, 0.75);
      onSuccess(compressed);
    } catch (err) {
      console.error('Failed to compress image:', err);
    }
  };

  // Multiple album files upload handler with auto-compression
  const handleAlbumMultipleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsCompressingPhotos(true);
    const promises: Promise<string>[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      promises.push(compressImageFile(file, 750, 0.65));
    }

    try {
      const urls = await Promise.all(promises);
      const validUrls = urls.filter((u) => typeof u === 'string' && u.trim().length > 0);
      if (validUrls.length === 0) {
        alert('Không thể đọc dữ liệu tệp ảnh đã chọn. Vui lòng thử lại với tệp JPG hoặc PNG khác.');
        return;
      }

      setFormData((prev) => {
        // If current gallery only contains sample mockups, replace them completely with the newly uploaded photos!
        const isAllMockups =
          prev.gallery.length === 0 ||
          prev.gallery.every(
            (p) =>
              p.id.startsWith('g-') ||
              p.id.startsWith('photo_') ||
              p.url.includes('images.unsplash.com')
          );
        const baseGallery = isAllMockups ? [] : prev.gallery;
        const newItems: GalleryItem[] = validUrls.map((url, i) => ({
          id: `album_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 7)}`,
          url,
          title: `Khoảnh khắc đẹp ${baseGallery.length + i + 1}`,
          caption: 'Hạnh phúc ngày chung đôi',
        }));

        return {
          ...prev,
          gallery: [...baseGallery, ...newItems],
        };
      });
    } catch (err) {
      console.error('Failed to process album photos:', err);
      alert('Có lỗi khi xử lý một số tệp ảnh. Vui lòng thử lại!');
    } finally {
      setIsCompressingPhotos(false);
      e.target.value = '';
    }
  };

  // Quick helper to clear mockup photos
  const handleClearMockupPhotos = () => {
    setFormData((prev) => ({
      ...prev,
      gallery: prev.gallery.filter(
        (p) =>
          !p.id.startsWith('g-') &&
          !p.id.startsWith('photo_') &&
          !p.url.includes('images.unsplash.com')
      ),
    }));
  };

  // Quick helper to clear all photos
  const handleClearAllPhotos = () => {
    if (window.confirm('Bạn có chắc muốn xóa tất cả ảnh trong album để tải bộ ảnh mới?')) {
      setFormData((prev) => ({
        ...prev,
        gallery: [],
      }));
    }
  };

  const handleAddPhotoByUrl = () => {
    if (!newPhotoUrl.trim()) return;
    const newItem: GalleryItem = {
      id: `album_${Date.now()}`,
      url: newPhotoUrl.trim(),
      title: newPhotoTitle.trim() || `Ảnh cưới ${formData.gallery.length + 1}`,
      caption: newPhotoCaption.trim() || undefined,
    };
    setFormData((prev) => {
      const isAllMockups =
        prev.gallery.length > 0 &&
        prev.gallery.every(
          (p) =>
            p.id.startsWith('g-') ||
            p.id.startsWith('photo_') ||
            p.url.includes('images.unsplash.com')
        );
      const baseGallery = isAllMockups ? [] : prev.gallery;
      return {
        ...prev,
        gallery: [...baseGallery, newItem],
      };
    });
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

  const formatDateToDisplay = (isoDate: string): string => {
    if (!isoDate) return '';
    const parts = isoDate.split('-');
    if (parts.length === 3) {
      const [year, month, day] = parts;
      return `${day} / ${month} / ${year}`;
    }
    return isoDate;
  };

  const parseDisplayDateToIso = (text: string): string => {
    if (!text) return '';
    const match = text.match(/(\d{1,2})\s*[/.-]\s*(\d{1,2})\s*[/.-]\s*(\d{4})/);
    if (match) {
      const day = match[1].padStart(2, '0');
      const month = match[2].padStart(2, '0');
      const year = match[3];
      return `${year}-${month}-${day}`;
    }
    const matchIso = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (matchIso) {
      return text;
    }
    return '';
  };

  const handleUpdateEventField = (
    index: number,
    field: keyof WeddingEvent,
    value: any
  ) => {
    const updated = [...formData.events];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setFormData((prev) => ({
      ...prev,
      events: updated,
    }));
  };

  const handleAddEvent = () => {
    const newEvent: WeddingEvent = {
      id: `ceremony_${Date.now()}`,
      title: 'Tiệc Cưới Mừng (Nhà Hàng)',
      side: 'both',
      time: '18:00 PM',
      dateText: formData.weddingDateFormatted || '28 / 11 / 2026',
      venueName: 'Trung Tâm Hội Nghị Tiệc Cưới',
      address: 'TP. Hồ Chí Minh',
      mapQuery: 'TP. Hồ Chí Minh',
      mapEmbedUrl: '',
    };
    setFormData((prev) => ({
      ...prev,
      events: [...prev.events, newEvent],
    }));
  };

  const handleDeleteEvent = (index: number) => {
    if (formData.events.length <= 1) {
      alert('Phải giữ lại ít nhất 1 sự kiện / buổi lễ trong lịch trình!');
      return;
    }
    const event = formData.events[index];
    if (window.confirm(`Bạn có chắc chắn muốn xóa "${event.title}" khỏi lịch trình?`)) {
      setFormData((prev) => ({
        ...prev,
        events: prev.events.filter((_, idx) => idx !== index),
      }));
    }
  };

  const handleMoveEvent = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= formData.events.length) return;
    const newEvents = [...formData.events];
    const temp = newEvents[index];
    newEvents[index] = newEvents[targetIndex];
    newEvents[targetIndex] = temp;
    setFormData((prev) => ({
      ...prev,
      events: newEvents,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);
    try {
      await onSave(formData);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 1000);
    } catch (err) {
      console.error('Failed to save wedding data:', err);
      setSaveError(err instanceof Error ? err.message : 'Lỗi khi lưu dữ liệu lên Firebase');
    } finally {
      setIsSaving(false);
    }
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
            { id: 'venues', label: 'Lịch Trình & Địa Điểm', icon: MapPin },
            { id: 'datetime', label: 'Ngày Giờ & Đếm Ngược', icon: Calendar },
            { id: 'gallery', label: 'Album Ảnh Cưới', icon: Images },
            { id: 'banks', label: 'Tài Khoản & Ảnh QR', icon: CreditCard },
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

                {/* Groom Avatar Card */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#ebdccb] shadow-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-stone-800 flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-[#9b663b]" />
                      <span>Ảnh Chân Dung Chú Rể (Bảo Trung)</span>
                    </label>
                    {formData.groom.avatar?.includes('images.unsplash.com') ? (
                      <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-medium">
                        Ảnh mẫu demo (Chưa thay)
                      </span>
                    ) : (
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
                        ✓ Ảnh của bạn
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                    <div className="relative group shrink-0">
                      <img
                        src={formData.groom.avatar}
                        alt="Groom avatar"
                        className="w-20 h-20 rounded-full object-cover border-3 border-[#a06a3e]/30 shadow-md"
                      />
                      <label className="cursor-pointer absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-medium">
                        <Upload className="w-4 h-4 mb-0.5" />
                        <span>Đổi ảnh</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            handleFileUpload(
                              e,
                              (url) =>
                                setFormData({
                                  ...formData,
                                  groom: { ...formData.groom, avatar: url },
                                }),
                              600
                            )
                          }
                        />
                      </label>
                    </div>

                    <div className="flex-1 space-y-2 w-full">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <label className="cursor-pointer inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#a06a3e] hover:bg-[#88572f] text-white text-xs font-semibold shadow-xs shrink-0 transition-colors">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Tải ảnh từ máy / điện thoại</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              handleFileUpload(
                                e,
                                (url) =>
                                  setFormData({
                                    ...formData,
                                    groom: { ...formData.groom, avatar: url },
                                  }),
                                600
                              )
                            }
                          />
                        </label>
                        <input
                          type="text"
                          placeholder="Hoặc dán link ảnh online (https://...)"
                          value={formData.groom.avatar}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              groom: { ...formData.groom, avatar: e.target.value },
                            })
                          }
                          className="flex-1 px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:bg-white focus:outline-none"
                        />
                      </div>
                      <p className="text-[11px] text-stone-500">
                        Hỗ trợ ảnh chụp điện thoại (JPG, PNG). Ảnh tự động tối ưu tỉ lệ tròn sắc nét và đồng bộ lên đám mây.
                      </p>
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

                {/* Bride Avatar Card */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-rose-100 shadow-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-stone-800 flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-rose-600" />
                      <span>Ảnh Chân Dung Cô Dâu (Lê Quỳnh)</span>
                    </label>
                    {formData.bride.avatar?.includes('images.unsplash.com') ? (
                      <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-medium">
                        Ảnh mẫu demo (Chưa thay)
                      </span>
                    ) : (
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
                        ✓ Ảnh của bạn
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                    <div className="relative group shrink-0">
                      <img
                        src={formData.bride.avatar}
                        alt="Bride avatar"
                        className="w-20 h-20 rounded-full object-cover border-3 border-rose-300 shadow-md"
                      />
                      <label className="cursor-pointer absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-medium">
                        <Upload className="w-4 h-4 mb-0.5" />
                        <span>Đổi ảnh</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            handleFileUpload(
                              e,
                              (url) =>
                                setFormData({
                                  ...formData,
                                  bride: { ...formData.bride, avatar: url },
                                }),
                              600
                            )
                          }
                        />
                      </label>
                    </div>

                    <div className="flex-1 space-y-2 w-full">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <label className="cursor-pointer inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs shrink-0 transition-colors">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Tải ảnh từ máy / điện thoại</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              handleFileUpload(
                                e,
                                (url) =>
                                  setFormData({
                                    ...formData,
                                    bride: { ...formData.bride, avatar: url },
                                  }),
                                600
                              )
                            }
                          />
                        </label>
                        <input
                          type="text"
                          placeholder="Hoặc dán link ảnh online (https://...)"
                          value={formData.bride.avatar}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              bride: { ...formData.bride, avatar: e.target.value },
                            })
                          }
                          className="flex-1 px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:bg-white focus:outline-none"
                        />
                      </div>
                      <p className="text-[11px] text-stone-500">
                        Hỗ trợ ảnh chụp điện thoại (JPG, PNG). Ảnh tự động tối ưu tỉ lệ tròn sắc nét và đồng bộ lên đám mây.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Admin PIN & Security Settings */}
                <div className="pt-4 border-t border-stone-200 mt-5">
                  <div className="flex items-center gap-2 mb-1.5 text-stone-800 font-semibold text-xs">
                    <Lock className="w-4 h-4 text-[#9b663b]" />
                    <span>Mã PIN Bảo Vệ Tùy Biến (Dành cho Cô Dâu & Chú Rể)</span>
                  </div>
                  <p className="text-[11px] text-stone-500 mb-2 leading-relaxed">
                    Mã PIN bảo mật giúp ngăn chặn khách mời vô tình hoặc tự ý sửa thông tin thiệp cưới của bạn. Mặc định là 2811.
                  </p>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      maxLength={10}
                      placeholder="Mã PIN (VD: 2811)"
                      value={formData.adminPin || '2811'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          adminPin: e.target.value.trim(),
                        })
                      }
                      className="w-36 px-3 py-2 rounded-xl bg-white border border-stone-300 font-mono text-center font-bold tracking-widest text-[#9b663b] focus:outline-none focus:ring-2 focus:ring-[#9b663b]/30"
                    />
                    <span className="text-[11px] text-stone-400">
                      Mặc định: <strong className="text-stone-600">2811</strong> (hoặc đặt ngày kỷ niệm tùy thích)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: DATETIME & COUNTDOWN */}
          {activeTab === 'datetime' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-[#faf5ee] border border-[#eedecf] flex items-start gap-3">
                <div className="p-2 rounded-xl bg-white text-[#9b683e] shadow-sm shrink-0 mt-0.5">
                  <Calendar className="w-4 h-4 text-[#9b683e]" />
                </div>
                <div className="text-xs text-stone-600 space-y-1">
                  <h4 className="font-semibold text-stone-800 text-sm">
                    Thời Gian Hôn Lễ & Đồng Hồ Đếm Ngược
                  </h4>
                  <p className="font-light leading-relaxed">
                    Cài đặt mốc đếm ngược trên đầu trang và tùy chỉnh ngày giờ cử hành chi tiết cho từng buổi lễ (Lễ Thành Hôn, Lễ Vu Quy).
                  </p>
                </div>
              </div>

              <div className="space-y-4 bg-white p-4 sm:p-5 rounded-2xl border border-stone-200">
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
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 focus:outline-none focus:bg-white text-xs sm:text-sm font-medium text-stone-800"
                  />
                  <p className="text-[10px] text-stone-400 mt-1">
                    Đồng hồ đếm ngược trên landing page sẽ tự động đếm từng giây đến thời điểm này.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 focus:outline-none focus:bg-white text-xs"
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
                      className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 focus:outline-none focus:bg-white text-xs"
                    />
                  </div>
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
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 focus:outline-none focus:bg-white text-xs"
                  />
                </div>
              </div>

              {/* Lịch trình các buổi lễ (Nhà Trai & Nhà Gái) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#fcfaf7] border border-[#e8ded2] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#eee2d3]">
                  <div>
                    <h4 className="font-semibold text-stone-800 text-sm flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-[#9b683e]" />
                      <span>Ngày Giờ Các Buổi Lễ Trong Lịch Trình (Nhà Trai, Nhà Gái)</span>
                    </h4>
                    <p className="text-[11px] text-stone-500">
                      Chỉnh sửa trực tiếp ngày & giờ cử hành cho từng bên
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('venues')}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#9b683e] hover:text-[#7f4f26] self-start sm:self-auto bg-white px-2.5 py-1 rounded-lg border border-[#e2d0bf] shadow-xs hover:shadow transition-all"
                  >
                    <span>Chỉnh chi tiết địa điểm & bản đồ</span>
                    <span>→</span>
                  </button>
                </div>

                <div className="space-y-3 pt-1">
                  {formData.events.map((event, idx) => (
                    <div
                      key={event.id}
                      className="p-3.5 rounded-xl bg-white border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              event.side === 'groom'
                                ? 'bg-blue-50 text-blue-700'
                                : event.side === 'bride'
                                ? 'bg-rose-50 text-rose-700'
                                : 'bg-amber-50 text-amber-800'
                            }`}
                          >
                            {event.side === 'groom'
                              ? 'Nhà Trai'
                              : event.side === 'bride'
                              ? 'Nhà Gái'
                              : 'Lễ Cưới'}
                          </span>
                          <span className="font-semibold text-stone-800 text-xs truncate">
                            {event.title}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 truncate">
                          {event.venueName} • {event.address}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div>
                          <label className="block text-[10px] font-medium text-stone-600 mb-0.5">
                            Ngày tổ chức
                          </label>
                          <input
                            type="text"
                            value={event.dateText || ''}
                            onChange={(e) =>
                              handleUpdateEventField(idx, 'dateText', e.target.value)
                            }
                            placeholder="28 / 11 / 2026"
                            className="px-2.5 py-1.5 text-xs rounded-lg border border-stone-300 w-32 bg-stone-50 focus:bg-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-medium text-stone-600 mb-0.5">
                            Giờ cử hành
                          </label>
                          <input
                            type="text"
                            value={event.time || ''}
                            onChange={(e) =>
                              handleUpdateEventField(idx, 'time', e.target.value)
                            }
                            placeholder="09:00 AM"
                            className="px-2.5 py-1.5 text-xs rounded-lg border border-stone-300 w-24 bg-stone-50 focus:bg-white focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: VENUES & MAP */}
          {activeTab === 'venues' && (
            <div className="space-y-6">
              {/* Guidance & Header */}
              <div className="p-4 rounded-2xl bg-[#faf5ee] border border-[#eedecf] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-white text-[#9b683e] shadow-sm shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4 text-rose-500" />
                  </div>
                  <div className="text-xs text-stone-600 space-y-1">
                    <h4 className="font-semibold text-stone-800 text-sm">
                      Lịch Trình Hôn Lễ, Ngày Giờ & Bản Đồ (Nhà Trai, Nhà Gái)
                    </h4>
                    <p className="font-light leading-relaxed">
                      Chỉnh sửa ngày giờ cử hành <strong>Lễ Thành Hôn</strong>, <strong>Lễ Vu Quy</strong>, bên tổ chức gia đình, địa chỉ và tọa độ dẫn đường Google Maps.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddEvent}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#9e673a] hover:bg-[#83522b] text-white text-xs font-semibold shadow-sm transition-all shrink-0 self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm buổi lễ mới</span>
                </button>
              </div>

              {formData.events.map((event, idx) => {
                const previewSrc =
                  event.mapEmbedUrl && event.mapEmbedUrl.trim() !== ''
                    ? event.mapEmbedUrl
                    : `https://maps.google.com/maps?q=${encodeURIComponent(
                        event.mapQuery || event.address || event.venueName
                      )}&t=&z=16&ie=UTF8&iwloc=&output=embed`;

                const isoDateVal = parseDisplayDateToIso(event.dateText || '');

                return (
                  <div
                    key={event.id}
                    className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-4"
                  >
                    {/* Event Card Header */}
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
                        <button
                          type="button"
                          onClick={() => handleMoveEvent(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1.5 rounded-lg border border-stone-200 text-stone-500 hover:text-stone-800 hover:bg-stone-50 disabled:opacity-30 disabled:hover:bg-transparent"
                          title="Di chuyển lên trên"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveEvent(idx, 'down')}
                          disabled={idx === formData.events.length - 1}
                          className="p-1.5 rounded-lg border border-stone-200 text-stone-500 hover:text-stone-800 hover:bg-stone-50 disabled:opacity-30 disabled:hover:bg-transparent"
                          title="Di chuyển xuống dưới"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        {formData.events.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteEvent(idx)}
                            className="p-1.5 rounded-lg border border-rose-200 text-rose-500 hover:bg-rose-50 transition-colors ml-1"
                            title="Xóa buổi lễ này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Basic Event Info: Title & Family Side */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                          Tên buổi lễ / Sự kiện *
                        </label>
                        <input
                          type="text"
                          value={event.title}
                          onChange={(e) =>
                            handleUpdateEventField(idx, 'title', e.target.value)
                          }
                          placeholder="VD: Lễ Thành Hôn (Nhà Trai) hoặc Lễ Vu Quy (Nhà Gái)"
                          className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 focus:outline-none focus:bg-white text-xs"
                        />
                        {/* Quick preset chips */}
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              handleUpdateEventField(idx, 'title', 'Lễ Thành Hôn (Nhà Trai)');
                              handleUpdateEventField(idx, 'side', 'groom');
                            }}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-600"
                          >
                            Lễ Thành Hôn
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              handleUpdateEventField(idx, 'title', 'Lễ Vu Quy (Nhà Gái)');
                              handleUpdateEventField(idx, 'side', 'bride');
                            }}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-600"
                          >
                            Lễ Vu Quy
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              handleUpdateEventField(idx, 'title', 'Lễ Đính Hôn (Ăn Hỏi)');
                            }}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-600"
                          >
                            Lễ Đính Hôn
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              handleUpdateEventField(idx, 'title', 'Tiệc Cưới Chung (Nhà Hàng)');
                              handleUpdateEventField(idx, 'side', 'both');
                            }}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-600"
                          >
                            Tiệc Cưới
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                          Bên tổ chức gia đình
                        </label>
                        <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                          <button
                            type="button"
                            onClick={() => handleUpdateEventField(idx, 'side', 'groom')}
                            className={`px-2 py-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                              event.side === 'groom'
                                ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-xs'
                                : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                            }`}
                          >
                            Nhà Trai
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateEventField(idx, 'side', 'bride')}
                            className={`px-2 py-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                              event.side === 'bride'
                                ? 'bg-rose-50 border-rose-500 text-rose-700 shadow-xs'
                                : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                            }`}
                          >
                            Nhà Gái
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateEventField(idx, 'side', 'both')}
                            className={`px-2 py-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                              event.side === 'both'
                                ? 'bg-amber-50 border-amber-500 text-amber-800 shadow-xs'
                                : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                            }`}
                          >
                            Cả Hai Bên
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Schedule Date & Time Row (Core User Request) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#faf7f3] border border-[#eee2d3]">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] font-semibold text-stone-800 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-[#9b683e]" />
                            <span>Ngày tổ chức hôn lễ *</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              const targetVal =
                                formData.weddingDateFormatted?.split(',')[1]?.trim() ||
                                formData.weddingDateFormatted ||
                                '28 / 11 / 2026';
                              handleUpdateEventField(idx, 'dateText', targetVal);
                            }}
                            className="text-[10px] text-[#9b683e] hover:underline"
                            title="Lấy theo ngày cưới chính đã nhập"
                          >
                            Lấy theo ngày cưới chính
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={event.dateText || ''}
                            onChange={(e) =>
                              handleUpdateEventField(idx, 'dateText', e.target.value)
                            }
                            placeholder="VD: 28 / 11 / 2026 hoặc 28 Tháng 11, 2026"
                            className="flex-1 px-3 py-2 rounded-xl bg-white border border-stone-300 focus:outline-none text-xs font-medium"
                          />
                          {/* Native Date Picker Helper */}
                          <div className="relative shrink-0" title="Chọn từ lịch">
                            <input
                              type="date"
                              value={isoDateVal}
                              onChange={(e) => {
                                if (e.target.value) {
                                  handleUpdateEventField(
                                    idx,
                                    'dateText',
                                    formatDateToDisplay(e.target.value)
                                  );
                                }
                              }}
                              className="w-9 h-9 opacity-0 absolute inset-0 cursor-pointer z-10"
                            />
                            <div className="w-9 h-9 rounded-xl bg-white border border-stone-300 flex items-center justify-center text-stone-600 hover:bg-stone-50 cursor-pointer shadow-xs">
                              <Calendar className="w-4 h-4 text-[#9b683e]" />
                            </div>
                          </div>
                        </div>
                        <p className="text-[10px] text-stone-400 mt-1">
                          Dòng chữ ngày tổ chức hiển thị trực tiếp trên thẻ lịch trình của sự kiện.
                        </p>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-stone-800 mb-1 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#9b683e]" />
                          <span>Giờ cử hành hôn lễ *</span>
                        </label>
                        <input
                          type="text"
                          value={event.time || ''}
                          onChange={(e) =>
                            handleUpdateEventField(idx, 'time', e.target.value)
                          }
                          placeholder="VD: 09:00 AM hoặc 11:30 AM"
                          className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 focus:outline-none text-xs font-medium"
                        />
                        {/* Quick Time Selection Chips */}
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {['07:00 AM', '07:30 AM', '08:00 AM', '09:00 AM', '11:00 AM', '11:30 AM', '17:30 PM', '18:00 PM'].map(
                            (timeVal) => (
                              <button
                                key={timeVal}
                                type="button"
                                onClick={() => handleUpdateEventField(idx, 'time', timeVal)}
                                className={`text-[10px] px-2 py-0.5 rounded-md transition-colors ${
                                  event.time === timeVal
                                    ? 'bg-[#9e673a] text-white font-semibold'
                                    : 'bg-white hover:bg-stone-100 text-stone-600 border border-stone-200'
                                }`}
                              >
                                {timeVal}
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Venue Name & Address */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                          Tên địa điểm / Hội trường / Tư gia
                        </label>
                        <input
                          type="text"
                          value={event.venueName}
                          onChange={(e) =>
                            handleUpdateEventField(idx, 'venueName', e.target.value)
                          }
                          placeholder="VD: Tư Gia Nhà Trai hoặc Khách Sạn Riverside"
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
                          onChange={(e) =>
                            handleUpdateEventField(idx, 'address', e.target.value)
                          }
                          placeholder="VD: Số 68 Đường Hoa Hồng, Phường Bến Nghé, Quận 1, TP. HCM"
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
                            onChange={(e) =>
                              handleUpdateEventField(idx, 'mapQuery', e.target.value)
                            }
                            placeholder="VD: 10.778786, 106.698345 hoặc Diamond Place 15A Hồ Văn Huê"
                            className="w-full px-3 py-1.5 rounded-lg bg-white border border-stone-300 text-xs focus:outline-none"
                          />
                          <p className="text-[10px] text-stone-400 mt-1">
                            Mẹo: Có thể dán trực tiếp tọa độ từ Google Maps hoặc tên tòa nhà cụ thể.
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

              {/* Add event button at bottom */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={handleAddEvent}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl border-2 border-dashed border-[#d9c4b1] hover:border-[#9e673a] bg-[#fcfaf7] hover:bg-[#faf4ec] text-[#8e5a32] text-xs font-semibold transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm Buổi Lễ Mới Vào Lịch Trình (Tiệc cưới, Lễ đính hôn...)</span>
                </button>
              </div>
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
                <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                  {formData.gallery.some((p) => p.id.startsWith('g-') || p.id.startsWith('photo_') || p.url.includes('images.unsplash.com')) && (
                    <button
                      type="button"
                      onClick={handleClearMockupPhotos}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition-all"
                      title="Xóa toàn bộ ảnh mẫu minh họa ban đầu để chỉ giữ lại ảnh cưới thật của bạn"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Xóa ảnh mẫu (Mockup)</span>
                    </button>
                  )}
                  {formData.gallery.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAllPhotos}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 border border-stone-300 hover:border-rose-300 text-stone-600 hover:text-rose-600 text-xs font-medium shadow-xs transition-all"
                      title="Xóa toàn bộ ảnh trong album để tải bộ ảnh mới"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Làm trống album</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleRestoreDefaultGallery}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-stone-50 border border-[#dfcebc] text-stone-700 text-xs font-medium shadow-xs transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
                    <span>Khôi phục mẫu</span>
                  </button>
                </div>
              </div>

              {/* Mockup notice banner if album currently has mockups */}
              {formData.gallery.some((p) => p.id.startsWith('g-') || p.id.startsWith('photo_') || p.url.includes('images.unsplash.com')) && (
                <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs animate-in fade-in">
                  <div className="text-amber-900 leading-relaxed">
                    <span className="font-semibold block sm:inline">💡 Album hiện đang có ảnh mẫu minh họa mặc định:</span>{' '}
                    <span>Khi bạn chọn tải ảnh của bạn lên từ máy tính hoặc điện thoại, các ảnh mẫu này sẽ được tự động thay thế bằng ảnh cưới của hai bạn!</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearMockupPhotos}
                    className="px-3 py-1.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-semibold text-xs shrink-0 transition-colors shadow-xs"
                  >
                    Xóa sạch ảnh mẫu ngay
                  </button>
                </div>
              )}

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
                  <label className={`inline-flex items-center gap-2 px-5 py-2.5 mt-3 rounded-xl text-white text-xs font-semibold shadow-md transition-all ${
                    isCompressingPhotos
                      ? 'bg-stone-400 cursor-not-allowed'
                      : 'bg-[#a06a3e] hover:bg-[#88572f] cursor-pointer'
                  }`}>
                    {isCompressingPhotos ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Đang tối ưu hóa các tệp ảnh...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>Chọn tệp ảnh từ máy tính / điện thoại</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={handleAlbumMultipleUpload}
                          disabled={isCompressingPhotos}
                        />
                      </>
                    )}
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
            <div className="space-y-5">
              {/* Bride & Groom Avatars Section */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#ebdccb] shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#9b663b]" />
                    <h4 className="font-semibold text-stone-800 text-xs sm:text-sm uppercase tracking-wider">
                      Ảnh Chân Dung Cô Dâu & Chú Rể
                    </h4>
                  </div>
                  <span className="text-[11px] text-stone-500">Hiển thị ở phần giới thiệu Chú Rể & Cô Dâu</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Groom Avatar */}
                  <div className="p-3.5 rounded-xl bg-[#faf6f0] border border-[#eee2d3] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-stone-800">Chú Rể ({formData.groom.name})</span>
                      {formData.groom.avatar?.includes('images.unsplash.com') ? (
                        <span className="text-[10px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full font-medium">Ảnh mẫu</span>
                      ) : (
                        <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-medium">✓ Ảnh của bạn</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <img
                        src={formData.groom.avatar}
                        alt="Groom avatar"
                        className="w-16 h-16 rounded-full object-cover border-2 border-[#a06a3e]/40 shadow-sm shrink-0"
                      />
                      <div className="flex-1 space-y-1.5 min-w-0">
                        <label className="cursor-pointer w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#a06a3e] hover:bg-[#88572f] text-white text-xs font-semibold shadow-xs transition-colors">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Tải ảnh chú rể</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              handleFileUpload(
                                e,
                                (url) => setFormData({ ...formData, groom: { ...formData.groom, avatar: url } }),
                                600
                              )
                            }
                          />
                        </label>
                        <input
                          type="text"
                          placeholder="Hoặc dán link ảnh online..."
                          value={formData.groom.avatar}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              groom: { ...formData.groom, avatar: e.target.value },
                            })
                          }
                          className="w-full px-2.5 py-1 rounded-lg bg-white border border-stone-300 text-[11px] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bride Avatar */}
                  <div className="p-3.5 rounded-xl bg-rose-50/50 border border-rose-100 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-stone-800">Cô Dâu ({formData.bride.name})</span>
                      {formData.bride.avatar?.includes('images.unsplash.com') ? (
                        <span className="text-[10px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full font-medium">Ảnh mẫu</span>
                      ) : (
                        <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-medium">✓ Ảnh của bạn</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <img
                        src={formData.bride.avatar}
                        alt="Bride avatar"
                        className="w-16 h-16 rounded-full object-cover border-2 border-rose-300 shadow-sm shrink-0"
                      />
                      <div className="flex-1 space-y-1.5 min-w-0">
                        <label className="cursor-pointer w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition-colors">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Tải ảnh cô dâu</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              handleFileUpload(
                                e,
                                (url) => setFormData({ ...formData, bride: { ...formData.bride, avatar: url } }),
                                600
                              )
                            }
                          />
                        </label>
                        <input
                          type="text"
                          placeholder="Hoặc dán link ảnh online..."
                          value={formData.bride.avatar}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              bride: { ...formData.bride, avatar: e.target.value },
                            })
                          }
                          className="w-full px-2.5 py-1 rounded-lg bg-white border border-stone-300 text-[11px] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Cover Image */}
              <div className="p-4 rounded-2xl bg-[#faf6f0] border border-[#eee2d3] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-stone-800">
                      Ảnh Bìa Chính (Hero Banner Background)
                    </label>
                    <span className="text-[10px] text-stone-500">Hiển thị toàn màn hình phần mở đầu thiệp</span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        coverImage: INITIAL_WEDDING_DATA.coverImage,
                        secondaryCoverImage: INITIAL_WEDDING_DATA.secondaryCoverImage,
                      })
                    }
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 text-[11px] font-medium shadow-2xs transition-all self-start sm:self-auto"
                    title="Khôi phục lại ảnh nền ban đầu trong phiên bản gốc"
                  >
                    <RotateCcw className="w-3 h-3 text-stone-500" />
                    <span>Dùng ảnh nền phiên bản cũ</span>
                  </button>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <img
                    src={formData.coverImage}
                    alt="Cover preview"
                    className="w-24 h-16 rounded-xl object-cover border border-stone-300 shadow-sm shrink-0"
                  />
                  <div className="flex-1 flex flex-col sm:flex-row gap-2 w-full">
                    <input
                      type="text"
                      value={formData.coverImage}
                      onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                      className="flex-1 px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs focus:outline-none"
                      placeholder="Nhập link ảnh online (https://...)"
                    />
                    <label className="cursor-pointer inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#a06a3e] hover:bg-[#88572f] text-white text-xs font-semibold shadow-xs shrink-0 transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Tải ảnh từ máy</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          handleFileUpload(
                            e,
                            (url) => setFormData({ ...formData, coverImage: url }),
                            900
                          )
                        }
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Secondary Cover Image */}
              <div className="p-4 rounded-2xl bg-[#faf6f0] border border-[#eee2d3] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-stone-800">
                    Ảnh Nền Phụ (Secondary Cover / Countdown)
                  </label>
                  <span className="text-[10px] text-stone-500">Ảnh nền phụ cho các phần nội dung thiệp</span>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <img
                    src={formData.secondaryCoverImage || formData.coverImage}
                    alt="Secondary cover preview"
                    className="w-24 h-16 rounded-xl object-cover border border-stone-300 shadow-sm shrink-0"
                  />
                  <div className="flex-1 flex flex-col sm:flex-row gap-2 w-full">
                    <input
                      type="text"
                      value={formData.secondaryCoverImage || ''}
                      onChange={(e) => setFormData({ ...formData, secondaryCoverImage: e.target.value })}
                      className="flex-1 px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs focus:outline-none"
                      placeholder="Nhập link ảnh phụ..."
                    />
                    <label className="cursor-pointer inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-stone-700 hover:bg-stone-800 text-white text-xs font-semibold shadow-xs shrink-0 transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Tải ảnh phụ</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          handleFileUpload(e, (url) =>
                            setFormData({ ...formData, secondaryCoverImage: url }),
                            900
                          )
                        }
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Music Settings */}
              <div className="p-4 rounded-2xl bg-white border border-stone-200 space-y-3">
                <div className="flex items-center gap-2 pb-1 border-b border-stone-100">
                  <Music className="w-4 h-4 text-[#a06a3e]" />
                  <h5 className="font-semibold text-stone-800 text-xs uppercase tracking-wider">
                    Nhạc Nền Hôn Lễ (.mp3)
                  </h5>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-stone-600 mb-1">
                      Tên bài hát hiển thị
                    </label>
                    <input
                      type="text"
                      placeholder="Tên bài hát (VD: A Thousand Years)"
                      value={formData.audioTrack.title}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          audioTrack: { ...formData.audioTrack, title: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 text-xs focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-stone-600 mb-1">
                      Đường dẫn tệp nhạc (.mp3)
                    </label>
                    <input
                      type="text"
                      placeholder="VD: /wedding_music.mp3 hoặc https://..."
                      value={formData.audioTrack.src}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          audioTrack: { ...formData.audioTrack, src: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 text-xs focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer Save Actions */}
          <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              {saveSuccess && (
                <span className="text-emerald-700 font-semibold text-xs flex items-center gap-1.5 animate-in fade-in">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Đã lưu thành công lên đám mây Firebase! Tất cả thiết bị đã cập nhật.</span>
                </span>
              )}
              {saveError && (
                <span className="text-rose-600 font-semibold text-xs flex items-center gap-1.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <span>{saveError}</span>
                </span>
              )}
              {!saveSuccess && !saveError && (
                <span className="text-stone-400 text-xs">
                  Mọi thông tin & ảnh cưới sẽ tự động đồng bộ tức thì trên mọi thiết bị.
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 disabled:opacity-50 text-xs font-medium"
              >
                Đóng
              </button>
              <button
                type="submit"
                disabled={isSaving || isCompressingPhotos}
                className="px-5 py-2 rounded-xl bg-[#a06a3e] hover:bg-[#8b5a33] disabled:bg-stone-400 text-white text-xs font-semibold shadow-md flex items-center gap-1.5 transition-all"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang lưu lên đám mây...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Lưu Cập Nhật</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
