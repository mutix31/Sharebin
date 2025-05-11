"use client"

import { notFound, redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, Clock, Eye, AlertTriangle } from "lucide-react"
import { getFileById } from "@/app/actions/upload-actions"
import { CopyButton } from "@/components/copy-button"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default async function ViewFilePage({ params }: { params: { id: string } }) {
  try {
    // ID formatını kontrol et
    if (!params.id || typeof params.id !== "string" || params.id.length < 5) {
      notFound()
    }

    const fileData = await getFileById(params.id)

    // Içerik süresi dolmuş veya görüntüleme limiti aşılmış
    if (fileData && fileData.expired) {
      const reason = fileData.error === "This content has expired" ? "expired" : "limit"
      redirect(`/expired?reason=${reason}`)
    }

    if (!fileData) {
      notFound()
    }

    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/view/${fileData.id}`

    // Süre ve görüntüleme bilgileri
    const expiresAt = fileData.expiresAt ? new Date(fileData.expiresAt) : null
    const viewLimit = fileData.viewLimit
    const viewCount = fileData.viewCount || 0

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{fileData.name}</span>
                <CopyButton text={shareUrl} variant="ghost" size="sm" label="Copy Link" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {fileData.type.startsWith("image/") ? (
                  <div className="rounded-lg overflow-hidden">
                    <img
                      src={fileData.url || "/placeholder.svg"}
                      alt={fileData.name}
                      className="w-full h-auto"
                      onError={(e) => {
                        // Resim yüklenemezse placeholder göster
                        const target = e.target as HTMLImageElement
                        target.src = "/placeholder.svg"
                        target.onerror = null
                      }}
                    />
                  </div>
                ) : fileData.type === "application/pdf" ? (
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center relative">
                    <iframe
                      src={fileData.url}
                      className="w-full h-full"
                      title={fileData.name}
                      onError={() => {
                        // PDF yüklenemediğinde hata mesajı göster
                        const errorElement = document.getElementById("pdf-error")
                        if (errorElement) {
                          errorElement.classList.remove("hidden")
                        }
                      }}
                    ></iframe>
                    <div
                      id="pdf-error"
                      className="hidden absolute inset-0 flex items-center justify-center bg-muted/80"
                    >
                      <div className="text-center p-4">
                        <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto mb-2" />
                        <p className="text-muted-foreground">PDF yüklenirken bir hata oluştu</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground">Bu dosya türü için önizleme kullanılamıyor</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">File Size</p>
                    <p className="font-medium">{(fileData.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">File Type</p>
                    <p className="font-medium">{fileData.type}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Uploaded</p>
                    <p className="font-medium">{new Date(fileData.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Uploaded By</p>
                    <p className="font-medium truncate">{fileData.userName || "Anonymous"}</p>
                  </div>
                </div>

                {/* Süre ve görüntüleme limiti bilgisi */}
                <div className="border-t pt-4 mt-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {expiresAt
                          ? `Bu içerik ${expiresAt.toLocaleDateString()} tarihinde sona erecek`
                          : "Bu içeriğin süresi bulunmuyor"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {viewLimit ? `${viewCount}/${viewLimit} görüntüleme` : `${viewCount} görüntüleme`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" asChild>
                <a
                  href={fileData.url}
                  download={fileData.name}
                  onClick={(e) => {
                    // Dosya indirme hatası durumunda
                    const handleError = () => {
                      e.preventDefault()
                      alert("Dosya indirilemedi. Lütfen daha sonra tekrar deneyin.")
                    }

                    // Basit bir bağlantı kontrolü
                    const img = new Image()
                    img.onerror = handleError
                    img.src = fileData.url
                  }}
                >
                  <Download className="mr-2 h-4 w-4" /> Download File
                </a>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error viewing file:", error)

    // Hata durumunda özel bir hata mesajı göster
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Dosya görüntülenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.
            </AlertDescription>
          </Alert>
          <div className="mt-4 text-center">
            <Button asChild>
              <a href="/">Ana Sayfaya Dön</a>
            </Button>
          </div>
        </div>
      </div>
    )
  }
}
