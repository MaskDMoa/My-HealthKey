"use client";

import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";

// ⬇️ Dados mockados como fallback (garante que o layout não quebre enquanto carrega)
const produtosFallback = [
  { id: "1", nome: "Paracetamol 500mg", preco: 12.90, imagem: "/Paracetamol.png" },
  { id: "2", nome: "Ibuprofeno 400mg", preco: 18.50, imagem: "/Paracetamol.png" },
  { id: "3", nome: "Dipirona 500mg", preco: 8.90, imagem: "/Paracetamol.png" },
];

export function ProdutosLista() {
  const [produtos, setProdutos] = useState<any[]>(produtosFallback);

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

      if (error || !rawProdutos) return; // Mantém o fallback se der erro

      const formatados = rawProdutos.map((p: any) => {
        const precos = p.pharmacy_medicines.map((pm: any) => Number(pm.price));
        const menorPreco = precos.length > 0 ? Math.min(...precos) : 0;
        
        return {
          id: p.id,
          nome: p.name,
          imagem: p.image_url || "/Paracetamol.png",
          preco: menorPreco
        };
      });
      setProdutos(formatados);
    }
    fetchProdutos();
  }, []);

  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Produtos em Destaque</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {produtos.map((produto) => (
          <Link key={produto.id} href={`/produto/${produto.id}`}>
            <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer p-4 hover:scale-105">
              <Image
                src={produto.imagem}
                alt={produto.nome}
                width={200}
                height={200}
                className="mx-auto object-contain h-40 w-40"
              />
              <h3 className="text-lg font-semibold text-gray-800 mt-4 text-center">
                {produto.nome}
              </h3>
              <p className="text-[#D32F2F] font-bold text-xl text-center">
                R$ {produto.preco.toFixed(2)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}