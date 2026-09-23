// Shown instantly while a portal page loads, so clicks respond straight
// away. Next.js also prefetches this, which makes navigation feel immediate.
export default function Loading() {
  return (
    <div className="space-y-8" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading…</span>
      <div className="space-y-4 border-b border-line pb-8">
        <div className="skeleton h-3 w-28" />
        <div className="skeleton h-12 w-2/3 max-w-md" />
        <div className="skeleton h-4 w-1/2 max-w-sm" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="card space-y-3 p-5">
            <div className="skeleton h-4 w-1/2" />
            <div className="skeleton h-3 w-5/6" />
            <div className="skeleton h-3 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
