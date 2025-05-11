"use server"

import { put, list, del } from "@vercel/blob"
import { revalidatePath } from "next/cache"
import { generateId, getSession } from "@/lib/auth"
import { redirect } from "next/navigation"

// Dosya yükleme seçenekleri için tip tanımlaması
interface UploadOptions {
  expiresIn?: string
  viewLimit?: string
}

// Dosya için son erişim tarihini hesapla
function calculateExpiryDate(expiresIn: string): Date | null {
  if (expiresIn === "unlimited") return null

  const now = new Date()

  if (expiresIn === "1d") {
    return new Date(now.getTime() + 24 * 60 * 60 * 1000)
  } else if (expiresIn === "5d") {
    return new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000)
  } else if (expiresIn === "1w") {
    return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  } else if (expiresIn === "1m") {
    return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
  }

  return null
}

// Function to upload a file to Vercel Blob
export async function uploadFile(file: File, options: UploadOptions = {}) {
  try {
    // Get the current user session
    const session = await getSession()

    if (!session) {
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

    const { expiresIn = "unlimited", viewLimit = "unlimited" } = options
    const expiryDate = calculateExpiryDate(expiresIn)

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
      userId: session.userId,
      userEmail: session.email,
      userName: session.name || session.email.split("@")[0],
      expiresAt: expiryDate ? expiryDate.toISOString() : null,
      viewLimit: viewLimit === "unlimited" ? null : Number.parseInt(viewLimit),
      viewCount: 0,
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

// Not oluşturma parametreleri
interface CreateNoteParams {
  title: string
  content: string
  expiresIn?: string
  viewLimit?: string
}

// Function to create a text note
export async function createNote({
  title,
  content,
  expiresIn = "unlimited",
  viewLimit = "unlimited",
}: CreateNoteParams) {
  try {
    // Get the current user session
    const session = await getSession()

    if (!session) {
      return {
        success: false,
        error: "You must be logged in to create notes",
      }
    }

    // Generate a unique ID for the note
    const noteId = await generateId()

    const expiryDate = calculateExpiryDate(expiresIn)

    // Create a JSON object for the note
    const noteData = {
      id: noteId,
      title,
      content,
      createdAt: new Date().toISOString(),
      userId: session.userId,
      userEmail: session.email,
      userName: session.name || session.email.split("@")[0],
      expiresAt: expiryDate ? expiryDate.toISOString() : null,
      viewLimit: viewLimit === "unlimited" ? null : Number.parseInt(viewLimit),
      viewCount: 0,
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

// Görüntüleme sayacını arttır ve erişim kontrolü
async function incrementViewAndCheckAccess(id: string, type: "file" | "note") {
  try {
    const path = type === "file" ? `metadata/${id}.json` : `notes/${id}.json`

    // Mevcut verileri al
    const { blobs } = await list()
    const itemBlob = blobs.find((blob) => blob.pathname === path)

    if (!itemBlob) return { success: false, error: "Item not found" }

    const response = await fetch(itemBlob.url)

    // Fetch başarısız olursa
    if (!response.ok) {
      return { success: false, error: `Failed to fetch ${type} data: ${response.statusText}` }
    }

    const data = await response.json()

    // Süresi dolmuş mu kontrol et
    if (data.expiresAt && new Date(data.expiresAt) < new Date()) {
      return { success: false, error: "This content has expired" }
    }

    // Görüntüleme limiti aşılmış mı kontrol et
    if (data.viewLimit !== null && data.viewCount >= data.viewLimit) {
      return { success: false, error: "View limit reached" }
    }

    // Görüntüleme sayısını arttır
    data.viewCount = (data.viewCount || 0) + 1

    // Metadatayı güncelle
    const updatedBlob = new Blob([JSON.stringify(data)], {
      type: "application/json",
    })

    await put(path, updatedBlob, { access: "public" })

    return { success: true, data }
  } catch (error) {
    console.error(`Error updating view count:`, error)
    return { success: false, error: "Failed to update view count" }
  }
}

// Function to get a specific file by ID
export async function getFileById(id: string) {
  try {
    // ID formatını kontrol et
    if (!id || typeof id !== "string" || id.length < 5) {
      return { expired: true, error: "Invalid file ID" }
    }

    const result = await incrementViewAndCheckAccess(id, "file")

    if (!result.success) {
      // Eğer süresi dolmuşsa veya görüntüleme limiti aşılmışsa null döndür
      if (result.error === "This content has expired" || result.error === "View limit reached") {
        return { expired: true, error: result.error }
      }
      return null
    }

    return result.data
  } catch (error) {
    console.error("Error fetching file:", error)
    return null
  }
}

// Function to get a specific note by ID
export async function getNoteById(id: string) {
  try {
    // ID formatını kontrol et
    if (!id || typeof id !== "string" || id.length < 5) {
      return { expired: true, error: "Invalid note ID" }
    }

    const result = await incrementViewAndCheckAccess(id, "note")

    if (!result.success) {
      // Eğer süresi dolmuşsa veya görüntüleme limiti aşılmışsa null döndür
      if (result.error === "This content has expired" || result.error === "View limit reached") {
        return { expired: true, error: result.error }
      }
      return null
    }

    return result.data
  } catch (error) {
    console.error("Error fetching note:", error)
    return null
  }
}

// Function to get all files and notes for the current user
export async function getUserUploads() {
  try {
    // Get the current user session
    const session = await getSession()

    if (!session) {
      redirect("/login")
    }

    const { blobs } = await list()
    const isAdmin = session.role === "admin"

    const files = []
    const notes = []

    for (const blob of blobs) {
      if (blob.pathname.startsWith("metadata/")) {
        try {
          const response = await fetch(blob.url)

          // Fetch başarısız olursa, bu dosyayı atla
          if (!response.ok) {
            console.error(`Failed to fetch metadata: ${response.statusText}`)
            continue
          }

          const metadata = await response.json()

          // Dosya süresi dolmamış olanları dahil et
          if (!metadata.expiresAt || new Date(metadata.expiresAt) > new Date()) {
            // Only include files owned by the current user (or all files for admin)
            if (isAdmin || metadata.userId === session.userId) {
              files.push(metadata)
            }
          }
        } catch (error) {
          console.error("Error parsing file metadata:", error)
        }
      } else if (blob.pathname.startsWith("notes/")) {
        try {
          const response = await fetch(blob.url)

          // Fetch başarısız olursa, bu notu atla
          if (!response.ok) {
            console.error(`Failed to fetch note: ${response.statusText}`)
            continue
          }

          const noteData = await response.json()

          // Not süresi dolmamış olanları dahil et
          if (!noteData.expiresAt || new Date(noteData.expiresAt) > new Date()) {
            // Only include notes owned by the current user (or all notes for admin)
            if (isAdmin || noteData.userId === session.userId) {
              notes.push(noteData)
            }
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
    const session = await getSession()

    if (!session) {
      redirect("/login")
    }

    // Regular users get their own uploads
    if (session.role !== "admin") {
      return getUserUploads()
    }

    const { blobs } = await list()

    const files = []
    const notes = []

    for (const blob of blobs) {
      if (blob.pathname.startsWith("metadata/")) {
        try {
          const response = await fetch(blob.url)

          // Fetch başarısız olursa, bu dosyayı atla
          if (!response.ok) {
            console.error(`Failed to fetch metadata: ${response.statusText}`)
            continue
          }

          const metadata = await response.json()
          files.push(metadata)
        } catch (error) {
          console.error("Error parsing file metadata:", error)
        }
      } else if (blob.pathname.startsWith("notes/")) {
        try {
          const response = await fetch(blob.url)

          // Fetch başarısız olursa, bu notu atla
          if (!response.ok) {
            console.error(`Failed to fetch note: ${response.statusText}`)
            continue
          }

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

// Function to delete a file
export async function deleteFile(id: string) {
  try {
    // Get the current user session
    const session = await getSession()

    if (!session) {
      return {
        success: false,
        error: "You must be logged in to delete files",
      }
    }

    const fileData = await getFileById(id)

    if (!fileData || fileData.expired) {
      return {
        success: false,
        error: "File not found or expired",
      }
    }

    // Check if user is authorized to delete this file
    if (session.role !== "admin" && fileData.userId !== session.userId) {
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

// Function to delete a note
export async function deleteNote(id: string) {
  try {
    // Get the current user session
    const session = await getSession()

    if (!session) {
      return {
        success: false,
        error: "You must be logged in to delete notes",
      }
    }

    const noteData = await getNoteById(id)

    if (!noteData || noteData.expired) {
      return {
        success: false,
        error: "Note not found or expired",
      }
    }

    // Check if user is authorized to delete this note
    if (session.role !== "admin" && noteData.userId !== session.userId) {
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
    const session = await getSession()

    if (!session || session.role !== "admin") {
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

        // Fetch başarısız olursa, bu kullanıcıyı atla
        if (!response.ok) {
          console.error(`Failed to fetch user data: ${response.statusText}`)
          continue
        }

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

// Kullanıcı bilgilerini güncelleme (admin veya self)
export async function updateUser(
  userId: string,
  userData: {
    name?: string
    role?: string
  },
) {
  try {
    // Get the current user session
    const session = await getSession()

    if (!session) {
      return {
        success: false,
        error: "You must be logged in",
      }
    }

    // Sadece kendini veya admin rolünde isen diğer kullanıcıları güncelleyebilirsin
    if (session.userId !== userId && session.role !== "admin") {
      return {
        success: false,
        error: "You are not authorized to update this user",
      }
    }

    // Rol değişikliği sadece admin tarafından yapılabilir
    if (userData.role && session.role !== "admin") {
      return {
        success: false,
        error: "Only admins can change roles",
      }
    }

    // Kullanıcıyı bul
    const { blobs } = await list({ prefix: "users/" })
    let userBlob = null
    let user = null

    for (const blob of blobs) {
      try {
        const response = await fetch(blob.url)

        // Fetch başarısız olursa, bu kullanıcıyı atla
        if (!response.ok) {
          console.error(`Failed to fetch user data: ${response.statusText}`)
          continue
        }

        const u = await response.json()
        if (u.id === userId) {
          userBlob = blob
          user = u
          break
        }
      } catch (error) {
        continue
      }
    }

    if (!user || !userBlob) {
      return {
        success: false,
        error: "User not found",
      }
    }

    // Kullanıcıyı güncelle
    const updatedUser = {
      ...user,
      ...(userData.name && { name: userData.name }),
      ...(userData.role && { role: userData.role }),
    }

    // Updated user'ı kaydet
    const updatedBlob = new Blob([JSON.stringify(updatedUser)], {
      type: "application/json",
    })

    await put(userBlob.pathname, updatedBlob, { access: "public" })

    // Eğer kendi kendimizi güncelliyorsak, session'ı da güncelle
    if (session.userId === userId) {
      // Mevcut session'ı al
      const { blobs: sessionBlobs } = await list({ prefix: "sessions/" })
      for (const blob of sessionBlobs) {
        try {
          const response = await fetch(blob.url)

          // Fetch başarısız olursa, bu session'ı atla
          if (!response.ok) {
            console.error(`Failed to fetch session data: ${response.statusText}`)
            continue
          }

          const sessionData = await response.json()

          if (sessionData.userId === userId) {
            // Session'ı güncelle
            const updatedSession = {
              ...sessionData,
              name: updatedUser.name,
              role: updatedUser.role,
            }

            const updatedSessionBlob = new Blob([JSON.stringify(updatedSession)], {
              type: "application/json",
            })

            await put(blob.pathname, updatedSessionBlob, { access: "public" })
          }
        } catch (error) {
          continue
        }
      }
    }

    revalidatePath("/admin")
    revalidatePath("/dashboard")

    return {
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    }
  } catch (error) {
    console.error("Update user error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update user",
    }
  }
}

// URL kısaltma işlemi
export async function createShortUrl(originalUrl: string) {
  try {
    // Get the current user session
    const session = await getSession()

    if (!session) {
      return {
        success: false,
        error: "You must be logged in to create short URLs",
      }
    }

    // Generate a unique ID
    const shortId = await generateId()
    const shortCode = shortId.substring(0, 6) // Kısa bir kod oluştur

    // URL verisini oluştur
    const urlData = {
      id: shortCode,
      originalUrl,
      createdAt: new Date().toISOString(),
      userId: session.userId,
      userEmail: session.email,
      userName: session.name || session.email.split("@")[0],
      visits: 0,
    }

    // URL verisini Blob'a kaydet
    const urlBlob = new Blob([JSON.stringify(urlData)], {
      type: "application/json",
    })

    await put(`urls/${shortCode}.json`, urlBlob, {
      access: "public",
    })

    revalidatePath("/")
    revalidatePath("/dashboard")

    return {
      success: true,
      shortCode,
      shortUrl: `/u/${shortCode}`,
    }
  } catch (error) {
    console.error("URL shortening error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create short URL",
    }
  }
}

// Kısaltılmış URL'yi çözümleme
export async function resolveShortUrl(shortCode: string) {
  try {
    // Kısa kod formatını kontrol et
    if (!shortCode || typeof shortCode !== "string" || shortCode.length < 3) {
      return { success: false, error: "Invalid short code" }
    }

    const { blobs } = await list({ prefix: "urls/" })
    const urlBlob = blobs.find((blob) => blob.pathname === `urls/${shortCode}.json`)

    if (!urlBlob) {
      return { success: false, error: "URL not found" }
    }

    const response = await fetch(urlBlob.url)

    // Fetch başarısız olursa
    if (!response.ok) {
      return { success: false, error: `Failed to fetch URL data: ${response.statusText}` }
    }

    const urlData = await response.json()

    // Ziyaret sayacını artır
    urlData.visits = (urlData.visits || 0) + 1

    // URL bilgisini güncelle
    const updatedBlob = new Blob([JSON.stringify(urlData)], {
      type: "application/json",
    })

    await put(`urls/${shortCode}.json`, updatedBlob, { access: "public" })

    return {
      success: true,
      originalUrl: urlData.originalUrl,
    }
  } catch (error) {
    console.error("Error resolving short URL:", error)
    return {
      success: false,
      error: "Failed to resolve URL",
    }
  }
}

// Kullanıcının kısaltılmış URL'lerini getir
export async function getUserShortUrls() {
  try {
    // Get the current user session
    const session = await getSession()

    if (!session) {
      return {
        success: false,
        error: "You must be logged in",
      }
    }

    const { blobs } = await list({ prefix: "urls/" })
    const isAdmin = session.role === "admin"
    const urls = []

    for (const blob of blobs) {
      try {
        const response = await fetch(blob.url)

        // Fetch başarısız olursa, bu URL'yi atla
        if (!response.ok) {
          console.error(`Failed to fetch URL data: ${response.statusText}`)
          continue
        }

        const urlData = await response.json()

        if (isAdmin || urlData.userId === session.userId) {
          urls.push(urlData)
        }
      } catch (error) {
        console.error("Error parsing URL data:", error)
      }
    }

    // Sort by creation date (newest first)
    urls.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return {
      success: true,
      urls,
    }
  } catch (error) {
    console.error("Error fetching URLs:", error)
    return {
      success: false,
      error: "Failed to fetch URLs",
    }
  }
}
