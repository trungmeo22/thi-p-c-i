import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { CalendarPlus, Clock, Sparkles } from 'lucide-react';
import { WeddingData } from '../types';
import { formatTimeRemaining } from '../utils/weddingHelpers';

interface CountdownSectionProps {
  weddingData: WeddingData;
}

export const CountdownSection: React.FC<CountdownSectionProps> = ({ weddingData }) => {
  const [timeLeft, setTimeLeft] = useState(() => formatTimeRemaining(weddingData.targetDateTime));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(formatTimeRemaining(weddingData.targetDateTime));
    }, 1000);
    return () => clearInterval(timer);
  }, [weddingData.targetDateTime]);

  // Google Calendar URL generator
  const getGoogleCalendarUrl = () => {
    const startDate = new Date(weddingData.targetDateTime);
    const endDate = new Date(startDate.getTime() + 4 * 60 * 60 * 1000); // 4 hours duration

    const formatCalDate = (d: Date) =>
      d.toISOString().replace(/-|:|\.\d+/g, '');

    const title = encodeURIComponent(`Đám cưới ${weddingData.groom.name} & ${weddingData.bride.name}`);
    const details = encodeURIComponent(
      `Trân trọng kính mời bạn đến chung vui trong ngày trọng đại của ${weddingData.groom.fullName} và ${weddingData.bride.fullName}.\n\n` +
      `Liên hệ: ${weddingData.groom.phone} (Chú rể) / ${weddingData.bride.phone} (Cô dâu)`
    );
    const mainEvent = weddingData.events[weddingData.events.length - 1] || weddingData.events[0];
    const location = encodeURIComponent(`${mainEvent?.venueName || ''}, ${mainEvent?.address || ''}`);

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${formatCalDate(
      startDate
    )}/${formatCalDate(endDate)}&details=${details}&location=${location}`;
  };

  const handleDownloadIcs = () => {
    const startDate = new Date(weddingData.targetDateTime);
    const endDate = new Date(startDate.getTime() + 4 * 60 * 60 * 1000);
    const formatCalDate = (d: Date) => d.toISOString().replace(/-|:|\.\d+/g, '');
    const mainEvent = weddingData.events[weddingData.events.length - 1] || weddingData.events[0];

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Wedding Invitation//VI',
      'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      `SUMMARY:Đám cưới ${weddingData.groom.name} & ${weddingData.bride.name}`,
      `DESCRIPTION:Trân trọng kính mời bạn đến chung vui cùng gia đình chúng tôi!`,
      `LOCATION:${mainEvent?.venueName || ''}, ${mainEvent?.address || ''}`,
      `DTSTART:${formatCalDate(startDate)}`,
      `DTEND:${formatCalDate(endDate)}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `dam_cuoi_${weddingData.groom.name}_${weddingData.bride.name}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const units = [
    { label: 'NGÀY', value: timeLeft.days },
    { label: 'GIỜ', value: timeLeft.hours },
    { label: 'PHÚT', value: timeLeft.minutes },
    { label: 'GIÂY', value: timeLeft.seconds },
  ];

  return (
    <section
      id="countdown"
      className="relative py-20 bg-gradient-to-b from-[#faf7f2] via-[#f5ede3] to-[#faf7f2] text-stone-800 overflow-hidden"
    >
      {/* Decorative floral watermark */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-200/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 text-center">
        {/* Subtitle with sparkles */}
        <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#a16f43] font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>ĐẾM NGƯỢC KHOẢNH KHẮC THIÊNG LIÊNG</span>
          <Sparkles className="w-3.5 h-3.5" />
        </div>

        <h2 className="font-serif-display text-3xl sm:text-4xl text-[#3b2b23] font-normal mb-3">
          Ngày Chung Đôi Sắp Đến
        </h2>

        <p className="text-stone-500 text-sm max-w-lg mx-auto font-light mb-10">
          Từng giây từng phút trôi qua đều đong đầy yêu thương và mong chờ ngày được đón tiếp quý vị thân thương.
        </p>

        {/* Countdown Units */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 max-w-2xl mx-auto">
          {units.map((unit, index) => (
            <motion.div
              key={unit.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-5 sm:p-6 shadow-md border border-[#eadecd] flex flex-col items-center justify-center group hover:border-[#cb9a6f] transition-colors"
            >
              {/* Gold Top Accent */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-[#c5966c] rounded-b-full opacity-70 group-hover:w-16 transition-all" />

              <span className="font-serif-display text-4xl sm:text-5xl font-semibold text-[#8b5a36] tabular-nums tracking-tight">
                {String(unit.value).padStart(2, '0')}
              </span>
              <span className="text-[11px] font-semibold tracking-widest text-stone-500 uppercase mt-2">
                {unit.label}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Event status message */}
        <div className="mt-8 text-xs text-stone-600 flex items-center justify-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-[#b28257]" />
          <span>
            {timeLeft.isPassed
              ? 'Sự kiện trọng đại đã diễn ra! Cảm ơn mọi người đã đến chung vui!'
              : `Sự kiện sẽ diễn ra vào lúc ${weddingData.events[weddingData.events.length - 1]?.time || '18:00'} ngày ${weddingData.weddingDateFormatted}`}
          </span>
        </div>

        {/* Add to Calendar Buttons */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <a
            href={getGoogleCalendarUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 text-xs font-medium shadow-sm hover:shadow transition-all"
          >
            <CalendarPlus className="w-4 h-4 text-[#a37248]" />
            <span>Thêm vào Google Calendar</span>
          </a>
          <button
            onClick={handleDownloadIcs}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 text-xs font-medium shadow-sm hover:shadow transition-all"
          >
            <CalendarPlus className="w-4 h-4 text-[#a37248]" />
            <span>Tải file lịch (.ICS / Apple Calendar)</span>
          </button>
        </div>
      </div>
    </section>
  );
};
