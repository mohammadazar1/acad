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

  if (session.user.role !== "COACH" && session.user.role !== "ACADEMY") {
    console.error("User is not a coach or academy admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    let query = supabase.from("coach_salaries").select("*")

    if (session.user.role === "COACH") {
      if (!session.user.id) {
        throw new Error("Coach ID is undefined")
      }
      query = query.eq("coach_id", session.user.id)
    } else if (session.user.role === "ACADEMY") {
      if (!session.user.academyId) {
        throw new Error("Academy ID is undefined")
      }
      query = query.eq("academyId", session.user.academyId)
    }

    const { data, error } = await query

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

