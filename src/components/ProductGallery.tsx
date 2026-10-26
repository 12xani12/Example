"use client";

import { useState } from "react";

export type GalleryImage = { src: string; srcLg: string; alt: string; label: string };

export function ProductGallery({ images, demo }: { images: GalleryImage[]; demo: boolean }) {
  const [index, setIndex] = useState(0);
  const current = images[index];
  if (!current) return <div className="aspect-square rounded-3xl bg-peach" />;
  return (
    <div className="flex flex-col-reverse gap-4 md:flex-row">
      {images.length > 1 && (
        <ul className="flex gap-3 md:w-24 md:flex-col" aria-label="Product images">
          {images.map((img, i) => (
            <li key={img.src} className="w-20 md:w-full">
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show image ${i + 1}: ${img.label}`}
                aria-current={i === index}
                className={`block aspect-square w-full overflow-hidden rounded-xl border-2 bg-white transition ${i === index ? "border-rose-deep" : "border-transparent opacity-80 hover:opacity-100"}`}
              >
                <img src={img.src} alt="" className="h-full w-full object-cover" loading="lazy" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <figure className="relative flex-1">
        <div className="overflow-hidden rounded-3xl bg-peach-light shadow-soft">
          <img key={current.srcLg} src={current.srcLg} alt={current.alt} className="aspect-square w-full animate-fade-in object-contain" fetchPriority="high" />
        </div>
        <figcaption className="mt-2 text-center text-[13px] text-charcoal-muted">
          {current.label}
          {demo && " · Sample artwork for demonstration"}
        </figcaption>
      </figure>
    </div>
  );
}
