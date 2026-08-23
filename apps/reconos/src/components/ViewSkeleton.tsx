/** Placeholder shown while a lazily-loaded view chunk is in flight. */
export function ViewSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1400px] p-4 md:p-5" aria-busy="true" aria-label="Loading view">
      <div className="skeleton mb-2 h-3 w-32 rounded" />
      <div className="skeleton mb-5 h-6 w-64 rounded" />

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="skeleton h-[74px] rounded-[10px]" />
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <div className="skeleton h-64 rounded-[10px] lg:col-span-2" />
        <div className="skeleton h-64 rounded-[10px]" />
      </div>
    </div>
  )
}
