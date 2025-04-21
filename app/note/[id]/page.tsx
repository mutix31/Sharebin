import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Copy, Share2 } from "lucide-react"
import Link from "next/link"

// This would be replaced with actual data fetching in a real implementation
async function getNoteData(id: string) {
  // Simulate fetching note data
  // In a real app, this would fetch from Vercel Blob or a database

  // For demo purposes, return mock data
  if (id === "example-note-id") {
    return {
      id: "example-note-id",
      title: "My Code Snippet",
      content: `function helloWorld() {
  console.log("Hello, world!");
}

// Call the function
helloWorld();`,
      createdAt: new Date().toISOString(),
    }
  }

  return null
}

export default async function ViewNotePage({ params }: { params: { id: string } }) {
  const noteData = await getNoteData(params.id)

  if (!noteData) {
    notFound()
  }

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

              <div className="text-sm">
                <p className="text-muted-foreground">Created</p>
                <p className="font-medium">{new Date(noteData.createdAt).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between gap-4">
            <Button className="w-full" variant="outline">
              <Copy className="mr-2 h-4 w-4" /> Copy Content
            </Button>
            <Button className="w-full">
              <Share2 className="mr-2 h-4 w-4" /> Share Note
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
