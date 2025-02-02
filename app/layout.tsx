import './globals.css'
import { Inter } from 'next/font/google'
import ClientLayout from './components/ClientLayout'
import Navbar from '../components/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'إدارة أكاديمية الرياضة',
  description: 'نظام إدارة اللاعبين في أكاديمية الرياضة',
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className={`${inter.className} bg-gray-50 text-gray-900 relative`}>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-green-100 z-0"></div>
        <div className="absolute inset-0 bg-pattern z-0 opacity-10"></div>
        <ClientLayout>
          <Navbar />
          <main className="relative z-10 container mx-auto px-4 py-8 mt-16 md:px-6 lg:px-8">
            <div className="max-w-screen-xl mx-auto"> {/* Added a container for better responsiveness */}
              {children}
            </div>
          </main>
        </ClientLayout>
      </body>
    </html>
  )
}

