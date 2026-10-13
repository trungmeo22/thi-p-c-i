import React, { useState, useEffect } from 'react';
import {
  INITIAL_WEDDING_DATA,
  INITIAL_GUESTS,
} from './data/defaultWeddingData';
import { WeddingData, GuestRSVP, AudioTrack, WeddingWish } from './types';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { CountdownSection } from './components/CountdownSection';
import { CoupleStorySection } from './components/CoupleStorySection';
import { EventDetailsMapSection } from './components/EventDetailsMapSection';
import { GallerySlider } from './components/GallerySlider';
import { WeddingBoxQRSection } from './components/WeddingBoxQRSection';
import { WishesSection } from './components/WishesSection';
import { RsvpSection } from './components/RsvpSection';
import { AudioPlayer } from './components/AudioPlayer';
import { FloatingPetals } from './components/FloatingPetals';
import { Footer } from './components/Footer';
import { GuestManagementModal } from './components/GuestManagementModal';
import { EditWeddingModal } from './components/EditWeddingModal';
import { AdminAuthModal } from './components/AdminAuthModal';
import { ShareModal } from './components/ShareModal';
import { Share2 } from 'lucide-react';
import {
  subscribeToWeddingData,
  saveWeddingDataToFirestore,
  subscribeToGuests,
  addGuestToFirestore,
  deleteGuestFromFirestore,
  updateGuestStatusInFirestore,
  subscribeToWishes,
  addWishToFirestore,
  likeWishInFirestore,
} from './lib/firebase';

const STORAGE_KEYS = {
  DATA: 'wedding_invitation_data_v1',
  GUESTS: 'wedding_invitation_guests_v1',
};

const INITIAL_WISHES: WeddingWish[] = [
  {
    id: 'w-default-1',
    senderName: 'Hoàng Long & Thu Hà',
    relationship: 'Bạn thân',
    message: 'Chúc hai bạn trăm năm hạnh phúc, đầu bạc răng long, mãi mãi gắn kết yêu thương như ngày đầu!',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    likes: 8,
  },
  {
    id: 'w-default-2',
    senderName: 'Gia đình Bác Thành',
    relationship: 'Họ hàng',
    message: 'Chúc đôi uyên ương vạn sự cát tường, sớm sinh quý tử, gia đình luôn hòa thuận và ngập tràn niềm vui!',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    likes: 12,
  },
];

export default function App() {
  // Load wedding data from localStorage or fallback
  const [weddingData, setWeddingData] = useState<WeddingData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DATA);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.groom) {
          delete parsed.groom.bio;
          delete parsed.groom.phone;
        }
        if (parsed.bride) {
          delete parsed.bride.bio;
          delete parsed.bride.phone;
        }
        if (parsed.events) {
          parsed.events = parsed.events.filter(
            (e: any) =>
              e.id !== 'wedding_banquet' &&
              !e.title?.toLowerCase().includes('tiệc cưới chung') &&
              !e.title?.toLowerCase().includes('tiệc chung')
          );
        }
        if (
          !parsed.audioTrack ||
          parsed.audioTrack.src.includes('mixkit.co') ||
          !parsed.audioTrack.src.startsWith('/')
        ) {
          parsed.audioTrack = INITIAL_WEDDING_DATA.audioTrack;
        }
        return parsed;
      }
    } catch {
      // ignore
    }
    return INITIAL_WEDDING_DATA;
  });

  // Load guests list from localStorage or fallback
  const [guests, setGuests] = useState<GuestRSVP[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.GUESTS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_GUESTS;
  });

  // Guest wishes list
  const [wishes, setWishes] = useState<WeddingWish[]>(INITIAL_WISHES);

  const [isHostMode, setIsHostMode] = useState<boolean>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('admin') === 'true' || params.get('mode') === 'host') {
        return true;
      }
      return (
        localStorage.getItem('wedding_host_authenticated') === 'true' ||
        sessionStorage.getItem('wedding_host_authenticated') === 'true'
      );
    } catch {
      return false;
    }
  });

  // Personalized Guest Name from URL parameter (?to=GuestName or ?guest=GuestName)
  const [guestName, setGuestName] = useState<string>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('to') || params.get('guest') || params.get('k') || '';
    } catch {
      return '';
    }
  });

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<{
    type: 'edit' | 'guest';
    tab?: 'couple' | 'gallery' | 'banks' | 'datetime' | 'venues' | 'photos';
  } | null>(null);

  // Auto prompt for PIN if ?admin is in URL but user isn't authenticated yet
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const hasAdmin = params.get('admin') !== null || params.get('mode') === 'host';
      const isAuth =
        localStorage.getItem('wedding_host_authenticated') === 'true' ||
        sessionStorage.getItem('wedding_host_authenticated') === 'true';
      if (hasAdmin && !isAuth) {
        setIsAuthModalOpen(true);
      }
    } catch {
      // ignore
    }
  }, []);

  const [editModalTab, setEditModalTab] = useState<
    'couple' | 'gallery' | 'banks' | 'datetime' | 'venues' | 'photos'
  >('couple');

  const handleOpenAuthModal = () => {
    setIsAuthModalOpen(true);
  };

  const handleUnlockHostMode = () => {
    setIsHostMode(true);
    if (pendingAction) {
      if (pendingAction.type === 'edit') {
        setEditModalTab(pendingAction.tab || 'couple');
        setIsEditModalOpen(true);
      } else if (pendingAction.type === 'guest') {
        setIsGuestModalOpen(true);
      }
      setPendingAction(null);
    } else {
      setSaveToast('Đã mở khóa Chế độ Chủ Tiệc! Bạn có thể chỉnh sửa thông tin thiệp và quản lý khách mời.');
      setTimeout(() => setSaveToast(null), 3500);
    }
  };

  const handleLockHostMode = () => {
    setIsHostMode(false);
    localStorage.removeItem('wedding_host_authenticated');
    sessionStorage.removeItem('wedding_host_authenticated');
    setIsEditModalOpen(false);
    setIsGuestModalOpen(false);
    setSaveToast('Đã khóa Chế độ Chủ Tiệc. Bạn đang xem giao diện như khách mời!');
    setTimeout(() => setSaveToast(null), 3500);
  };

  const handleOpenEditModal = (
    tab: 'couple' | 'gallery' | 'banks' | 'datetime' | 'venues' | 'photos' = 'couple'
  ) => {
    if (!isHostMode) {
      setPendingAction({ type: 'edit', tab });
      setIsAuthModalOpen(true);
      return;
    }
    setEditModalTab(tab);
    setIsEditModalOpen(true);
  };

  const handleOpenGuestModal = () => {
    if (!isHostMode) {
      setPendingAction({ type: 'guest' });
      setIsAuthModalOpen(true);
      return;
    }
    setIsGuestModalOpen(true);
  };

  // Sync weddingData to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.DATA, JSON.stringify(weddingData));
    } catch {
      // storage quota or disabled
    }
  }, [weddingData]);

  // Sync guests to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.GUESTS, JSON.stringify(guests));
    } catch {
      // ignore
    }
  }, [guests]);

  // Real-time Firebase Firestore Sync
  useEffect(() => {
    const unsubWedding = subscribeToWeddingData((data) => {
      if (data && data.groom && data.bride) {
        setWeddingData(data);
      }
    });

    const unsubGuests = subscribeToGuests((guestList) => {
      if (guestList && guestList.length > 0) {
        setGuests(guestList);
      }
    });

    const unsubWishes = subscribeToWishes((wishesList) => {
      if (wishesList && wishesList.length > 0) {
        setWishes(wishesList);
      }
    });

    return () => {
      unsubWedding();
      unsubGuests();
      unsubWishes();
    };
  }, []);

  // Handlers for Guest RSVP
  const handleAddGuest = (newGuest: GuestRSVP) => {
    setGuests((prev) => [newGuest, ...prev]);
    addGuestToFirestore(newGuest).catch((err) => {
      console.error('Failed to sync guest RSVP to Firestore:', err);
    });
  };

  const handleDeleteGuest = (guestId: string) => {
    setGuests((prev) => prev.filter((g) => g.id !== guestId));
    deleteGuestFromFirestore(guestId).catch((err) => {
      console.error('Failed to delete guest from Firestore:', err);
    });
  };

  const handleUpdateGuestStatus = (
    guestId: string,
    status: 'attending' | 'tentative' | 'not_attending'
  ) => {
    setGuests((prev) =>
      prev.map((g) => (g.id === guestId ? { ...g, attendance: status } : g))
    );
    updateGuestStatusInFirestore(guestId, status).catch((err) => {
      console.error('Failed to update guest status in Firestore:', err);
    });
  };

  // Wishes Handlers
  const handleAddWish = (newWish: WeddingWish) => {
    setWishes((prev) => [newWish, ...prev]);
    addWishToFirestore(newWish).catch((err) => {
      console.error('Failed to add wish to Firestore:', err);
    });
  };

  const handleLikeWish = (wishId: string) => {
    const target = wishes.find((w) => w.id === wishId);
    const currentLikes = target ? target.likes : 0;
    setWishes((prev) =>
      prev.map((w) => (w.id === wishId ? { ...w, likes: w.likes + 1, isLiked: true } : w))
    );
    likeWishInFirestore(wishId, currentLikes).catch((err) => {
      console.error('Failed to like wish in Firestore:', err);
    });
  };

  // Customizer Handlers
  const handleSaveWeddingData = (updated: WeddingData) => {
    setWeddingData(updated);
    saveWeddingDataToFirestore(updated)
      .then(() => {
        setSaveToast('Đã lưu thành công lên Firebase Firestore! Toàn bộ khách mời sẽ thấy dữ liệu cập nhật mới.');
        setTimeout(() => setSaveToast(null), 4000);
      })
      .catch((err) => {
        console.error('Failed to save wedding data to Firestore:', err);
        setSaveToast('Lưu nội bộ thành công. Đang đồng bộ lại với Firebase...');
        setTimeout(() => setSaveToast(null), 3000);
      });
  };

  const handleResetWeddingData = () => {
    setWeddingData(INITIAL_WEDDING_DATA);
    setGuests(INITIAL_GUESTS);
    localStorage.removeItem(STORAGE_KEYS.DATA);
    localStorage.removeItem(STORAGE_KEYS.GUESTS);
  };

  const handleTrackChange = (track: AudioTrack) => {
    const updated = { ...weddingData, audioTrack: track };
    setWeddingData(updated);
    saveWeddingDataToFirestore(updated).catch(() => {});
  };

  return (
    <div className="min-h-screen bg-[#faf7f2] text-[#2c2623] relative font-sans selection:bg-[#dfb48c] selection:text-[#382012]">
      {/* Gentle Floating Blossom / Rose Petals */}
      <FloatingPetals />

      {/* Save / Status Toast Notification */}
      {saveToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#31251e] text-[#fbf6ef] px-4 py-2.5 rounded-2xl shadow-2xl border border-[#9b663b]/50 text-xs flex items-center gap-2 max-w-md text-center animate-in fade-in slide-in-from-top-3 duration-200">
          <span>{saveToast}</span>
        </div>
      )}

      {/* Floating Romantic Background Music Player */}
      <AudioPlayer
        currentTrack={weddingData.audioTrack}
        onTrackChange={handleTrackChange}
      />

      {/* Top Floating Navigation Bar */}
      <Navbar
        weddingData={weddingData}
        guestCount={guests.filter((g) => g.attendance === 'attending').length}
        isHostMode={isHostMode}
        onOpenEditModal={() => handleOpenEditModal('couple')}
        onOpenGuestModal={handleOpenGuestModal}
        onOpenAuthModal={handleOpenAuthModal}
        onLockHostMode={handleLockHostMode}
        onOpenShareModal={() => setIsShareModalOpen(true)}
      />

      {/* Hero Section with optional personalized guest greeting */}
      <HeroSection
        weddingData={weddingData}
        onOpenEditModal={isHostMode ? () => handleOpenEditModal('couple') : undefined}
        guestName={guestName}
      />

      {/* Real-time Countdown Timer Section */}
      <CountdownSection weddingData={weddingData} />

      {/* Couple Story & Timeline */}
      <CoupleStorySection
        weddingData={weddingData}
        onOpenEditModal={isHostMode ? () => handleOpenEditModal('couple') : undefined}
      />

      {/* Wedding Events Itinerary & Interactive Directions Map */}
      <EventDetailsMapSection
        weddingData={weddingData}
        onOpenEditModal={isHostMode ? () => handleOpenEditModal('venues') : undefined}
      />

      {/* Elegant Sliding Wedding Photo Gallery */}
      <GallerySlider
        items={weddingData.gallery}
        onOpenEditModal={isHostMode ? () => handleOpenEditModal('gallery') : undefined}
      />

      {/* Secure Bank QR Code Gift Box (Nhà Trai & Nhà Gái) */}
      <WeddingBoxQRSection weddingData={weddingData} />

      {/* Real-time Wishes & Guestbook Section */}
      <WishesSection
        wishes={wishes}
        adminEmail={weddingData.adminEmail}
        onAddWish={handleAddWish}
        onLikeWish={handleLikeWish}
      />

      {/* RSVP Attendance Confirmation Form */}
      <RsvpSection onAddGuest={handleAddGuest} guestName={guestName} />

      {/* Footer */}
      <Footer
        weddingData={weddingData}
        onOpenAuthModal={handleOpenAuthModal}
        onOpenShareModal={() => setIsShareModalOpen(true)}
      />

      {/* Floating Host Controls Bar (When unlocked) */}
      {isHostMode && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-[#251b14]/90 text-amber-200 backdrop-blur-md px-4 py-2 rounded-full shadow-2xl border border-amber-500/40 flex items-center gap-2 text-xs animate-in slide-in-from-bottom-2 duration-300">
          <span className="flex items-center gap-1.5 font-medium pr-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Chủ Tiệc</span>
          </span>
          <button
            onClick={() => handleOpenEditModal('couple')}
            className="px-2.5 py-1 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 font-semibold transition-colors"
          >
            Tùy Biến Thiệp
          </button>
          <button
            onClick={handleOpenGuestModal}
            className="px-2.5 py-1 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 font-semibold transition-colors"
          >
            DS Khách ({guests.filter((g) => g.attendance === 'attending').length})
          </button>
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="px-2.5 py-1 rounded-full bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 font-semibold transition-colors flex items-center gap-1"
            title="Lấy link thiệp sạch để gửi cho khách"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Chia Sẻ Thiệp</span>
          </button>
          <button
            onClick={handleLockHostMode}
            className="px-2.5 py-1 rounded-full bg-stone-700 hover:bg-stone-600 text-stone-200 transition-colors ml-1"
            title="Khóa quản trị để xem giao diện như khách mời"
          >
            Xem như khách
          </button>
        </div>
      )}

      {/* Share Invitation & Vercel Links Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        weddingData={weddingData}
        onPreviewAsGuest={handleLockHostMode}
      />

      {/* Host / Admin PIN Verification Modal */}
      <AdminAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleUnlockHostMode}
        currentPin={weddingData.adminPin || '2811'}
      />

      {/* Couple / Admin Guest Management Modal */}
      <GuestManagementModal
        isOpen={isGuestModalOpen}
        onClose={() => setIsGuestModalOpen(false)}
        guests={guests}
        onAddGuest={handleAddGuest}
        onDeleteGuest={handleDeleteGuest}
        onUpdateGuestStatus={handleUpdateGuestStatus}
      />

      {/* Wedding Information Customizer Modal */}
      <EditWeddingModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        data={weddingData}
        onSave={handleSaveWeddingData}
        onReset={handleResetWeddingData}
        initialTab={editModalTab}
      />
    </div>
  );
}
