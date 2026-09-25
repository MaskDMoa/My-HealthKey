"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { MapPin, Phone, Globe, Pill, ArrowLeft, Storefront, Clock } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";

import { Header } from "@/app/_components/header";
import { Footer } from "@/app/_components/footer";

// Leaflet precisa ser carregado sem SSR
const FarmaciaMap = dynamic(() => import("./FarmaciaMap"), { ssr: false });

type Pharmacy = {
  id: string;
  name: string;
  trade_name?: string;
  address: string;
  latitude: number;
  longitude: number;
  phone?: string;
  website_url?: string;
  opening_hours?: {
    [key: string]: {
      abre: string;
      fecha: string;
      fechado: boolean;
    };
  };
};

type MedicineInfo = {
  id: string;
  name: string;
  active_ingredient: string;
  description?: string;
};

type StockItem = {
  id: string;
  price: number;
  is_available: boolean;
  medicines: MedicineInfo | MedicineInfo[];
};

export function FarmaciaDetail({ pharmacy, stock, initialReviews = [] }: { pharmacy: Pharmacy; stock: StockItem[]; initialReviews?: any[] }) {
  const [reviews, setReviews] = useState<any[]>(initialReviews);
  const [user, setUser] = useState<any>(null);
  const [isPharmacy, setIsPharmacy] = useState(false);
  const [novaNota, setNovaNota] = useState(5);
  const [novoComentario, setNovoComentario] = useState("");
  const [enviandoReview, setEnviandoReview] = useState(false);

  useEffect(() => {
    async function checkUser() {
      const supabase = createClient();
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        setUser(currentUser);
        const { data: pharm } = await supabase.from("pharmacies").select("id").eq("owner_id", currentUser.id).single();
        setIsPharmacy(!!pharm);
      }
    }
    checkUser();
  }, []);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || isPharmacy) return;
    
    setEnviandoReview(true);
    const supabase = createClient();
    
    const userName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Usuário";

    const { data, error } = await supabase.from("reviews").insert({
      user_id: user.id,
      user_name: userName,
      pharmacy_id: pharmacy.id,
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

  return (
    <>
      <Header />
      <main className="min-h-screen" style={{ backgroundColor: "#F8F9FA" }}>
        {/* Header da farmácia */}
        <section style={{ backgroundColor: "#C62828" }} className="text-white">
          <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-6xl">
            <Link href="/busca" className="inline-flex items-center gap-2 text-red-200 hover:text-white text-xs sm:text-sm mb-4 transition-colors group">
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Voltar à busca
            </Link>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shrink-0">
                <Storefront size={28} weight="fill" className="text-white sm:text-3xl" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">{pharmacy.name}</h1>
                {pharmacy.trade_name && pharmacy.trade_name !== pharmacy.name && (
                  <p className="text-red-200 text-xs sm:text-sm mt-0.5">{pharmacy.trade_name}</p>
                )}
              </div>
            </div>
          </div>
        </section>

      <div className="container mx-auto px-4 sm:px-6 max-w-6xl py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna esquerda: Mapa + Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Mapa */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="h-64">
                <FarmaciaMap lat={pharmacy.latitude} lng={pharmacy.longitude} name={pharmacy.name} />
              </div>
              <div className="p-5 space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin size={20} className="text-red-500 mt-0.5 shrink-0" weight="fill" />
                  <p className="text-sm text-gray-600">{pharmacy.address}</p>
                </div>
                {pharmacy.phone && (
                  <div className="flex items-center gap-3">
                    <Phone size={20} className="text-red-500 shrink-0" weight="fill" />
                    <p className="text-sm text-gray-600">{pharmacy.phone}</p>
                  </div>
                )}
                {pharmacy.website_url && (
                  <div className="flex items-center gap-3">
                    <Globe size={20} className="text-red-500 shrink-0" weight="fill" />
                    <a href={pharmacy.website_url} target="_blank" rel="noopener noreferrer" className="text-sm text-red-600 hover:underline">
                      {pharmacy.website_url}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Horários de Funcionamento */}
            {pharmacy.opening_hours && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-50 flex items-center gap-2">
                  <Clock size={20} className="text-red-500" weight="fill" />
                  <h3 className="font-bold text-gray-800">Horários de Funcionamento</h3>
                </div>
                <div className="divide-y divide-gray-50">
                  {["segunda", "terca", "quarta", "quinta", "sexta", "sabado", "domingo"].map((dayKey) => {
                    const labels: {[k:string]:string} = {
                      segunda: "Seg", terca: "Ter", quarta: "Qua",
                      quinta: "Qui", sexta: "Sex", sabado: "Sáb", domingo: "Dom"
                    };
                    const day = pharmacy.opening_hours?.[dayKey];
                    if (!day) return null;
                    const today = new Date().toLocaleDateString("pt-BR", { weekday: "long" })
                      .normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace("-feira", "").toLowerCase();
                    const isToday = today === dayKey;
                    return (
                      <div key={dayKey} className={`flex items-center justify-between px-5 py-3 ${isToday ? "bg-red-50/60" : ""}`}>
                        <span className={`text-sm font-semibold ${isToday ? "text-red-600" : "text-gray-700"}`}>
                          {labels[dayKey]} {isToday && <span className="text-xs font-normal text-red-400 ml-1">Hoje</span>}
                        </span>
                        {day.fechado ? (
                          <span className="text-sm text-gray-400 font-medium">Fechado</span>
                        ) : (
                          <span className="text-sm text-gray-600 font-medium">{day.abre} — {day.fecha}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Coluna direita: Medicamentos */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Pill size={24} className="text-red-600" weight="fill" />
                  Medicamentos Disponíveis
                </h2>
                <span className="text-sm text-gray-400">
                  {stock.length} {stock.length === 1 ? "item" : "itens"}
                </span>
              </div>

              {stock.length === 0 ? (
                <div className="p-12 text-center">
                  <Pill size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 font-medium">Nenhum medicamento cadastrado ainda.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {stock.map((item) => {
                    const med = Array.isArray(item.medicines) ? item.medicines[0] : item.medicines;
                    if (!med) return null;
                    return (
                      <Link
                        key={item.id}
                        href={`/produto/${med.id}?farmacia=${pharmacy.id}`}
                        className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-red-50/40 transition-colors group block"
                      >
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-800 group-hover:text-red-600 transition-colors text-sm sm:text-base">
                            {med.name}
                          </h3>
                          {med.active_ingredient && (
                            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                              Princípio ativo: {med.active_ingredient}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-3 sm:ml-4">
                          <span className="text-xs text-green-600 font-semibold bg-green-50 px-2.5 py-0.5 rounded-full">
                            Disponível
                          </span>
                          <p className="text-lg sm:text-xl font-bold text-red-600">
                            R$ {Number(item.price).toFixed(2).replace('.', ',')}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Nova Seção: Avaliações da Farmácia */}
            <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-6">Avaliações da Farmácia</h2>
              
              {user ? (
                isPharmacy ? (
                  <div className="bg-orange-50 text-orange-800 p-4 rounded-xl mb-8 text-sm">
                    Apenas contas de clientes podem avaliar farmácias.
                  </div>
                ) : (
                  <form onSubmit={handleSubmitReview} className="mb-8 p-4 sm:p-6 border border-gray-100 rounded-xl bg-gray-50">
                    <h3 className="font-semibold text-base sm:text-lg mb-3">Deixe sua avaliação</h3>
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
                      placeholder="Como foi sua experiência com esta farmácia?"
                      className="w-full p-3 bg-white border border-gray-200 rounded-xl resize-none h-24 mb-4 outline-none focus:ring-2 focus:ring-red-500/50 text-sm"
                      required
                    />
                    <button
                      type="submit"
                      disabled={enviandoReview}
                      className="bg-[#D32F2F] hover:bg-[#C62828] text-white px-5 sm:px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50"
                    >
                      {enviandoReview ? "Enviando..." : "Enviar Avaliação"}
                    </button>
                  </form>
                )
              ) : (
                <div className="bg-gray-50 text-gray-600 p-4 rounded-xl mb-8 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between text-sm">
                  <span>Faça login para avaliar esta farmácia.</span>
                  <Link href="/login" className="text-[#D32F2F] font-semibold hover:underline">
                    Fazer Login
                  </Link>
                </div>
              )}

              {/* Lista de Avaliações */}
              <div className="space-y-6">
                {reviews.length === 0 ? (
                  <p className="text-gray-500 text-center py-4 text-sm">Nenhuma avaliação ainda. Seja o primeiro a avaliar!</p>
                ) : (
                  reviews.map((rev) => (
                    <div key={rev.id} className="border-b border-gray-100 pb-5 last:border-b-0 last:pb-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-9 h-9 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                          {rev.user_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-semibold block text-gray-800 text-sm sm:text-base">{rev.user_name}</span>
                          <span className="text-yellow-500 text-xs sm:text-sm">
                            {"★".repeat(rev.rating)}{"☆".repeat(5 - rev.rating)}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-700 text-sm sm:text-base pl-0 sm:pl-12 mt-1.5">{rev.comment}</p>
                      <span className="text-xs text-gray-400 pl-0 sm:pl-12 mt-1 block">
                        {new Date(rev.created_at).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
    <Footer />
  </>
  );
}
