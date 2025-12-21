'use client';

import Image from "next/image";
import Calendar from "@/components/Calendar";
import { useParams } from 'next/navigation';
import monthData from '@/util/month.json';
import '@/app/globals.css';
import MonthTransition from '@/components/MonthTransition';
import TeaOoredoo from '@/components/TeaOoredoo';
import { useState, useEffect } from 'react';

import Link from 'next/link';

export default function MonthPage() {
  const params = useParams();
  const { month } = params; // e.g., 'jan'
  const [scrollOpacity, setScrollOpacity] = useState(0);
  const [backdropBlur, setBackdropBlur] = useState(0);

  const monthMap: Record<string, number> = {
    jan: 1,
    feb: 2,
    mar: 3,
    apr: 4,
    may: 5,
    jun: 6,
    jul: 7,
    aug: 8,
    sep: 9,
    oct: 10,
    nov: 11,
    dec: 12,
  };

  const monthNumber = monthMap[month.toLowerCase()] || 1; // default to Jan
  const year = 2026; // you can make this dynamic if needed

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY || window.pageYOffset;
      // Calculate opacity: 0 at scroll 0, up to 0.5 (50%) as user scrolls
      // Using a threshold of 800px for full opacity (adjust as needed)
      const maxScroll = 800;
      const scrollProgress = Math.min(scrollPosition / maxScroll, 1);
      const opacity = scrollProgress * 0.8;
      // Calculate backdrop blur: 0px at scroll 0, up to 16px (backdrop-blur-lg equivalent) as user scrolls
      const blur = scrollProgress * 16;
      setScrollOpacity(opacity);
      setBackdropBlur(blur);
    };

    // Set initial values
    handleScroll();

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div style={{
      backgroundImage: `${monthData[month].theme_color}`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      <main className=" w-full max-w-3xl mx-auto z-9 relative p-4 z-1" style={{ paddingTop: '400px' }}>


        <Calendar month={monthNumber} year={year} expanded={true} />

        <h2 className="mt-8">Tea of the Month</h2>
        <div>
          <h1>{monthData[month].flower}</h1>
          <strong className="flowerMv">{monthData[month].flower_mv}</strong>
        </div>

        <div className="text-white mb-8">
          <p>{monthData[month].flower_description}</p>
        </div>

        <h2 className="mb-4">Benefits of {monthData[month].flower}</h2>
        <div className="flex md:grid md:grid-cols-3 gap-4 mb-8 overflow-x-auto md:overflow-x-visible scrollbar-hide md:scrollbar-default">
          <div className="benefitCard rounded-xl max-w-[270px] md:min-w-0 flex-shrink-0 md:flex-shrink">
            <strong className="block mb-3">Benefit 1</strong>
            <p>{monthData[month].flower_benefit_1}</p>
          </div>
          <div className="benefitCard rounded-xl max-w-[270px] md:min-w-0 flex-shrink-0 md:flex-shrink">
            <strong className="block mb-3">Benefit 2</strong>
            <p>{monthData[month].flower_benefit_2}</p>
          </div>
          <div className="benefitCard rounded-xl max-w-[270px] md:min-w-0 flex-shrink-0 md:flex-shrink">
            <strong className="block mb-3">Benefit 3</strong>
            <p>{monthData[month].flower_benefit_3}</p>
          </div>
        </div>
        <TeaOoredoo />
      </main>

      <div className="fixed top-0 left-0 right-0 z-1">
        <div
          className="w-full absolute left-0 top-0 right-0 bottom-0 z-20 h-full transition-all duration-300 ease-out"
          style={{
            backgroundColor: `rgba(0, 0, 0, ${scrollOpacity})`,
            backdropFilter: `blur(${backdropBlur}px)`,
            WebkitBackdropFilter: `blur(${backdropBlur}px)`
          }}
        ></div>
        <div className="backdrop-blur-xs w-full absolute left-0 top-[380px] right-0 z-20 h-[500px] "></div>
        {/* <div className="backdrop-blur-xs w-full absolute left-0 top-[440px] right-0 z-21 h-[250px] "></div> */}
        <div style={{ height: '550px', }}>
          <video preload="metadata" width="100%" height="100%" className="pointer-events-none" autoPlay muted loop playsInline style={{ height: '550px', objectFit: 'cover' }}>
            <source src={`/mp4/${monthData[month].video}`} type="video/mp4" />
          </video>
        </div>
      </div>
      <div
        className="fixed inset-0 z-0 top-0 right-0 left-0 blur-sm"
        style={{
          backgroundImage: `${monthData[month].theme_color}, url(${`/${monthData[month].flower_image}`})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
    </div>
  );
}

