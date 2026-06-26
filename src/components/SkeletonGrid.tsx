/**
 * Skeleton grid that dynamically mirrors the responsive gallery layout while loading.
 */
export function SkeletonGrid({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="relative overflow-hidden rounded-xl bg-white/[0.03] aspect-square border border-white/5 shadow-soft">
          <div className="absolute inset-0 skeleton" />
        </div>
      ))}
    </div>
  );
}
