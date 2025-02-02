'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { UserIcon as UserGroupIcon, UserPlusIcon, BarChartIcon as ChartBarIcon, UserIcon, ClipboardListIcon, ArrowRightIcon, Building } from 'lucide-react'
import { useState } from 'react';

const navigationItems = [
  { href: "/player-list", Icon: UserGroupIcon, title: "قائمة اللاعبين" },
  { href: "/add-player", Icon: UserPlusIcon, title: "إضافة لاعب" },
  { href: "/financial-report", Icon: ChartBarIcon, title: "التقرير المالي" },
  { href: "/coaches", Icon: UserIcon, title: "إدارة المدربين" },
  { href: "/attendance", Icon: ClipboardListIcon, title: "الحضور والغياب" },
]

export default function DashboardContent() {
  const { data: session, status } = useSession()
  

  if (status === "loading") {
    return <div>جاري التحميل...</div>
  }

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">مرحبًا بك في نظام إدارة الأكاديمية الرياضية</h1>
        <Link href="/login" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300">
          تسجيل الدخول
        </Link>
      </div>
    )
  }

  const items = [
    ...navigationItems,
    ...(session.user.role === 'ADMIN' ? [
      { href: "/admin/academies", Icon: Building, title: "إدارة الأكاديميات" }
    ] : [])
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">لوحة التحكم الرئيسية</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {items.map((item, index) => {
          const Icon = item.Icon
          return (
            <Link 
              key={index} 
              href={item.href} 
              className="bg-white hover:bg-gray-50 text-gray-800 font-bold py-6 px-4 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 text-center flex flex-col items-center justify-center space-y-4"
            >
              <Icon className="h-12 w-12 text-blue-500" />
              <span>{item.title}</span>
              <ArrowRightIcon className="h-5 w-5 text-gray-400" />
            </Link>
          )
        })}
      </div>

    </div>
  )
}

