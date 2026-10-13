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

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);

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
    saveWeddingDataToFirestore(updated).catch((err) => {
      console.error('Failed to save wedding data to Firestore:', err);
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

      {/* Floating Romantic Background Music Player */}
      <AudioPlayer
        currentTrack={weddingData.audioTrack}
        onTrackChange={handleTrackChange}
      />

      {/* Top Floating Navigation Bar */}
      <Navbar
        weddingData={weddingData}
        guestCount={guests.filter((g) => g.attendance === 'attending').length}
        onOpenEditModal={() => setIsEditModalOpen(true)}
        onOpenGuestModal={() => setIsGuestModalOpen(true)}
      />

      {/* Hero Section */}
      <HeroSection
        weddingData={weddingData}
        onOpenEditModal={() => setIsEditModalOpen(true)}
      />

      {/* Real-time Countdown Timer Section */}
      <CountdownSection weddingData={weddingData} />

      {/* Couple Story & Timeline */}
      <CoupleStorySection
        weddingData={weddingData}
        onOpenEditModal={() => setIsEditModalOpen(true)}
      />

      {/* Wedding Events Itinerary & Interactive Directions Map */}
      <EventDetailsMapSection weddingData={weddingData} />

      {/* Elegant Sliding Wedding Photo Gallery */}
      <GallerySlider
        items={weddingData.gallery}
        onOpenEditModal={() => setIsEditModalOpen(true)}
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
      <RsvpSection onAddGuest={handleAddGuest} />

      {/* Footer */}
      <Footer weddingData={weddingData} />

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
      />
    </div>
  );
}
