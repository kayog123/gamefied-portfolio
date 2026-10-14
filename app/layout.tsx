import type { Metadata } from 'next';
import { Analytics } from "@vercel/analytics/next"
import { Inter, JetBrains_Mono, Space_Grotesk } from 'next/font/google';
import { CustomCursor } from '@/components/custom-cursor';
import { SITE_URL } from '@/lib/site';
import './globals.css';

const display = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const sans = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Jovanni Jungco — Full-stack & AI Engineer · Your idea → Live product',
    template: '%s · Jovanni Jungco — Full-stack & AI Engineer',
  },
  description:
    'I build products end to end: web and mobile apps, AI agents, payments, maps and automation. Type your idea and watch it become a blueprint.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} ${mono.variable}`}
    >
      <body className="min-h-dvh bg-navy font-sans text-text antialiased">
        {children}
        <CustomCursor />
        <Analytics/>
      </body>
    </html>
  );
}
