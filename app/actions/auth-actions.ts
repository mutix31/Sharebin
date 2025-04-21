"use server"

import { put, list } from "@vercel/blob"
import { hash, generateId } from "@/lib/auth"

// Function to check if a user exists
async function getUserByEmail(email: string) {
  try {
    const { blobs } = await list({ prefix: "users/" })
    return blobs.some((blob) => blob.pathname === `users/${email.toLowerCase()}.json`)
  } catch (error) {
    console.error("Error checking user:", error)
    return false
  }
}

// Function to register a new user
export async function registerUser({ name, email, password }: { name: string; email: string; password: string }) {
  try {
    const lowerEmail = email.toLowerCase()

    // Check if user already exists
    const userExists = await getUserByEmail(lowerEmail)

    if (userExists) {
      return {
        success: false,
        error: "User with this email already exists",
      }
    }

    // Create user object
    const userId = await generateId()
    const hashedPassword = await hash(password)

    const userData = {
      id: userId,
      name,
      email: lowerEmail,
      password: hashedPassword,
      role: lowerEmail === "admin@example.com" ? "admin" : "user",
      createdAt: new Date().toISOString(),
    }

    // Store user data in Blob
    const userBlob = new Blob([JSON.stringify(userData)], {
      type: "application/json",
    })

    await put(`users/${lowerEmail}.json`, userBlob, {
      access: "public",
    })

    return {
      success: true,
      userId,
    }
  } catch (error) {
    console.error("Registration error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to register user",
    }
  }
}
