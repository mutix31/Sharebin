import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, Share2 } from "lucide-react"
import Link from "next/link"

// This would be replaced with actual data fetching in a real implementation
async function getFileData(id: string) {
  // Simulate fetching file data
  // In a real app, this would query a database

  // For demo purposes, return mock data
  if (id === "example-file-id") {
    return {
      id: "example-file-id",
      name: "example-file.pdf",
      url: "https://example.com/files/example-file.pdf",
      size: 2.5 * 1024 * 1024, // 2.5MB
      type: "application/pdf",
      createdAt: new Date().toISOString(),
    }
  }

  return null
}

export default async function ViewFilePage({ params }: { params: { id: string } }) {
  const fileData = await getFileData(params.id)

  if (!fileData) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{fileData.name}</span>
              <Button variant="ghost" size="icon" asChild>
                <Link href="/">
                  <Share2 className="h-5 w-5" />
                </Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">File Preview</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">File Size</p>
                  <p className="font-medium">{(fileData.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
                <div>
                  <p className="text-muted-foreground">File Type</p>
                  <p className="font-medium">{fileData.type}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Uploaded</p>
                  <p className="font-medium">{new Date(fileData.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">File ID</p>
                  <p className="font-medium truncate">{fileData.id}</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" asChild>
              <a href={fileData.url} download>
                <Download className="mr-2 h-4 w-4" /> Download File
              </a>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
