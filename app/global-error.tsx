"use client"

import { Button } from "@/components/ui/button"
import { Home, RotateCcw } from "lucide-react"
import Link from "next/link"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full">
            <div className="text-center space-y-6">
              <div className="bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full p-4 inline-flex">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-10 w-10"
                >
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                  <path d="M12 9v4" />
                  <path d="M12 17h.01" />
                </svg>
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold">Kritik Hata</h1>
                <p className="text-muted-foreground">
                  Uygulama beklenmeyen bir hata ile karşılaştı. Lütfen sayfayı yenilemeyi deneyin.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button onClick={reset} variant="outline" className="gap-1">
                  <RotateCcw className="h-4 w-4" />
                  Yeniden Dene
                </Button>
                <Button asChild>
                  <Link href="/" className="gap-1">
                    <Home className="h-4 w-4" />
                    Ana Sayfaya Dön
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
