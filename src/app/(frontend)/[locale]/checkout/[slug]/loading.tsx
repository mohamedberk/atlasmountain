export default function Loading() {
  return (
    <div className="min-h-screen animate-pulse">
      <div className="h-48 bg-neutral-200" />
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="h-8 bg-neutral-200 rounded w-1/3" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-64 bg-neutral-200 rounded-2xl" />
            <div className="h-48 bg-neutral-200 rounded-2xl" />
          </div>
          <div className="h-80 bg-neutral-200 rounded-2xl" />
        </div>
      </div>
    </div>
  )
}
