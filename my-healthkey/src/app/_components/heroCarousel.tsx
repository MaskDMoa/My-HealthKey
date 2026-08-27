"use client";

import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface ButtonProps {
  enabled: boolean;
  onClick: () => void;
}

interface DotButtonProps {
  selected: boolean;
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

function DotButton({ selected, onClick }: DotButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`w-3 h-3 rounded-full transition-all mx-1 ${
        selected ? "bg-[#D32F2F] w-6" : "bg-gray-400 hover:bg-gray-500"
      }`}
    />
  );
}

// Cores rotativas para cada farmácia no carrossel
const bgColors = ["#C62828", "#2E7D32", "#1565C0", "#E65100", "#6A1B9A", "#00838F"];

export function HeroCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 30 });
  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  // Banners fallback (iguais ao original) enquanto carrega do banco
  const fallbackBanners = [
    { id: "fb1", title: "20% OFF", description: "Em todos os produtos da Loja A", bgColor: "#C62828" },
    { id: "fb2", title: "Frete Grátis", description: "Nas filiais da Loja B", bgColor: "#2E7D32" },
    { id: "fb3", title: "Clube de Benefícios", description: "Acumule pontos e troque por produtos", bgColor: "#1565C0" },
    { id: "fb4", title: "Até 3x sem juros", description: "No cartão de crédito na Loja C", bgColor: "#E65100" },
  ];

  const [banners, setBanners] = useState(fallbackBanners);

  useEffect(() => {
    async function fetchFarmacias() {
      // Busca as farmácias e a quantidade de medicamentos que cada uma tem
      const supabase = createClient();
      const { data: pharmacies, error } = await supabase
        .from("pharmacies")
        .select(`
          id,
          name,
          address,
          pharmacy_medicines ( medicine_id )
        `);

      if (error || !pharmacies || pharmacies.length === 0) return;

      const bannersFromDB = pharmacies.map((farm: any, idx: number) => ({
        id: farm.id,
        title: farm.name,
        description: `${farm.pharmacy_medicines.length} medicamentos disponíveis · ${farm.address.split(",").slice(0, 2).join(",")}`,
        bgColor: bgColors[idx % bgColors.length],
      }));

      setBanners(bannersFromDB);
    }

    fetchFarmacias();
  }, []);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setPrevBtnEnabled(emblaApi.canScrollPrev());
    setNextBtnEnabled(emblaApi.canScrollNext());
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
  }, [emblaApi, onSelect]);

  // Reinicia o embla quando os banners mudam (para recalcular os snaps)
  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.reInit();
    setScrollSnaps(emblaApi.scrollSnapList());
  }, [banners, emblaApi]);

  return (
    <div className="relative group mt-6">
      <div className="overflow-hidden rounded-xl mx-16" ref={emblaRef}>
        <div className="flex">
          {banners.map((banner) => (
            <div key={banner.id} className="flex-[0_0_100%] min-w-0 relative">
              <div
                style={{ backgroundColor: banner.bgColor }}
                className="h-70 md:h-87.5 lg:h-80 w-full flex items-center justify-between px-8 md:px-16"
              >
                <div className="text-white max-w-md text-center md:text-left">
                  <h2 className="text-3xl md:text-5xl font-bold mb-2 md:mb-4">
                    {banner.title}
                  </h2>
                  <p className="text-lg md:text-xl mb-4 md:mb-6">
                    {banner.description}
                  </p>
                  <button className="bg-white text-[#D32F2F] px-4 md:px-6 py-2 md:py-3 rounded-full font-semibold hover:bg-gray-100 transition text-sm md:text-base">
                    Aproveitar
                  </button>
                </div>

                <div className="hidden md:block">
                  <Image
                    src="/Paracetamol.png"
                    alt="Paracetamol"
                    width={180}
                    height={180}
                    className="drop-shadow-2xl"
                  />
                </div>
              </div>
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

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {scrollSnaps.map((_, index) => (
          <DotButton
            key={index}
            selected={index === selectedIndex}
            onClick={() => emblaApi?.scrollTo(index)}
          />
        ))}
      </div>
    </div>
  );
}
