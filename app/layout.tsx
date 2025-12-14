import './globals.css';
export const metadata = { title: 'Sturdy Final', description: 'Parenting Help' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}