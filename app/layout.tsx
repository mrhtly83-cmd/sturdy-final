import type { Metadata } from "next";
import "./globals.css"; // <--- This line is the key!

export const metadata: Metadata = {
  title: "Sturdy Parents",
  description: "Design the words that calm your home",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}