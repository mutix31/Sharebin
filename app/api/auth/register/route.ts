import { type NextRequest, NextResponse } from "next/server"
import { registerUser } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    // Daha detaylı doğrulama
    if (!name || !name.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "İsim gereklidir",
        },
        { status: 400 },
      )
    }

    if (!email || !email.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Email gereklidir",
        },
        { status: 400 },
      )
    }

    // Basit email doğrulama
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          error: "Geçerli bir email adresi giriniz",
        },
        { status: 400 },
      )
    }

    if (!password) {
      return NextResponse.json(
        {
          success: false,
          error: "Şifre gereklidir",
        },
        { status: 400 },
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          error: "Şifre en az 6 karakter olmalıdır",
        },
        { status: 400 },
      )
    }

    const result = await registerUser(name, email, password)

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Kayıt işlemi başarısız oldu",
        },
        { status: 400 },
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
      },
      message: "Kayıt başarılı",
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Beklenmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
      },
      { status: 500 },
    )
  }
}
