import { FileUpload } from "@/components/file-upload"
import { NoteCreator } from "@/components/note-creator"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Upload } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">ShareBin</h1>
        <p className="text-muted-foreground">Share files and notes quickly and easily. Max file size: 50MB.</p>
      </div>

      <div className="max-w-3xl mx-auto">
        <Tabs defaultValue="file" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="file" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload File
            </TabsTrigger>
            <TabsTrigger value="note" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Create Note
            </TabsTrigger>
          </TabsList>
          <TabsContent value="file">
            <FileUpload />
          </TabsContent>
          <TabsContent value="note">
            <NoteCreator />
          </TabsContent>
        </Tabs>

        <div className="mt-12 space-y-4">
          <h2 className="text-2xl font-semibold">Recent Uploads</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {/* This would be populated with actual data in a real implementation */}
            <Link href="/view/example-file-id" className="block">
              <div className="border rounded-lg p-4 hover:bg-muted transition-colors">
                <h3 className="font-medium">example-file.pdf</h3>
                <p className="text-sm text-muted-foreground">Uploaded 2 minutes ago</p>
              </div>
            </Link>
            <Link href="/note/example-note-id" className="block">
              <div className="border rounded-lg p-4 hover:bg-muted transition-colors">
                <h3 className="font-medium">My Code Snippet</h3>
                <p className="text-sm text-muted-foreground">Created 5 minutes ago</p>
              </div>
            </Link>
          </div>
          <div className="text-center mt-8">
            <Button variant="outline" asChild>
              <Link href="/dashboard">View All Uploads</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
