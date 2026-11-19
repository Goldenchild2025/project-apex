import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/AuthProvider';
import LiveAwardsBanner from './components/LiveAwardsBanner';

export const metadata: Metadata = {
  title: 'Project-Apex | AI Virtual Artist Ecosystem & Battle Arena',
  description: 'Explore AI music, cinematic video drops, and live head-to-head battle arenas featuring Jax Cypher and ByteRider.',
  openGraph: {
    title: 'Project-Apex | AI Virtual Artist Ecosystem',
    description: 'Vote in real-time battle arenas, explore AI music charts, and unlock featured creator tiers.',
    url: 'https://project-apex.ai',
    siteName: 'Project-Apex',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
        width: 1200,
        height: 630,
        alt: 'Project-Apex AI Media Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Project-Apex | AI Virtual Artist Ecosystem',
    description: 'Explore AI music, cinematic video drops, and live head-to-head battle arenas.',
    images: ['https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 antialiased font-sans">
        <AuthProvider>
          <LiveAwardsBanner />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
