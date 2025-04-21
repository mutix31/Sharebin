"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { Upload, X, FileIcon, Check } from "lucide-react"
import { uploadFile } from "@/app/actions/upload-actions"

export function FileUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

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

  const handleUpload = async () => {
    if (!file) return

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

      // Upload file
      const result = await uploadFile(file)

      clearInterval(interval)
      setProgress(100)

      if (result.success) {
        setFileUrl(result.url)
        toast({
          title: "Upload successful",
          description: "Your file has been uploaded successfully",
        })
      } else {
        throw new Error(result.error || "Upload failed")
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Something went wrong",
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
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
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
                      navigator.clipboard.writeText(fileUrl)
                      toast({ title: "Link copied to clipboard" })
                    }}
                  >
                    Copy Link
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button className="w-full" asChild>
                    <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                      View File
                    </a>
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
