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
      
      <body className="bg-slate-50 min-h-screen">
        <h1>Pokémon Plushie Collection</h1>
        {children}
        <footer>
          <p>&copy; 2023 Pokémon Plushie Collection. All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
}
