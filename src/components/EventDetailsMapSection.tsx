import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MapPin, Navigation, Clock, Calendar, Copy, Check, ExternalLink, Sparkles } from 'lucide-react';
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

  const currentEvent =
    weddingData.events.find((e) => e.id === selectedEventId) || weddingData.events[0];

  const handleCopyAddress = (event: WeddingEvent) => {
    navigator.clipboard.writeText(event.address);
    setCopiedAddressId(event.id);
    setTimeout(() => setCopiedAddressId(null), 2500);
  };

  return (
    <section id="events" className="py-24 bg-[#f6efe6] relative overflow-hidden">
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
        <div className={`grid grid-cols-1 ${weddingData.events.length <= 2 ? 'md:grid-cols-2 max-w-4xl mx-auto' : 'md:grid-cols-3'} gap-6 mb-16`}>
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
                        <Navigation className="w-3 h-3" /> Đang xem
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
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                      event.mapQuery || event.address || event.venueName
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#a06a3e] hover:bg-[#89572e] text-white text-xs font-semibold shadow-sm transition-colors"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Chỉ đường</span>
                  </a>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyAddress(event);
                    }}
                    className="p-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600 transition-colors"
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

        {/* Embedded Interactive Map Preview */}
        <div id="map" className="bg-white rounded-3xl p-4 sm:p-6 shadow-md border border-[#e5d9cc]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-stone-100">
            <div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-500" />
                <h4 className="font-semibold text-stone-800 text-sm sm:text-base">
                  Bản Đồ Vị Trí: {currentEvent.venueName}
                </h4>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">{currentEvent.address}</p>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  currentEvent.mapQuery || currentEvent.address || currentEvent.venueName
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium transition-colors"
              >
                <span>Mở Google Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href={`https://maps.apple.com/?q=${encodeURIComponent(
                  currentEvent.mapQuery || currentEvent.address || currentEvent.venueName
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium transition-colors"
              >
                <span>Apple Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="w-full h-80 sm:h-96 rounded-2xl overflow-hidden border border-stone-200 shadow-inner relative bg-stone-100">
            <iframe
              title={`Bản đồ ${currentEvent.venueName}`}
              src={
                currentEvent.mapEmbedUrl && currentEvent.mapEmbedUrl.trim() !== ''
                  ? currentEvent.mapEmbedUrl
                  : `https://maps.google.com/maps?q=${encodeURIComponent(
                      currentEvent.mapQuery || currentEvent.address || currentEvent.venueName
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
          </div>
        </div>
      </div>
    </section>
  );
};
