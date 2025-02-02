import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../auth/[...nextauth]/route"
import { supabase } from "../../../../../lib/supabaseClient"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ACADEMY") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { error } = await supabase
      .from("coach_salaries")
      .delete()
      .eq("id", params.id)
      .eq("coach_id", session.user.academyId) // تأكد من أن الراتب ينتمي إلى أكاديمية المستخدم

    if (error) throw error

    return NextResponse.json({ message: "Salary deleted successfully" })
  } catch (error) {
    console.error("Error deleting salary:", error)
    return NextResponse.json({ error: "Failed to delete salary" }, { status: 500 })
  }
}

