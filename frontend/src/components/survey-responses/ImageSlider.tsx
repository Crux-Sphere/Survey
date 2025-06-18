"use client";

import { useState, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Thumbs } from "swiper/modules";
import { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/thumbs";

export default function ImageSlider({ images }: { images: string[] }) {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="w-full max-w-4xl mx-auto p-4"
    >
      {/* Main Slider */}
      <Swiper
        modules={[Navigation, Pagination, Thumbs]}
        spaceBetween={10}
        navigation
        pagination={{ clickable: true }}
        thumbs={{ swiper: thumbsSwiper }}
        className="rounded-xl shadow-lg mb-4"
      >
        {images.map((src, index) => (
          <SwiperSlide key={index}>
            <img
              src={src}
              alt={`Slide ${index + 1}`}
              className="w-full h-[400px] object-cover rounded-xl"
            />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Thumbnail Slider */}
      {images.length > 1 && (
        <Swiper
          modules={[Thumbs]}
          onSwiper={setThumbsSwiper}
          spaceBetween={10}
          slidesPerView={Math.min(images.length, 4)}
          watchSlidesProgress
          className="rounded-md"
        >
          {images.map((src, index) => (
            <SwiperSlide key={index}>
              <img
                src={src}
                alt={`Thumbnail ${index + 1}`}
                className="h-[80px] w-full object-cover rounded-md cursor-pointer border hover:border-blue-500"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </div>
  );
}
