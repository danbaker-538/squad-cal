"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface FallingPhoto {
  id: number;
  src: string;
  left: number; // % from left
  delay: number; // seconds
  duration: number; // seconds
  rotation: number; // degrees
  size: number; // px width
}

export function FallingPhotos({ photos }: { photos: string[] }) {
  const [items, setItems] = useState<FallingPhoto[]>([]);

  useEffect(() => {
    if (photos.length === 0) return;

    // Generate ~15 falling photos at a time, cycling through the photo list
    const generated: FallingPhoto[] = [];
    const count = Math.min(18, photos.length * 2);

    for (let i = 0; i < count; i++) {
      generated.push({
        id: i,
        src: photos[i % photos.length],
        left: Math.random() * 90 + 2, // 2-92%
        delay: Math.random() * 12, // 0-12s stagger
        duration: 14 + Math.random() * 10, // 14-24s fall time
        rotation: Math.random() * 30 - 15, // -15 to +15 degrees
        size: 70 + Math.random() * 40, // 70-110px
      });
    }

    setItems(generated);
  }, [photos]);

  if (items.length === 0) return null;

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: -1 }}>
      {items.map((photo) => (
        <div
          key={photo.id}
          className="absolute animate-fall"
          style={{
            left: `${photo.left}%`,
            animationDelay: `${photo.delay}s`,
            animationDuration: `${photo.duration}s`,
          }}
        >
          {/* Polaroid frame */}
          <div
            className="bg-white p-1.5 pb-5 shadow-lg rounded-sm"
            style={{
              transform: `rotate(${photo.rotation}deg)`,
              width: photo.size,
            }}
          >
            <div className="relative w-full" style={{ aspectRatio: "1" }}>
              <Image
                src={photo.src}
                alt=""
                fill
                className="object-cover"
                sizes={`${photo.size}px`}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
