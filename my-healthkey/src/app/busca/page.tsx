"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MagnifyingGlassIcon, SlidersHorizontalIcon } from "@phosphor-icons/react";

// ⬇️ Dados mockados (depois isso vem da API / banco)
interface Produto {
  id: number;
  nome: string;
  categoria: string;
  precoMin: number;
  imagem: string;
}

const produtos: Produto[] = [
  { id: 1, nome: "Paracetamol 500mg", categoria: "Analgésicos", precoMin: 9.9, imagem: "/Paracetamol.png" },
  { id: 2, nome: "Ibuprofeno 400mg", categoria: "Anti-inflamatórios", precoMin: 17.5, imagem: "/Paracetamol.png" },
  { id: 3, nome: "Dipirona 500mg", categoria: "Analgésicos", precoMin: 7.9, imagem: "/Paracetamol.png" },
  { id: 4, nome: "Amoxicilina 500mg", categoria: "Antibióticos", precoMin: 25.0, imagem: "/Paracetamol.png" },
  { id: 5, nome: "Loratadina 10mg", categoria: "Antialérgicos", precoMin: 14.2, imagem: "/Paracetamol.png" },
  { id: 6, nome: "Omeprazol 20mg", categoria: "Gastroprotetores", precoMin: 11.3, imagem: "/Paracetamol.png" },
  { id: 7, nome: "Vitamina C 1g", categoria: "Vitaminas", precoMin: 22.9, imagem: "/Paracetamol.png" },
  { id: 8, nome: "Dorflex", categoria: "Analgésicos", precoMin: 19.9, imagem: "/Paracetamol.png" },
];

const categorias = ["Todos", ...Array.from(new Set(produtos.map((p) => p.categoria)))];

type Ordenacao = "relevancia" | "menor-preco" | "maior-preco" | "nome";

export default function BuscaPage() {
  const searchParams = useSearchParams();

  const [termo, setTermo] = useState(searchParams.get("q") ?? "");
  const [categoria, setCategoria] = useState("Todos");
  const [ordenacao, setOrdenacao] = useState<Ordenacao>("relevancia");

  const resultados = useMemo(() => {
    let lista = produtos.filter((p) =>
      p.nome.toLowerCase().includes(termo.trim().toLowerCase())
    );

    if (categoria !== "Todos") {
      lista = lista.filter((p) => p.categoria === categoria);
    }

    switch (ordenacao) {
      case "menor-preco":
        lista = [...lista].sort((a, b) => a.precoMin - b.precoMin);
        break;
      case "maior-preco":
        lista = [...lista].sort((a, b) => b.precoMin - a.precoMin);
        break;
      case "nome":
        lista = [...lista].sort((a, b) => a.nome.localeCompare(b.nome));
        break;
    }

    return lista;
  }, [termo, categoria, ordenacao]);

  return (
    <main style={{ backgroundColor: "#F8F9FA" }} className="min-h-screen">
      {/* Cabeçalho da busca */}
      <section style={{ backgroundColor: "#C62828" }} className="text-white">
        <div className="container mx-auto px-6 py-10 max-w-6xl">
          <p className="text-sm uppercase tracking-wide text-red-100 mb-2">
            Buscar medicamentos
          </p>
          <h1 className="text-3xl font-bold mb-6">
            {termo ? (
              <>Resultados para &quot;{termo}&quot;</>
            ) : (
              <>Encontre o menor preço perto de você</>
            )}
          </h1>

          <div className="flex items-center bg-white rounded-lg overflow-hidden shadow-md max-w-2xl">
            <MagnifyingGlassIcon size={20} className="text-gray-400 ml-4" />
            <Input
              type="text"
              value={termo}
              onChange={(e) => setTermo(e.target.value)}
              placeholder="Ex: Paracetamol, Dipirona, Vitamina C..."
              className="border-0 shadow-none focus-visible:ring-0 text-gray-800"
            />
          </div>
        </div>
      </section>

      {/* Filtros */}
      <section className="container mx-auto px-6 max-w-6xl py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            {categorias.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoria(cat)}
                className="text-sm px-4 py-1.5 rounded-full border transition"
                style={
                  categoria === cat
                    ? { backgroundColor: "#D32F2F", borderColor: "#D32F2F", color: "#fff" }
                    : { backgroundColor: "#fff", borderColor: "#E0E0E0", color: "#555" }
                }
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <SlidersHorizontalIcon size={18} />
            <span>Ordenar:</span>
            <select
              value={ordenacao}
              onChange={(e) => setOrdenacao(e.target.value as Ordenacao)}
              className="border border-gray-200 rounded-md px-2 py-1.5 bg-white text-gray-700 outline-none"
            >
              <option value="relevancia">Relevância</option>
              <option value="menor-preco">Menor preço</option>
              <option value="maior-preco">Maior preço</option>
              <option value="nome">Nome (A-Z)</option>
            </select>
          </div>
        </div>
      </section>

      {/* Resultados */}
      <section className="container mx-auto px-6 max-w-6xl pb-16">
        <p className="text-sm text-gray-500 mb-4">
          {resultados.length}{" "}
          {resultados.length === 1 ? "produto encontrado" : "produtos encontrados"}
        </p>

        {resultados.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-lg font-semibold text-gray-700 mb-2">
              Nenhum produto encontrado
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Revise a grafia ou tente buscar por outro nome de medicamento.
            </p>
            <Button
              onClick={() => {
                setTermo("");
                setCategoria("Todos");
              }}
              style={{ backgroundColor: "#D32F2F" }}
              className="text-white"
            >
              Limpar busca
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {resultados.map((produto) => (
              <Link key={produto.id} href={`/produto/${produto.id}`}>
                <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer p-4 hover:scale-105 h-full flex flex-col">
                  <span className="text-xs font-medium text-gray-400 mb-2">
                    {produto.categoria}
                  </span>
                  <Image
                    src={produto.imagem}
                    alt={produto.nome}
                    width={160}
                    height={160}
                    className="mx-auto object-contain h-32 w-32"
                  />
                  <h3 className="text-base font-semibold text-gray-800 mt-4 text-center flex-1">
                    {produto.nome}
                  </h3>
                  <div className="text-center mt-2">
                    <span className="text-xs text-gray-400 block">a partir de</span>
                    <p className="text-[#D32F2F] font-bold text-xl">
                      R$ {produto.precoMin.toFixed(2)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
