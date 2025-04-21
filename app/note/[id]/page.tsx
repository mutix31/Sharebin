import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Share2 } from "lucide-react"
import Link from "next/link"
import { getNoteById } from "@/app/actions/upload-actions"
import { CopyButton } from "@/components/copy-button"

export default async function ViewNotePage({ params }: { params: { id: string } }) {
  const noteData = await getNoteById(params.id)

  if (!noteData) {
    notFound()
  }

  const shareUrl = `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"}/note/${noteData.id}`

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{noteData.title}</span>
              <Button variant="ghost" size="icon" asChild>
                <Link href="/">
                  <Share2 className="h-5 w-5" />
                </Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg overflow-x-auto">
                <pre className="text-sm">
                  <code>{noteData.content}</code>
                </pre>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Created</p>
                  <p className="font-medium">{new Date(noteData.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Created By</p>
                  <p className="font-medium truncate">{noteData.userEmail || "Anonymous"}</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between gap-4">
            <CopyButton text={noteData.content} label="Copy Content" variant="outline" className="w-full" />
            <CopyButton text={shareUrl} label="Share Note" className="w-full" />
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
