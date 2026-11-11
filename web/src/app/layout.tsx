import type { Metadata } from "next";
import { Manrope, Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { DashboardDataProvider } from "@/context/DashboardDataContext";
import { Header } from "@/components/Header";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "UNHCR Asylum Analytics (2010–2025)",
  description:
    "16-Year UNHCR operations, decision outcomes, and backlog audit across 186 sovereign nations.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${inter.variable} ${jakarta.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background text-foreground antialiased font-sans flex flex-col">
        <DashboardDataProvider>
          <Header />
          <main className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8 2xl:p-10 space-y-6 flex-1">
            {children}
          </main>
        </DashboardDataProvider>
      </body>
    </html>
  );
}
