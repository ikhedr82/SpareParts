import { Inter, Cairo } from 'next/font/google'
import './globals.css'
import { LanguageProvider } from '@/lib/i18n/LanguageContext'
import { ToastProvider } from '@/components/toast'
import { QueryProvider } from '@/lib/query-provider'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const cairo = Cairo({ subsets: ['arabic'], variable: '--font-cairo' })

export const metadata = {
  title: 'Partivo — Multi-Tenant Spare Parts Commerce',
  description: 'All-in-one SaaS platform for spare parts dealers. Manage inventory, sales, logistics, and finance.',
  icons: {
    icon: '/brand/favicon.svg',
  },
  openGraph: {
    title: 'Partivo — Multi-Tenant Spare Parts Commerce',
    description: 'All-in-one SaaS platform for spare parts dealers. Manage inventory, sales, logistics, and finance.',
    url: 'https://partivo.net',
    siteName: 'Partivo',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body className={`${inter.variable} ${cairo.variable}`}>
        <QueryProvider>
          <LanguageProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </LanguageProvider>
        </QueryProvider>
      </body>
    </html>
  )
}


