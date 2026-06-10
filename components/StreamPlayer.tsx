'use client';

import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { AlertCircle, RefreshCw, Volume2, VolumeX } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

interface StreamPlayerProps {
  streamUrl: string;
  title?: string;
  isLive?: boolean;
}

export default function StreamPlayer({ streamUrl, title, isLive = false }: StreamPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamUrl) return;

    const destroyHls = () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: isLive,
        backBufferLength: isLive ? 30 : 90,
      });

      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setLoading(false);
        video.play().catch(() => {
          // Autoplay blocked — user needs to interact
        });
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              setError('Erreur réseau. Veuillez vérifier votre connexion.');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              setError('Erreur de lecture du flux. Veuillez réessayer.');
              destroyHls();
              break;
          }
        }
      });

      hlsRef.current = hls;
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari / iOS)
      video.src = streamUrl;
      video.addEventListener('loadedmetadata', () => {
        setLoading(false);
        video.play().catch(() => {});
      });
      video.addEventListener('error', () => {
        setError('Erreur de lecture du flux.');
      });
    } else {
      setTimeout(() => {
        setError('Votre navigateur ne supporte pas la lecture vidéo HLS.');
      }, 0);
    }

    return destroyHls;
  }, [streamUrl, isLive]);

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    if (videoRef.current) {
      videoRef.current.load();
    }
    // Re-trigger by re-mounting
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    const video = videoRef.current;
    if (video && Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true, lowLatencyMode: isLive });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setLoading(false);
        video.play().catch(() => {});
      });
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) setError('Erreur de lecture. Veuillez réessayer.');
      });
      hlsRef.current = hls;
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setMuted(videoRef.current.muted);
    }
  };

  return (
    <div className="relative w-full max-w-[1100px] mx-auto">
      {/* Live Badge */}
      {isLive && (
        <div className="absolute top-[var(--space-md)] left-[var(--space-md)] z-10 flex items-center gap-[var(--space-xs)] bg-[var(--brand-danger)] px-3.5 py-1.5 rounded-full text-xs font-bold text-white tracking-wider uppercase shadow-[0_4px_12px_rgba(225,29,72,0.3)]">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
          En direct
        </div>
      )}

      {/* Mute toggle */}
      <button
        onClick={toggleMute}
        className="absolute top-[var(--space-md)] right-[var(--space-md)] z-10 bg-[var(--obsidian-night)]/70 backdrop-blur-md border border-[var(--border-default)] rounded-full w-10 h-10 flex items-center justify-center cursor-pointer text-white transition-all duration-300 hover:bg-[var(--obsidian-night)] hover:scale-105"
        aria-label={muted ? 'Activer le son' : 'Couper le son'}
      >
        {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
      </button>

      {/* Video Container */}
      <div className="relative w-full pt-[56.25%] rounded-[var(--radius-md)] overflow-hidden bg-black border border-[var(--border-strong)] shadow-[var(--shadow-lg)]">
        {/* Loading overlay using shared LoadingSpinner component */}
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--bg-base)] z-[5] opacity-95">
            <LoadingSpinner 
              variant="spinner" 
              size="lg" 
              label={isLive ? 'Connexion au flux en direct...' : 'Chargement de la vidéo...'} 
            />
          </div>
        )}

        {/* Error overlay */}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--bg-surface)] z-[6] gap-[var(--space-md)]">
            <AlertCircle size={36} className="text-[var(--brand-danger)]" />
            <p className="text-[var(--brand-danger)] text-sm font-semibold text-center max-w-[300px]">
              {error}
            </p>
            <button
              onClick={handleRetry}
              className="btn-primary no-underline flex items-center gap-[var(--space-xs)] py-2.5 px-6 font-semibold text-sm cursor-pointer"
            >
              <RefreshCw size={16} /> Réessayer
            </button>
          </div>
        )}

        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          controls
          className="absolute inset-0 w-full h-full object-contain bg-black"
        />
      </div>

      {/* Title bar */}
      {title && (
        <div className="mt-[var(--space-md)] py-4 px-5 bg-[var(--gradient-card)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] shadow-[var(--shadow-sm)]">
          <h2 className="text-lg font-bold text-[var(--text-primary)] font-display">
            {title}
          </h2>
        </div>
      )}
    </div>
  );
}
