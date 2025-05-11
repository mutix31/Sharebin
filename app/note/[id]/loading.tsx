import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-6 w-32" />
                </div>
                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-6 w-32" />
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
