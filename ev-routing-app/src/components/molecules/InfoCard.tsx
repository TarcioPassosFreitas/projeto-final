interface InfoCardProps {
  title?: string
  children: React.ReactNode
}

export default function InfoCard({children }: InfoCardProps) {
  return (
    <div className="bg-black/30 backdrop-blur-lg rounded-[40px] px-10 py-8 w-[340px] md:w-[420px] text-white shadow-xl shadow-cyan-400/20 border border-cyan-400/20">
      <div className="flex flex-col gap-4">
        {children}
      </div>
    </div>
  )
}
