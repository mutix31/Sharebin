import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="container flex h-[calc(100vh-8rem)] items-center justify-center">
      <div className="flex flex-col items-center space-y-4 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <h2 className="text-xl font-semibold">Yükleniyor...</h2>
        <p className="text-muted-foreground">Lütfen bekleyin, içerik yükleniyor.</p>
      </div>
    </div>
  )
}
