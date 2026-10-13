import { GuestRSVP } from '../types';

export function getVietQrUrl(
  bankId: string,
  accountNumber: string,
  accountName: string,
  amount: number = 0,
  memo: string = 'Mung cuoi'
): string {
  if (!bankId || !accountNumber) return '';
  const cleanBank = bankId.trim().toUpperCase();
  const cleanAcc = accountNumber.trim().replace(/\s+/g, '');
  const cleanName = encodeURIComponent(accountName.trim());
  const cleanMemo = encodeURIComponent(memo.trim());

  let url = `https://img.vietqr.io/image/${cleanBank}-${cleanAcc}-compact2.png?accountName=${cleanName}`;
  if (amount > 0) {
    url += `&amount=${amount}`;
  }
  if (memo) {
    url += `&addInfo=${cleanMemo}`;
  }
  return url;
}

export function exportGuestsToCsv(guests: GuestRSVP[], fileName: string = 'danh_sach_khach_moi_dam_cuoi.csv') {
  const headers = [
    'Mã Khách',
    'Họ Và Tên',
    'Số Điện Thoại',
    'Email',
    'Khách Của',
    'Trạng Thái Tham Dự',
    'Số Lượng Khách',
    'Xe Đưa Đón',
    'Ghi Chú/Lời Nhắn',
    'Thời Gian Gửi',
  ];

  const rows = guests.map((g) => [
    `"${g.id}"`,
    `"${g.name.replace(/"/g, '""')}"`,
    `"${g.phone.replace(/"/g, '""')}"`,
    `"${(g.email || '').replace(/"/g, '""')}"`,
    `"${g.guestSide === 'groom' ? 'Nhà Trai' : g.guestSide === 'bride' ? 'Nhà Gái' : 'Cả Hai Nhà'}"`,
    `"${g.attendance === 'attending' ? 'Tham dự' : g.attendance === 'tentative' ? 'Chưa chắc chắn' : 'Không tham dự'}"`,
    g.guestCount,
    `"${g.needTransportation ? 'Có' : 'Không'}"`,
    `"${(g.notes || '').replace(/"/g, '""')}"`,
    `"${new Date(g.createdAt).toLocaleString('vi-VN')}"`,
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function formatTimeRemaining(targetIsoDate: string) {
  const diff = new Date(targetIsoDate).getTime() - new Date().getTime();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPassed: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / 1000 / 60) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return { days, hours, minutes, seconds, isPassed: false };
}
