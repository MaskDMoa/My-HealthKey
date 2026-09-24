"use client";

import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Header } from "@/./app/_components/header";
import { Footer } from "@/./app/_components/footer";
import { createClient } from "@/lib/supabase/client";

const MapaFarmacias = dynamic(() => import("@/./app/_components/MapaFarmacias"), {
  ssr: false,
  loading: () => (
    <div className="bg-white rounded-xl shadow-lg p-6 md:p-10 text-center text-gray-400 mt-12">
      Carregando mapa de farmácias…
    </div>
  ),
});

export default function ProdutoPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [quantidade, setQuantidade] = useState(1);
  const [produto, setProduto] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [farmaciaSelecionada, setFarmaciaSelecionada] = useState<any>(null);

  // Estados para Reviews
  const [reviews, setReviews] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isPharmacy, setIsPharmacy] = useState(false);
  const [novaNota, setNovaNota] = useState(5);
  const [novoComentario, setNovoComentario] = useState("");
  const [enviandoReview, setEnviandoReview] = useState(false);

  useEffect(() => {
    async function fetchProdutoEReviews() {
      const supabase = createClient();
      
      // Checa usuário logado
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        setUser(currentUser);
        const { data: pharm } = await supabase.from("pharmacies").select("id").eq("owner_id", currentUser.id).single();
        setIsPharmacy(!!pharm);
      }

      // 1. Busca os detalhes do medicamento
      const { data, error } = await supabase
        .from("medicines")
        .select(`
          id,
          name,
          active_ingredient,
          description,
          image_url,
          pharmacy_medicines ( price )
        `)
        .eq("id", params.id)
        .single();

      if (error || !data) {
        setLoading(false);
        return;
      }

      // Calcula o menor preço disponível
      const precos = data.pharmacy_medicines.map((pm: any) => pm.price);
      const menorPreco = precos.length > 0 ? Math.min(...precos) : 0;

      // 2. Busca as avaliações
      const { data: reviewsData } = await supabase
        .from("reviews")
        .select("*")
        .eq("medicine_id", data.id)
        .order("created_at", { ascending: false });

      // Calcula a média das notas
      const calcAvg = () => {
        if (!reviewsData || reviewsData.length === 0) return 5.0;
        const sum = reviewsData.reduce((acc, curr) => acc + curr.rating, 0);
        return (sum / reviewsData.length).toFixed(1);
      };

      setReviews(reviewsData || []);

      setProduto({
        id: data.id,
        nome: data.name,
        descricao: data.description || "Descrição não disponível no momento.",
        imagem: data.image_url || "/Paracetamol.png",
        categoria: data.active_ingredient || "Medicamentos",
        preco: menorPreco,
        avaliacao: calcAvg(),
        totalAvaliacoes: reviewsData?.length || 0
      });
      setLoading(false);
    }
    fetchProdutoEReviews();
  }, [params.id]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || isPharmacy) return;
    
    setEnviandoReview(true);
    const supabase = createClient();
    
    const userName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Usuário";

    const { data, error } = await supabase.from("reviews").insert({
      user_id: user.id,
      user_name: userName,
      medicine_id: produto.id,
      rating: novaNota,
      comment: novoComentario
    }).select().single();

    if (error) {
      alert("Erro ao enviar avaliação. Tente novamente.");
    } else if (data) {
      setReviews([data, ...reviews]);
      setNovoComentario("");
      setNovaNota(5);
      alert("Avaliação enviada com sucesso!");
    }
    setEnviandoReview(false);
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-[60vh] flex items-center justify-center bg-[#F8F9FA]">
          <span className="text-gray-500 text-lg">Carregando produto...</span>
        </div>
        <Footer />
      </>
    );
  }

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

  const handleAddToCart = async () => {
    if (!farmaciaSelecionada) {
      alert("Por favor, selecione uma farmácia no mapa abaixo antes de adicionar ao carrinho.");
      return;
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert("Você precisa fazer login para adicionar ao carrinho!");
      router.push("/login");
      return;
    }

    // Insere no banco (tabela cart_items)
    const { error } = await supabase.from("cart_items").insert({
      user_id: user.id,
      pharmacy_id: farmaciaSelecionada.id,
      medicine_id: produto.id,
      quantity: quantidade
    });

    if (error) {
      alert("Erro ao adicionar ao carrinho: " + error.message);
    } else {
      alert(`Adicionado ${quantidade}x ${produto.nome} (Vendido por ${farmaciaSelecionada.nome}) ao carrinho!`);
      // Atualiza a página para o Header mostrar o novo número do carrinho
      router.refresh();
    }
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
                    <span className="text-gray-400">({produto.totalAvaliacoes} avaliações)</span>
                  </div>

                  <p className="text-4xl font-bold text-[#D32F2F] mt-4">
                    R$ {farmaciaSelecionada ? farmaciaSelecionada.preco.toFixed(2) : produto.preco.toFixed(2)}
                  </p>
                  
                  {farmaciaSelecionada && (
                    <p className="text-sm text-gray-500 mt-1">
                      Vendido por: <strong>{farmaciaSelecionada.nome}</strong>
                    </p>
                  )}

                  <p className="text-gray-600 mt-4 leading-relaxed">
                    {produto.descricao}
                  </p>

                  <p className="text-sm font-medium mt-4 flex items-center gap-2">
                    {produto.preco > 0 ? (
                      <span className="text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                        ✅ Disponível nas farmácias parceiras
                      </span>
                    ) : (
                      <span className="text-amber-700 bg-amber-50 px-3 py-1 rounded-full">
                        ⚠️ Consulte disponibilidade nas farmácias
                      </span>
                    )}
                  </p>
                </div>

                {/* Compra */}
                <div className="border-t pt-6 mt-6">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                    <div className="flex items-center justify-between sm:justify-start border border-gray-200 rounded-xl px-2 py-1">
                      <button
                        onClick={() => setQuantidade(Math.max(1, quantidade - 1))}
                        className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-lg transition text-lg"
                      >
                        -
                      </button>
                      <span className="px-4 font-bold text-gray-800">{quantidade}</span>
                      <button
                        onClick={() => setQuantidade(quantidade + 1)}
                        className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-lg transition text-lg"
                      >
                        +
                      </button>
                    </div>

                    <Button
                      onClick={handleAddToCart}
                      className="w-full sm:flex-1 bg-[#D32F2F] hover:bg-[#C62828] text-white py-4 sm:py-6 text-base sm:text-lg font-bold rounded-xl shadow-lg shadow-red-200"
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

          <div className="mt-12">
            <MapaFarmacias
              medicamentoId={produto.id.toString()}
              nomeMedicamento={produto.nome}
              onSelectPharmacy={(f) => setFarmaciaSelecionada(f)}
            />
          </div>

          {/* Avaliações */}
          <div className="mt-12 bg-white rounded-xl shadow-lg p-6 md:p-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Avaliações</h2>
            
            {/* Formulário de Nova Avaliação */}
            {user ? (
              isPharmacy ? (
                <div className="bg-orange-50 text-orange-800 p-4 rounded-lg mb-8">
                  Apenas contas de clientes podem avaliar medicamentos.
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} className="mb-8 p-6 border rounded-xl bg-gray-50">
                  <h3 className="font-semibold text-lg mb-4">Deixe sua avaliação</h3>
                  <div className="flex gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNovaNota(star)}
                        className={`text-2xl ${star <= novaNota ? 'text-yellow-500' : 'text-gray-300'}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={novoComentario}
                    onChange={(e) => setNovoComentario(e.target.value)}
                    placeholder="Escreva seu comentário..."
                    className="w-full p-3 border rounded-lg resize-none h-24 mb-4 outline-none focus:ring-2 focus:ring-red-500/50"
                    required
                  />
                  <Button
                    type="submit"
                    disabled={enviandoReview}
                    className="bg-[#D32F2F] hover:bg-[#C62828] text-white"
                  >
                    {enviandoReview ? "Enviando..." : "Enviar Avaliação"}
                  </Button>
                </form>
              )
            ) : (
              <div className="bg-gray-50 text-gray-600 p-4 rounded-xl mb-8 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
                <span>Faça login para deixar uma avaliação.</span>
                <Link href="/login" className="text-[#D32F2F] font-semibold hover:underline">
                  Fazer Login
                </Link>
              </div>
            )}

            {/* Lista de Avaliações */}
            <div className="space-y-6">
              {reviews.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Nenhuma avaliação ainda. Seja o primeiro!</p>
              ) : (
                reviews.map((rev) => (
                  <div key={rev.id} className="border-b pb-6 last:border-b-0 last:pb-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-bold text-base shrink-0">
                        {rev.user_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-semibold text-gray-800 block text-sm sm:text-base">{rev.user_name}</span>
                        <span className="text-yellow-500 text-xs sm:text-sm">
                          {"★".repeat(rev.rating)}{"☆".repeat(5 - rev.rating)}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm sm:text-base pl-0 sm:pl-13 mt-2">{rev.comment}</p>
                    <span className="text-xs text-gray-400 pl-0 sm:pl-13 mt-1.5 block">
                      {new Date(rev.created_at).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ⬇️ FOOTER NO RODAPÉ */}
      <Footer />
    </>
  );
}
