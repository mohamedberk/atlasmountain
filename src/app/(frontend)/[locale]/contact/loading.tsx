export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="w-12 h-12 border-4 border-[#49b540]/20 border-t-[#49b540] rounded-full animate-spin" />
    </div>
  )
}
