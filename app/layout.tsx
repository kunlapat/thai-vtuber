import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/QueryProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AppLayout } from "@/components/AppLayout";
import { GoogleAnalytics } from '@next/third-parties/google'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const googleAnalyticId = process.env.NEXT_PUBLIC_GTAG_ID;

export const metadata: Metadata = {
  title: "Thai VTuber",
  description: "Analytics dashboard for Thai VTuber channels with statistics, rankings, and insights",
  openGraph: {
    title: "Thai VTuber",
    description: "Analytics dashboard for Thai VTuber channels with statistics, rankings, and insights",
    url: "https://vtuber.kerlos.in.th",
    siteName: "Thai VTuber",
    images: [
      {
        url: "https://vtuber.kerlos.in.th/images/og.jpg",
        width: 1200,
        height: 630,
        alt: "Thai VTuber Analytics Dashboard",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <meta name="theme-color" content="#ffffff" />
      {googleAnalyticId && (
        <GoogleAnalytics gaId={googleAnalyticId} />
      )}
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <QueryProvider>
            <AppLayout>
              {children}
            </AppLayout>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
