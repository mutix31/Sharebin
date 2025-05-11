import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileQuestion } from "lucide-react"

export default function NotFound() {
  return (
    <div className="container flex h-[calc(100vh-8rem)] items-center justify-center">
      <div className="flex flex-col items-center space-y-6 text-center max-w-md">
        <div className="rounded-full bg-muted p-6">
          <FileQuestion className="h-12 w-12 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">404</h1>
          <h2 className="text-xl font-semibold">Sayfa Bulunamadı</h2>
          <p className="text-muted-foreground">
            Aradığınız dosya, not veya sayfa bulunamadı veya kaldırılmış olabilir.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild>
            <Link href="/">Ana Sayfaya Dön</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard">Dosyalarım</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
