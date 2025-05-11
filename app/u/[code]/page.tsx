import { resolveShortUrl } from "@/app/actions/upload-actions"
import { redirect } from "next/navigation"

export default async function ShortUrlRedirect({ params }: { params: { code: string } }) {
  const result = await resolveShortUrl(params.code)

  if (!result.success) {
    redirect("/not-found")
  }

  // Sayfa bir yönlendirme işlevi görüyor
  redirect(result.originalUrl)
}
