"use client";

import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import { ArrowRight, Tag } from "@phosphor-icons/react";

// ⬇️ Dados mockados como fallback
const produtosFallback = [
  { id: "1", nome: "Paracetamol 500mg", preco: 12.90, imagem: "/Paracetamol.png" },
  { id: "2", nome: "Ibuprofeno 400mg", preco: 18.50, imagem: "/Paracetamol.png" },
  { id: "3", nome: "Dipirona 500mg", preco: 8.90, imagem: "/Paracetamol.png" },
  { id: "4", nome: "Loratadina 10mg", preco: 15.00, imagem: "/Paracetamol.png" },
];

export function ProdutosLista() {
  const [produtos, setProdutos] = useState<any[]>(produtosFallback);
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
        .sort((a, b) => a.preco - b.preco) // Ordena do mais barato para o mais caro
        .slice(0, 8); // Limita a 8 produtos para um grid perfeito (2 linhas de 4)
        
      if (formatados.length > 0) {
        setProdutos(formatados);
      } else {
        setProdutos(produtosFallback);
      }
      setLoading(false);
    }
    fetchProdutos();
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-6 py-24 relative">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-red-50 rounded-full blur-[100px] opacity-50"></div>
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-blue-50 rounded-full blur-[100px] opacity-50"></div>
      </div>

      <div className="flex flex-col items-center mb-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 text-red-600 mb-4 font-semibold text-sm">
          <Tag size={16} weight="bold" />
          Melhores Ofertas
        </div>
        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-5">
          Produtos em Destaque
        </h2>
        <p className="text-gray-500 max-w-2xl text-lg font-light">
          Encontramos os medicamentos mais buscados com os menores preços na sua região. 
          Economize sem complicação.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="flex flex-wrap justify-center gap-6 md:gap-8">
          {produtos.map((produto) => (
            <Link 
              key={produto.id} 
              href={`/produto/${produto.id}`} 
              className="group block h-full w-full sm:w-[calc(50%-1.5rem)] lg:w-[calc(25%-1.5rem)] max-w-[280px]"
            >
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white hover:border-red-100 hover:shadow-[0_20px_40px_rgba(211,47,47,0.1)] transition-all duration-500 cursor-pointer p-6 hover:-translate-y-2 relative overflow-hidden h-full flex flex-col z-10">
                
                {/* Background da imagem */}
                <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-gray-50 to-transparent -z-10 group-hover:from-red-50/50 transition-colors duration-500"></div>

                <div className="flex-grow flex items-center justify-center p-6 relative">
                  {/* Badge de preço baixo (decorativo) */}
                  {produto.preco < 15 && (
                    <div className="absolute top-0 right-0 bg-gradient-to-r from-green-500 to-emerald-400 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-md shadow-green-200 z-20">
                      Super Preço
                    </div>
                  )}

                  <Image
                    src={produto.imagem}
                    alt={produto.nome}
                    width={180}
                    height={180}
                    className="mx-auto object-contain h-36 w-36 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-700 ease-out drop-shadow-sm group-hover:drop-shadow-xl"
                  />
                </div>
                
                <div className="pt-5 mt-auto border-t border-gray-100/80">
                  <h3 className="text-lg font-bold text-gray-800 line-clamp-2 leading-tight group-hover:text-red-600 transition-colors min-h-[3rem]">
                    {produto.nome}
                  </h3>
                  
                  <div className="mt-5 flex items-end justify-between relative overflow-hidden">
                    <div className="transform transition-transform duration-500 group-hover:-translate-y-1">
                      <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mb-1">Menor Preço</p>
                      <p className="text-gray-900 font-black text-2xl">
                        <span className="text-sm font-bold text-gray-400 mr-1">R$</span>
                        {produto.preco.toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                    
                    {/* Botão animado corrigido */}
                    <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-red-600 transition-colors duration-500">
                      <ArrowRight size={20} className="text-gray-400 group-hover:text-white transition-all duration-500 group-hover:scale-110" weight="bold" />
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