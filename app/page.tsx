import { FileUpload } from "@/components/file-upload"
import { NoteCreator } from "@/components/note-creator"
import { UrlShortener } from "@/components/url-shortener"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Upload, LogIn, Link } from "lucide-react"
import NextLink from "next/link"
import { getUserUploads } from "./actions/upload-actions"
import { getSession } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function Home({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  let tab = "file"

  if (searchParams.tab === "note") {
    tab = "note"
  } else if (searchParams.tab === "url") {
    tab = "url"
  }

  const session = await getSession()

  // If user is logged in, get their uploads
  const { files = [], notes = [] } = session ? await getUserUploads() : { files: [], notes: [] }

  // Get the most recent uploads (up to 2)
  const recentFiles = files.slice(0, 2)
  const recentNotes = notes.slice(0, 2)
  const hasRecent = recentFiles.length > 0 || recentNotes.length > 0

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">ShareBin</h1>
        <p className="text-muted-foreground">Share files and notes quickly and easily. Max file size: 50MB.</p>
      </div>

      <div className="max-w-3xl mx-auto">
        {session ? (
          <>
            <Tabs defaultValue={tab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="file" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Dosya Yükle
                </TabsTrigger>
                <TabsTrigger value="note" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Not Oluştur
                </TabsTrigger>
                <TabsTrigger value="url" className="flex items-center gap-2">
                  <Link className="h-4 w-4" />
                  URL Kısalt
                </TabsTrigger>
              </TabsList>
              <TabsContent value="file">
                <FileUpload />
              </TabsContent>
              <TabsContent value="note">
                <NoteCreator />
              </TabsContent>
              <TabsContent value="url">
                <UrlShortener />
              </TabsContent>
            </Tabs>

            {hasRecent && (
              <div className="mt-12 space-y-4">
                <h2 className="text-2xl font-semibold">Recent Uploads</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {recentFiles.map((file) => (
                    <NextLink key={file.id} href={`/view/${file.id}`} className="block">
                      <div className="border rounded-lg p-4 hover:bg-muted transition-colors">
                        <h3 className="font-medium">{file.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Uploaded {new Date(file.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </NextLink>
                  ))}
                  {recentNotes.map((note) => (
                    <NextLink key={note.id} href={`/note/${note.id}`} className="block">
                      <div className="border rounded-lg p-4 hover:bg-muted transition-colors">
                        <h3 className="font-medium">{note.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          Created {new Date(note.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </NextLink>
                  ))}
                </div>
                <div className="text-center mt-8">
                  <Button variant="outline" asChild>
                    <NextLink href="/dashboard">View All Uploads</NextLink>
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Login Required</CardTitle>
              <CardDescription>Please login or register to upload files and create notes</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="mb-6 text-center">
                <p className="mb-4">ShareBin allows you to:</p>
                <ul className="text-left list-disc pl-6 space-y-2">
                  <li>Upload files up to 50MB</li>
                  <li>Create and share text notes</li>
                  <li>Manage your uploads in one place</li>
                  <li>Share content with secure links</li>
                  <li>Shorten and share URLs</li>
                </ul>
              </div>
              <Button asChild size="lg">
                <NextLink href="/login" className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Login or Register
                </NextLink>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
