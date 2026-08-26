"use client";

import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Header } from "@/./app/_components/header";
import { Footer } from "@/./app/_components/footer";


const MapaFarmacias = dynamic(() => import("@/./app/_components/MapaFarmacias"), {
  ssr: false,
  loading: () => (
    <div className="bg-white rounded-xl shadow-lg p-6 md:p-10 text-center text-gray-400 mt-12">
      Carregando mapa de farmácias…
    </div>
  ),
});

const produtosMock = [
  {
    id: 1,
    nome: "Paracetamol 500mg",
    preco: 12.90,
    descricao: "Analgésico e antitérmico indicado para dor e febre.",
    imagem: "/Paracetamol.png",
    categoria: "Analgésicos",
    estoque: 50,
    avaliacao: 4.5,
  },
  {
    id: 2,
    nome: "Ibuprofeno 400mg",
    preco: 18.50,
    descricao: "Anti-inflamatório não esteroidal, alivia dores e inflamações.",
    imagem: "/Paracetamol.png",
    categoria: "Anti-inflamatórios",
    estoque: 30,
    avaliacao: 4.8,
  },
  {
    id: 3,
    nome: "Dipirona 500mg",
    preco: 8.90,
    descricao: "Analgésico e antitérmico de ação rápida.",
    imagem: "/Paracetamol.png",
    categoria: "Analgésicos",
    estoque: 100,
    avaliacao: 4.2,
  },
];

export default function ProdutoPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [quantidade, setQuantidade] = useState(1);

  const produto = produtosMock.find((p) => p.id === Number(params.id));

  if (!produto) {
    return (
      <>
        <Header />
        <div className="min-h-[60vh] flex items-center justify-center bg-[#F8F9FA]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[#D32F2F]">Produto não encontrado</h1>
            <Link href="/" className="text-[#D32F2F] hover:underline mt-4 block">
              Voltar para a home
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const handleAddToCart = () => {
    alert(`Adicionado ${quantidade}x ${produto.nome} ao carrinho!`);
  };

  return (
    <>
      {/* ⬇️ HEADER FIXO NO TOPO */}
      <Header />

      {/* ⬇️ CONTEÚDO PRINCIPAL */}
      <div className="min-h-screen bg-[#F8F9FA] py-8 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Botão voltar */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[#D32F2F] hover:underline mb-6"
          >
            ← Voltar
          </button>

          {/* Container do produto */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:p-10">
              
              {/* Imagem */}
              <div className="flex items-center justify-center bg-gray-50 rounded-lg p-6">
                <Image
                  src={produto.imagem}
                  alt={produto.nome}
                  width={300}
                  height={300}
                  className="object-contain drop-shadow-xl"
                />
              </div>

              {/* Informações */}
              <div className="flex flex-col justify-between">
                <div>
                  <span className="text-sm font-medium text-[#D32F2F] bg-red-50 px-3 py-1 rounded-full">
                    {produto.categoria}
                  </span>

                  <h1 className="text-3xl font-bold text-gray-800 mt-3">
                    {produto.nome}
                  </h1>

                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-yellow-500 text-xl">⭐</span>
                    <span className="font-semibold">{produto.avaliacao}</span>
                    <span className="text-gray-400">(120 avaliações)</span>
                  </div>

                  <p className="text-4xl font-bold text-[#D32F2F] mt-4">
                    R$ {produto.preco.toFixed(2)}
                  </p>

                  <p className="text-gray-600 mt-4 leading-relaxed">
                    {produto.descricao}
                  </p>

                  <p className="text-sm text-green-600 mt-4">
                    ✅ Em estoque ({produto.estoque} unidades)
                  </p>
                </div>

                {/* Compra */}
                <div className="border-t pt-6 mt-6">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border rounded-lg">
                      <button
                        onClick={() => setQuantidade(Math.max(1, quantidade - 1))}
                        className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition"
                      >
                        -
                      </button>
                      <span className="px-4 py-2 font-semibold">{quantidade}</span>
                      <button
                        onClick={() => setQuantidade(quantidade + 1)}
                        className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition"
                      >
                        +
                      </button>
                    </div>

                    <Button
                      onClick={handleAddToCart}
                      className="flex-1 bg-[#D32F2F] hover:bg-[#C62828] text-white py-6 text-lg"
                    >
                      Adicionar ao carrinho
                    </Button>
                  </div>

                  <p className="text-center text-sm text-gray-400 mt-4">
                    <Link href="/" className="hover:underline">
                      Continuar comprando
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ALTERAÇÃO 2: Mapa de farmácias — entre o produto e as avaliações */}
          <div className="mt-12">
            <MapaFarmacias
              medicamentoId={produto.id.toString()}
              nomeMedicamento={produto.nome}
            />
          </div>

          {/* Avaliações */}
          <div className="mt-12 bg-white rounded-xl shadow-lg p-6 md:p-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Avaliações</h2>
            <div className="space-y-4">
              <div className="border-b pb-4">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">João S.</span>
                  <span className="text-yellow-500">⭐⭐⭐⭐⭐</span>
                </div>
                <p className="text-gray-600 mt-1">Ótimo produto, aliviou minha dor rapidamente!</p>
              </div>
              <div className="border-b pb-4">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Maria F.</span>
                  <span className="text-yellow-500">⭐⭐⭐⭐</span>
                </div>
                <p className="text-gray-600 mt-1">Bom custo-benefício, entrega rápida.</p>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Pedro R.</span>
                  <span className="text-yellow-500">⭐⭐⭐⭐⭐</span>
                </div>
                <p className="text-gray-600 mt-1">Recomendo! Já compro sempre aqui.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ⬇️ FOOTER NO RODAPÉ */}
      <Footer />
    </>
  );
}
