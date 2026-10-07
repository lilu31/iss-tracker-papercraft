import type { Metadata } from "next";
import { Baloo_2, Nunito } from "next/font/google";
import "leaflet/dist/leaflet.css";
import "./globals.css";

/**
 * Die Schrift ist Teil der Creative Direction: rund und freundlich wie in
 * einem Kinderbuch. `next/font` laedt sie beim Build herunter und liefert sie
 * danach selbst aus - kein externer Request zur Laufzeit.
 */
const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
});

const baloo = Baloo_2({
  subsets: ["latin"],
  variable: "--font-baloo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ISS Live-Tracker",
  description:
    "Wo ist die Internationale Raumstation gerade? Live-Position, Höhe und Geschwindigkeit auf einer Bastelpapier-Weltkarte.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de" className={`${nunito.variable} ${baloo.variable}`}>
      <body className="min-h-screen bg-paper-cream font-sans text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
