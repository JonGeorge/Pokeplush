import type { Metadata, Viewport } from "next";
import { Lexend_Deca, Figtree } from "next/font/google";
import "./globals.css";

const lexendDeca = Lexend_Deca({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pokémon Plushie Collection",
  description: "Track your Pokémon plushie collection!",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${lexendDeca.variable} ${figtree.variable}`} suppressHydrationWarning>
      <body className="bg-white min-h-screen font-body" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
