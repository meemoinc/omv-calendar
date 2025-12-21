import { startOfMonth, endOfMonth } from 'date-fns';

const DHIVEHI_GREGORIAN_MONTHS = [
  'ޖެނުއަރީ',
  'ފެބްރުއަރީ',
  'މާރިޗް',
  'އޭޕްރިލް',
  'މޭ',
  'ޖޫން',
  'ޖުލައި',
  'އޯގަސްޓް',
  'ސެޕްޓެމްބަރ',
  'އޮކްޓޯބަރ',
  'ނޮވެމްބަރ',
  'ޑިސެމްބަރ',
];


export function toHijri(date: Date, locale = 'en-US') {
  const formatter = new Intl.DateTimeFormat(`${locale}-u-ca-islamic`, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return formatter
    .formatToParts(date)
    .filter(part => part.type !== 'era') // removes "AH"
    .map(part => part.value)
    .join('')
    .trim();
}


export function getHijriMonthRange(
  date: Date,
  locale = 'ar'
) {
  const formatter = new Intl.DateTimeFormat(
    `${locale}-u-ca-islamic`,
    {
      month: 'long',
      year: 'numeric',
    }
  );

  const getParts = (d: Date) =>
    formatter
      .formatToParts(d)
      .filter(p => p.type !== 'era');

  const start = getParts(startOfMonth(date));
  const end = getParts(endOfMonth(date));

  const startMonth = start.find(p => p.type === 'month')?.value;
  const endMonth = end.find(p => p.type === 'month')?.value;

  const startYear = start.find(p => p.type === 'year')?.value;
  const endYear = end.find(p => p.type === 'year')?.value;

  // Same Hijri month
  if (startMonth === endMonth && startYear === endYear) {
    return `${startYear} ${startMonth}`;
  }

  // Same year, two months
  if (startYear === endYear) {
    return `${startYear} ${startMonth} – ${endMonth}`;
  }

  // Year rollover (rare but possible)
  return `${startYear} ${startMonth} – ${endYear} ${endMonth}`;
}


type DhivehiGregorianFormatOptions = {
  day?: boolean;
  month?: boolean;
  year?: boolean;
};

export function toDhivehiGregorian(
  date: Date,
  options: DhivehiGregorianFormatOptions = {
    day: false,
    month: true,
    year: false,
  }
) {
  const day = date.getDate();
  const monthIndex = date.getMonth();
  const year = date.getFullYear();

  const parts: string[] = [];

  if (options.month)
    parts.push(DHIVEHI_GREGORIAN_MONTHS[monthIndex]);

  if (options.year) parts.push(year.toString());

  if (options.day) parts.push(day.toString());

  // Natural Dhivehi order: Month Year Day
  return parts.join(' ');
}