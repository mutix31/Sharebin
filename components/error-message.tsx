import { AlertTriangle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface ErrorMessageProps {
  title?: string
  message: string
  showHomeButton?: boolean
}

export function ErrorMessage({ title = "Hata", message, showHomeButton = false }: ErrorMessageProps) {
  return (
    <div className="space-y-4">
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </Alert>

      {showHomeButton && (
        <div className="flex justify-center">
          <Button asChild>
            <Link href="/">Ana Sayfaya Dön</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
