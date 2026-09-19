import Image from "next/image";
import Link from "next/link";
import { MagnifyingGlass, Scales, MapPin } from "@phosphor-icons/react/dist/ssr";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#C62828] via-[#D32F2F] to-[#E53935] text-white min-h-[500px] flex items-center">
      
      {/* Elementos decorativos (Glows / Background) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl opacity-60 mix-blend-overlay"></div>
        <div className="absolute top-40 -left-20 w-72 h-72 bg-red-400/20 rounded-full blur-3xl opacity-50 mix-blend-overlay"></div>
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/20 to-transparent"></div>
      </div>

      <div className="container mx-auto px-6 py-16 lg:py-24 relative z-10">
        <div className="flex flex-col-reverse lg:flex-row items-center justify-between gap-12 lg:gap-20">
          
          {/* Text Content */}
          <div className="flex-1 max-w-2xl text-center lg:text-left space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md shadow-lg mb-2">
              <Scales size={16} weight="bold" className="text-red-200" />
              <span className="text-sm font-semibold tracking-wide text-red-50 uppercase">Compare preços em tempo real</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] drop-shadow-sm">
              Sua saúde, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-100 to-white">
                sempre em dia.
              </span>
            </h1>
            
            <p className="text-lg lg:text-2xl font-light text-red-50 leading-relaxed max-w-xl mx-auto lg:mx-0 opacity-90">
              Compare preços de medicamentos entre farmácias da sua região. Encontre o melhor custo-benefício sem sair de casa.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <Link href="/busca" className="group flex items-center justify-center gap-2 bg-white text-red-700 px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-all shadow-[0_0_40px_-10px_rgba(255,255,255,0.5)] hover:shadow-[0_0_60px_-15px_rgba(255,255,255,0.7)] w-full sm:w-auto">
                <MagnifyingGlass size={24} weight="bold" />
                Buscar Remédios
              </Link>
            </div>
            
            <div className="flex items-center justify-center lg:justify-start gap-6 pt-8 opacity-80">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Scales size={20} className="text-green-300" weight="fill" /> Compare Preços
              </div>
              <div className="flex items-center gap-2 text-sm font-medium">
                <MapPin size={20} className="text-red-300" weight="fill" /> Farmácias Perto de Você
              </div>
            </div>
          </div>

          {/* Visual Element (Medicine + Badges) */}
          <div className="flex-1 relative w-full max-w-lg lg:max-w-xl xl:max-w-2xl animate-in fade-in zoom-in duration-1000 delay-200">
            <div className="relative w-full aspect-square flex items-center justify-center">
              {/* Decorative rings */}
              <div className="absolute w-3/4 h-3/4 border-2 border-white/10 rounded-full animate-[spin_30s_linear_infinite]"></div>
              <div className="absolute w-2/3 h-2/3 border border-white/20 rounded-full animate-[spin_20s_linear_infinite_reverse]"></div>
              
              {/* Floating Image */}
              <div className="relative z-10 animate-[bounce_4s_ease-in-out_infinite]">
                <Image
                  src="/Paracetamol.png"
                  alt="Medicamento Ilustrativo"
                  width={380}
                  height={380}
                  className="drop-shadow-2xl object-contain hover:scale-110 transition-transform duration-500"
                  priority
                />
              </div>
              
              {/* Floating Glass Badges */}
              <div className="absolute top-1/4 -left-4 lg:-left-12 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl shadow-xl animate-[bounce_5s_ease-in-out_infinite_reverse]">
                <p className="text-xs font-semibold text-red-100 uppercase tracking-wider mb-1">Economia Média</p>
                <p className="text-2xl font-bold text-white">R$ 15,00</p>
              </div>
              
              <div className="absolute bottom-1/4 -right-4 lg:-right-12 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl shadow-xl animate-[bounce_6s_ease-in-out_infinite]">
                <p className="text-xs font-semibold text-red-100 uppercase tracking-wider mb-1">Farmácias</p>
                <p className="text-xl font-bold text-white">Perto de Você</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
