import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#0c0c10",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "Kas Badminton - Manajemen Kas Mingguan",
  description: "Aplikasi pencatatan kas badminton mingguan, anggota, iuran, pengeluaran dan laporan saldo.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Kas Badminton",
  },
  icons: {
    icon: "/logo-ax.png",
    shortcut: "/logo-ax.png",
    apple: "/logo-ax.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0a0a0d] text-white selection:bg-red-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
