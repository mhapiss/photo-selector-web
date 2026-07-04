export function SkeletonGrid({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="aspect-square overflow-hidden rounded-lg bg-warm-border"
          style={{ background: 'var(--color-border)' }}
        >
          <div className="h-full w-full skeleton" />
        </div>
      ))}
    </div>
  );
}
