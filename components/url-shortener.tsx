"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { createShortUrl } from "@/app/actions/upload-actions"
import { useRouter } from "next/navigation"
import { LinkIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { CopyButton } from "@/components/copy-button"

export function UrlShortener() {
  const [url, setUrl] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [shortUrl, setShortUrl] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  // handleSubmit fonksiyonunu güncelleyelim
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!url.trim()) {
      toast({
        title: "URL gerekli",
        description: "Lütfen kısaltmak istediğiniz URL'yi girin",
        variant: "destructive",
      })
      return
    }

    // Daha gelişmiş URL doğrulama
    try {
      const urlObj = new URL(url)
      if (!["http:", "https:"].includes(urlObj.protocol)) {
        throw new Error("Geçersiz protokol")
      }
    } catch (error) {
      toast({
        title: "Geçersiz URL",
        description: "Lütfen geçerli bir URL girin (http:// veya https:// ile başlamalı)",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      const result = await createShortUrl(url)

      if (result.success) {
        const fullShortUrl = `${window.location.origin}/u/${result.shortCode}`
        setShortUrl(fullShortUrl)

        toast({
          title: "URL kısaltıldı",
          description: "URL başarıyla kısaltıldı",
          variant: "success",
        })

        // Refresh the dashboard to show the new shortened URL
        router.refresh()
      } else {
        throw new Error(result.error || "URL kısaltma işlemi başarısız oldu")
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: error instanceof Error ? error.message : "Bir şeyler yanlış gitti",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setUrl("")
    setShortUrl(null)
  }

  return (
    <div className="space-y-4">
      {!shortUrl ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Kısaltmak istediğiniz URL'yi girin"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isSubmitting}
              className="flex-1"
              type="url"
            />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "İşleniyor..." : "Kısalt"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Girilen bağlantı kısaltılacak ve paylaşılabilir bir URL oluşturulacak.
          </p>
        </form>
      ) : (
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-center bg-muted rounded-md p-4 gap-2">
              <LinkIcon className="h-5 w-5 text-primary" />
              <span className="font-medium">{shortUrl}</span>
            </div>

            <div className="flex gap-2">
              <CopyButton text={shortUrl} className="w-full" />
              <Button variant="outline" onClick={resetForm}>
                Başka URL kısalt
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
