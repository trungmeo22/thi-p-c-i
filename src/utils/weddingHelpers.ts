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

export async function compressImageFile(
  file: File,
  maxDimension: number = 1000,
  quality: number = 0.72
): Promise<string> {
  return new Promise((resolve, reject) => {
    // If it is SVG, don't canvas compress
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = (e) => resolve((e.target?.result as string) || '');
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) {
        resolve('');
        return;
      }

      const img = new Image();
      img.onload = () => {
        let { width, height } = img;

        if (width > maxDimension || height > maxDimension) {
          if (width >= height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }

        // Draw image with smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to web-optimized JPEG
        let compressedDataUrl = canvas.toDataURL('image/jpeg', quality);

        // If still > 350KB, downscale one more step to ensure fast cloud syncing
        if (compressedDataUrl.length > 350 * 1024) {
          const secondCanvas = document.createElement('canvas');
          const targetW = Math.round(width * 0.75);
          const targetH = Math.round(height * 0.75);
          secondCanvas.width = targetW;
          secondCanvas.height = targetH;
          const ctx2 = secondCanvas.getContext('2d');
          if (ctx2) {
            ctx2.imageSmoothingEnabled = true;
            ctx2.imageSmoothingQuality = 'medium';
            ctx2.drawImage(canvas, 0, 0, targetW, targetH);
            compressedDataUrl = secondCanvas.toDataURL('image/jpeg', 0.65);
          }
        }

        resolve(compressedDataUrl);
      };

      img.onerror = () => {
        resolve(dataUrl);
      };
      img.src = dataUrl;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
