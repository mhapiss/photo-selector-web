/**
 * Skeleton grid that mirrors the fixed-column gallery layout while loading.
 */
export function SkeletonGrid({ count = 12 }: { count?: number }) {
  return (
    <div
      className="grid gap-2"
      style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton aspect-square" />
      ))}
    </div>
  );
}
