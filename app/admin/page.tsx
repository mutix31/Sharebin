import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileIcon, FileText, Users, Trash2 } from "lucide-react"
import Link from "next/link"
import { getAllUploads, getAllUsers } from "@/app/actions/upload-actions"
import { DeleteButton } from "@/components/delete-button"
import { requireAdmin } from "@/lib/auth"

export default async function AdminPage() {
  // This will redirect if not admin
  await requireAdmin()

  const { files, notes } = await getAllUploads()
  const usersResult = await getAllUsers()
  const users = usersResult.success ? usersResult.users : []

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage all files, notes, and users</p>
      </div>

      <div className="max-w-6xl mx-auto">
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
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users ({users.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="files">
            <div className="rounded-md border">
              <div className="p-4 bg-muted/50">
                <div className="grid grid-cols-12 font-medium">
                  <div className="col-span-4">Name</div>
                  <div className="col-span-3">User</div>
                  <div className="col-span-2">Size</div>
                  <div className="col-span-2">Date</div>
                  <div className="col-span-1">Actions</div>
                </div>
              </div>
              <div className="divide-y">
                {files.map((file) => (
                  <div key={file.id} className="p-4 grid grid-cols-12 items-center">
                    <div className="col-span-4 truncate">
                      <Link href={`/view/${file.id}`} className="hover:underline flex items-center gap-2">
                        <FileIcon className="h-4 w-4" />
                        {file.name}
                      </Link>
                    </div>
                    <div className="col-span-3 truncate text-sm text-muted-foreground">
                      {file.userEmail || "Anonymous"}
                    </div>
                    <div className="col-span-2 text-sm">{(file.size / (1024 * 1024)).toFixed(2)} MB</div>
                    <div className="col-span-2 text-sm text-muted-foreground">
                      {new Date(file.createdAt).toLocaleDateString()}
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <DeleteButton id={file.id} type="file">
                        <Trash2 className="h-4 w-4" />
                      </DeleteButton>
                    </div>
                  </div>
                ))}
                {files.length === 0 && <div className="p-8 text-center text-muted-foreground">No files found</div>}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notes">
            <div className="rounded-md border">
              <div className="p-4 bg-muted/50">
                <div className="grid grid-cols-12 font-medium">
                  <div className="col-span-4">Title</div>
                  <div className="col-span-3">User</div>
                  <div className="col-span-4">Date</div>
                  <div className="col-span-1">Actions</div>
                </div>
              </div>
              <div className="divide-y">
                {notes.map((note) => (
                  <div key={note.id} className="p-4 grid grid-cols-12 items-center">
                    <div className="col-span-4 truncate">
                      <Link href={`/note/${note.id}`} className="hover:underline flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        {note.title}
                      </Link>
                    </div>
                    <div className="col-span-3 truncate text-sm text-muted-foreground">
                      {note.userEmail || "Anonymous"}
                    </div>
                    <div className="col-span-4 text-sm text-muted-foreground">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <DeleteButton id={note.id} type="note">
                        <Trash2 className="h-4 w-4" />
                      </DeleteButton>
                    </div>
                  </div>
                ))}
                {notes.length === 0 && <div className="p-8 text-center text-muted-foreground">No notes found</div>}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <div className="rounded-md border">
              <div className="p-4 bg-muted/50">
                <div className="grid grid-cols-12 font-medium">
                  <div className="col-span-3">Name</div>
                  <div className="col-span-4">Email</div>
                  <div className="col-span-2">Role</div>
                  <div className="col-span-3">Joined</div>
                </div>
              </div>
              <div className="divide-y">
                {users.map((user) => (
                  <div key={user.id} className="p-4 grid grid-cols-12 items-center">
                    <div className="col-span-3 truncate">{user.name}</div>
                    <div className="col-span-4 truncate text-sm">{user.email}</div>
                    <div className="col-span-2">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          user.role === "admin" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {user.role}
                      </span>
                    </div>
                    <div className="col-span-3 text-sm text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
                {users.length === 0 && <div className="p-8 text-center text-muted-foreground">No users found</div>}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
