import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Home, Upload, FileText } from "lucide-react"
import Link from "next/link"

export default function ExpiredContentPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const reason = searchParams.reason as string
  const isExpired = reason === "expired"
  const isLimitReached = reason === "limit"

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-500">
              <AlertCircle className="h-5 w-5" />
              İçeriğe Erişilemiyor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <AlertCircle className="h-16 w-16 text-amber-500 mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Bu içerik artık mevcut değil</h2>
              <p className="text-muted-foreground mb-6">
                {isExpired
                  ? "Bu içeriğin süresi dolmuştur."
                  : isLimitReached
                    ? "Bu içeriğin görüntüleme limiti aşılmıştır."
                    : "Bu içerik artık mevcut değildir."}
              </p>

              <div className="grid gap-4 w-full max-w-md">
                <Button asChild>
                  <Link href="/">
                    <Home className="mr-2 h-4 w-4" />
                    Ana Sayfaya Dön
                  </Link>
                </Button>

                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" asChild>
                    <Link href="/?tab=file">
                      <Upload className="mr-2 h-4 w-4" />
                      Dosya Yükle
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/?tab=note">
                      <FileText className="mr-2 h-4 w-4" />
                      Not Oluştur
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-center text-center text-sm text-muted-foreground">
            <p>
              İçerikler, belirlenen süre dolduğunda veya görüntüleme limiti aşıldığında otomatik olarak erişilemez hale
              gelir.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
