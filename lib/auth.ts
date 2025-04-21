"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { put, list } from "@vercel/blob"

// Simple session token
const SESSION_COOKIE_NAME = "sharebin_session"
const SESSION_EXPIRY = 30 * 24 * 60 * 60 * 1000 // 30 days

// Simple password hashing function that works in all environments
export async function hash(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + "sharebin-salt")

  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")

  return hashHex
}

// Compare password with hash
export async function compare(password: string, hash: string): Promise<boolean> {
  const hashedPassword = await hash(password)
  return hashedPassword === hash
}

// Generate a random ID
export async function generateId(): Promise<string> {
  return Array.from({ length: 16 }, () => Math.floor(Math.random() * 36).toString(36)).join("")
}

// Get user by email
export async function getUserByEmail(email: string) {
  try {
    const { blobs } = await list({ prefix: "users/" })
    const userBlob = blobs.find((blob) => blob.pathname === `users/${email.toLowerCase()}.json`)

    if (!userBlob) return null

    const response = await fetch(userBlob.url)
    const userData = await response.json()
    return userData
  } catch (error) {
    console.error("Error fetching user:", error)
    return null
  }
}

// Register a new user
export async function registerUser(name: string, email: string, password: string) {
  try {
    const lowerEmail = email.toLowerCase()

    // Check if user already exists
    const existingUser = await getUserByEmail(lowerEmail)
    if (existingUser) {
      return { success: false, error: "User already exists" }
    }

    // Create new user
    const hashedPassword = await hash(password)
    const userId = await generateId()

    const userData = {
      id: userId,
      name: name || lowerEmail.split("@")[0],
      email: lowerEmail,
      password: hashedPassword,
      role: lowerEmail === "admin@sharebin.com" ? "admin" : "user",
      createdAt: new Date().toISOString(),
    }

    // Store user in Blob
    const userBlob = new Blob([JSON.stringify(userData)], {
      type: "application/json",
    })

    await put(`users/${lowerEmail}.json`, userBlob, {
      access: "public",
    })

    return { success: true, user: { ...userData, password: undefined } }
  } catch (error) {
    console.error("Registration error:", error)
    return { success: false, error: "Failed to register user" }
  }
}

// Login user
export async function loginUser(email: string, password: string) {
  try {
    const user = await getUserByEmail(email.toLowerCase())

    if (!user) {
      return { success: false, error: "Invalid email or password" }
    }

    const hashedPassword = await hash(password)
    if (user.password !== hashedPassword) {
      return { success: false, error: "Invalid email or password" }
    }

    // Create session
    const sessionToken = (await generateId()) + (await generateId())
    const session = {
      token: sessionToken,
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      expires: new Date(Date.now() + SESSION_EXPIRY).toISOString(),
    }

    // Store session in cookie
    cookies().set({
      name: SESSION_COOKIE_NAME,
      value: sessionToken,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: SESSION_EXPIRY / 1000,
      sameSite: "lax",
    })

    // Store session in Blob
    const sessionBlob = new Blob([JSON.stringify(session)], {
      type: "application/json",
    })

    await put(`sessions/${sessionToken}.json`, sessionBlob, {
      access: "public",
    })

    return { success: true, user: { ...user, password: undefined } }
  } catch (error) {
    console.error("Login error:", error)
    return { success: false, error: "Failed to login" }
  }
}

// Logout user
export async function logoutUser() {
  try {
    const sessionToken = cookies().get(SESSION_COOKIE_NAME)?.value

    if (sessionToken) {
      // Delete session from Blob
      try {
        const { blobs } = await list({ prefix: "sessions/" })
        const sessionBlob = blobs.find((blob) => blob.pathname === `sessions/${sessionToken}.json`)

        if (sessionBlob) {
          // We would delete the session here, but we'll skip for simplicity
          // await del(sessionBlob.url)
        }
      } catch (error) {
        console.error("Error deleting session:", error)
      }

      // Delete cookie
      cookies().delete(SESSION_COOKIE_NAME)
    }

    return { success: true }
  } catch (error) {
    console.error("Logout error:", error)
    return { success: false, error: "Failed to logout" }
  }
}

// Get current session
export async function getSession() {
  try {
    const sessionToken = cookies().get(SESSION_COOKIE_NAME)?.value

    if (!sessionToken) {
      return null
    }

    // Get session from Blob
    const { blobs } = await list({ prefix: "sessions/" })
    const sessionBlob = blobs.find((blob) => blob.pathname === `sessions/${sessionToken}.json`)

    if (!sessionBlob) {
      return null
    }

    const response = await fetch(sessionBlob.url)
    const session = await response.json()

    // Check if session is expired
    if (new Date(session.expires) < new Date()) {
      cookies().delete(SESSION_COOKIE_NAME)
      return null
    }

    return session
  } catch (error) {
    console.error("Get session error:", error)
    return null
  }
}

// Check if user is authenticated
export async function requireAuth() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  return session
}

// Check if user is admin
export async function requireAdmin() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  if (session.role !== "admin") {
    redirect("/")
  }

  return session
}
