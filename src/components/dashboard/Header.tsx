// src/components/dashboard/Header.tsx
export default function Header({
  title,
  titleClass = "",
  headerClass = "", // <-- yeni
}: {
  title: string;
  titleClass?: string;
  headerClass?: string;
}) {
  return (
    <header
      className={[
        "sticky top-0 z-10 px-4 py-3 border-b",
        // varsayılan (turuncu değilse)
        headerClass || "bg-white border-neutral-200 text-neutral-900",
      ].join(" ")}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* title rengi üstteki text rengini miras alır; istersen ekstra sınıf verirsin */}
        <h1 className={["text-lg font-semibold", titleClass].join(" ")}>{title}</h1>

        <div className="flex items-center gap-3">
          {/* text rengini miras alsın; opaklık verelim */}
          <span className="text-sm opacity-80">Admin</span>
          <div className="h-8 w-8 rounded-full bg-white/30" />
        </div>
      </div>
    </header>
  );
}
