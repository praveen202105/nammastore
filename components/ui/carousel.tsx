/* eslint-disable @next/next/no-img-element */
"use client";
import { IconArrowNarrowLeft, IconArrowNarrowRight } from "@tabler/icons-react";
import type React from "react";
import { useState, useRef, useId, useEffect } from "react";

interface SlideData {
  title: string;
  button: string;
  src: string;
}

interface SlideProps {
  slide: SlideData;
  index: number;
  current: number;
  handleSlideClick: (index: number) => void;
  handlePreviousClick: () => void;
  handleNextClick: () => void;
}

const Slide = ({
  slide,
  index,
  current,
  handleSlideClick,
  handlePreviousClick,
  handleNextClick,
}: SlideProps) => {
  const slideRef = useRef<HTMLLIElement>(null);
  const xRef = useRef(0);
  const yRef = useRef(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const animate = () => {
      if (!slideRef.current) return;

      const x = xRef.current;
      const y = yRef.current;

      slideRef.current.style.setProperty("--x", `${x}px`);
      slideRef.current.style.setProperty("--y", `${y}px`);

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  const handleMouseMove = (event: React.MouseEvent) => {
    const el = slideRef.current;
    if (!el) return;

    const r = el.getBoundingClientRect();
    xRef.current = event.clientX - (r.left + Math.floor(r.width / 2));
    yRef.current = event.clientY - (r.top + Math.floor(r.height / 2));
  };

  const handleMouseLeave = () => {
    xRef.current = 0;
    yRef.current = 0;
  };

  const imageLoaded = (event: React.SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.style.opacity = "1";
  };

  const { src, button, title } = slide;

  return (
    <li
      ref={slideRef}
      className="absolute top-0 left-0 w-full h-full flex items-center justify-center touch-pan-y"
      style={{
        transform: `translateX(${(index - current) * 100}%)`,
        transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
      onClick={() => handleSlideClick(index)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="absolute inset-0">
        <img
          className="w-full h-full object-cover"
          alt={title}
          src={src || "/placeholder.svg"}
          onLoad={imageLoaded}
          loading="eager"
          decoding="sync"
        />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      <div className="relative z-10 text-center text-white px-4">
        <h2 className="text-4xl md:text-6xl font-bold mb-8">{title}</h2>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          handlePreviousClick();
        }}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 hidden md:flex items-center justify-center bg-white/80 hover:bg-white rounded-full transition duration-200"
        title="Previous slide"
      >
        <IconArrowNarrowLeft className="text-neutral-600" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleNextClick();
        }}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 hidden md:flex items-center justify-center bg-white/80 hover:bg-white rounded-full transition duration-200"
        title="Next slide"
      >
        <IconArrowNarrowRight className="text-neutral-600" />
      </button>
    </li>
  );
};

interface CarouselProps {
  slides: SlideData[];
}

export default function Carousel({ slides }: CarouselProps) {
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const minSwipeDistance = 50; // minimum distance for a swipe

  const handlePreviousClick = () => {
    const previous = current - 1;
    setCurrent(previous < 0 ? slides.length - 1 : previous);
  };

  const handleNextClick = () => {
    const next = current + 1;
    setCurrent(next === slides.length ? 0 : next);
  };

  const handleSlideClick = (index: number) => {
    if (current !== index) {
      setCurrent(index);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const swipeDistance = touchStartX.current - touchEndX.current;

    if (Math.abs(swipeDistance) > minSwipeDistance) {
      if (swipeDistance > 0) {
        // Swiped left
        handleNextClick();
      } else {
        // Swiped right
        handlePreviousClick();
      }
    }
  };

  const id = useId();

  return (
    <div
      className="relative w-[96vmin] h-[30vh] md:w-[96vmin] md:h-[30vh] lg:w-[100%] lg:h-[60vh] overflow-hidden rounded-md"
      aria-labelledby={`carousel-heading-${id}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <ul className="relative w-full h-full">
        {slides.map((slide, index) => (
          <Slide
            key={index}
            slide={slide}
            index={index}
            current={current}
            handleSlideClick={handleSlideClick}
            handlePreviousClick={handlePreviousClick}
            handleNextClick={handleNextClick}
          />
        ))}
      </ul>
    </div>
  );
}
