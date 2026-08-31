import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import MobileHeader from "@/components/MobileHeader";
import AuthStatus from "@/components/AuthStatus";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cockpit",
  description: "Cockpit personnel — timebox, BTS, sport, M&J Production, Gmail",
  applicationName: "Cockpit",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Cockpit", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased">
        <div className="flex min-h-screen">
          <Sidebar footer={<AuthStatus />} />
          <div className="flex min-w-0 flex-1 flex-col">
            <MobileHeader />
            <main className="mx-auto w-full max-w-6xl flex-1 p-4 pb-24 sm:p-6 md:p-10 md:pb-10">
              {children}
            </main>
          </div>
        </div>
        <MobileNav />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
