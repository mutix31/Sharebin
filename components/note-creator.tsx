"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { createNote } from "@/app/actions/upload-actions"
import { useRouter } from "next/navigation"

export function NoteCreator() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [noteUrl, setNoteUrl] = useState<string | null>(null)
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

      const result = await createNote({ title, content })

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
