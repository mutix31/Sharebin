"use server"

// Simple password hashing function that works in all environments
export async function hash(password: string): Promise<string> {
  // In a real app, use a proper password hashing library
  // This is a simple implementation for demo purposes
  const encoder = new TextEncoder()
  const data = encoder.encode(password + "some-salt")

  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")

  return hashHex
}

// Simple password comparison function
export async function compare(password: string, hashedPassword: string): Promise<boolean> {
  const newHash = await hash(password)
  return newHash === hashedPassword
}

// Generate a random ID (UUID-like)
export async function generateId(): Promise<string> {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("")
}
