"use client";

import Image from "next/image";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Storefront, ArrowRight } from "@phosphor-icons/react";

interface DotButtonProps {
  selected: boolean;
  onClick: () => void;
}

function DotButton({ selected, onClick }: DotButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`transition-all duration-500 rounded-full ${
        selected
          ? "w-8 h-2.5 bg-white shadow-lg shadow-white/30"
          : "w-2.5 h-2.5 bg-white/40 hover:bg-white/60"
      }`}
    />
  );
}

// Gradientes premium para cada slide
const gradients = [
  "from-[#C62828] via-[#D32F2F] to-[#EF5350]",
  "from-[#1B5E20] via-[#2E7D32] to-[#4CAF50]",
  "from-[#0D47A1] via-[#1565C0] to-[#42A5F5]",
  "from-[#E65100] via-[#F57C00] to-[#FFB74D]",
  "from-[#4A148C] via-[#6A1B9A] to-[#AB47BC]",
  "from-[#006064] via-[#00838F] to-[#26C6DA]",
];

export function HeroCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, duration: 40 },
    [Autoplay({ delay: 5000, stopOnInteraction: true })]
  );
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const fallbackBanners = [
    { id: "fb1", title: "Compare Preços", description: "Encontre o medicamento mais barato perto de você", gradient: gradients[0] },
    { id: "fb2", title: "Farmácias Parceiras", description: "Acesse o catálogo completo de remédios de cada loja", gradient: gradients[1] },
    { id: "fb3", title: "Saúde Inteligente", description: "Economize tempo e dinheiro com a nossa plataforma", gradient: gradients[2] },
  ];

  const [banners, setBanners] = useState(fallbackBanners);

  useEffect(() => {
    async function fetchFarmacias() {
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
        gradient: gradients[idx % gradients.length],
        pharmacyId: farm.id,
      }));

      setBanners(bannersFromDB);
    }

    fetchFarmacias();
  }, []);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.reInit();
    setScrollSnaps(emblaApi.scrollSnapList());
  }, [banners, emblaApi]);

  return (
    <div className="relative group max-w-7xl mx-auto px-6 pt-8 pb-8">
      <div className="overflow-hidden rounded-3xl shadow-2xl bg-gray-50" ref={emblaRef}>
        <div className="flex">
          {banners.map((banner: any) => (
            <div key={banner.id} className="flex-[0_0_100%] min-w-0 flex">
              <div
                className={`bg-gradient-to-br ${banner.gradient} w-full relative overflow-hidden flex flex-col justify-center`}
                style={{ minHeight: "380px" }}
              >
                {/* Elementos decorativos */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl"></div>
                  {/* Pattern sutil */}
                  <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "24px 24px" }}></div>
                </div>

                <div className="relative z-10 flex items-center justify-between px-10 md:px-16 py-12">
                  {/* Conteúdo textual */}
                  <div className="text-white max-w-lg space-y-5">
                    {banner.pharmacyId && (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-full border border-white/20">
                        <Storefront size={14} weight="fill" />
                        <span className="text-xs font-semibold uppercase tracking-wider">Farmácia Parceira</span>
                      </div>
                    )}
                    <h2 className="text-3xl md:text-5xl lg:text-5xl font-extrabold tracking-tight leading-[1.1] drop-shadow-md">
                      {banner.title}
                    </h2>
                    <p className="text-base md:text-xl font-light text-white/85 leading-relaxed max-w-md line-clamp-2">
                      {banner.description}
                    </p>
                    {banner.pharmacyId ? (
                      <Link
                        href={`/farmacia/${banner.pharmacyId}`}
                        className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 border border-white/20 hover:scale-105 hover:shadow-xl group/btn"
                      >
                        Ver Farmácia
                        <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" weight="bold" />
                      </Link>
                    ) : (
                      <Link
                        href="/busca"
                        className="inline-flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] group/btn"
                      >
                        Explorar
                        <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" weight="bold" />
                      </Link>
                    )}
                  </div>

                  {/* Imagem ilustrativa */}
                  <div className="hidden md:flex items-center justify-center relative">
                    <div className="absolute w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>
                    <Image
                      src="/Paracetamol.png"
                      alt="Medicamento"
                      width={200}
                      height={200}
                      className="drop-shadow-2xl relative z-10 hover:scale-110 transition-transform duration-500 animate-[bounce_4s_ease-in-out_infinite]"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Setas de navegação */}
      <button
        onClick={() => emblaApi?.scrollPrev()}
        className="absolute left-10 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm shadow-xl flex items-center justify-center text-gray-700 hover:bg-white hover:scale-110 transition-all duration-300 opacity-0 group-hover:opacity-100 z-20"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6" /></svg>
      </button>
      <button
        onClick={() => emblaApi?.scrollNext()}
        className="absolute right-10 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm shadow-xl flex items-center justify-center text-gray-700 hover:bg-white hover:scale-110 transition-all duration-300 opacity-0 group-hover:opacity-100 z-20"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6" /></svg>
      </button>

      {/* Dots indicator */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-2 z-20">
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
