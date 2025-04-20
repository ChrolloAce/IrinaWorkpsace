import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AppProvider } from '@/lib/context'
import { ToastProvider } from '@/components/ui/toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Permit Management Dashboard',
  description: 'Dashboard for managing client permits and tracking progress',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppProvider>
          <ToastProvider>
            <main className="flex h-full min-h-screen">
              {children}
            </main>
          </ToastProvider>
        </AppProvider>
      </body>
    </html>
  )
} 