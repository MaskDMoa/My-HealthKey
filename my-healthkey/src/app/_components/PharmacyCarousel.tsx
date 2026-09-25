"use client";

import Image from "next/image";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface ButtonProps {
  enabled: boolean;
  onClick: () => void;
}

function PrevButton({ enabled, onClick }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={!enabled}
      aria-label="Anterior"
      className="hidden sm:flex absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 z-10 transition-all disabled:opacity-30 items-center justify-center w-9 h-9 sm:w-10 sm:h-10"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      >
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </button>
  );
}

function NextButton({ enabled, onClick }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={!enabled}
      aria-label="Próximo"
      className="hidden sm:flex absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 z-10 transition-all disabled:opacity-30 items-center justify-center w-9 h-9 sm:w-10 sm:h-10"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      >
        <path d="M9 18l6-6-6-6" />
      </svg>
    </button>
  );
}

export function PharmacyCarousel({
  pharmacyId,
  pharmacyName,
}: {
  pharmacyId: string;
  pharmacyName: string;
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    slidesToScroll: "auto",
  });
  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false);
  const [medicines, setMedicines] = useState<any[]>([]);

  useEffect(() => {
    async function fetchMedicines() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("pharmacy_medicines")
        .select(`
          price,
          medicines (
            id,
            name,
            description,
            image_url
          )
        `)
        .eq("pharmacy_id", pharmacyId)
        .eq("is_available", true);

      if (error) {
        console.error(error);
        return;
      }

      setMedicines(data || []);
    }
    fetchMedicines();
  }, [pharmacyId]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setPrevBtnEnabled(emblaApi.canScrollPrev());
    setNextBtnEnabled(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
  }, [emblaApi, onSelect]);

  if (medicines.length === 0) return null;

  return (
    <div className="relative group max-w-7xl mx-auto px-4 sm:px-8 mt-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 tracking-tight">
          {pharmacyName}
        </h2>
        <Link
          href={`/farmacia/${pharmacyId}`}
          className="text-xs sm:text-sm font-semibold text-red-600 hover:text-red-700 transition-colors"
        >
          Ver catálogo completo →
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl" ref={emblaRef}>
        <div className="flex -ml-3">
          {medicines.map((item, idx) => {
            const med = item.medicines;
            if (!med) return null;
            return (
              <div
                key={med.id || idx}
                className="flex-[0_0_80%] sm:flex-[0_0_46%] md:flex-[0_0_31%] lg:flex-[0_0_23%] min-w-0 pl-3"
              >
                <Link href={`/produto/${med.id}?farmacia=${pharmacyId}`}>
                  <div className="bg-white rounded-2xl p-4 sm:p-5 h-full flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer border border-gray-100 hover:border-red-300">
                    <div className="w-full h-28 relative mb-3">
                      <Image
                        src={med.image_url || "/Paracetamol.png"}
                        alt={med.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div className="text-black flex-1 flex flex-col justify-between text-left">
                      <div>
                        <h3 className="text-sm sm:text-base font-bold text-gray-900 line-clamp-2 leading-snug">
                          {med.name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {med.description || "Disponível nesta farmácia"}
                        </p>
                      </div>
                      <div className="mt-3 pt-2 border-t border-gray-100 flex items-baseline justify-between">
                        <span className="text-xs text-gray-400 font-medium">Por</span>
                        <span className="text-base sm:text-lg font-bold text-[#D32F2F]">
                          R$ {Number(item.price).toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      <PrevButton
        onClick={() => emblaApi?.scrollPrev()}
        enabled={prevBtnEnabled}
      />
      <NextButton
        onClick={() => emblaApi?.scrollNext()}
        enabled={nextBtnEnabled}
      />
    </div>
  );
}
