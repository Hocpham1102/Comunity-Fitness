export default function ActiveWorkoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-screen w-screen overflow-hidden">
      {children}
    </div>
  )
}
