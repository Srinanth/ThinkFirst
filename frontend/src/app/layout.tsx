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
      <body className="bg-slate-50 text-slate-900 antialiased selection:bg-blue-600 selection:text-white min-h-screen" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
