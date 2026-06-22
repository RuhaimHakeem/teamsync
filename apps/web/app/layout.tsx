import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TeamSync',
  description: 'Keep your team in sync.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
