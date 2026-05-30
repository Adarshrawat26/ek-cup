import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLoading() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header skeleton */}
      <div className="mb-6 rounded-[2rem] border bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-4 w-36" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-11 w-36 rounded-full" />
            <Skeleton className="h-11 w-20 rounded-full" />
            <Skeleton className="h-11 w-24 rounded-full" />
          </div>
        </div>
      </div>

      {/* Stats skeleton */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-[2rem] border bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <Skeleton className="h-9 w-9 rounded-xl" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="mt-4 h-7 w-24" />
            <Skeleton className="mt-1.5 h-3 w-32" />
          </div>
        ))}
      </div>

      {/* Content skeleton */}
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-[2rem] border bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div className="space-y-1.5">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-6 w-36" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <div className="space-y-3">
                {[...Array(3)].map((_, j) => (
                  <Skeleton key={j} className="h-12 w-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="rounded-[2rem] border bg-white p-6 shadow-sm">
              <Skeleton className="mb-4 h-6 w-32" />
              <div className="space-y-3">
                {[...Array(5)].map((_, j) => (
                  <div key={j} className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <Skeleton className="h-3 w-12" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
