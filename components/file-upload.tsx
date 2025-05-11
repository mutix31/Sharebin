"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { Upload, X, FileIcon, Check, Clock, Eye } from "lucide-react"
import { uploadFile } from "@/app/actions/upload-actions"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

export function FileUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [expiresIn, setExpiresIn] = useState<string>("unlimited")
  const [viewLimit, setViewLimit] = useState<string>("unlimited")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const router = useRouter()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // Check file size (50MB limit)
    if (selectedFile.size > 50 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 50MB",
        variant: "destructive",
      })
      return
    }

    setFile(selectedFile)
    setFileUrl(null)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files?.[0]
    if (!droppedFile) return

    // Check file size (50MB limit)
    if (droppedFile.size > 50 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 50MB",
        variant: "destructive",
      })
      return
    }

    setFile(droppedFile)
    setFileUrl(null)
  }

  // handleUpload fonksiyonunu güncelleyelim
  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "Dosya seçilmedi",
        description: "Lütfen bir dosya seçin",
        variant: "destructive",
      })
      return
    }

    try {
      setUploading(true)

      // Simulate progress
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) {
            clearInterval(interval)
            return 95
          }
          return prev + 5
        })
      }, 100)

      // Upload file with expiration and view limits
      const result = await uploadFile(file, {
        expiresIn,
        viewLimit,
      })

      clearInterval(interval)
      setProgress(100)

      if (result.success) {
        setFileUrl(result.url)

        // Store file ID in localStorage
        const myUploads = JSON.parse(localStorage.getItem("myUploads") || '{"files":[],"notes":[]}')
        myUploads.files.push(result.id)
        localStorage.setItem("myUploads", JSON.stringify(myUploads))

        toast({
          title: "Yükleme başarılı",
          description: "Dosyanız başarıyla yüklendi",
          variant: "success",
        })

        // Refresh the dashboard to show the new file
        router.refresh()
      } else {
        throw new Error(result.error || "Yükleme başarısız oldu")
      }
    } catch (error) {
      toast({
        title: "Yükleme başarısız",
        description: error instanceof Error ? error.message : "Bir şeyler yanlış gitti",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const resetUpload = () => {
    setFile(null)
    setProgress(0)
    setFileUrl(null)
    setExpiresIn("unlimited")
    setViewLimit("unlimited")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const getExpirationText = (value: string) => {
    const expirationTexts: Record<string, string> = {
      "1d": "1 gün",
      "5d": "5 gün",
      "1w": "1 hafta",
      "1m": "1 ay",
      unlimited: "Süresiz",
    }
    return expirationTexts[value] || value
  }

  const getViewLimitText = (value: string) => {
    const viewLimitTexts: Record<string, string> = {
      "1": "1 görüntüleme",
      "10": "10 görüntüleme",
      unlimited: "Sınırsız görüntüleme",
    }
    return viewLimitTexts[value] || value
  }

  return (
    <div className="space-y-4">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" id="file-upload" />

      {!file ? (
        <div
          className="border-2 border-dashed rounded-lg p-12 text-center hover:bg-muted/50 transition-colors cursor-pointer"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-10 w-10 text-muted-foreground" />
            <h3 className="font-medium text-lg">Drag & drop your file here</h3>
            <p className="text-sm text-muted-foreground">or click to browse (max 50MB)</p>
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-muted rounded-lg p-2">
                  <FileIcon className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-medium truncate max-w-[200px] sm:max-w-[300px]">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              </div>
              {!uploading && !fileUrl && (
                <Button variant="ghost" size="icon" onClick={resetUpload}>
                  <X className="h-4 w-4" />
                </Button>
              )}
              {fileUrl && (
                <div className="flex items-center text-green-500">
                  <Check className="h-5 w-5 mr-1" />
                  <span className="text-sm">Uploaded</span>
                </div>
              )}
            </div>

            {!fileUrl && !uploading && (
              <div className="grid gap-4 my-4">
                <div className="grid gap-2">
                  <Label htmlFor="expires-in" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Dosya Süresi
                  </Label>
                  <Select value={expiresIn} onValueChange={setExpiresIn}>
                    <SelectTrigger id="expires-in">
                      <SelectValue placeholder="Bir süre seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1d">1 gün</SelectItem>
                      <SelectItem value="5d">5 gün</SelectItem>
                      <SelectItem value="1w">1 hafta</SelectItem>
                      <SelectItem value="1m">1 ay</SelectItem>
                      <SelectItem value="unlimited">Süresiz</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="view-limit" className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Görüntüleme Limiti
                  </Label>
                  <Select value={viewLimit} onValueChange={setViewLimit}>
                    <SelectTrigger id="view-limit">
                      <SelectValue placeholder="Bir limit seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 görüntüleme</SelectItem>
                      <SelectItem value="10">10 görüntüleme</SelectItem>
                      <SelectItem value="unlimited">Sınırsız görüntüleme</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {uploading && (
              <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-right text-muted-foreground">{progress}%</p>
              </div>
            )}

            {fileUrl ? (
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                  <span className="text-sm font-medium truncate flex-1">{fileUrl.split("/").pop()}</span>
                  <Button
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}${fileUrl}`)
                      toast({ title: "Link copied to clipboard" })
                    }}
                  >
                    Copy Link
                  </Button>
                </div>
                <div className="flex flex-col gap-2 text-sm text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>Süre: {getExpirationText(expiresIn)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>Limit: {getViewLimitText(viewLimit)}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button className="w-full" asChild>
                    <a href={fileUrl}>View File</a>
                  </Button>
                  <Button variant="outline" onClick={resetUpload}>
                    Upload Another
                  </Button>
                </div>
              </div>
            ) : (
              <Button className="w-full" onClick={handleUpload} disabled={uploading}>
                {uploading ? "Uploading..." : "Upload File"}
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
