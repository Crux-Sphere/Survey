// 'use client'; // Needed for client-side interactivity in Next.js 13+

// import { useRef, useState } from 'react';

// export default function AudioComp({ audioUrl }:any) {
//   const audioRef = useRef(null);
//   console.log("sudio",audioUrl)
//   const [isPlaying, setIsPlaying] = useState(false);

//   const toggleAudio = (e:any) => {
//     e.stopPropagation()
//     const audio :any = audioRef.current;
//     if (!audio) return;

//     if (isPlaying) {
//       audio.pause();
//     } else {
//       audio.play();
//     }

//     setIsPlaying(!isPlaying);
//   };

//   return (
//     <div onClick={toggleAudio} style={{ cursor: 'pointer', fontSize: '24px' }}>
//       <audio ref={audioRef} src={audioUrl} preload="auto" />
//       {isPlaying ? '⏸' : '▶'}
//     </div>
//   );
// }
'use client';

import { useEffect, useRef, useState } from 'react';

export default function AudioComp({ audioUrl }: { audioUrl: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);

  const toggleAudio = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // prevent click from reaching parent
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }

    setIsPlaying(!isPlaying);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
      .toString()
      .padStart(2, '0');
    const seconds = Math.floor(time % 60)
      .toString()
      .padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      if (!isSeeking) setCurrentTime(audio.currentTime);
    };

    const setAudioData = () => {
      setDuration(audio.duration);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', setAudioData);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', setAudioData);
    };
  }, [isSeeking]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
  };

  const handleSeekStart = (e: React.MouseEvent<HTMLInputElement>) => {
    e.stopPropagation();
    setIsSeeking(true);
  };

  const handleSeekEnd = (e: React.MouseEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = currentTime;
    }
    setIsSeeking(false);
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      className="w-full max-w-md mx-auto p-4 rounded "
    >
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      <div className="flex items-center gap-4 mb-2">
        <button
          onClick={toggleAudio}
          className="text-2xl"
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
        <div className="text-sm font-mono w-16 text-right">
          {formatTime(currentTime)}
        </div>
        <input
          type="range"
          min={0}
          max={duration}
          step={0.1}
          value={currentTime}
          onChange={handleSeek}
          onMouseDown={handleSeekStart}
          onMouseUp={handleSeekEnd}
          className="flex-grow"
        />
        <div className="text-sm font-mono w-16">
          {formatTime(duration)}
        </div>
      </div>
    </div>
  );
}
