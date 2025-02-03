import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import { supabase } from "../../../../lib/supabaseClient"

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    console.error("No session found")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (session.user.role !== "COACH") {
    console.error("User is not a coach")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    if (!session.user.coach_id) {
      console.error("Coach ID is undefined in the session")
      return NextResponse.json({ error: "Coach ID is missing" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("coach_salaries")
      .select(`
        id,
        coach_id,
        amount,
        payment_date,
        notes
      `)
      .eq("coach_id", session.user.coach_id)
      .order("payment_date", { ascending: false })

    if (error) {
      console.error("Supabase error fetching salaries:", error)
      throw error
    }

    console.log("Fetched coach salaries:", data)
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in /api/coaches/salaries:", error)
    return NextResponse.json({ error: "Failed to fetch coach salaries" }, { status: 500 })
  }
}

