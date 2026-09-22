"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";

// Muted, looping background film. Starts paused for visitors who prefer
// reduced motion, and always offers a visible play/pause control.
export function BackgroundVideo({
  src,
  poster,
  className,
  controlClassName,
}: {
  src: string;
  poster: string;
  className?: string;
  controlClassName?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!reduce.matches) {
      video.play().catch(() => setPlaying(false));
    }
  }, []);

  function toggle() {
    const video = ref.current;
    if (!video) return;
    if (video.paused) video.play();
    else video.pause();
  }

  return (
    <>
      <video
        ref={ref}
        className={className}
        poster={poster}
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      >
        <source src={src} type="video/mp4" />
      </video>
      <button
        type="button"
        onClick={toggle}
        className={`inline-flex items-center gap-2 rounded-full border border-white/30 bg-black/20 px-4 py-2 text-[13px] text-white backdrop-blur-sm transition hover:bg-black/40 ${controlClassName ?? ""}`}
        aria-label={playing ? "Pause background film" : "Play background film"}
      >
        {playing ? <Pause size={13} /> : <Play size={13} />}
        {playing ? "Pause film" : "Play film"}
      </button>
    </>
  );
}
