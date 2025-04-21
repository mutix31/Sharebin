"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { FileText, Upload, User, LogOut, Shield } from "lucide-react"
import { useSession, signOut } from "next-auth/react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Navbar() {
  const { data: session } = useSession()
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
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard" className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                <span>My Files</span>
              </Link>
            </Button>
            {isAdmin && (
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin" className="flex items-center gap-1">
                  <Shield className="h-4 w-4" />
                  <span>Admin</span>
                </Link>
              </Button>
            )}
            <ModeToggle />

            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>{session.user.name || session.user.email}</span>
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
                  <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
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
