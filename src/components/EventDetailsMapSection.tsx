import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MapPin,
  Navigation,
  Clock,
  Calendar,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Compass,
  LocateFixed,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { WeddingData, WeddingEvent } from '../types';

interface EventDetailsMapSectionProps {
  weddingData: WeddingData;
}

export const EventDetailsMapSection: React.FC<EventDetailsMapSectionProps> = ({
  weddingData,
}) => {
  const [selectedEventId, setSelectedEventId] = useState<string>(
    weddingData.events[weddingData.events.length - 1]?.id || weddingData.events[0]?.id
  );
  const [copiedAddressId, setCopiedAddressId] = useState<string | null>(null);
  const [interactiveMode, setInteractiveMode] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const currentEvent =
    weddingData.events.find((e) => e.id === selectedEventId) || weddingData.events[0];

  // Helper to extract clean & precise destination query for Google Maps navigation
  const getDestinationQuery = (event: WeddingEvent): string => {
    if (event.mapQuery && event.mapQuery.trim()) {
      return event.mapQuery.trim();
    }
    if (event.venueName && event.address) {
      return `${event.venueName}, ${event.address}`.trim();
    }
    return event.address || event.venueName;
  };

  // Google Maps Turn-by-Turn Directions URL (natively launches Google Maps app on iOS/Android or navigation on web)
  const getGoogleMapsDirectionsUrl = (event: WeddingEvent): string => {
    const destination = getDestinationQuery(event);
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
  };

  // Google Maps Search / Location Pin URL
  const getGoogleMapsSearchUrl = (event: WeddingEvent): string => {
    const query = getDestinationQuery(event);
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  };

  // Apple Maps URL for iOS devices
  const getAppleMapsUrl = (event: WeddingEvent): string => {
    const query = getDestinationQuery(event);
    return `https://maps.apple.com/?q=${encodeURIComponent(query)}`;
  };

  const handleOpenGoogleMaps = (event: WeddingEvent) => {
    const url = getGoogleMapsDirectionsUrl(event);
    setToastMessage(`Đang mở ứng dụng Google Maps dẫn đường đến ${event.venueName}...`);
    setTimeout(() => setToastMessage(null), 3000);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopyAddress = (event: WeddingEvent) => {
    navigator.clipboard.writeText(event.address);
    setCopiedAddressId(event.id);
    setToastMessage(`Đã sao chép địa chỉ: ${event.address}`);
    setTimeout(() => {
      setCopiedAddressId(null);
      setToastMessage(null);
    }, 2500);
  };

  return (
    <section id="events" className="py-24 bg-[#f6efe6] relative overflow-hidden">
      {/* Toast Notification when clicking to open navigation */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-stone-900/90 text-white backdrop-blur-md shadow-2xl flex items-center gap-2.5 text-xs sm:text-sm font-medium border border-white/10"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#a06a3e] font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>THỜI GIAN & ĐỊA ĐIỂM TỔ CHỨC</span>
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <h2 className="font-serif-display text-3xl sm:text-5xl text-[#31251e] font-normal mb-4">
            Lịch Trình Hôn Lễ
          </h2>
          <p className="text-stone-500 text-sm font-light leading-relaxed">
            Sự hiện diện của quý vị là niềm vinh hạnh to lớn và lời chúc phúc ý nghĩa nhất đối với đôi lứa và hai bên gia đình.
          </p>
        </div>

        {/* Event Cards Grid */}
        <div
          className={`grid grid-cols-1 ${
            weddingData.events.length <= 2
              ? 'md:grid-cols-2 max-w-4xl mx-auto'
              : 'md:grid-cols-3'
          } gap-6 mb-16`}
        >
          {weddingData.events.map((event, index) => {
            const isSelected = event.id === selectedEventId;
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                onClick={() => setSelectedEventId(event.id)}
                className={`cursor-pointer rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between ${
                  isSelected
                    ? 'bg-white shadow-xl ring-2 ring-[#b8855b] transform -translate-y-1'
                    : 'bg-white/70 hover:bg-white shadow-sm border border-[#e8ded2] hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${
                        event.side === 'groom'
                          ? 'bg-blue-50 text-blue-700'
                          : event.side === 'bride'
                          ? 'bg-rose-50 text-rose-700'
                          : 'bg-amber-50 text-amber-800'
                      }`}
                    >
                      {event.side === 'groom'
                        ? 'NHÀ TRAI'
                        : event.side === 'bride'
                        ? 'NHÀ GÁI'
                        : 'LỄ CƯỚI'}
                    </span>
                    {isSelected && (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-[#a06a3e]">
                        <Navigation className="w-3 h-3" /> Đang xem bản đồ
                      </span>
                    )}
                  </div>

                  <h3 className="font-serif-display text-xl sm:text-2xl text-stone-800 font-medium mb-3">
                    {event.title}
                  </h3>

                  <div className="space-y-2 text-xs text-stone-600 mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#a06a3e] shrink-0" />
                      <span className="font-medium text-stone-800">{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#a06a3e] shrink-0" />
                      <span>{event.dateText}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-[#a06a3e] shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-stone-800">{event.venueName}</div>
                        <div className="text-stone-500 font-light mt-0.5">{event.address}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-100 flex flex-wrap items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenGoogleMaps(event);
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#a06a3e] to-[#89572e] hover:from-[#8d5b32] hover:to-[#764823] text-white text-xs font-semibold shadow-sm transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                    title="Mở ứng dụng Google Maps dẫn đường chính xác"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Chỉ đường Google Maps</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyAddress(event);
                    }}
                    className="p-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600 transition-colors"
                    title="Sao chép địa chỉ"
                  >
                    {copiedAddressId === event.id ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Interactive Google Maps Preview with Tap-to-Navigate Feature */}
        <div id="map" className="bg-white rounded-3xl p-4 sm:p-6 shadow-md border border-[#e5d9cc]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 mb-4 border-b border-stone-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
                  <MapPin className="w-4 h-4 text-rose-500" />
                </span>
                <h4 className="font-semibold text-stone-800 text-sm sm:text-base">
                  Bản Đồ Vị Trí: {currentEvent.venueName}
                </h4>
              </div>
              <p className="text-xs text-stone-500 mt-1 pl-8">
                {currentEvent.address}
              </p>
            </div>

            {/* Direct Navigation Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleOpenGoogleMaps(currentEvent)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1a73e8] hover:bg-[#1558b3] text-white text-xs font-semibold shadow-sm hover:shadow transition-all transform hover:-translate-y-0.5"
                title="Mở ứng dụng Google Maps dẫn đường chính xác đến vị trí"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Mở Google Maps Dẫn Đường</span>
                <ExternalLink className="w-3 h-3 opacity-80" />
              </button>

              <a
                href={getAppleMapsUrl(currentEvent)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium transition-colors"
                title="Mở trên ứng dụng Apple Maps"
              >
                <span>Apple Maps</span>
                <ExternalLink className="w-3 h-3 text-stone-500" />
              </a>

              <button
                onClick={() => handleCopyAddress(currentEvent)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-medium transition-colors"
                title="Sao chép địa chỉ sự kiện"
              >
                {copiedAddressId === currentEvent.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Đã chép</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-stone-500" />
                    <span>Chép địa chỉ</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Map View Container with Tap-To-Navigate Overlay */}
          <div className="relative w-full h-80 sm:h-[420px] rounded-2xl overflow-hidden border border-stone-200 shadow-inner bg-stone-100">
            {/* Embedded Google Maps Iframe */}
            <iframe
              title={`Bản đồ ${currentEvent.venueName}`}
              src={
                currentEvent.mapEmbedUrl && currentEvent.mapEmbedUrl.trim() !== ''
                  ? currentEvent.mapEmbedUrl
                  : `https://maps.google.com/maps?q=${encodeURIComponent(
                      getDestinationQuery(currentEvent)
                    )}&t=&z=16&ie=UTF8&iwloc=&output=embed`
              }
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full"
            />

            {/* Click-to-Navigate Overlay Layer */}
            {!interactiveMode ? (
              <div
                onClick={() => handleOpenGoogleMaps(currentEvent)}
                className="absolute inset-0 bg-stone-900/10 hover:bg-stone-900/25 transition-all duration-300 cursor-pointer flex flex-col justify-between p-4 sm:p-6 group select-none"
              >
                {/* Top Badge: Tap prompt */}
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md text-[#1a73e8] text-xs font-semibold shadow-lg border border-white/60 transform group-hover:scale-105 transition-transform">
                    <LocateFixed className="w-4 h-4 animate-pulse text-[#1a73e8]" />
                    <span>Nhấn vào bản đồ để mở ứng dụng Google Maps dẫn đường</span>
                  </div>

                  {/* Mode switcher to allow in-page pan/zoom if guest prefers */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setInteractiveMode(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-900/80 hover:bg-stone-900 text-white text-[11px] font-medium backdrop-blur-md shadow-md transition-colors"
                    title="Chuyển sang chế độ phóng to/thu nhỏ trực tiếp trên trang"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Tương tác trên web</span>
                  </button>
                </div>

                {/* Center Floating Action Card on Hover / Tap */}
                <div className="self-center transform transition-all duration-300 group-hover:scale-105 sm:opacity-90 sm:group-hover:opacity-100">
                  <div className="px-5 py-3.5 rounded-2xl bg-white/95 backdrop-blur-md shadow-2xl border border-stone-200/80 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1a73e8] to-[#4285f4] text-white flex items-center justify-center shadow-md">
                      <Navigation className="w-5 h-5 text-white animate-bounce" />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-stone-900 flex items-center gap-1.5">
                        <span>Chạm để mở Google Maps dẫn đường</span>
                        <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
                      </div>
                      <div className="text-[11px] text-stone-500 max-w-[260px] sm:max-w-[340px] truncate">
                        {currentEvent.venueName} • {currentEvent.address}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Information Bar */}
                <div className="flex items-center justify-between text-white text-xs">
                  <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-black/60 backdrop-blur-sm">
                    <Compass className="w-3.5 h-3.5 text-amber-300" />
                    <span>Dẫn đường chính xác từng khúc cua tới địa điểm hôn lễ</span>
                  </div>
                  <div className="ml-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#1a73e8] text-white font-medium text-xs shadow-md">
                    <Navigation className="w-3 h-3" />
                    <span>Mở Google Maps</span>
                  </div>
                </div>
              </div>
            ) : (
              /* When interactiveMode is active, user can pan/zoom in iframe, with button to restore tap-to-navigate */
              <div className="absolute top-3 right-3 flex items-center gap-2 pointer-events-auto z-20">
                <button
                  onClick={() => handleOpenGoogleMaps(currentEvent)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1a73e8] hover:bg-[#1558b3] text-white text-xs font-semibold shadow-lg transition-colors"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Mở Google Maps</span>
                </button>
                <button
                  onClick={() => setInteractiveMode(false)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/90 hover:bg-white text-stone-800 text-xs font-medium shadow-lg border border-stone-200 transition-colors"
                >
                  <span>Chế độ chạm mở app</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
