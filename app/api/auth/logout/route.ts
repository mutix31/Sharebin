import { NextResponse } from "next/server"
import { logoutUser } from "@/lib/auth"

export async function POST() {
  try {
    const result = await logoutUser()

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ success: false, error: "An unexpected error occurred" }, { status: 500 })
  }
}
