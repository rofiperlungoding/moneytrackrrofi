import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { SplitText as GSAPSplitText } from 'gsap/SplitText';

gsap.registerPlugin(GSAPSplitText);

interface RotatingTextProps {
  phrases: string[];
  interval?: number;
  textClassName?: string;
}

export const RotatingText: React.FC<RotatingTextProps> = ({
  phrases,
  interval = 2800, // Changed to 2.8 seconds
  textClassName = ''
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const textRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const splitTextRef = useRef<GSAPSplitText | null>(null);

  useEffect(() => {
    if (phrases.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % phrases.length);
    }, interval);

    return () => clearInterval(timer);
  }, [phrases.length, interval]);

  useEffect(() => {
    const textEl = textRef.current;
    const containerEl = containerRef.current;
    const measureEl = measureRef.current;
    
    if (!textEl || !containerEl || !measureEl) return;

    // Clean up previous animation
    if (timelineRef.current) {
      timelineRef.current.kill();
    }
    if (splitTextRef.current) {
      splitTextRef.current.revert();
    }

    // Set the text content for measurement
    measureEl.textContent = phrases[currentIndex];
    const targetWidth = measureEl.offsetWidth;

    // Set transform origin to left center so it expands to the right
    gsap.set(containerEl, { transformOrigin: 'left center' });

    // Animate container width to target width with padding, stretching to the right
    gsap.to(containerEl, {
      width: targetWidth + 48, // Add padding (24px on each side)
      duration: 0.4,
      ease: "power2.out"
    });

    // Set the visible text content
    textEl.textContent = phrases[currentIndex];

    // Create split text instance
    splitTextRef.current = new GSAPSplitText(textEl, {
      type: "chars",
      charsClass: "split-char"
    });

    const chars = splitTextRef.current.chars;

    // Set initial state for characters with left alignment
    gsap.set(chars, {
      yPercent: 100,
      opacity: 0,
      scale: 0.8,
      rotationX: -90,
      transformOrigin: "center center",
      display: "inline-block",
      verticalAlign: "baseline"
    });

    // Create timeline for character animation
    timelineRef.current = gsap.timeline({ delay: 0.2 });
    
    timelineRef.current.to(chars, {
      yPercent: 0,
      opacity: 1,
      scale: 1,
      rotationX: 0,
      duration: 0.6,
      ease: "back.out(1.7)",
      stagger: {
        amount: 0.3,
        from: "start"
      }
    });

    // Cleanup function
    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
      if (splitTextRef.current) {
        splitTextRef.current.revert();
      }
    };
  }, [currentIndex, phrases]);

  return (
    <div className="relative">
      {/* Container with dynamic width, now aligned to start (left) */}
      <div
        ref={containerRef}
        className="bg-cinematic-surface/80 backdrop-blur-premium border-2 border-cinema-green/30 rounded-2xl px-6 py-4 shadow-premium flex items-center justify-start relative overflow-hidden"
        style={{
          minHeight: '60px' // Ensure consistent height
        }}
      >
        {/* Background glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-cinema-green/10 to-cinema-emerald/10 rounded-2xl animate-pulse" />
        
        {/* Text content aligned to the left */}
        <div
          ref={textRef}
          className={`relative z-10 text-left font-bold font-cinematic ${textClassName}`}
          style={{ 
            lineHeight: '1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            height: '100%',
            minHeight: '1em',
            verticalAlign: 'middle'
          }}
        />
      </div>

      {/* Hidden measurement element with same styling */}
      <div
        ref={measureRef}
        className={`absolute opacity-0 pointer-events-none whitespace-nowrap font-bold font-cinematic ${textClassName}`}
        style={{ 
          top: '-1000px',
          left: '-1000px',
          lineHeight: '1'
        }}
      />
    </div>
  );
};