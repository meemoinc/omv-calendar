'use client';

import React from 'react';

import '@/app/globals.css';

export default function TeaOoredoo() {
  return (
    <div className="footerOoredooTea rounded-xl mb-5">
      <div className="footerOoredooTeaContent rounded-xl px-7 py-7">
        <img src="/logo_tea_ooredoo.png" alt="tea" className='w-50 mb-5' />

        <h2 className='mb-5'>Every cup tells a story</h2>
        <p>Maldivians love their tea, in the morning or evening, with a warm hedhika or alongside mashuni and roshi. Our tea culture holds the flavours, memories, and small moments that bring us together. This year’s calendar celebrates twelve unique teas. Sip through the refreshing brightness of lemon, the gentle calm of jasmine, and the sweetness of mango. Drift into tropical flavours or slow down with soothing herbal brews like blue pea and basil. From floral notes to familiar homegrown tastes, every month introduces a new experience. Here’s to a year brewed with colour, culture, and connection. A year to refresh, to unwind, to rediscover simple joys, one cup at a time.</p>
      </div>
      <img src="/bg_tea.png" alt="tea" className='backgroundImage rounded-xl' />
    </div>
  );
}
