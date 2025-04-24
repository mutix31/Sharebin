import { requireAuth } from "@/lib/auth"
import { ProfileForm } from "@/components/profile-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function ProfilePage() {
  const session = await requireAuth()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Profil Ayarları</h1>
        <p className="text-muted-foreground">Hesap bilgilerinizi güncelleyin</p>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Profil Bilgileri</CardTitle>
            <CardDescription>Görünen adınızı değiştirebilirsiniz</CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm user={session} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
