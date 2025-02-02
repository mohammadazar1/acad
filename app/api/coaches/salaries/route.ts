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
    let query = supabase.from("coach_salaries").select(`
      id,
      coach_id,
      amount,
      payment_date,
      notes,
      coaches (
        id,
        name,
        academyId
      )
    `)

    if (session.user.role === "COACH") {
      if (!session.user.id) {
        console.error("Coach ID is undefined in the session")
        return NextResponse.json({ error: "Coach ID is missing" }, { status: 400 })
      }
      query = query.eq("coach_id", session.user.id)
    } else if (session.user.role === "ACADEMY") {
      if (!session.user.academyId) {
        console.error("Academy ID is undefined in the session")
        return NextResponse.json({ error: "Academy ID is missing" }, { status: 400 })
      }
      query = query.eq("coaches.academyId", session.user.academyId)
    }

    const { data, error } = await query

    if (error) {
      console.error("Supabase error fetching salaries:", error)
      throw error
    }

    // Filter out any salaries where the coach's academyId doesn't match the current user's academyId
    const filteredData =
      session.user.role === "ACADEMY"
        ? data.filter((salary) => salary.coaches?.academyId === session.user.academyId)
        : data

    console.log("Fetched coach salaries:", filteredData)
    return NextResponse.json(filteredData)
  } catch (error) {
    console.error("Error in /api/coaches/salaries:", error)
    return NextResponse.json({ error: "Failed to fetch coach salaries" }, { status: 500 })
  }
}

