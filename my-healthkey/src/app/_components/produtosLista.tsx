"use client";

import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import { ArrowRight, Tag, Pill } from "@phosphor-icons/react";

export function ProdutosLista() {
  const [produtos, setProdutos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProdutos() {
      const supabase = createClient();
      const { data: rawProdutos, error } = await supabase
        .from("medicines")
        .select(`
          id,
          name,
          image_url,
          pharmacy_medicines ( price )
        `);

      if (error || !rawProdutos) {
        setLoading(false);
        return;
      }

      const formatados = rawProdutos
        .filter((p: any) => p.pharmacy_medicines && p.pharmacy_medicines.length > 0)
        .map((p: any) => {
          const precos = p.pharmacy_medicines.map((pm: any) => Number(pm.price));
          const menorPreco = precos.length > 0 ? Math.min(...precos) : 0;
          
          return {
            id: p.id,
            nome: p.name,
            imagem: p.image_url || "/Paracetamol.png",
            preco: menorPreco
          };
        })
        .sort((a, b) => a.preco - b.preco)
        .slice(0, 8);
        
      setProdutos(formatados);
      setLoading(false);
    }
    fetchProdutos();
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20 relative">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 right-1/4 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-red-50 rounded-full blur-[100px] opacity-50"></div>
        <div className="absolute bottom-0 left-1/4 w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] bg-blue-50 rounded-full blur-[100px] opacity-50"></div>
      </div>

      <div className="flex flex-col items-center mb-10 sm:mb-16 text-center px-2">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 text-red-600 mb-4 font-semibold text-xs sm:text-sm">
          <Tag size={16} weight="bold" />
          Melhores Ofertas
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
          Produtos em Destaque
        </h2>
        <p className="text-gray-500 max-w-2xl text-base sm:text-lg font-light">
          Encontramos os medicamentos mais buscados com os menores preços na sua região. 
          Economize sem complicação.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white/60 rounded-3xl p-6 border border-gray-100 animate-pulse h-80 flex flex-col justify-between">
              <div className="w-28 h-28 bg-gray-200 rounded-2xl mx-auto" />
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-6 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : produtos.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-white/70 backdrop-blur-md rounded-3xl p-8 max-w-md mx-auto border border-gray-100 shadow-sm">
          <Pill size={40} className="mx-auto text-red-400 mb-3" />
          <p className="font-bold text-gray-800 text-lg">Nenhum medicamento com preços cadastrados</p>
          <p className="text-sm text-gray-500 mt-1">Novas farmácias e ofertas são adicionadas diariamente.</p>
          <Link href="/busca" className="inline-block mt-4 text-sm font-semibold text-red-600 hover:underline">
            Explorar todas as farmácias →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {produtos.map((produto) => (
            <Link 
              key={produto.id} 
              href={`/produto/${produto.id}`} 
              className="group block h-full w-full"
            >
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white hover:border-red-100 hover:shadow-[0_20px_40px_rgba(211,47,47,0.1)] transition-all duration-500 cursor-pointer p-6 hover:-translate-y-2 relative overflow-hidden h-full flex flex-col z-10">
                
                {/* Background da imagem */}
                <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-gray-50 to-transparent -z-10 group-hover:from-red-50/50 transition-colors duration-500"></div>

                <div className="flex-grow flex items-center justify-center p-4 relative min-h-[160px]">
                  {/* Badge de preço baixo (decorativo) */}
                  {produto.preco < 15 && (
                    <div className="absolute top-0 right-0 bg-gradient-to-r from-green-500 to-emerald-400 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-md shadow-green-200 z-20">
                      Super Preço
                    </div>
                  )}

                  <Image
                    src={produto.imagem}
                    alt={produto.nome}
                    width={160}
                    height={160}
                    className="mx-auto object-contain h-32 w-32 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-700 ease-out drop-shadow-sm group-hover:drop-shadow-xl"
                  />
                </div>
                
                <div className="pt-5 mt-auto border-t border-gray-100/80">
                  <h3 className="text-base sm:text-lg font-bold text-gray-800 line-clamp-2 leading-tight group-hover:text-red-600 transition-colors min-h-[2.75rem]">
                    {produto.nome}
                  </h3>
                  
                  <div className="mt-4 flex items-end justify-between relative overflow-hidden">
                    <div className="transform transition-transform duration-500 group-hover:-translate-y-0.5">
                      <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mb-1">Menor Preço</p>
                      <p className="text-gray-900 font-black text-xl sm:text-2xl">
                        <span className="text-sm font-bold text-gray-400 mr-1">R$</span>
                        {produto.preco.toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                    
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-red-600 transition-colors duration-500 shrink-0">
                      <ArrowRight size={18} className="text-gray-400 group-hover:text-white transition-all duration-500 group-hover:scale-110" weight="bold" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}