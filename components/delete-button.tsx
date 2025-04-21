"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { deleteFile, deleteNote } from "@/app/actions/upload-actions"
import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface DeleteButtonProps {
  id: string
  type: "file" | "note"
  children: React.ReactNode
}

export function DeleteButton({ id, type, children }: DeleteButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const result = type === "file" ? await deleteFile(id) : await deleteNote(id)

      if (result.success) {
        toast({
          title: "Deleted successfully",
          description: `The ${type} has been deleted`,
        })

        // Update localStorage
        const myUploads = JSON.parse(localStorage.getItem("myUploads") || '{"files":[],"notes":[]}')
        if (type === "file") {
          myUploads.files = myUploads.files.filter((fileId: string) => fileId !== id)
        } else {
          myUploads.notes = myUploads.notes.filter((noteId: string) => noteId !== id)
        }
        localStorage.setItem("myUploads", JSON.stringify(myUploads))

        router.refresh()
      } else {
        throw new Error(result.error || `Failed to delete ${type}`)
      }
    } catch (error) {
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-100">
          {children}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the {type}.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-red-500 hover:bg-red-600">
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
