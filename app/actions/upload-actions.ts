"use server"

import { put } from "@vercel/blob"
import { revalidatePath } from "next/cache"
import crypto from "crypto"

// Function to upload a file to Vercel Blob
export async function uploadFile(file: File) {
  try {
    // Check file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      return {
        success: false,
        error: "File size exceeds the 50MB limit",
      }
    }

    // Generate a unique filename
    const uniqueId = crypto.randomBytes(8).toString("hex")
    const fileName = `${uniqueId}-${file.name}`

    // Upload to Vercel Blob
    const blob = await put(fileName, file, {
      access: "public",
    })

    // Store metadata in database (would be implemented in a real app)
    // await db.insert({ fileName, url: blob.url, size: file.size, type: file.type })

    revalidatePath("/")

    return {
      success: true,
      url: blob.url,
      fileName: blob.pathname,
    }
  } catch (error) {
    console.error("Upload error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to upload file",
    }
  }
}

// Function to create a text note
export async function createNote({ title, content }: { title: string; content: string }) {
  try {
    // Generate a unique ID for the note
    const noteId = crypto.randomBytes(8).toString("hex")

    // Create a JSON object for the note
    const noteData = {
      id: noteId,
      title,
      content,
      createdAt: new Date().toISOString(),
    }

    // Convert to JSON string
    const noteBlob = new Blob([JSON.stringify(noteData)], {
      type: "application/json",
    })

    // Upload to Vercel Blob
    const blob = await put(`notes/${noteId}.json`, noteBlob, {
      access: "public",
    })

    // Store metadata in database (would be implemented in a real app)
    // await db.insert({ noteId, title, url: blob.url })

    revalidatePath("/")

    return {
      success: true,
      url: `/note/${noteId}`,
      noteId,
    }
  } catch (error) {
    console.error("Note creation error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create note",
    }
  }
}
