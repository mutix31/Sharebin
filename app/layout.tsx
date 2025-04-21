import type React from "react"
import "@/app/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Navbar } from "@/components/navbar"
import { Toaster } from "@/components/ui/toaster"
import { SessionProvider } from "@/components/session-provider"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "ShareBin - File & Note Sharing",
  description: "Share files and notes quickly and easily. Max file size: 50MB.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <SessionProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <div className="relative flex min-h-screen flex-col">
              <Navbar />
              <main className="flex-1">{children}</main>
              <footer className="border-t py-6">
                <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
                  <p className="text-center text-sm text-muted-foreground">
                    &copy; {new Date().getFullYear()} ShareBin. All rights reserved.
                  </p>
                </div>
              </footer>
            </div>
            <Toaster />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
