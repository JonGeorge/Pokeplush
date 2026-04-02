import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pokémon Plushie Collection",
  description: "Track your Pokémon plushie collection!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 min-h-screen">{children}</body>
    </html>
  );
}
