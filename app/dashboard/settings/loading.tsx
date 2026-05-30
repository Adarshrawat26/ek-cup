import { Skeleton } from '@/components/ui/skeleton';

export default function SettingsLoading() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-8 sm:px-6">
      <Skeleton className="mb-6 h-9 w-36 rounded-full" />
      <div className="mb-8">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="mt-1.5 h-4 w-64" />
      </div>

      {/* Tab bar */}
      <Skeleton className="mb-6 h-11 w-56 rounded-2xl" />

      {/* Card */}
      <div className="rounded-3xl border bg-white p-6">
        <Skeleton className="mb-1 h-6 w-32" />
        <Skeleton className="mb-6 h-4 w-64" />

        <div className="flex gap-6">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="flex-1 space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i}>
                <Skeleton className="mb-1.5 h-4 w-28" />
                <Skeleton className="h-11 w-full rounded-2xl" />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Skeleton className="h-11 w-28 rounded-full" />
        </div>
      </div>
    </main>
  );
}
