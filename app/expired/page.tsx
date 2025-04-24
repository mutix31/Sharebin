import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
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
            <CardTitle className="flex items-center justify-between text-amber-500">
              <span className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                İçeriğe Erişilemiyor
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <AlertCircle className="h-16 w-16 text-amber-500 mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Bu içerik artık mevcut değil</h2>
              <p className="text-muted-foreground mb-4">
                {isExpired
                  ? "Bu içeriğin süresi dolmuştur."
                  : isLimitReached
                    ? "Bu içeriğin görüntüleme limiti aşılmıştır."
                    : "Bu içerik artık mevcut değildir."}
              </p>
              <Button asChild>
                <Link href="/">Ana Sayfaya Dön</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
