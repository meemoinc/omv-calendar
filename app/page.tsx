import { redirect } from 'next/navigation';

export default function Home() {
  const monthSlug = [
    'jan', 'feb', 'mar', 'apr', 'may', 'jun',
    'jul', 'aug', 'sep', 'oct', 'nov', 'dec'
  ][new Date().getMonth()];

  redirect(`/${monthSlug}`);
}