import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Music } from 'lucide-react';
import { AudioTrack } from '../types';

interface AudioPlayerProps {
  currentTrack: AudioTrack;
  onTrackChange?: (track: AudioTrack) => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ currentTrack }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fallbackSrc = '/audio/pachelbel-canon.mp3';
  const resolvedSrc =
    currentTrack.src && !currentTrack.src.includes('mixkit.co')
      ? currentTrack.src
      : fallbackSrc;

  // Initialize and try auto-play
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.6;

    const tryAutoPlay = async () => {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch {
        // Autoplay blocked by browser policy until user gesture
        setIsPlaying(false);
      }
    };

    tryAutoPlay();

    // Add one-time user interaction listener to start music if autoplay was blocked
    const handleFirstUserGesture = () => {
      if (audioRef.current && audioRef.current.paused) {
        audioRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch(() => {});
      }
    };

    window.addEventListener('click', handleFirstUserGesture, { once: true });
    window.addEventListener('touchstart', handleFirstUserGesture, { once: true });

    return () => {
      window.removeEventListener('click', handleFirstUserGesture);
      window.removeEventListener('touchstart', handleFirstUserGesture);
    };
  }, [resolvedSrc]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch((err) => {
            console.warn('Audio play request not fulfilled:', err?.message || err);
            setIsPlaying(false);
          });
      }
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Hidden HTML5 audio element */}
      <audio
        ref={audioRef}
        src={resolvedSrc}
        loop
        preload="auto"
        onError={() => {
          if (audioRef.current && !audioRef.current.src.endsWith(fallbackSrc)) {
            console.warn('Audio track source error, falling back to local Canon in D');
            audioRef.current.src = fallbackSrc;
            audioRef.current.load();
          }
        }}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Floating Vinyl Record Button */}
      <div className="relative group">
        {/* Subtle tooltip on hover */}
        <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-900/90 text-white text-xs font-medium backdrop-blur-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
          <Music className="w-3.5 h-3.5 text-[#e5ba88]" />
          <span>{isPlaying ? 'Tạm dừng nhạc' : 'Phát nhạc nền'}</span>
        </div>

        {/* Ambient Glow ring when playing */}
        {isPlaying && (
          <div className="absolute -inset-1 rounded-full bg-[#dfb48c]/30 blur-sm animate-pulse" />
        )}

        {/* Spinning Vinyl Disc */}
        <button
          onClick={togglePlay}
          aria-label={isPlaying ? 'Tạm dừng nhạc' : 'Bật nhạc'}
          className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-full p-1 bg-stone-950 shadow-2xl border-2 border-[#caa077]/70 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
            isPlaying ? 'shadow-[#b58759]/20' : 'opacity-85 hover:opacity-100'
          }`}
        >
          {/* Vinyl Grooves Body (Spins when playing) */}
          <div
            className={`w-full h-full rounded-full bg-stone-900 relative flex items-center justify-center overflow-hidden transition-all ${
              isPlaying ? 'animate-spin-slow' : ''
            }`}
            style={{
              backgroundImage: `radial-gradient(circle, #26211e 0%, #171413 40%, #2b2521 42%, #141211 60%, #26211e 62%, #12100f 100%)`,
              boxShadow: 'inset 0 0 8px rgba(0,0,0,0.8)',
            }}
          >
            {/* Concentric groove rings */}
            <div className="absolute inset-1.5 rounded-full border border-stone-700/30" />
            <div className="absolute inset-3 rounded-full border border-stone-700/25" />

            {/* Vinyl Center Label (Rose gold / Warm copper) */}
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-tr from-[#9c663a] via-[#dfb48c] to-[#b8855b] flex items-center justify-center shadow-inner relative border border-[#ffe0c2]/40">
              {/* Center spindle hole */}
              <div className="w-1.5 h-1.5 rounded-full bg-stone-950 shadow-sm" />
            </div>
          </div>

          {/* Center Play/Pause Overlay Icon */}
          <div
            className={`absolute inset-0 flex items-center justify-center rounded-full transition-opacity duration-200 ${
              isPlaying
                ? 'opacity-0 group-hover:opacity-100 bg-black/40'
                : 'opacity-100 bg-black/30'
            }`}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 text-white drop-shadow-md" />
            ) : (
              <Play className="w-4 h-4 text-white ml-0.5 drop-shadow-md" />
            )}
          </div>
        </button>
      </div>
    </div>
  );
};
