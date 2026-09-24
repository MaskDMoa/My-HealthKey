import { Header } from "./_components/header";
import { Hero } from "./_components/hero";
import { HeroCarousel } from "./_components/heroCarousel";
import { PharmaciesSection } from "./_components/PharmaciesSection";
import { ProdutosLista } from "./_components/produtosLista"; // ⬅️ ADICIONA
import { Footer } from "./_components/footer";

export default function Home() {
  return (
    <main className="w-full overflow-x-hidden min-h-screen bg-[#F8F9FA]">
      <Header />
      <Hero />
      <HeroCarousel />
      <ProdutosLista /> {/* ⬅️ ADICIONA AQUI */}
      <PharmaciesSection />
      <Footer />
    </main>
  );
}