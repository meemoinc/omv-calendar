import type { Metadata } from "next";
import { Geist, Geist_Mono, Outfit, Noto_Sans_Arabic, Rubik } from "next/font/google";
import Image from "next/image";
import "./globals.css";
import MonthTransition from '@/components/MonthTransition';
import Link from 'next/link';

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["latin"],
});
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSansArabic = Noto_Sans_Arabic({
  variable: "--font-noto-sans-arabic",
  subsets: ["arabic"],
});

export const metadata: Metadata = {
  title: "Ooredoo Calendar 2026",
  description: "Here's to a year brewed with colour, culture, and connection. A year to refresh, to unwind, to rediscover simple joys, one cup at a time.",
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
    shortcut: '/apple-icon.png',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Ooredoo Calendar',
  },
  openGraph: {
    title: "Ooredoo Calendar 2026",
    description: "Here's to a year brewed with colour, culture, and connection. A year to refresh, to unwind, to rediscover simple joys, one cup at a time.",
    images: '/og-image.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${outfit.variable} ${rubik.variable} bg-black `}
      >
        <div className="fixed top-4 left-4 right-4 rounded-lg flex items-center justify-center p-4 bg-white  z-10">
          <Link href="/">
            <Image src="/omv-logo.svg" alt="logo" width={100} height={100} />
          </Link>
        </div>
        {/* <MonthTransition> */}
        {children}
        {/* </MonthTransition> */}
      </body>
    </html>
  );
}
