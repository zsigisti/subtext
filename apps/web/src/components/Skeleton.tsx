/** Shimmer skeletons that mirror the shape of a result while it loads. */

function Bar({ w = "100%", h = "0.9rem" }: { w?: string; h?: string }) {
  return <div className="skeleton" style={{ width: w, height: h }} />;
}

export function DecodeSkeleton() {
  return (
    <div className="card animate-fade-in p-5" aria-hidden="true">
      <div className="flex items-center justify-between gap-3">
        <Bar w="60%" h="1.2rem" />
        <Bar w="6rem" h="1.5rem" />
      </div>
      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Bar w="40%" h="0.7rem" />
            <Bar />
            <Bar w="80%" />
          </div>
        ))}
      </div>
      <div className="mt-5 space-y-2">
        <Bar w="30%" h="0.7rem" />
        <Bar w="90%" />
      </div>
    </div>
  );
}

export function ComposeSkeleton() {
  return (
    <div className="space-y-4" aria-hidden="true">
      <div className="card animate-fade-in p-4">
        <Bar w="40%" h="0.7rem" />
        <div className="mt-2 space-y-2">
          <Bar />
          <Bar w="85%" />
        </div>
      </div>
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="card animate-fade-in p-5" style={{ animationDelay: `${i * 80}ms` }}>
          <Bar w="35%" h="1.1rem" />
          <div className="mt-3 space-y-2">
            <Bar />
            <Bar w="70%" />
          </div>
          <div className="mt-3">
            <Bar w="55%" h="2.5rem" />
          </div>
        </div>
      ))}
    </div>
  );
}
