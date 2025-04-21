import { type NextRequest, NextResponse } from "next/server"
import { registerUser } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email and password are required" }, { status: 400 })
    }

    const result = await registerUser(name, email, password)

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 })
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
    console.error("Registration error:", error)
    return NextResponse.json({ success: false, error: "An unexpected error occurred" }, { status: 500 })
  }
}
