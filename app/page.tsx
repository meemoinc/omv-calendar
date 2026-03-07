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
  monthSlug = monthAbbreviations[currentMonth];

  redirect(`/${monthSlug}`);
}

