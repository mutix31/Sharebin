"use server"

import { put, list, del } from "@vercel/blob"
import { revalidatePath } from "next/cache"
import { generateId } from "@/lib/auth"
import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"

// Function to upload a file to Vercel Blob
export async function uploadFile(file: File) {
  try {
    // Get the current user session
    const session = await getServerSession()

    if (!session?.user) {
      return {
        success: false,
        error: "You must be logged in to upload files",
      }
    }

    // Check file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      return {
        success: false,
        error: "File size exceeds the 50MB limit",
      }
    }

    // Generate a unique filename
    const uniqueId = await generateId()
    const fileName = `${uniqueId}-${file.name}`

    // Upload to Vercel Blob
    const blob = await put(fileName, file, {
      access: "public",
    })

    // Create metadata file
    const metadata = {
      id: uniqueId,
      name: file.name,
      url: blob.url,
      size: file.size,
      type: file.type,
      createdAt: new Date().toISOString(),
      userId: session.user.id,
      userEmail: session.user.email,
    }

    // Store metadata in Blob as well
    const metadataBlob = new Blob([JSON.stringify(metadata)], {
      type: "application/json",
    })
    await put(`metadata/${uniqueId}.json`, metadataBlob, {
      access: "public",
    })

    revalidatePath("/")
    revalidatePath("/dashboard")
    revalidatePath("/admin")

    return {
      success: true,
      url: `/view/${uniqueId}`,
      fileUrl: blob.url,
      fileName: blob.pathname,
      id: uniqueId,
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
    // Get the current user session
    const session = await getServerSession()

    if (!session?.user) {
      return {
        success: false,
        error: "You must be logged in to create notes",
      }
    }

    // Generate a unique ID for the note
    const noteId = await generateId()

    // Create a JSON object for the note
    const noteData = {
      id: noteId,
      title,
      content,
      createdAt: new Date().toISOString(),
      userId: session.user.id,
      userEmail: session.user.email,
    }

    // Convert to JSON string
    const noteBlob = new Blob([JSON.stringify(noteData)], {
      type: "application/json",
    })

    // Upload to Vercel Blob
    const blob = await put(`notes/${noteId}.json`, noteBlob, {
      access: "public",
    })

    revalidatePath("/")
    revalidatePath("/dashboard")
    revalidatePath("/admin")

    return {
      success: true,
      url: `/note/${noteId}`,
      noteUrl: blob.url,
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

// Function to get all files and notes for the current user
export async function getUserUploads() {
  try {
    // Get the current user session
    const session = await getServerSession()

    if (!session?.user) {
      redirect("/login")
    }

    const { blobs } = await list()
    const isAdmin = session.user.role === "admin"

    const files = []
    const notes = []

    for (const blob of blobs) {
      if (blob.pathname.startsWith("metadata/")) {
        try {
          const response = await fetch(blob.url)
          const metadata = await response.json()

          // Only include files owned by the current user (or all files for admin)
          if (isAdmin || metadata.userId === session.user.id) {
            files.push(metadata)
          }
        } catch (error) {
          console.error("Error parsing file metadata:", error)
        }
      } else if (blob.pathname.startsWith("notes/")) {
        try {
          const response = await fetch(blob.url)
          const noteData = await response.json()

          // Only include notes owned by the current user (or all notes for admin)
          if (isAdmin || noteData.userId === session.user.id) {
            notes.push(noteData)
          }
        } catch (error) {
          console.error("Error parsing note data:", error)
        }
      }
    }

    // Sort by creation date (newest first)
    files.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    notes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return { files, notes }
  } catch (error) {
    console.error("Error fetching uploads:", error)
    return { files: [], notes: [] }
  }
}

// Function to get all files and notes (admin only)
export async function getAllUploads() {
  try {
    // Get the current user session
    const session = await getServerSession()

    if (!session?.user) {
      redirect("/login")
    }

    // Regular users get their own uploads
    if (session.user.role !== "admin") {
      return getUserUploads()
    }

    const { blobs } = await list()

    const files = []
    const notes = []

    for (const blob of blobs) {
      if (blob.pathname.startsWith("metadata/")) {
        try {
          const response = await fetch(blob.url)
          const metadata = await response.json()
          files.push(metadata)
        } catch (error) {
          console.error("Error parsing file metadata:", error)
        }
      } else if (blob.pathname.startsWith("notes/")) {
        try {
          const response = await fetch(blob.url)
          const noteData = await response.json()
          notes.push(noteData)
        } catch (error) {
          console.error("Error parsing note data:", error)
        }
      }
    }

    // Sort by creation date (newest first)
    files.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    notes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return { files, notes }
  } catch (error) {
    console.error("Error fetching uploads:", error)
    return { files: [], notes: [] }
  }
}

// Function to get a specific file by ID
export async function getFileById(id: string) {
  try {
    const { blobs } = await list()
    const metadataBlob = blobs.find((blob) => blob.pathname === `metadata/${id}.json`)

    if (!metadataBlob) {
      return null
    }

    const response = await fetch(metadataBlob.url)
    const metadata = await response.json()

    return metadata
  } catch (error) {
    console.error("Error fetching file:", error)
    return null
  }
}

// Function to get a specific note by ID
export async function getNoteById(id: string) {
  try {
    const { blobs } = await list()
    const noteBlob = blobs.find((blob) => blob.pathname === `notes/${id}.json`)

    if (!noteBlob) {
      return null
    }

    const response = await fetch(noteBlob.url)
    const noteData = await response.json()

    return noteData
  } catch (error) {
    console.error("Error fetching note:", error)
    return null
  }
}

// Function to delete a file (admin only)
export async function deleteFile(id: string) {
  try {
    // Get the current user session
    const session = await getServerSession()

    if (!session?.user) {
      return {
        success: false,
        error: "You must be logged in to delete files",
      }
    }

    const fileData = await getFileById(id)

    if (!fileData) {
      return {
        success: false,
        error: "File not found",
      }
    }

    // Check if user is authorized to delete this file
    if (session.user.role !== "admin" && fileData.userId !== session.user.id) {
      return {
        success: false,
        error: "You are not authorized to delete this file",
      }
    }

    // Delete the file and its metadata
    const fileUrl = fileData.url
    const filePathname = new URL(fileUrl).pathname.split("/").pop()

    if (filePathname) {
      await del(filePathname)
    }

    await del(`metadata/${id}.json`)

    revalidatePath("/")
    revalidatePath("/dashboard")
    revalidatePath("/admin")

    return {
      success: true,
    }
  } catch (error) {
    console.error("Delete error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete file",
    }
  }
}

// Function to delete a note (admin only)
export async function deleteNote(id: string) {
  try {
    // Get the current user session
    const session = await getServerSession()

    if (!session?.user) {
      return {
        success: false,
        error: "You must be logged in to delete notes",
      }
    }

    const noteData = await getNoteById(id)

    if (!noteData) {
      return {
        success: false,
        error: "Note not found",
      }
    }

    // Check if user is authorized to delete this note
    if (session.user.role !== "admin" && noteData.userId !== session.user.id) {
      return {
        success: false,
        error: "You are not authorized to delete this note",
      }
    }

    // Delete the note
    await del(`notes/${id}.json`)

    revalidatePath("/")
    revalidatePath("/dashboard")
    revalidatePath("/admin")

    return {
      success: true,
    }
  } catch (error) {
    console.error("Delete error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete note",
    }
  }
}

// Function to get all users (admin only)
export async function getAllUsers() {
  try {
    // Get the current user session
    const session = await getServerSession()

    if (!session?.user || session.user.role !== "admin") {
      return {
        success: false,
        error: "You are not authorized to access user data",
      }
    }

    const { blobs } = await list({ prefix: "users/" })
    const users = []

    for (const blob of blobs) {
      try {
        const response = await fetch(blob.url)
        const userData = await response.json()

        // Remove password before sending to client
        const { password, ...userWithoutPassword } = userData
        users.push(userWithoutPassword)
      } catch (error) {
        console.error("Error parsing user data:", error)
      }
    }

    // Sort by creation date (newest first)
    users.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return {
      success: true,
      users,
    }
  } catch (error) {
    console.error("Error fetching users:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch users",
    }
  }
}
