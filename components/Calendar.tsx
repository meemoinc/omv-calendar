'use client';

import {
  addDays,
  endOfMonth,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  parseISO,
  isWithinInterval,
} from 'date-fns';
import { arSA } from 'date-fns/locale';
import React, { useMemo, useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './Calendar.module.css';
import { getHijriMonthRange, toDhivehiGregorian } from '../util/CalendarUtil';
import holidays from '../util/holidays.json';
import nakaiPrayerData from '../util/nakai_prayer.json';

const BOX_SIZE = 36;
const todayDate = new Date();

const nakaiDescriptions = {
  'Mula': 'Strong winds, rough seas',
  'Furahalha': 'Strong north-easterly winds, rough seas',
  'Uthuruhalha': 'Clear blue skies, strong winds, rough seas',
  'Huvan': 'Calm seas, clear blue skies',
  'Dhinasha': 'North-easterly winds, moderate seas, plenty of sunshine',
  'Hiyaviha': 'Seas are calm, days and nights are hot',
  'Furabadhuruva': 'Frequent, short, sharp bursts of thunder and lightning',
  'Fusbadhuruva': 'Usually clear blue skies',
  'Reyva': 'If storm occur they may be severe',
  'Assidha': 'Begins with storm, then becomes hot and dry',
  'Burunu': 'Begins with a storm and strong winds, then becomes calm',
  'Kethi': 'Dark clouds, frequent rains',
  'Roanu': 'Storms, strong winds and rough seas',
  'Miyahelia': 'Storms, rough seas and strong westerly winds',
  'Adha': 'South-westerly winds and light rain',
  'Funoas': 'Storms, rough seas, frequent sudden gales',
  'Fus': 'Wet and overcast',
  'Ahuliha': 'Less frequent storms, calmer days',
  'Maa': 'Generally calm',
  'Fura': 'Isolated showers, usually dry with light north-westerly winds',
  'Uthura': 'Strong north-westerly winds',
  'Atha': 'Generally clear and calm with isolated showers',
  'Hitha': 'Light winds, isolated showers',
  'Hey': 'Strong winds from all directions',
  'Nora': 'Light winds, some sun and showers',
  'Dosha': 'Light north-easterly winds',
}

type Holiday = {
  name: string;
  startDate: string; // YYYY-MM-DD format
  dateRange: string | null; // "YYYY-MM-DD - YYYY-MM-DD" format
  type: 'Public Holiday' | 'School Days' | 'Other' | 'Special Days' | 'Term Holidays' | 'Exam Days';
};

type Props = {
  month?: number; // 1–12
  year?: number;
  expanded?: boolean;
};

type NakaiPrayerData = {
  nakai_name_en: string;
  nakai_name_mv: string;
  nakai_day: number;
  Fajr: number;
  Sunrise: number;
  Dhuhr: number;
  Asr: number;
  Maghrib: number;
  Isha: number;
};

/**
 * Check if a date falls within a holiday's date range
 */
function isDateInHoliday(date: Date, holiday: Holiday): boolean {
  const dateStr = format(date, 'yyyy-MM-dd');

  // Check if date matches startDate
  if (holiday.startDate === dateStr) {
    return true;
  }

  // Check if date falls within dateRange
  if (holiday.dateRange) {
    const [startStr, endStr] = holiday.dateRange.split(' - ');
    const startDate = parseISO(startStr);
    const endDate = parseISO(endStr);
    const endDateStr = format(endDate, 'yyyy-MM-dd');

    // Include both start and end dates
    // isWithinInterval is exclusive of end, so check end date separately
    if (dateStr === endDateStr || isWithinInterval(date, { start: startDate, end: endDate })) {
      return true;
    }
  }

  return false;
}

/**
 * Get all holidays that include a specific date
 */
function getHolidaysForDate(date: Date, holidays: Holiday[]): Holiday[] {
  return holidays.filter(holiday => isDateInHoliday(date, holiday));
}

/**
 * Get holidays for a specific month
 */
function getHolidaysForMonth(year: number, month: number, holidays: Holiday[]): Holiday[] {
  const monthStart = startOfMonth(new Date(year, month));
  const monthEnd = endOfMonth(monthStart);

  return holidays.filter(holiday => {
    const holidayStart = parseISO(holiday.startDate);

    // Check if holiday starts in this month
    if (isSameMonth(holidayStart, monthStart)) {
      return true;
    }

    // Check if holiday has a dateRange that overlaps with this month
    if (holiday.dateRange) {
      const [startStr, endStr] = holiday.dateRange.split(' - ');
      const rangeStart = parseISO(startStr);
      const rangeEnd = parseISO(endStr);

      // Check if range overlaps with month
      return (
        (rangeStart <= monthEnd && rangeEnd >= monthStart) ||
        (rangeStart >= monthStart && rangeStart <= monthEnd)
      );
    }

    return false;
  });
}

/**
 * Get CSS class name for a holiday type
 */
function getHolidayClass(type: Holiday['type']): string {
  const classMap: Record<Holiday['type'], string> = {
    'Public Holiday': 'dayContainerPublicHoliday',
    'School Days': 'dayContainerSchoolDays',
    'Other': 'dayContainerOther',
    'Special Days': 'dayContainerSpecialDays',
    'Term Holidays': 'dayContainerTermHolidays',
    'Exam Days': 'dayContainerExamDays',
  };
  return classMap[type];
}

/**
 * Get CSS class name for holiday type indicator
 */
function getHolidayTypeClass(type: Holiday['type']): string {
  const classMap: Record<Holiday['type'], string> = {
    'Public Holiday': 'holidayTypePublicHoliday',
    'School Days': 'holidayTypeSchoolDays',
    'Other': 'holidayTypeOther',
    'Special Days': 'holidayTypeSpecialDays',
    'Term Holidays': 'holidayTypeTermHolidays',
    'Exam Days': 'holidayTypeExamDays',
  };
  return classMap[type];
}

/**
 * Format date to match JSON key format: "DD MMM YYYY" (e.g., "01 Jan 2026")
 */
function formatDateForJson(date: Date): string {
  return format(date, 'dd MMM yyyy');
}

/**
 * Convert decimal hours to time string (e.g., 5.0 -> "05:00 AM", 12.13 -> "12:08 PM")
 */
function decimalHoursToTime(decimalHours: number): string {
  const hours = Math.floor(decimalHours);
  const minutes = Math.round((decimalHours - hours) * 60);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  const displayMinutes = minutes.toString().padStart(2, '0');
  return `${displayHours.toString().padStart(2, '0')}:${displayMinutes}`;
}



export default function Calendar({
  month,
  year = todayDate.getFullYear(),
  expanded = false,
}: Props) {
  const today = new Date();

  // If today is December 2025, default to January 1, 2026
  const getDefaultSelectedDate = (): Date => {
    if (today.getFullYear() === 2025 && today.getMonth() === 11) { // Month 11 = December
      return new Date(2026, 0, 1); // January 1, 2026
    }
    return today;
  };

  const monthIndex =
    typeof month === 'number' && month >= 1 && month <= 12
      ? month - 1
      : today.getMonth();

  const [isExpanded, setIsExpanded] = useState(expanded);
  const [selectedDate, setSelectedDate] = useState<Date>(getDefaultSelectedDate());
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsMonthDropdownOpen(false);
      }
    };

    if (isMonthDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMonthDropdownOpen]);

  const firstDay = startOfMonth(new Date(year, monthIndex));
  const lastDay = endOfMonth(firstDay);
  const calendarStart = startOfWeek(firstDay, { weekStartsOn: 0 });
  const calendarMonth = format(firstDay, 'MMMM');
  const arabicCalendarMonth = getHijriMonthRange(firstDay, 'ar-SA');
  const dhivehiGregorianCalendarMonth = toDhivehiGregorian(firstDay);

  // Parse holidays and filter for current month
  const holidaysList = holidays as Holiday[];
  const monthHolidays = useMemo(
    () => getHolidaysForMonth(year, monthIndex, holidaysList),
    [year, monthIndex, holidaysList]
  );

  /** Build weeks */
  const weeks = useMemo(() => {
    const result: Date[][] = [];
    let current = calendarStart;

    while (
      current <= lastDay ||
      result.length === 0 ||
      result[result.length - 1].length < 7
    ) {
      const week: Date[] = [];
      for (let i = 0; i < 7; i++) {
        week.push(current);
        current = addDays(current, 1);
      }
      result.push(week);
    }

    return result;
  }, [calendarStart, lastDay]);

  const headerDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  /** Current week */
  const currentWeek =
    weeks.find((w) => w.some((d) => isToday(d))) || weeks[0];
  const currentWeekIndex = weeks.indexOf(currentWeek);

  const weekHeight = BOX_SIZE + 6;

  const translateY = isExpanded
    ? 0
    : -currentWeekIndex * weekHeight;

  // Get nakai and prayer data for selected date
  const selectedDateKey = formatDateForJson(selectedDate);
  const nakaiPrayer = (nakaiPrayerData as Record<string, NakaiPrayerData>)[selectedDateKey];

  const dhivehiDayMap: Record<string, string> = {
    Sun: 'އާދިއްތަ',
    Mon: 'ހޯމަ',
    Tue: 'އަންގާރަ',
    Wed: 'ބުދަ',
    Thu: 'ބުރާސްފަތި',
    Fri: 'ހުކުރު',
    Sat: 'ހޮނިހިރު',
  };

  const monthAbbreviations = [
    'jan', 'feb', 'mar', 'apr', 'may', 'jun',
    'jul', 'aug', 'sep', 'oct', 'nov', 'dec'
  ];

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div>
      <div className="flex flex-row justify-between gap-4 mb-4">
        <div className="text-white text-xl font-bold">
          <div className="relative d-block" ref={dropdownRef}>
            <button
              onClick={() => setIsMonthDropdownOpen(!isMonthDropdownOpen)}
              className="block text-left hover:opacity-80 transition-opacity cursor-pointer backdrop-blur-sm bg-white/20 rounded-full py-2 px-4 flex items-center gap-2 mb-5"
            >
              <strong className="text-white uppercase">{calendarMonth}</strong>
              <Image src="/icon-down.svg" width={18} height={18} alt="down" />
            </button>
            {isMonthDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 bg-white/20 rounded-xl shadow-lg z-50 min-w-[200px] backdrop-blur-sm">
                <div className="py-2">
                  {monthNames.map((monthName, index) => {
                    const monthNum = index + 1;
                    const monthAbbr = monthAbbreviations[index];
                    const isCurrentMonth = monthNum === monthIndex + 1;
                    return (
                      <Link
                        key={monthNum}
                        href={`/${monthAbbr}`}
                        className={`block text-sm font-normal px-4 py-2 text-white hover:bg-white/10 transition-colors ${isCurrentMonth ? 'bg-white/20' : ''
                          }`}
                        onClick={() => setIsMonthDropdownOpen(false)}
                      >
                        {monthName}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <span className={`${styles.arabicCalendarMonth} d-block`}>{arabicCalendarMonth}</span>
        </div>
        <div className={styles.calendarMonthMv}>
          {dhivehiGregorianCalendarMonth}
        </div>
      </div>
      {/* Calendar Card */}
      <div className={`${styles.calContainer} rounded-xl mb-8`}>
        {/* Header */}
        <div className={`${styles.headerRow} rounded-lg`}>
          <div className={styles.todayText}>{format(today, 'dd')}</div>

          <div className={styles.todayDayTextContainer}>
            <div>
              <div className={styles.todayDayText}>
                Today, {format(today, 'eeee')}
              </div>
              <div className={styles.todayDayTextMv}>{dhivehiDayMap[format(today, 'eee')]}</div>
            </div>

            {/* <button
              onClick={() => setIsExpanded((v) => !v)}
              className={styles.expandButton}
            >
              <span className={styles.expandText}>
                {isExpanded ? 'Collapse' : 'Expand'}
              </span>
            </button> */}
          </div>
        </div>

        {/* Day labels */}
        <div className={styles.dayLabelsRow}>
          {headerDays.map((d, i) => (
            <div key={i} className={styles.dayLabelContainer}>
              <span className={styles.dayLabel}>{d}</span>
            </div>
          ))}
        </div>

        {/* Weeks */}
        <div
          className={styles.weeksClip}
          style={{
            maxHeight: isExpanded ? BOX_SIZE * 8 + 12 : BOX_SIZE + 8,
          }}
        >
          <div
            className={styles.weeksContainer}
            style={{ transform: `translateY(${translateY}px)` }}
          >
            {weeks.map((week, i) => (
              <div key={i} className={styles.weekRow}>
                {week.map((day, di) => {
                  const inMonth = isSameMonth(day, firstDay);
                  const todayMark = isToday(day);
                  const dayHolidays = getHolidaysForDate(day, holidaysList);
                  // Priority: Public Holiday > Exam Days > Term Holidays > School Days > Special Days > Other
                  // If multiple holidays, prioritize by type
                  const priorityHoliday = dayHolidays.find(h => h.type === 'Public Holiday') ||
                    dayHolidays.find(h => h.type === 'Exam Days') ||
                    dayHolidays.find(h => h.type === 'Term Holidays') ||
                    dayHolidays.find(h => h.type === 'School Days') ||
                    dayHolidays.find(h => h.type === 'Special Days') ||
                    dayHolidays.find(h => h.type === 'Other') ||
                    dayHolidays[0];
                  const holidayClass = priorityHoliday ? getHolidayClass(priorityHoliday.type) : '';

                  const isSelected = format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');

                  return (
                    <div
                      key={di}
                      onClick={() => setSelectedDate(day)}
                      className={`${styles.dayContainer} ${todayMark ? styles.dayContainerToday : ''} ${holidayClass ? styles[holidayClass] : ''} ${isSelected ? 'ring-2 ring-white-500' : ''}`}
                      style={{ cursor: 'pointer' }}
                    >
                      <span
                        className={`${styles.dayText} ${!inMonth ? styles.dayTextOtherMonth : ''
                          } ${todayMark ? styles.dayTextToday : ''}`}
                      >
                        {format(day, 'd')}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Public Holidays */}
        {monthHolidays.length > 0 && (
          <div className={`${styles.publicHolidays} mt-5 pt-5`}>
            {monthHolidays.map((holiday, index) => {
              const holidayDate = parseISO(holiday.startDate);
              const formattedDate = format(holidayDate, 'dd MMMM');

              return (
                <div key={index} className="mb-2">
                  <small className={styles.holidayDate}>{formattedDate}</small>
                  <strong className={styles.holidayName}>
                    <span className={`${styles.holidayType} ${styles[getHolidayTypeClass(holiday.type)]}`}>&bull;</span>  {holiday.name}
                  </strong>
                </div>
              );
            })}
          </div>
        )}

        {/* Nakai */}
        {nakaiPrayer && (
          <div className={`${styles.nakai} rounded-lg`}>
            <div className="flex justify-between mb-2">
              <strong className={styles.nakaiNameText}>{nakaiPrayer.nakai_day} {nakaiPrayer.nakai_name_en}</strong>
              <span className={styles.nakaiNameMvText}>{nakaiPrayer.nakai_name_mv}</span>
            </div>
            <p className={styles.nakaiDescriptionText}>{nakaiDescriptions[nakaiPrayer.nakai_name_en as keyof typeof nakaiDescriptions]}</p>
          </div>
        )}
      </div>

      {/* Prayer Times */}
      <h2 className='mb-2' >Prayer Times</h2>

      {nakaiPrayer && (
        <div className={`${styles.calContainer} rounded-xl flex gap-2 mb-8`}>
          {([
            ['Fajr', '/icon-fajr.svg', nakaiPrayer.Fajr],
            ['Sun Rise', '/icon-sunrise.svg', nakaiPrayer.Sunrise],
            ['Dhuhr', '/icon-dhuhr.svg', nakaiPrayer.Dhuhr],
            ['Asr', '/icon-asr.svg', nakaiPrayer.Asr],
            ['Maghrib', '/icon-magrib.svg', nakaiPrayer.Maghrib],
            ['Isha', '/icon-isha.svg', nakaiPrayer.Isha],
          ] as [string, string, number][]).map(([name, icon, time]) => (
            <div key={name} className={`flex flex-col flex-1 items-center ${styles.prayer}`}>
              <Image src={icon} alt={name} width={24} height={24} />
              <strong className={styles.prayerNameText}>{name}</strong>
              <span className={styles.prayerTimeText}>{decimalHoursToTime(time)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
