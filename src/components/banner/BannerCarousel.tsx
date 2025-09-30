//src/components/banner/BannerCarousel.tsx
"use client";
import * as React from "react";

export type Slide = {
  id: number | string;
  src: string;            // görüntü (url veya data:)
  title?: string;         // başlık (opsiyonel)
  description?: string;   // açıklama (opsiyonel)
  link?: string;          // tıklanınca gidilecek url (opsiyonel)
};

export default function BannerCarousel({ slides }: { slides: Slide[] }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [idx, setIdx] = React.useState(0);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      const i = Math.round(el.scrollLeft / el.clientWidth);
      setIdx(i);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const goto = (i: number) => {
    const el = ref.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  };

  if (!slides?.length) return null;

  return (
    <div className="relative">
      {/* track */}
      <div
        ref={ref}
        className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory rounded-2xl"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {slides.map((s) => {
          const imageEl = (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={s.src}
              alt={s.title || s.description || ""}
              className="w-full aspect-[16/7] object-cover rounded-2xl"
              loading="lazy"
            />
          );

          return (
            <div key={s.id} className="relative min-w-full snap-center">
              {s.link ? (
                <a href={s.link} target="_blank" rel="noreferrer">
                  {imageEl}
                </a>
              ) : (
                imageEl
              )}

              {/* Caption overlay */}
              {(s.title || s.description) && (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 rounded-b-2xl p-4 sm:p-6 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
                  {s.title && (
                    <h3 className="text-white text-base sm:text-lg md:text-xl font-semibold leading-tight">
                      {s.title}
                    </h3>
                  )}
                  {s.description && (
                    <p className="mt-1 text-white/90 text-xs sm:text-sm md:text-base line-clamp-2">
                      {s.description}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* arrows + dots */}
      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => goto(Math.max(idx - 1, 0))}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/85 px-3 py-2 shadow hover:bg-white"
            aria-label="Önceki slayt"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => goto(Math.min(idx + 1, slides.length - 1))}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/85 px-3 py-2 shadow hover:bg-white"
            aria-label="Sonraki slayt"
          >
            ›
          </button>

          <div className="absolute inset-x-0 bottom-2 flex justify-center gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goto(i)}
                aria-label={`Slayt ${i + 1}`}
                className={`h-1.5 w-4 rounded-full ${i === idx ? "bg-white" : "bg-white/60"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
