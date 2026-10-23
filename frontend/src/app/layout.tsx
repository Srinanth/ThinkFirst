import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ThinkFirst — Institutional AI Learning Platform',
  description: 'AI-powered adaptive learning platform with deterministic mastery engine.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-[#1e1e1e] text-[#ffffff] antialiased selection:bg-[#00d2ff] selection:text-[#0a0f1d] min-h-screen" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
