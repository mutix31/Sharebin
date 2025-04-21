import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Download } from "lucide-react"
import { getFileById } from "@/app/actions/upload-actions"
import { CopyButton } from "@/components/copy-button"

export default async function ViewFilePage({ params }: { params: { id: string } }) {
  const fileData = await getFileById(params.id)

  if (!fileData) {
    notFound()
  }

  const shareUrl = `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"}/view/${fileData.id}`

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{fileData.name}</span>
              <CopyButton text={shareUrl} variant="ghost" size="sm" label="Copy Link" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {fileData.type.startsWith("image/") ? (
                <div className="rounded-lg overflow-hidden">
                  <img src={fileData.url || "/placeholder.svg"} alt={fileData.name} className="w-full h-auto" />
                </div>
              ) : fileData.type === "application/pdf" ? (
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <iframe src={fileData.url} className="w-full h-full" title={fileData.name}></iframe>
                </div>
              ) : (
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">Preview not available for this file type</p>
                </div>
              )}

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
                  <p className="text-muted-foreground">Uploaded By</p>
                  <p className="font-medium truncate">{fileData.userEmail || "Anonymous"}</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" asChild>
              <a href={fileData.url} download={fileData.name}>
                <Download className="mr-2 h-4 w-4" /> Download File
              </a>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
