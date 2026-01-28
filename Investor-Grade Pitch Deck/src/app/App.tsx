import { useState, useEffect } from 'react';
import { Cover } from '@/app/components/slides/Cover';
import { Problem } from '@/app/components/slides/Problem';
import { WhatsBroken } from '@/app/components/slides/WhatsBroken';
import { WhyNow } from '@/app/components/slides/WhyNow';
import { CoreInsight } from '@/app/components/slides/CoreInsight';
import { Solution } from '@/app/components/slides/Solution';
import { HowItWorks } from '@/app/components/slides/HowItWorks';
import { ProductInAction } from '@/app/components/slides/ProductInAction';
import { WhyWeWin } from '@/app/components/slides/WhyWeWin';
import { Market } from '@/app/components/slides/Market';
import { VisionAndAsk } from '@/app/components/slides/VisionAndAsk';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
  Cover,
  Problem,
  WhatsBroken,
  WhyNow,
  CoreInsight,
  Solution,
  HowItWorks,
  ProductInAction,
  WhyWeWin,
  Market,
  VisionAndAsk,
];

export default function App() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && currentSlide < slides.length - 1) {
        setCurrentSlide((prev) => prev + 1);
      } else if (e.key === 'ArrowLeft' && currentSlide > 0) {
        setCurrentSlide((prev) => prev - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide]);

  const CurrentSlideComponent = slides[currentSlide];

  return (
    <div className="size-full bg-[#0a0a0a] text-white flex flex-col">
      <div className="flex-1 flex items-center justify-center p-12">
        <CurrentSlideComponent />
      </div>

      {/* Navigation */}
      <div className="fixed bottom-8 left-0 right-0 flex items-center justify-center gap-6">
        <button
          onClick={() => setCurrentSlide((prev) => Math.max(0, prev - 1))}
          disabled={currentSlide === 0}
          className="p-2 rounded-full bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft className="size-5" />
        </button>

        <div className="flex items-center gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-1.5 rounded-full transition-all ${
                index === currentSlide
                  ? 'w-8 bg-blue-500'
                  : 'w-1.5 bg-zinc-700 hover:bg-zinc-600'
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => setCurrentSlide((prev) => Math.min(slides.length - 1, prev + 1))}
          disabled={currentSlide === slides.length - 1}
          className="p-2 rounded-full bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>

      {/* Slide Counter */}
      <div className="fixed top-8 right-12 text-sm text-zinc-500 font-mono">
        {currentSlide + 1} / {slides.length}
      </div>
    </div>
  );
}
