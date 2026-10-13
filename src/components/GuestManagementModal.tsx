import React, { useState, useMemo } from 'react';
import {
  X,
  Users,
  Download,
  Plus,
  Trash2,
  Search,
  Filter,
  CheckCircle2,
  HelpCircle,
  XCircle,
  Car,
  FileSpreadsheet,
  Calendar,
  Phone,
} from 'lucide-react';
import { GuestRSVP } from '../types';
import { exportGuestsToCsv } from '../utils/weddingHelpers';

interface GuestManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  guests: GuestRSVP[];
  onAddGuest: (guest: GuestRSVP) => void;
  onDeleteGuest: (guestId: string) => void;
  onUpdateGuestStatus: (guestId: string, status: 'attending' | 'tentative' | 'not_attending') => void;
}

export const GuestManagementModal: React.FC<GuestManagementModalProps> = ({
  isOpen,
  onClose,
  guests,
  onAddGuest,
  onDeleteGuest,
  onUpdateGuestStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSide, setFilterSide] = useState<string>('all');
  const [isAddingNew, setIsAddingNew] = useState(false);

  // New guest state form
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newSide, setNewSide] = useState<'groom' | 'bride' | 'both'>('groom');
  const [newCount, setNewCount] = useState(1);
  const [newStatus, setNewStatus] = useState<'attending' | 'tentative' | 'not_attending'>('attending');
  const [newShuttle, setNewShuttle] = useState(false);
  const [newNotes, setNewNotes] = useState('');

  // Calculations
  const stats = useMemo(() => {
    const totalEntries = guests.length;
    const attendingGuests = guests.filter((g) => g.attendance === 'attending');
    const tentativeGuests = guests.filter((g) => g.attendance === 'tentative');
    const declinedGuests = guests.filter((g) => g.attendance === 'not_attending');

    // Total headcounts (including +1s)
    const totalHeadCount = attendingGuests.reduce((sum, g) => sum + (g.guestCount || 1), 0);
    const groomHeadCount = attendingGuests
      .filter((g) => g.guestSide === 'groom' || g.guestSide === 'both')
      .reduce((sum, g) => sum + (g.guestCount || 1), 0);
    const brideHeadCount = attendingGuests
      .filter((g) => g.guestSide === 'bride' || g.guestSide === 'both')
      .reduce((sum, g) => sum + (g.guestCount || 1), 0);

    const needShuttleCount = attendingGuests.filter((g) => g.needTransportation).length;

    return {
      totalEntries,
      attendingCount: attendingGuests.length,
      totalHeadCount,
      tentativeCount: tentativeGuests.length,
      declinedCount: declinedGuests.length,
      groomHeadCount,
      brideHeadCount,
      needShuttleCount,
    };
  }, [guests]);

  // Filtered List
  const filteredGuests = useMemo(() => {
    return guests.filter((g) => {
      const matchSearch =
        g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.phone.includes(searchTerm) ||
        (g.notes && g.notes.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchStatus = filterStatus === 'all' || g.attendance === filterStatus;
      const matchSide = filterSide === 'all' || g.guestSide === filterSide;

      return matchSearch && matchStatus && matchSide;
    });
  }, [guests, searchTerm, filterStatus, filterSide]);

  const handleCreateGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const guest: GuestRSVP = {
      id: `g-manual-${Date.now()}`,
      name: newName.trim(),
      phone: newPhone.trim(),
      guestSide: newSide,
      attendance: newStatus,
      guestCount: newStatus === 'not_attending' ? 0 : Number(newCount),
      needTransportation: newShuttle,
      notes: newNotes.trim(),
      createdAt: new Date().toISOString(),
    };

    onAddGuest(guest);
    setIsAddingNew(false);
    setNewName('');
    setNewPhone('');
    setNewNotes('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-[#fcfaf7]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#f4ebe0] text-[#915e34]">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-stone-800 text-base sm:text-lg">
                Hệ Thống Quản Lý Danh Sách Khách Mời
              </h3>
              <p className="text-xs text-stone-500">
                Theo dõi số lượng mâm cỗ, danh sách xác nhận và đón tiếp khách chu đáo.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => exportGuestsToCsv(guests)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium shadow-sm transition-colors"
              title="Xuất file Excel / CSV danh sách khách"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Xuất Excel / CSV</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats Summary Bar */}
        <div className="px-6 py-4 bg-[#f8f3ec] border-b border-stone-200 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-3 rounded-2xl border border-[#e8ded2] shadow-2xs">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
              Tổng Khách Tham Dự
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-bold text-[#8d582c]">{stats.totalHeadCount}</span>
              <span className="text-xs text-stone-500 font-light">người</span>
            </div>
            <span className="text-[10px] text-stone-400">({stats.attendingCount} lời xác nhận)</span>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-[#e8ded2] shadow-2xs">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
              Phân Nhóm Khách
            </span>
            <div className="flex items-center justify-between text-xs mt-1">
              <span className="text-blue-700 font-medium">Nhà Trai: {stats.groomHeadCount}</span>
              <span className="text-rose-700 font-medium">Nhà Gái: {stats.brideHeadCount}</span>
            </div>
            <span className="text-[10px] text-stone-400 block mt-0.5">Ước tính: ~{Math.ceil(stats.totalHeadCount / 10)} bàn tiệc</span>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-[#e8ded2] shadow-2xs">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
              Chưa Chắc Chắn / Từ Chối
            </span>
            <div className="flex items-center gap-3 text-xs mt-1">
              <span className="text-amber-600 font-medium">{stats.tentativeCount} đang cân nhắc</span>
              <span className="text-stone-400">|</span>
              <span className="text-rose-500 font-medium">{stats.declinedCount} vắng mặt</span>
            </div>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-[#e8ded2] shadow-2xs">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
              Cần Xe Đưa Đón
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-bold text-indigo-700">{stats.needShuttleCount}</span>
              <span className="text-xs text-stone-500">lượt đăng ký</span>
            </div>
          </div>
        </div>

        {/* Filter & Actions Toolset */}
        <div className="p-4 sm:px-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-stone-100">
          <div className="flex-1 flex items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm theo tên hoặc SĐT khách..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b8855b]/50"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-700 focus:outline-none"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="attending">Tham dự</option>
              <option value="tentative">Chưa chắc chắn</option>
              <option value="not_attending">Không tham dự</option>
            </select>

            {/* Side Filter */}
            <select
              value={filterSide}
              onChange={(e) => setFilterSide(e.target.value)}
              className="px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-700 focus:outline-none"
            >
              <option value="all">Tất cả bên</option>
              <option value="groom">Nhà Trai</option>
              <option value="bride">Nhà Gái</option>
              <option value="both">Cả Hai</option>
            </select>
          </div>

          <button
            onClick={() => setIsAddingNew(true)}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#a06a3e] hover:bg-[#89572e] text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm khách mời thủ công</span>
          </button>
        </div>

        {/* Form to Add New Guest Manually */}
        {isAddingNew && (
          <div className="p-4 sm:px-6 bg-[#faf5ef] border-b border-stone-200 animate-in slide-in-from-top-2">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#915e34]">
                Thêm Khách Mới Vào Danh Sách
              </span>
              <button
                onClick={() => setIsAddingNew(false)}
                className="text-stone-400 hover:text-stone-700 text-xs"
              >
                Hủy
              </button>
            </div>
            <form onSubmit={handleCreateGuest} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <input
                type="text"
                required
                placeholder="Họ và tên khách *"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white border border-stone-300 focus:outline-none"
              />
              <input
                type="tel"
                placeholder="Số điện thoại"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white border border-stone-300 focus:outline-none"
              />
              <select
                value={newSide}
                onChange={(e) => setNewSide(e.target.value as any)}
                className="px-3 py-2 rounded-xl bg-white border border-stone-300 focus:outline-none"
              >
                <option value="groom">Khách Nhà Trai</option>
                <option value="bride">Khách Nhà Gái</option>
                <option value="both">Khách Cả Hai Nhà</option>
              </select>
              <div className="flex items-center gap-2">
                <span className="text-stone-600">Số lượng người:</span>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={newCount}
                  onChange={(e) => setNewCount(Number(e.target.value))}
                  className="w-16 px-2 py-1 rounded-lg bg-white border border-stone-300"
                />
              </div>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as any)}
                className="px-3 py-2 rounded-xl bg-white border border-stone-300 focus:outline-none"
              >
                <option value="attending">Chắc chắn tham dự</option>
                <option value="tentative">Chưa chắc chắn</option>
                <option value="not_attending">Không tham dự</option>
              </select>
              <input
                type="text"
                placeholder="Ghi chú (bàn số, ăn chay...)"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white border border-stone-300 focus:outline-none"
              />
              <div className="sm:col-span-3 flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-3 py-1.5 rounded-lg border border-stone-300 text-stone-600 hover:bg-stone-100"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#a06a3e] text-white font-medium hover:bg-[#8c5a31]"
                >
                  Lưu Khách Mời
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Guest Table */}
        <div className="flex-1 overflow-y-auto p-4 sm:px-6">
          {filteredGuests.length === 0 ? (
            <div className="text-center py-16 text-stone-400 text-sm">
              Không tìm thấy khách mời nào phù hợp với bộ lọc tìm kiếm.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-600 border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-400 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-3">Khách Mời</th>
                    <th className="py-2.5 px-3">Liên Hệ</th>
                    <th className="py-2.5 px-3">Bên Gia Đình</th>
                    <th className="py-2.5 px-3">Trạng Thái</th>
                    <th className="py-2.5 px-3 text-center">Số Người</th>
                    <th className="py-2.5 px-3">Ghi Chú & Xe</th>
                    <th className="py-2.5 px-3 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredGuests.map((guest) => (
                    <tr key={guest.id} className="hover:bg-[#faf7f2] transition-colors">
                      <td className="py-3 px-3 font-semibold text-stone-800">
                        {guest.name}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1 text-stone-600">
                          <Phone className="w-3 h-3 text-stone-400" />
                          <span>{guest.phone || 'Chưa có'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md font-medium text-[10px] ${
                            guest.guestSide === 'groom'
                              ? 'bg-blue-50 text-blue-700'
                              : guest.guestSide === 'bride'
                              ? 'bg-rose-50 text-rose-700'
                              : 'bg-amber-50 text-amber-800'
                          }`}
                        >
                          {guest.guestSide === 'groom'
                            ? 'Nhà Trai'
                            : guest.guestSide === 'bride'
                            ? 'Nhà Gái'
                            : 'Cả Hai Bên'}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <select
                          value={guest.attendance}
                          onChange={(e) =>
                            onUpdateGuestStatus(guest.id, e.target.value as any)
                          }
                          className={`px-2 py-1 rounded-lg text-[11px] font-medium border ${
                            guest.attendance === 'attending'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : guest.attendance === 'tentative'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-stone-100 text-stone-600 border-stone-200'
                          }`}
                        >
                          <option value="attending">Tham dự</option>
                          <option value="tentative">Chưa chắc chắn</option>
                          <option value="not_attending">Không tham dự</option>
                        </select>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="font-bold text-stone-800 bg-stone-100 px-2 py-0.5 rounded-full">
                          {guest.attendance === 'not_attending' ? 0 : guest.guestCount}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="space-y-0.5 max-w-[200px] truncate">
                          {guest.needTransportation && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded font-medium">
                              <Car className="w-2.5 h-2.5" /> Có xe đưa đón
                            </span>
                          )}
                          {guest.notes && (
                            <p className="text-[11px] text-stone-500 italic truncate">
                              "{guest.notes}"
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => onDeleteGuest(guest.id)}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Xóa khách khỏi danh sách"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-[#fcfaf7] border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
          <span>Hiển thị {filteredGuests.length} / {guests.length} khách mời</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-700 font-medium transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
