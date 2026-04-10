"use client";

import { useEffect, useMemo, useState } from "react";

export default function ListingGallery({
  photos,
  title,
  locationText,
  showVat,
}: {
  photos: string[];
  title: string;
  locationText: string;
  showVat?: boolean;
}) {
  const validPhotos = useMemo(
    () => photos.filter((photo) => typeof photo === "string" && photo.trim() !== ""),
    [photos]
  );

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const mainPhoto = validPhotos[0] || null;
  const sidePhotos = validPhotos.slice(1, 5);

  function openAt(index: number) {
    if (index < 0 || index >= validPhotos.length) return;
    setSelectedIndex(index);
  }

  function close() {
    setSelectedIndex(null);
  }

  function goPrev() {
    if (selectedIndex === null || validPhotos.length === 0) return;
    setSelectedIndex((selectedIndex - 1 + validPhotos.length) % validPhotos.length);
  }

  function goNext() {
    if (selectedIndex === null || validPhotos.length === 0) return;
    setSelectedIndex((selectedIndex + 1) % validPhotos.length);
  }

  useEffect(() => {
    if (selectedIndex === null) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    }

    window.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [selectedIndex]);

  const selectedPhoto =
    selectedIndex !== null ? validPhotos[selectedIndex] ?? null : null;

  return (
    <>
      <section className="animate-fade-up overflow-hidden rounded-md border border-slate-200 bg-white p-3 shadow-[0_14px_40px_rgba(15,23,42,0.05)]">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_280px] xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="relative overflow-hidden rounded-md bg-slate-100">
            {mainPhoto ? (
              <button
                type="button"
                onClick={() => openAt(0)}
                className="block w-full text-left"
                aria-label="Ouvrir la photo principale"
              >
                <img
                  src={mainPhoto}
                  alt={title || "Photo principale"}
                  className="aspect-[16/10] h-full w-full cursor-zoom-in object-cover sm:aspect-[16/9]"
                />
              </button>
            ) : (
              <div className="grid aspect-[16/10] place-items-center text-sm text-slate-500 sm:aspect-[16/9]">
                Photo principale indisponible
              </div>
            )}

            <div className="absolute left-3 top-3 flex flex-wrap gap-2 sm:left-4 sm:top-4">
              <span className="rounded-full bg-orange-500 px-3 py-1 text-[12px] font-semibold text-white shadow-sm">
                À la une
              </span>
              <span className="rounded-full bg-white px-3 py-1 text-[12px] font-medium text-slate-900">
                {validPhotos.length > 0
                  ? `${validPhotos.length} photo${validPhotos.length > 1 ? "s" : ""}`
                  : "Galerie"}
              </span>
            </div>

            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-white px-3 py-1 text-[12px] font-medium text-slate-900">
                    Professionnel
                  </span>
                  {showVat ? (
                    <span className="rounded-full bg-white px-3 py-1 text-[12px] font-medium text-slate-900">
                      TVA récupérable
                    </span>
                  ) : null}
                </div>

                <div className="hidden text-[12px] text-white/90 sm:block">
                  {locationText}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-2">
            {sidePhotos.length > 0 ? (
              sidePhotos.map((photo, index) => {
                const actualIndex = index + 1;

                return (
                  <button
                    key={`${photo}-${index}`}
                    type="button"
                    onClick={() => openAt(actualIndex)}
                    className="overflow-hidden rounded-md bg-slate-100 text-left"
                    aria-label={`Ouvrir la photo ${actualIndex + 1}`}
                  >
                    <img
                      src={photo}
                      alt={`${title || "Annonce"} photo ${actualIndex + 1}`}
                      className="aspect-[4/3] h-full w-full cursor-zoom-in object-cover transition duration-300 hover:scale-[1.02]"
                    />
                  </button>
                );
              })
            ) : (
              <>
                <div className="grid aspect-[4/3] place-items-center rounded-md bg-slate-100 text-sm text-slate-500">
                  Photo
                </div>
                <div className="grid aspect-[4/3] place-items-center rounded-md bg-slate-100 text-sm text-slate-500">
                  Photo
                </div>
                <div className="grid aspect-[4/3] place-items-center rounded-md bg-slate-100 text-sm text-slate-500">
                  Photo
                </div>
                <div className="grid aspect-[4/3] place-items-center rounded-md bg-slate-100 text-sm text-slate-500">
                  Photo
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {selectedPhoto ? (
        <div className="fixed inset-0 z-[999] bg-black/90 p-4">
          <button
            type="button"
            onClick={close}
            className="absolute inset-0"
            aria-label="Fermer la galerie"
          />

          <div className="relative z-10 flex h-full items-center justify-center">
            {validPhotos.length > 1 ? (
              <button
                type="button"
                onClick={goPrev}
                className="absolute left-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/95 px-4 py-3 text-lg font-semibold text-slate-900 shadow-lg transition hover:bg-white"
                aria-label="Photo précédente"
              >
                ←
              </button>
            ) : null}

            <div className="relative w-full max-w-6xl">
              <button
                type="button"
                onClick={close}
                className="absolute right-2 top-2 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-lg font-semibold text-slate-900 shadow-lg"
                aria-label="Fermer"
              >
                ✕
              </button>

              <img
                src={selectedPhoto}
                alt={title || "Photo véhicule"}
                className="max-h-[88vh] w-full rounded-md object-contain"
              />

              <div className="mt-3 text-center text-sm text-white/85">
                {selectedIndex! + 1} / {validPhotos.length}
              </div>
            </div>

            {validPhotos.length > 1 ? (
              <button
                type="button"
                onClick={goNext}
                className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/95 px-4 py-3 text-lg font-semibold text-slate-900 shadow-lg transition hover:bg-white"
                aria-label="Photo suivante"
              >
                →
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}