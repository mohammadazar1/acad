"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import type { Player } from "../../types"
import SearchInput from "../../components/SearchInput"
import { withAcademyStatus } from "../../components/withAcademyStatus"
import { Bar } from "react-chartjs-2"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

function PlayerList() {
  const [players, setPlayers] = useState<Player[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedPlayer, setExpandedPlayer] = useState<string | null>(null)
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === "authenticated") {
      fetchPlayers()
    }
  }, [status])

  const fetchPlayers = async () => {
    try {
      const response = await fetch("/api/players")
      if (!response.ok) {
        throw new Error("Failed to fetch players")
      }
      const data = await response.json()
      setPlayers(data)
    } catch (error) {
      console.error("Error fetching players:", error)
      alert("فشل في جلب بيانات اللاعبين")
    }
  }

  const filteredPlayers = players.filter(
    (player) =>
      player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.sport.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.division.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const chartData = {
    labels: ["نشط", "غير نشط"],
    datasets: [
      {
        label: "عدد اللاعبين",
        data: [
          filteredPlayers.filter((player) => player.isActive).length,
          filteredPlayers.filter((player) => !player.isActive).length,
        ],
        backgroundColor: ["rgba(75, 192, 192, 0.6)", "rgba(255, 99, 132, 0.6)"],
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "توزيع اللاعبين حسب الحالة",
      },
    },
  }

  if (status === "loading") {
    return <p>جاري التحميل...</p>
  }

  if (status === "unauthenticated") {
    return <p>يجب تسجيل الدخول لعرض قائمة اللاعبين</p>
  }

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">قائمة اللاعبين</h1>
      <SearchInput placeholder="ابحث عن لاعب..." value={searchTerm} onChange={setSearchTerm} />
      <div className="mb-8 bg-gray-100 p-4 rounded-lg shadow-inner">
        <Bar data={chartData} options={chartOptions} />
      </div>
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full">
          <thead className="bg-gray-200">
            <tr>
              <th className="py-3 px-6 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الاسم</th>
              <th className="py-3 px-6 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">العمر</th>
              <th className="py-3 px-6 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الرياضة
              </th>
              <th className="py-3 px-6 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الشعبة
              </th>
              <th className="py-3 px-6 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الاشتراك
              </th>
              <th className="py-3 px-6 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الحالة
              </th>
              <th className="py-3 px-6 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الإجراءات
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredPlayers.map((player) => (
              <tr key={player.id} className="hover:bg-gray-50">
                <td className="py-4 px-6 text-right whitespace-nowrap">{player.name}</td>
                <td className="py-4 px-6 text-right whitespace-nowrap">{player.age}</td>
                <td className="py-4 px-6 text-right whitespace-nowrap">{player.sport}</td>
                <td className="py-4 px-6 text-right whitespace-nowrap">{player.division}</td>
                <td className="py-4 px-6 text-right whitespace-nowrap">{player.subscription}</td>
                <td className="py-4 px-6 text-right whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${player.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                  >
                    {player.isActive ? "نشط" : "غير نشط"}
                  </span>
                </td>
                <td className="py-3 px-6 text-right whitespace-nowrap">
                  <Link href={`/player/${player.id}`} className="text-indigo-600 hover:text-indigo-900">
                    التفاصيل
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default withAcademyStatus(PlayerList)

