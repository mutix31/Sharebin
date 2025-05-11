import { resolveShortUrl } from "@/app/actions/upload-actions"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Home } from "lucide-react"
import Link from "next/link"

export default async function ShortUrlRedirect({ params }: { params: { code: string } }) {
  try {
    // Kısa kod formatını kontrol et
    if (!params.code || typeof params.code !== "string" || params.code.length < 3) {
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-500">
                  <AlertTriangle className="h-5 w-5" />
                  Geçersiz Kısa URL
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center p-6 text-center">
                  <AlertTriangle className="h-16 w-16 text-amber-500 mb-4" />
                  <h2 className="text-xl font-semibold mb-2">Bu kısa URL geçerli değil</h2>
                  <p className="text-muted-foreground mb-4">
                    Aradığınız kısa URL bulunamadı veya artık kullanılamıyor.
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href="/">
                    <Home className="mr-2 h-4 w-4" />
                    Ana Sayfaya Dön
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )
    }

    const result = await resolveShortUrl(params.code)

    if (!result.success) {
      // Kısa URL bulunamadı, özel hata sayfası göster
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-500">
                  <AlertTriangle className="h-5 w-5" />
                  Geçersiz Kısa URL
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center p-6 text-center">
                  <AlertTriangle className="h-16 w-16 text-amber-500 mb-4" />
                  <h2 className="text-xl font-semibold mb-2">Bu kısa URL geçerli değil</h2>
                  <p className="text-muted-foreground mb-4">
                    Aradığınız kısa URL bulunamadı veya artık kullanılamıyor.
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href="/">
                    <Home className="mr-2 h-4 w-4" />
                    Ana Sayfaya Dön
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )
    }

    // Sayfa bir yönlendirme işlevi görüyor
    redirect(result.originalUrl)
  } catch (error) {
    console.error("Kısa URL yönlendirme hatası:", error)

    // Hata durumunda özel hata sayfası göster
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-500">
                <AlertTriangle className="h-5 w-5" />
                Yönlendirme Hatası
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center p-6 text-center">
                <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
                <h2 className="text-xl font-semibold mb-2">Yönlendirme sırasında bir hata oluştu</h2>
                <p className="text-muted-foreground mb-4">
                  Kısa URL'yi çözümlerken beklenmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyin.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Ana Sayfaya Dön
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    )
  }
}
