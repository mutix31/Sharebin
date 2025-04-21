"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { FileText, Upload, User, LogOut, Shield } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"

interface UserSession {
  authenticated: boolean
  user?: {
    id: string
    name: string
    email: string
    role: string
  }
}

export function Navbar() {
  const [session, setSession] = useState<UserSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch("/api/auth/session")
        const data = await res.json()
        setSession(data)
      } catch (error) {
        console.error("Failed to fetch session:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSession()
  }, [])

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      setSession({ authenticated: false })
      toast({ title: "Logged out successfully" })
      router.push("/")
      router.refresh()
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "An error occurred during logout",
        variant: "destructive",
      })
    }
  }

  const isAuthenticated = session?.authenticated
  const isAdmin = session?.user?.role === "admin"

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl">ShareBin</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <nav className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/" className="flex items-center gap-1">
                <Upload className="h-4 w-4" />
                <span>Upload</span>
              </Link>
            </Button>

            {isAuthenticated && (
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard" className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  <span>My Files</span>
                </Link>
              </Button>
            )}

            {isAdmin && (
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin" className="flex items-center gap-1">
                  <Shield className="h-4 w-4" />
                  <span>Admin</span>
                </Link>
              </Button>
            )}

            <ModeToggle />

            {isLoading ? (
              <div className="h-9 w-20 bg-muted animate-pulse rounded-md"></div>
            ) : isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>{session.user?.name || session.user?.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{isAdmin ? "Admin Account" : "My Account"}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">My Files</Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">Admin Dashboard</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button size="sm" asChild>
                <Link href="/login">Login</Link>
              </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
