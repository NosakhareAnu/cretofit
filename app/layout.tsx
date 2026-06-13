import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://cretofit.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Cretofit — Interior Design & Decor",
    template: "%s | Cretofit",
  },
  description:
    "Cretofit supplies and installs quality interior design products across Lagos and Lekki — from furniture and lighting to full home styling and renovation.",
  keywords: [
    "interior design Lagos",
    "interior decor Lagos",
    "furniture Lagos",
    "home styling Lekki",
    "interior design Nigeria",
    "Cretofit",
    "home decor Nigeria",
    "interior products Lagos",
    "Lekki interior design",
    "Nigerian interior designer",
  ],
  openGraph: {
    title: "Cretofit — Interior Design & Decor",
    description:
      "Quality interior design products and home styling in Lagos and Lekki, Nigeria.",
    url: "/",
    siteName: "Cretofit",
    locale: "en_NG",
    type: "website",
    images: [
      {
        url: "/images/home/home-hero.jpg.png",
        alt: "Cretofit — Premium Interior Design & Decor, Lagos",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cretofit — Interior Design & Decor",
    description:
      "Quality interior design products and home styling in Lagos and Lekki, Nigeria.",
    images: ["/images/home/home-hero.jpg.png"],
  },
  alternates: {
    canonical: "/",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-[#F7F4F0]">{children}</body>
    </html>
  );
}
