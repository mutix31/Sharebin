"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { LogIn, UserPlus } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"
  const { toast } = useToast()

  // Login form state
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [loginError, setLoginError] = useState<string | null>(null)

  // Register form state
  const [registerName, setRegisterName] = useState("")
  const [registerEmail, setRegisterEmail] = useState("")
  const [registerPassword, setRegisterPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [registerError, setRegisterError] = useState<string | null>(null)

  // handleLogin fonksiyonunu güncelleyelim
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError(null)

    // Form doğrulama
    if (!loginEmail.trim()) {
      setLoginError("Email adresi boş olamaz")
      return
    }

    if (!loginPassword.trim()) {
      setLoginError("Şifre boş olamaz")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      })

      const data = await response.json()

      if (!data.success) {
        setLoginError(data.error || "Giriş başarısız. Lütfen bilgilerinizi kontrol edin.")
        toast({
          title: "Giriş başarısız",
          description: data.error || "Lütfen bilgilerinizi kontrol edin",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Giriş başarılı",
          description: `Hoş geldiniz, ${data.user.name || data.user.email.split("@")[0]}!`,
        })

        // Başarılı girişten sonra yönlendirme
        router.push(data.redirectUrl || callbackUrl)
        router.refresh()
      }
    } catch (error) {
      setLoginError("Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.")
      toast({
        title: "Bağlantı hatası",
        description: "Sunucuya bağlanırken bir hata oluştu. Lütfen internet bağlantınızı kontrol edin.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // handleRegister fonksiyonunu güncelleyelim
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setRegisterError(null)

    // Form doğrulama
    if (!registerName.trim()) {
      setRegisterError("İsim boş olamaz")
      return
    }

    if (!registerEmail.trim()) {
      setRegisterError("Email adresi boş olamaz")
      return
    }

    if (!registerPassword.trim()) {
      setRegisterError("Şifre boş olamaz")
      return
    }

    if (registerPassword.length < 6) {
      setRegisterError("Şifre en az 6 karakter olmalıdır")
      return
    }

    if (registerPassword !== confirmPassword) {
      setRegisterError("Şifreler eşleşmiyor. Lütfen kontrol edin.")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: registerName,
          email: registerEmail,
          password: registerPassword,
        }),
      })

      const data = await response.json()

      if (!data.success) {
        setRegisterError(data.error || "Kayıt başarısız. Lütfen bilgilerinizi kontrol edin.")
        toast({
          title: "Kayıt başarısız",
          description: data.error || "Lütfen farklı bir email adresi deneyin",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Kayıt başarılı",
          description: "Hesabınız oluşturuldu. Şimdi giriş yapabilirsiniz.",
          variant: "success",
        })

        // Auto-fill login form
        setLoginEmail(registerEmail)
        setLoginPassword(registerPassword)

        // Switch to login tab
        document.getElementById("login-tab")?.click()
      }
    } catch (error) {
      setRegisterError("Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.")
      toast({
        title: "Bağlantı hatası",
        description: "Sunucuya bağlanırken bir hata oluştu. Lütfen internet bağlantınızı kontrol edin.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container flex h-screen items-center justify-center">
      <div className="w-full max-w-md">
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login" id="login-tab">
              Giriş
            </TabsTrigger>
            <TabsTrigger value="register">Kayıt Ol</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Giriş</CardTitle>
                <CardDescription>Hesabınıza erişmek için bilgilerinizi girin</CardDescription>
              </CardHeader>
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4">
                  {loginError && (
                    <Alert variant="destructive">
                      <AlertDescription>{loginError}</AlertDescription>
                    </Alert>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="name@example.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Şifre</Label>
                    <Input
                      id="login-password"
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      "Giriş yapılıyor..."
                    ) : (
                      <>
                        <LogIn className="mr-2 h-4 w-4" /> Giriş Yap
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>Hesap oluştur</CardTitle>
                <CardDescription>Hesap oluşturmak için bilgilerinizi girin</CardDescription>
              </CardHeader>
              <form onSubmit={handleRegister}>
                <CardContent className="space-y-4">
                  {registerError && (
                    <Alert variant="destructive">
                      <AlertDescription>{registerError}</AlertDescription>
                    </Alert>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="register-name">İsim</Label>
                    <Input
                      id="register-name"
                      placeholder="John Doe"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="name@example.com"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Şifre</Label>
                    <Input
                      id="register-password"
                      type="password"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Şifre Tekrar</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      "Hesap oluşturuluyor..."
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-4 w-4" /> Hesap Oluştur
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          <p>Admin giriş: admin@sharebin.com / herhangi bir şifre</p>
        </div>
      </div>
    </div>
  )
}
