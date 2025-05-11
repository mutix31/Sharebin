import { Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface LoadingFallbackProps {
  message?: string
}

export function LoadingFallback({ message = "Yükleniyor..." }: LoadingFallbackProps) {
  return (
    <Card className="w-full">
      <CardContent className="flex flex-col items-center justify-center p-6">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-center text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  )
}
