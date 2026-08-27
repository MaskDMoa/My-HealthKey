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
      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 z-10 transition-all disabled:opacity-50"
      style={{ width: "40px", height: "40px" }}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
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
      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 z-10 transition-all disabled:opacity-50"
      style={{ width: "40px", height: "40px" }}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M9 18l6-6-6-6" />
      </svg>
    </button>
  );
}

export function PharmacyCarousel({ pharmacyId, pharmacyName }: { pharmacyId: string; pharmacyName: string }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 30 });
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

  if (medicines.length === 0) return null; // Não renderiza o carrossel se a farmácia não tiver produtos cadastrados/disponíveis

  return (
    <div className="relative group mt-6">
      <div className="ml-16 mt-4 mb-2">
        <h1 className="text-3xl font-bold text-gray-800 font-mono">{pharmacyName}</h1>
      </div>
      <div className="overflow-hidden rounded-xl mx-16" ref={emblaRef}>
        <div className="flex">
          {medicines.map((item, idx) => (
            <div
              key={item.medicines.id + idx}
              className="flex-[0_0_100%] sm:flex-[0_0_50%] md:flex-[0_0_20%] min-w-0 px-2"
            >
              <Link href={`/produto/${item.medicines.id}`}>
                <div className="bg-white rounded-2xl p-6 h-auto min-h-[14rem] w-full flex flex-col sm:flex-row items-center justify-center gap-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-transparent hover:border-[#D32F2F]">
                  <div className="shrink-0 w-24 h-24 relative">
                    <Image
                      src={item.medicines.image_url || "/Paracetamol.png"}
                      alt={item.medicines.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="text-black flex-1 flex flex-col justify-center text-center sm:text-left">
                    <h3 className="text-base font-bold font-mono text-gray-900 line-clamp-2">
                      {item.medicines.name}
                    </h3>
                    <p className="text-xs font-mono text-gray-500 mt-1 leading-tight line-clamp-3">
                      {item.medicines.description || "Sem descrição"}
                    </p>
                    <span className="text-lg font-bold font-mono text-[#D32F2F] mt-2 block">
                      R$ {Number(item.price).toFixed(2)}
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
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
