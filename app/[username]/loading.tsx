import { Skeleton } from '@/components/ui/skeleton';

export default function CreatorProfileLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero / header */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
            {/* Avatar */}
            <Skeleton className="h-24 w-24 rounded-full sm:h-28 sm:w-28" />
            <div className="flex-1 space-y-3 text-center sm:text-left">
              <Skeleton className="mx-auto h-7 w-48 sm:mx-0" />
              <Skeleton className="mx-auto h-4 w-32 sm:mx-0" />
              <Skeleton className="mx-auto h-4 w-64 sm:mx-0" />
              <Skeleton className="mx-auto h-4 w-56 sm:mx-0" />
              <div className="flex justify-center gap-2 pt-1 sm:justify-start">
                <Skeleton className="h-5 w-14 rounded-full" />
                <Skeleton className="h-5 w-14 rounded-full" />
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          {/* Main column */}
          <div className="space-y-6">
            {/* Recent supporters */}
            <div className="rounded-3xl border bg-white p-6">
              <Skeleton className="mb-4 h-5 w-40" />
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                    <Skeleton className="h-4 w-12" />
                  </div>
                ))}
              </div>
            </div>

            {/* Posts */}
            <div className="rounded-3xl border bg-white p-6">
              <Skeleton className="mb-4 h-5 w-24" />
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar — chai widget */}
          <div className="space-y-4">
            <div className="rounded-3xl border bg-white p-5">
              <Skeleton className="mb-4 h-6 w-40" />
              <div className="flex gap-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-10 rounded-xl" />
                ))}
              </div>
              <Skeleton className="mt-4 h-11 w-full rounded-full" />
            </div>
            <div className="rounded-3xl border bg-white p-5">
              <Skeleton className="mb-3 h-5 w-32" />
              {[...Array(3)].map((_, i) => (
                <div key={i} className="mb-3 rounded-2xl border p-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="mt-1.5 h-6 w-16" />
                  <Skeleton className="mt-2 h-3 w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
