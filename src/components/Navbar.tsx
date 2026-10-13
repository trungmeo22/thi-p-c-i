import React, { useState, useEffect } from 'react';
import { Heart, Settings, Users, Menu, X, Calendar, MapPin, Image as ImageIcon, Gift } from 'lucide-react';
import { WeddingData } from '../types';

interface NavbarProps {
  weddingData: WeddingData;
  guestCount: number;
  onOpenEditModal: () => void;
  onOpenGuestModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  weddingData,
  guestCount,
  onOpenEditModal,
  onOpenGuestModal,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Cặp Đôi', href: '#couple', icon: Heart },
    { label: 'Lịch Trình', href: '#events', icon: Calendar },
    { label: 'Đếm Ngược', href: '#countdown', icon: Calendar },
    { label: 'Album Cưới', href: '#gallery', icon: ImageIcon },
    { label: 'Bản Đồ', href: '#map', icon: MapPin },
    { label: 'Xác Nhận', href: '#rsvp', icon: Users },
    { label: 'Mừng Cưới', href: '#wedding-box', icon: Gift },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-30 transition-all duration-500 ${
        isScrolled
          ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-[#eee4d6] py-2.5'
          : 'bg-gradient-to-b from-black/40 via-black/20 to-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Monogram / Brand */}
        <a
          href="#top"
          className="flex items-center gap-2 group transition-transform hover:scale-105"
        >
          <span
            className={`font-script text-2xl sm:text-3xl tracking-wide transition-colors ${
              isScrolled ? 'text-[#8b5a36]' : 'text-white'
            }`}
          >
            {weddingData.groom.name.split(' ').pop()} & {weddingData.bride.name.split(' ').pop()}
          </span>
          <Heart
            className={`w-4 h-4 fill-current transition-colors ${
              isScrolled ? 'text-rose-500' : 'text-rose-300'
            }`}
          />
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`text-xs uppercase tracking-wider font-medium transition-all hover:text-[#b48c68] ${
                isScrolled
                  ? 'text-stone-700 hover:text-[#9e673a]'
                  : 'text-stone-200 hover:text-white drop-shadow-sm'
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Action Controls: Customizer & Admin Guest Dashboard */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Edit / Customize Card button */}
          <button
            onClick={onOpenEditModal}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all shadow-sm ${
              isScrolled
                ? 'bg-[#f4ebe1] hover:bg-[#e9ded0] text-[#7a4e2a] border border-[#ddcfbf]'
                : 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-md border border-white/30'
            }`}
            title="Tải ảnh và chỉnh sửa thông tin ngày giờ, địa điểm, STK"
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tùy Biến Thiệp</span>
          </button>

          {/* Guest management button */}
          <button
            onClick={onOpenGuestModal}
            className="relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide bg-gradient-to-r from-[#9b663b] to-[#b8855b] hover:from-[#88572f] hover:to-[#a4734b] text-white shadow-md transition-transform hover:scale-105"
            title="Quản lý danh sách khách mời và xem số lượng RSVP"
          >
            <Users className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Khách Mời</span>
            {guestCount > 0 && (
              <span className="ml-0.5 bg-rose-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.2">
                {guestCount}
              </span>
            )}
          </button>

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`lg:hidden p-1.5 rounded-lg transition-colors ${
              isScrolled ? 'text-stone-800' : 'text-white'
            }`}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-stone-200 px-6 py-4 space-y-3 shadow-xl animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2 rounded-xl text-stone-700 hover:bg-[#f6ede3] hover:text-[#915e34] text-xs font-medium transition-colors"
                >
                  <Icon className="w-4 h-4 text-[#a37248]" />
                  <span>{link.label}</span>
                </a>
              );
            })}
          </div>
          <div className="pt-2 border-t border-stone-100 flex gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenEditModal();
              }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#f7eee5] text-[#86562f] text-xs font-semibold"
            >
              <Settings className="w-3.5 h-3.5" />
              Tùy biến thiệp
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenGuestModal();
              }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#a06b3e] text-white text-xs font-semibold"
            >
              <Users className="w-3.5 h-3.5" />
              QL Khách ({guestCount})
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
