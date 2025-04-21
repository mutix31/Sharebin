import { type NextRequest, NextResponse } from "next/server"
import { loginUser } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email and password are required" }, { status: 400 })
    }

    const result = await loginUser(email, password)

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ success: false, error: "An unexpected error occurred" }, { status: 500 })
  }
}
