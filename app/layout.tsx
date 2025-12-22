import type { Metadata } from "next";
import type { ReactNode } from "react";
// Add this import to load Tailwind/NativeWind styles
import "./globals.css";

export const metadata: Metadata = {
  title: "Sturdy",
  description: "Design the words that calm your home",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}