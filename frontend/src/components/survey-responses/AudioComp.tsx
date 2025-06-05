'use client'; // Needed for client-side interactivity in Next.js 13+

import { useRef, useState } from 'react';

export default function AudioComp({ audioUrl }:any) {
  const audioRef = useRef(null);
  console.log("sudio",audioUrl)
  const [isPlaying, setIsPlaying] = useState(false);

  const toggleAudio = (e:any) => {
    e.stopPropagation()
    const audio :any = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }

    setIsPlaying(!isPlaying);
  };

  return (
    <div onClick={toggleAudio} style={{ cursor: 'pointer', fontSize: '24px' }}>
      <audio ref={audioRef} src={audioUrl} preload="auto" />
      {isPlaying ? '⏸' : '▶'}
    </div>
  );
}