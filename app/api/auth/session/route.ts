import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ authenticated: false })
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.userId,
        name: session.name,
        email: session.email,
        role: session.role,
      },
    })
  } catch (error) {
    console.error("Session error:", error)
    return NextResponse.json({ authenticated: false, error: "An unexpected error occurred" }, { status: 500 })
  }
}
