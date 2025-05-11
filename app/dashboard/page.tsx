import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileIcon, FileText, Trash2, Link, AlertTriangle } from "lucide-react"
import NextLink from "next/link"
import { getUserUploads, getUserShortUrls } from "@/app/actions/upload-actions"
import { DeleteButton } from "@/components/delete-button"
import { requireAuth } from "@/lib/auth"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default async function DashboardPage() {
  const session = await requireAuth()

  // Hata yakalama ile veri alma
  let files = []
  let notes = []
  let urls = []
  let fetchError = null

  try {
    const uploadsResult = await getUserUploads()
    files = uploadsResult.files || []
    notes = uploadsResult.notes || []

    const urlsResult = await getUserShortUrls()
    urls = urlsResult.success ? urlsResult.urls : []
  } catch (error) {
    console.error("Error fetching user data:", error)
    fetchError = "Verileriniz yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin."
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Uploads</h1>
        <p className="text-muted-foreground">
          Welcome, {session.name || session.email}. View and manage your uploaded files and notes.
        </p>
      </div>

      {fetchError && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{fetchError}</AlertDescription>
        </Alert>
      )}

      <div className="max-w-5xl mx-auto">
        <Tabs defaultValue="files" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="files" className="flex items-center gap-2">
              <FileIcon className="h-4 w-4" />
              Files ({files.length})
            </TabsTrigger>
            <TabsTrigger value="notes" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Notes ({notes.length})
            </TabsTrigger>
            <TabsTrigger value="urls" className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              URLs ({urls.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="files">
            {files.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {files.map((file) => (
                  <Card key={file.id} className="h-full">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <NextLink href={`/view/${file.id}`} className="flex items-center gap-3 flex-1">
                          <div className="bg-muted rounded-lg p-2">
                            <FileIcon className="h-6 w-6" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">{file.name}</h3>
                            <p className="text-xs text-muted-foreground">
                              {(file.size / (1024 * 1024)).toFixed(2)} MB •{" "}
                              {new Date(file.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </NextLink>
                        <DeleteButton id={file.id} type="file">
                          <Trash2 className="h-4 w-4" />
                        </DeleteButton>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No files uploaded yet</p>
                <Button asChild>
                  <NextLink href="/?tab=file">Upload Your First File</NextLink>
                </Button>
              </div>
            )}
          </TabsContent>
          <TabsContent value="notes">
            {notes.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {notes.map((note) => (
                  <Card key={note.id} className="h-full">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <NextLink href={`/note/${note.id}`} className="flex items-center gap-3 flex-1">
                          <div className="bg-muted rounded-lg p-2">
                            <FileText className="h-6 w-6" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">{note.title}</h3>
                            <p className="text-xs text-muted-foreground">
                              Created {new Date(note.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </NextLink>
                        <DeleteButton id={note.id} type="note">
                          <Trash2 className="h-4 w-4" />
                        </DeleteButton>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No notes created yet</p>
                <Button asChild>
                  <NextLink href="/?tab=note">Create Your First Note</NextLink>
                </Button>
              </div>
            )}
          </TabsContent>
          <TabsContent value="urls">
            {urls.length > 0 ? (
              <div className="space-y-4">
                <div className="rounded-md border">
                  <div className="p-4 bg-muted/50">
                    <div className="grid grid-cols-12 font-medium">
                      <div className="col-span-5">Kısa URL</div>
                      <div className="col-span-5">Orijinal URL</div>
                      <div className="col-span-2">Ziyaretler</div>
                    </div>
                  </div>
                  <div className="divide-y">
                    {urls.map((url) => (
                      <div key={url.id} className="p-4 grid grid-cols-12 items-center">
                        <div className="col-span-5 truncate">
                          <a
                            href={`/u/${url.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline text-primary"
                          >
                            {`${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/u/${url.id}`}
                          </a>
                        </div>
                        <div className="col-span-5 truncate">
                          <a
                            href={url.originalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline text-muted-foreground"
                          >
                            {url.originalUrl}
                          </a>
                        </div>
                        <div className="col-span-2 text-sm">{url.visits} ziyaret</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">Henüz kısaltılmış URL yok</p>
                <Button asChild>
                  <NextLink href="/?tab=url">İlk URL'nizi Kısaltın</NextLink>
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="text-center mt-12">
          <Card>
            <CardHeader>
              <CardTitle>Upload More</CardTitle>
              <CardDescription>Share more files or create new notes</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="flex-1">
                <NextLink href="/?tab=file">
                  <FileIcon className="mr-2 h-4 w-4" />
                  Dosya Yükle
                </NextLink>
              </Button>
              <Button asChild variant="secondary" className="flex-1">
                <NextLink href="/?tab=note">
                  <FileText className="mr-2 h-4 w-4" />
                  Not Oluştur
                </NextLink>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <NextLink href="/?tab=url">
                  <Link className="mr-2 h-4 w-4" />
                  URL Kısalt
                </NextLink>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
