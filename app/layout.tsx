import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { NotificationsProvider } from '@/providers/notifications-provider'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Fitness Carrot - Your Personal Fitness Companion',
    template: '%s | Fitness Carrot'
  },
  description: 'Track workouts, plan nutrition, and achieve your fitness goals with Fitness Carrot. Join 50,000+ users transforming their fitness journey with personalized coaching and analytics.',
  keywords: ['fitness tracker', 'workout app', 'nutrition planning', 'fitness goals', 'personal trainer', 'workout tracking', 'meal planning'],
  authors: [{ name: 'Fitness Carrot' }],
  creator: 'Fitness Carrot',
  publisher: 'Fitness Carrot',
  metadataBase: new URL('https://fitnesscarrot.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://fitnesscarrot.com',
    title: 'Fitness Carrot - Your Personal Fitness Companion',
    description: 'Track workouts, plan nutrition, and achieve your fitness goals with personalized coaching.',
    siteName: 'Fitness Carrot',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Fitness Carrot - Track your fitness journey',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fitness Carrot - Your Personal Fitness Companion',
    description: 'Track workouts, plan nutrition, and achieve your fitness goals.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'mask-icon', url: '/safari-pinned-tab.svg', color: '#ea580c' },
    ],
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <NotificationsProvider>
              {children}
              <Toaster />
              <Analytics />
            </NotificationsProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}