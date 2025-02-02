'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'
import { Menu, X, Home, Users, UserPlus, ClipboardList, LogOut, Building, UserCog, DollarSign, Settings } from 'lucide-react'

const coachNavItems = [
  { href: "/coach-dashboard", icon: ClipboardList, label: "لوحة التحكم" },
  { href: "/attendance", icon: ClipboardList, label: "الحضور والغياب" },
  { href: "/coach-salary", icon: UserCog, label: "تفاصيل الراتب" },
];

export default function Navbar() {
  const { data: session } = useSession()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              {session?.user.role !== 'COACH' && (
                <Link href="/" className="flex items-center hover:bg-blue-700 px-3 py-2 rounded transition duration-300">
                  <Home className="h-6 w-6 mr-2" />
                  <span className="font-bold text-lg">الرئيسية</span>
                </Link>
              )}
              <div className="hidden md:flex items-center space-x-4">
              {session?.user.role === 'COACH' ? (
                coachNavItems.map((item) => (
                  <Link key={item.href} href={item.href} className="flex items-center hover:bg-blue-700 px-3 py-2 rounded transition duration-300">
                    <item.icon className="h-5 w-5 ml-1" />
                    <span>{item.label}</span>
                  </Link>
                ))
              ) : (
                <>
                  <Link href="/player-list" className="flex items-center hover:bg-blue-700 px-3 py-2 rounded transition duration-300">
                    <Users className="h-5 w-5 mr-1" />
                    <span>قائمة اللاعبين</span>
                  </Link>
                  <Link href="/add-player" className="flex items-center hover:bg-blue-700 px-3 py-2 rounded transition duration-300">
                    <UserPlus className="h-5 w-5 mr-1" />
                    <span>إضافة لاعب</span>
                  </Link>
                  <Link href="/attendance" className="flex items-center hover:bg-blue-700 px-3 py-2 rounded transition duration-300">
                    <ClipboardList className="h-5 w-5 mr-1" />
                    <span>الحضور والغياب</span>
                  </Link>
                  <Link href="/coaches" className="flex items-center hover:bg-blue-700 px-3 py-2 rounded transition duration-300">
                    <UserCog className="h-5 w-5 mr-1" />
                    <span>إدارة المدربين</span>
                  </Link>
                  <Link href="/financial-report" className="flex items-center hover:bg-blue-700 px-3 py-2 rounded transition duration-300">
                    <DollarSign className="h-5 w-5 mr-1" />
                    <span>السجل المالي</span>
                  </Link>
                  <Link href="/revenue" className="flex items-center hover:bg-blue-700 px-3 py-2 rounded transition duration-300">
                    <DollarSign className="h-5 w-5 mr-1" />
                    <span>الإيرادات</span>
                  </Link>
                  {session && session.user.role === 'ADMIN' && (
                    <Link href="/admin/academies" className="flex items-center hover:bg-blue-700 px-3 py-2 rounded transition duration-300">
                      <Building className="h-5 w-5 mr-1" />
                      <span>إدارة الأكاديميات</span>
                    </Link>
                  )}
                  {session?.user.role === 'ACADEMY' && (
                    <Link href="/academy-settings" className="flex items-center hover:bg-blue-700 px-3 py-2 rounded transition duration-300">
                      <Settings className="h-5 w-5 mr-1" />
                      <span>إعدادات الأكاديمية</span>
                    </Link>
                  )}
                </>
              )}
              </div>
            </div>
            <div className="md:hidden">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
            {session && (
              <div className="hidden md:flex items-center">
                <span className="mr-4">مرحبًا، {session.user.name}</span>
                <button
                  onClick={() => signOut()}
                  className="flex items-center bg-red-500 hover:bg-red-600 px-3 py-2 rounded transition duration-300"
                >
                  <LogOut className="h-5 w-5 mr-1" />
                  <span>تسجيل الخروج</span>
                </button>
              </div>
            )}
          </div>
        </div>
        {/* Mobile menu */}
        <div className={`md:hidden fixed left-0 right-0 bg-blue-800 shadow-lg transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'top-16 opacity-100' : '-top-full opacity-0'}`}>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {session?.user.role === 'COACH' ? (
            coachNavItems.map((item) => (
              <Link key={item.href} href={item.href} className="flex items-center hover:bg-blue-700 px-3 py-2 rounded transition duration-300">
                <item.icon className="h-5 w-5 ml-1" />
                <span>{item.label}</span>
              </Link>
            ))
          ) : (
            <>
              <Link href="/" className="flex items-center hover:bg-blue-700 px-3 py-2 rounded transition duration-300">
                <Home className="h-5 w-5 mr-1" />
                <span>الرئيسية</span>
              </Link>
              <Link href="/player-list" className="flex items-center hover:bg-blue-700 px-3 py-2 rounded transition duration-300">
                <Users className="h-5 w-5 mr-1" />
                <span>قائمة اللاعبين</span>
              </Link>
              <Link href="/add-player" className="flex items-center hover:bg-blue-700 px-3 py-2 rounded transition duration-300">
                <UserPlus className="h-5 w-5 mr-1" />
                <span>إضافة لاعب</span>
              </Link>
              <Link href="/attendance" className="flex items-center hover:bg-blue-700 px-3 py-2 rounded transition duration-300">
                <ClipboardList className="h-5 w-5 mr-1" />
                <span>الحضور والغياب</span>
              </Link>
              <Link href="/coaches" className="flex items-center hover:bg-blue-700 px-3 py-2 rounded transition duration-300">
                <UserCog className="h-5 w-5 mr-1" />
                <span>إدارة المدربين</span>
              </Link>
              <Link href="/financial-report" className="flex items-center hover:bg-blue-700 px-3 py-2 rounded transition duration-300">
                <DollarSign className="h-5 w-5 mr-1" />
                <span>السجل المالي</span>
              </Link>
              <Link href="/revenue" className="flex items-center hover:bg-blue-700 px-3 py-2 rounded transition duration-300">
                <DollarSign className="h-5 w-5 mr-1" />
                <span>الإيرادات</span>
              </Link>
              {session && session.user.role === 'ADMIN' && (
                <Link href="/admin/academies" className="flex items-center hover:bg-blue-700 px-3 py-2 rounded transition duration-300">
                  <Building className="h-5 w-5 mr-1" />
                  <span>إدارة الأكاديميات</span>
                </Link>
              )}
              {session?.user.role === 'ACADEMY' && (
                <Link href="/academy-settings" className="flex items-center hover:bg-blue-700 px-3 py-2 rounded transition duration-300">
                  <Settings className="h-5 w-5 mr-1" />
                  <span>إعدادات الأكاديمية</span>
                </Link>
              )}
            </>
          )}
          {session && (
            <button
              onClick={() => signOut()}
              className="flex items-center bg-red-500 hover:bg-red-600 px-3 py-2 rounded transition duration-300 w-full"
            >
              <LogOut className="h-5 w-5 mr-1" />
              <span>تسجيل الخروج</span>
            </button>
          )}
          </div>
        </div>
      </nav>
      <div className="h-16"></div>
    </>
  )
}

