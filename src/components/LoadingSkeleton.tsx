export default function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-2xl border border-rose-100 bg-white p-5"
        >
          <div className="mb-3 flex justify-between">
            <div className="h-4 w-8 rounded bg-rose-100" />
            <div className="h-5 w-16 rounded-full bg-rose-100" />
          </div>
          <div className="mb-2 h-6 w-4/5 rounded bg-zinc-100" />
          <div className="mb-4 h-4 w-full rounded bg-zinc-50" />
          <div className="flex justify-between">
            <div className="h-4 w-12 rounded bg-zinc-50" />
            <div className="h-8 w-20 rounded-lg bg-rose-50" />
          </div>
        </div>
      ))}
    </div>
  );
}
