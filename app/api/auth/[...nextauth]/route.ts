import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { list, put } from "@vercel/blob"
import { compare, hash } from "@/lib/auth"

async function getUser(email: string) {
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

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        name: { label: "Name", type: "text" },
        isRegistering: { label: "Is Registering", type: "boolean" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required")
        }

        const email = credentials.email.toLowerCase()
        const isRegistering = credentials.isRegistering === "true"

        // Registration flow
        if (isRegistering) {
          const existingUser = await getUser(email)

          if (existingUser) {
            throw new Error("User already exists")
          }

          // Create new user
          const hashedPassword = await hash(credentials.password)
          const userId = await generateId()

          const newUser = {
            id: userId,
            email,
            name: credentials.name || email.split("@")[0],
            password: hashedPassword,
            role: email === "admin@example.com" ? "admin" : "user", // Simple admin check
            createdAt: new Date().toISOString(),
          }

          // Store user in Blob
          const userBlob = new Blob([JSON.stringify(newUser)], {
            type: "application/json",
          })

          await put(`users/${email}.json`, userBlob, {
            access: "public",
          })

          return {
            id: userId,
            email,
            name: newUser.name,
            role: newUser.role,
          }
        }

        // Login flow
        const user = await getUser(email)

        if (!user) {
          throw new Error("User not found")
        }

        const passwordMatch = await compare(credentials.password, user.password)

        if (!passwordMatch) {
          throw new Error("Invalid password")
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || "your-secret-key-change-this-in-production",
})

// Simple ID generator that works in all environments
async function generateId() {
  const array = new Uint8Array(16)
  if (typeof crypto !== "undefined") {
    crypto.getRandomValues(array)
  } else {
    // Fallback for environments without crypto
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256)
    }
  }
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("")
}

export { handler as GET, handler as POST }
