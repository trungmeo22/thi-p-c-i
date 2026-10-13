import React, { useState, useEffect } from 'react';
import {
  INITIAL_WEDDING_DATA,
  INITIAL_GUESTS,
} from './data/defaultWeddingData';
import { WeddingData, GuestRSVP, AudioTrack } from './types';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { CountdownSection } from './components/CountdownSection';
import { CoupleStorySection } from './components/CoupleStorySection';
import { EventDetailsMapSection } from './components/EventDetailsMapSection';
import { GallerySlider } from './components/GallerySlider';
import { WeddingBoxQRSection } from './components/WeddingBoxQRSection';
import { RsvpSection } from './components/RsvpSection';
import { AudioPlayer } from './components/AudioPlayer';
import { FloatingPetals } from './components/FloatingPetals';
import { Footer } from './components/Footer';
import { GuestManagementModal } from './components/GuestManagementModal';
import { EditWeddingModal } from './components/EditWeddingModal';

const STORAGE_KEYS = {
  DATA: 'wedding_invitation_data_v1',
  GUESTS: 'wedding_invitation_guests_v1',
};

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

  // Handlers for Guest RSVP
  const handleAddGuest = (newGuest: GuestRSVP) => {
    setGuests((prev) => [newGuest, ...prev]);
  };

  const handleDeleteGuest = (guestId: string) => {
    setGuests((prev) => prev.filter((g) => g.id !== guestId));
  };

  const handleUpdateGuestStatus = (
    guestId: string,
    status: 'attending' | 'tentative' | 'not_attending'
  ) => {
    setGuests((prev) =>
      prev.map((g) => (g.id === guestId ? { ...g, attendance: status } : g))
    );
  };

  // Customizer Handlers
  const handleSaveWeddingData = (updated: WeddingData) => {
    setWeddingData(updated);
  };

  const handleResetWeddingData = () => {
    setWeddingData(INITIAL_WEDDING_DATA);
    setGuests(INITIAL_GUESTS);
    localStorage.removeItem(STORAGE_KEYS.DATA);
    localStorage.removeItem(STORAGE_KEYS.GUESTS);
  };

  const handleTrackChange = (track: AudioTrack) => {
    setWeddingData((prev) => ({ ...prev, audioTrack: track }));
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
