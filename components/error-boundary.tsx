"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Home, RotateCcw } from "lucide-react"
import Link from "next/link"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("Error caught by ErrorBoundary:", error, errorInfo)
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-500">
                  <AlertTriangle className="h-5 w-5" />
                  Bir Hata Oluştu
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center p-6 text-center">
                  <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
                  <h2 className="text-xl font-semibold mb-2">Beklenmeyen bir hata oluştu</h2>
                  <p className="text-muted-foreground mb-6">
                    İşleminiz sırasında bir sorun oluştu. Lütfen sayfayı yenilemeyi deneyin veya ana sayfaya dönün.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between gap-4">
                <Button
                  variant="outline"
                  onClick={() => this.setState({ hasError: false, error: null })}
                  className="w-full"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Yeniden Dene
                </Button>
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

    return this.props.children
  }
}
