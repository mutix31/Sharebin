"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { createNote } from "@/app/actions/upload-actions"
import { useRouter } from "next/navigation"
import { Clock, Eye } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

export function NoteCreator() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [noteUrl, setNoteUrl] = useState<string | null>(null)
  const [expiresIn, setExpiresIn] = useState<string>("unlimited")
  const [viewLimit, setViewLimit] = useState<string>("unlimited")
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !content.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both a title and content for your note",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      const result = await createNote({
        title,
        content,
        expiresIn,
        viewLimit,
      })

      if (result.success) {
        setNoteUrl(result.url)

        // Store note ID in localStorage
        const myUploads = JSON.parse(localStorage.getItem("myUploads") || '{"files":[],"notes":[]}')
        myUploads.notes.push(result.noteId)
        localStorage.setItem("myUploads", JSON.stringify(myUploads))

        toast({
          title: "Note created",
          description: "Your note has been created successfully",
        })

        // Refresh the dashboard to show the new note
        router.refresh()
      } else {
        throw new Error(result.error || "Failed to create note")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setTitle("")
    setContent("")
    setNoteUrl(null)
    setExpiresIn("unlimited")
    setViewLimit("unlimited")
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
      {!noteUrl ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              placeholder="Note title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Textarea
              placeholder="Write your note content here..."
              className="min-h-[200px]"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="note-expires-in" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Not Süresi
              </Label>
              <Select value={expiresIn} onValueChange={setExpiresIn}>
                <SelectTrigger id="note-expires-in">
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
              <Label htmlFor="note-view-limit" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Görüntüleme Limiti
              </Label>
              <Select value={viewLimit} onValueChange={setViewLimit}>
                <SelectTrigger id="note-view-limit">
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

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Note"}
          </Button>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="rounded-md border p-4">
            <h3 className="font-medium mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-3">{content}</p>
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
          <div className="flex items-center justify-between p-3 bg-muted rounded-md">
            <span className="text-sm font-medium truncate flex-1">{noteUrl.split("/").pop()}</span>
            <Button
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}${noteUrl}`)
                toast({ title: "Link copied to clipboard" })
              }}
            >
              Copy Link
            </Button>
          </div>
          <div className="flex gap-2">
            <Button className="w-full" asChild>
              <a href={noteUrl}>View Note</a>
            </Button>
            <Button variant="outline" onClick={resetForm}>
              Create Another
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
