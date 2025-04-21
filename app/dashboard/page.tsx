import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileIcon, FileText, Trash2 } from "lucide-react"
import Link from "next/link"
import { getUserUploads } from "@/app/actions/upload-actions"
import { DeleteButton } from "@/components/delete-button"
import { requireAuth } from "@/lib/auth"

export default async function DashboardPage() {
  const session = await requireAuth()
  const { files, notes } = await getUserUploads()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Uploads</h1>
        <p className="text-muted-foreground">
          Welcome, {session.name || session.email}. View and manage your uploaded files and notes.
        </p>
      </div>

      <div className="max-w-5xl mx-auto">
        <Tabs defaultValue="files" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="files" className="flex items-center gap-2">
              <FileIcon className="h-4 w-4" />
              Files ({files.length})
            </TabsTrigger>
            <TabsTrigger value="notes" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Notes ({notes.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="files">
            {files.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {files.map((file) => (
                  <Card key={file.id} className="h-full">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <Link href={`/view/${file.id}`} className="flex items-center gap-3 flex-1">
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
                        </Link>
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
                  <Link href="/?tab=file">Upload Your First File</Link>
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
                        <Link href={`/note/${note.id}`} className="flex items-center gap-3 flex-1">
                          <div className="bg-muted rounded-lg p-2">
                            <FileText className="h-6 w-6" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">{note.title}</h3>
                            <p className="text-xs text-muted-foreground">
                              Created {new Date(note.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </Link>
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
                  <Link href="/?tab=note">Create Your First Note</Link>
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
                <Link href="/?tab=file">
                  <FileIcon className="mr-2 h-4 w-4" />
                  Upload File
                </Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href="/?tab=note">
                  <FileText className="mr-2 h-4 w-4" />
                  Create Note
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
