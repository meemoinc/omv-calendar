import { redirect } from 'next/navigation';

const MONTH_SLUGS = [
  'jan', 'feb', 'mar', 'apr', 'may', 'jun',
  'jul', 'aug', 'sep', 'oct', 'nov', 'dec',
] as const;

// Avoid baking the redirect at build time (static /jan was cached in production).
export const dynamic = 'force-dynamic';

function getCurrentMonthSlug(): string {
  const month = Number(
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'Indian/Maldives',
      month: 'numeric',
    }).format(new Date())
  );

  return MONTH_SLUGS[month - 1];
}

export default function Home() {
  redirect(`/${getCurrentMonthSlug()}`);
}