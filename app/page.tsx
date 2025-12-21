import { redirect } from 'next/navigation';

export default function Home() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-11

  const monthAbbreviations = [
    'jan', 'feb', 'mar', 'apr', 'may', 'jun',
    'jul', 'aug', 'sep', 'oct', 'nov', 'dec'
  ];

  let monthSlug: string;

  // If it's December 2025, redirect to January
  if (currentYear === 2025 && currentMonth === 11) {
    monthSlug = 'jan';
  }
  // If year is 2026, redirect to the correct month
  else if (currentYear === 2026) {
    monthSlug = monthAbbreviations[currentMonth];
  }
  // Otherwise, default to January
  else {
    monthSlug = 'jan';
  }

  redirect(`/${monthSlug}`);
}

