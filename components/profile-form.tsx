"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { updateUser } from "@/app/actions/upload-actions"
import { useRouter } from "next/navigation"

interface ProfileFormProps {
  user: {
    id: string
    name: string
    email: string
    role: string
  }
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [name, setName] = useState(user.name)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Form doğrulama
    if (!name.trim()) {
      toast({
        title: "Hata",
        description: "İsim alanı boş olamaz",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const result = await updateUser(user.id, { name })

      if (!result.success) {
        throw new Error(result.error || "Profil güncellenemedi")
      }

      toast({
        title: "Profil güncellendi",
        description: "Profil bilgileriniz başarıyla güncellendi",
        variant: "success",
      })

      router.refresh()
    } catch (error) {
      toast({
        title: "Güncelleme başarısız",
        description: error instanceof Error ? error.message : "Bir şeyler yanlış gitti",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" value={user.email} disabled />
        <p className="text-xs text-muted-foreground">Email adresiniz değiştirilemez</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">İsim</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} disabled={isSubmitting} required />
        <p className="text-xs text-muted-foreground">Bu isim profilinizde ve paylaşımlarınızda görünecektir</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Üyelik Tipi</Label>
        <Input
          id="role"
          value={user.role === "admin" ? "Admin" : user.role === "vip" ? "VIP Üye" : "Standart Üye"}
          disabled
        />
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Güncelleniyor..." : "Profili Güncelle"}
      </Button>
    </form>
  )
}
