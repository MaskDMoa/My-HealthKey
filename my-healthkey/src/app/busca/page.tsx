"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MagnifyingGlass, SlidersHorizontal, Pill, Storefront, XCircle } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";
import { Header } from "@/app/_components/header";
import { Footer } from "@/app/_components/footer";

type Ordenacao = "relevancia" | "menor-preco" | "maior-preco" | "nome";
type TipoBusca = "medicamentos" | "farmacias";

interface OfferResult {
  id: string; // pharmacy_medicines.id
  medicine_id: string;
  name: string;
  active_ingredient: string;
  pharmacy_name: string;
  price: number;
  pharmacy_id?: string;
}

function BuscaContent() {
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [tipoBusca, setTipoBusca] = useState<TipoBusca>("medicamentos");
  const [termo, setTermo] = useState(searchParams.get("q") ?? "");
  const [termoSubmit, setTermoSubmit] = useState(searchParams.get("q") ?? "");
  
  const [ordenacao, setOrdenacao] = useState<Ordenacao>("relevancia");

  const [remedios, setRemedios] = useState<OfferResult[]>([]);
  const [carregandoRemedios, setCarregandoRemedios] = useState(false);

  const [farmacias, setFarmacias] = useState<any[]>([]);
  const [carregandoFarmacias, setCarregandoFarmacias] = useState(false);

  const [dropdownAberto, setDropdownAberto] = useState(false);
  const opcoesOrdenacao = {
    "relevancia": "Relevância",
    "menor-preco": "Menor Preço",
    "maior-preco": "Maior Preço",
    "nome": "Ordem Alfabética (A-Z)"
  };

  const [tagsDinamicas, setTagsDinamicas] = useState<string[]>(["Todos"]);

  // Busca tags dinâmicas no mount
  useEffect(() => {
    async function fetchTags() {
      const { data } = await supabase.from("medicines").select("name").limit(5);
      if (data && data.length > 0) {
        // Extrai o primeiro nome de cada remédio (ex: "Paracetamol 500mg" -> "Paracetamol")
        const names = data.map(m => m.name.split(" ")[0]);
        // Remove duplicatas e pega até 5
        const uniqueNames = Array.from(new Set(names)).slice(0, 5);
        setTagsDinamicas(["Todos", ...uniqueNames]);
      } else {
        // Sem tags prévias no banco
        setTagsDinamicas(["Todos"]);
      }
    }
    fetchTags();
  }, []);

  // Busca no banco de dados quando o termo é submetido
  useEffect(() => {
    const performSearch = async () => {
      if (tipoBusca === "medicamentos") {
        setCarregandoRemedios(true);

        // Registrar log de busca silenciosamente (se houver termo)
        if (termoSubmit) {
          supabase.from("search_logs").insert({ term: termoSubmit }).then(() => {});
        }

        // Buscar medicamentos do banco (limitando os IDs primeiro)
        let medQuery = supabase.from("medicines").select("id").limit(50);
        if (termoSubmit) medQuery = medQuery.ilike("name", `%${termoSubmit}%`);
        const { data: medData } = await medQuery;

        if (medData && medData.length > 0) {
          const medIds = medData.map(m => m.id);
          
          const { data: offersData } = await supabase
            .from("pharmacy_medicines")
            .select(`
              id, price, medicine_id, pharmacy_id,
              medicines (name, active_ingredient),
              pharmacies (name)
            `)
            .in("medicine_id", medIds)
            .eq("is_available", true);

          let results: OfferResult[] = (offersData || []).map((o: any) => ({
            id: o.id,
            medicine_id: o.medicine_id,
            name: o.medicines?.name || "",
            active_ingredient: o.medicines?.active_ingredient || "",
            pharmacy_name: o.pharmacies?.name || "",
            price: Number(o.price),
            pharmacy_id: o.pharmacy_id
          }));

          // Ordenar
          switch (ordenacao) {
            case "menor-preco":
              results.sort((a, b) => a.price - b.price);
              break;
            case "maior-preco":
              results.sort((a, b) => b.price - a.price);
              break;
            case "nome":
              results.sort((a, b) => a.name.localeCompare(b.name));
              break;
            case "relevancia":
              results.sort((a, b) => {
                const porNome = a.name.localeCompare(b.name);
                return porNome !== 0 ? porNome : a.price - b.price;
              });
              break;
          }

          setRemedios(results);
        } else {
          setRemedios([]);
        }

        setCarregandoRemedios(false);
      } else {
        // Buscar farmácias
        setCarregandoFarmacias(true);
        let query = supabase.from("pharmacies").select("*");
        
        if (termoSubmit) {
          query = query.ilike("name", `%${termoSubmit}%`);
        }

        const { data } = await query;
        setFarmacias(data || []);
        setCarregandoFarmacias(false);
      }
    };

    performSearch();
  }, [termoSubmit, tipoBusca, ordenacao]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      setTermoSubmit(termo);
    }
  };

  const isLoading = tipoBusca === "medicamentos" ? carregandoRemedios : carregandoFarmacias;

  // Sincroniza com o query param da URL (quando o Header redireciona pra /busca?q=...)
  useEffect(() => {
    const q = searchParams.get("q") ?? "";
    if (q !== termoSubmit) {
      setTermo(q);
      setTermoSubmit(q);
    }
  }, [searchParams]);

  return (
    <main style={{ backgroundColor: "#F8F9FA" }} className="min-h-screen">
      {/* Header global com barra de pesquisa */}
      <Header />

      {/* Cabeçalho da busca */}
      <section style={{ backgroundColor: "#C62828" }} className="text-white pb-6 relative shadow-inner">
        <div className="container mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-4 sm:pb-6 max-w-6xl">
          
          <div className="flex gap-2.5 sm:gap-4 mb-4 sm:mb-6">
            <button
              onClick={() => setTipoBusca("medicamentos")}
              className={`flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
                tipoBusca === "medicamentos" ? "bg-white text-red-700 shadow-md scale-105" : "bg-red-800/50 hover:bg-red-800 text-red-50"
              }`}
            >
              <Pill size={18} weight={tipoBusca === "medicamentos" ? "fill" : "regular"} />
              Medicamentos
            </button>
            <button
              onClick={() => setTipoBusca("farmacias")}
              className={`flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
                tipoBusca === "farmacias" ? "bg-white text-red-700 shadow-md scale-105" : "bg-red-800/50 hover:bg-red-800 text-red-50"
              }`}
            >
              <Storefront size={18} weight={tipoBusca === "farmacias" ? "fill" : "regular"} />
              Farmácias
            </button>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold">
            {termoSubmit ? (
              <>Resultados para &quot;{termoSubmit}&quot;</>
            ) : (
              <>{tipoBusca === "medicamentos" ? "Encontre o menor preço" : "Encontre farmácias próximas"}</>
            )}
          </h1>
        </div>
      </section>

      {/* Filtros (apenas para medicamentos) */}
      {tipoBusca === "medicamentos" && (
        <section className="container mx-auto px-4 sm:px-6 max-w-6xl py-4 sm:py-6 animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 sm:gap-6">
            
            {/* Tags de Categoria (Agem como filtros de busca rápida deslizáveis no mobile) */}
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar flex-nowrap sm:flex-wrap pb-1.5 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 flex-1">
              {tagsDinamicas.map((cat) => {
                const isActive = cat === "Todos" ? termoSubmit === "" : termoSubmit.toLowerCase() === cat.toLowerCase();
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      const newTerm = cat === "Todos" ? "" : cat;
                      setTermo(newTerm);
                      setTermoSubmit(newTerm);
                    }}
                    className={`text-xs sm:text-sm px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full border font-medium transition-all duration-200 hover:shadow-md shrink-0 whitespace-nowrap ${
                      isActive
                        ? "bg-red-600 border-red-600 text-white shadow-red-200 shadow-sm"
                        : "bg-white border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-600"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Seletor de Ordenação (Customizado) */}
            <div className="relative w-full sm:w-auto">
              <div 
                onClick={() => setDropdownAberto(!dropdownAberto)}
                className="flex items-center justify-between sm:justify-start gap-3 bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm hover:border-red-300 transition-colors cursor-pointer select-none"
              >
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={18} className="text-red-500" />
                  <span className="text-xs sm:text-sm font-medium text-gray-600 whitespace-nowrap">
                    Ordenar por: <span className="text-gray-900 ml-1 font-semibold">{opcoesOrdenacao[ordenacao]}</span>
                  </span>
                </div>
                <svg className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${dropdownAberto ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>

              {/* Menu Dropdown */}
              {dropdownAberto && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setDropdownAberto(false)}></div>
                  <div className="absolute left-0 sm:left-auto right-0 mt-2 w-full sm:w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    {(Object.keys(opcoesOrdenacao) as Ordenacao[]).map((chave) => (
                      <button
                        key={chave}
                        onClick={() => {
                          setOrdenacao(chave);
                          setDropdownAberto(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-xs sm:text-sm font-medium transition-colors ${
                          ordenacao === chave
                            ? "bg-red-50 text-red-700"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {opcoesOrdenacao[chave]}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Resultados */}
      <section className="container mx-auto px-4 sm:px-6 max-w-6xl pb-16 pt-2">
        
        {tipoBusca === "medicamentos" ? (
          <>
            {isLoading ? (
              <div className="text-center py-12 text-gray-500">Buscando medicamentos...</div>
            ) : (
              <>
                <p className="text-sm text-gray-500 mb-4">
                  {remedios.length}{" "}
                  {remedios.length === 1 ? "oferta encontrada" : "ofertas encontradas"}
                </p>

                {remedios.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-md p-12 text-center">
                    <Pill size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-lg font-semibold text-gray-700 mb-2">
                      Nenhum medicamento encontrado
                    </p>
                    <p className="text-sm text-gray-500 mb-4">Tente buscar por outro nome.</p>
                    <Button
                      onClick={() => {
                        setTermo("");
                        setTermoSubmit("");
                      }}
                      style={{ backgroundColor: "#D32F2F" }}
                      className="text-white"
                    >
                      Limpar busca
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {remedios.map((med) => (
                      <Link key={med.id} href={`/produto/${med.medicine_id}?farmacia=${med.pharmacy_id || ""}`}>
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer p-5 hover:scale-[1.03] h-full flex flex-col group">
                          <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-red-100 transition-colors">
                            <Pill size={24} className="text-red-500" weight="fill" />
                          </div>
                          <h3 className="text-base font-semibold text-gray-800 flex-1">
                            {med.name}
                          </h3>
                          {med.active_ingredient && (
                            <p className="text-xs text-gray-400 mt-1">{med.active_ingredient}</p>
                          )}
                          
                          <div className="flex items-center gap-1.5 mt-3 bg-red-50 rounded-full px-3 py-1.5 w-fit">
                            <Storefront size={14} className="text-[#D32F2F]" />
                            <span className="text-xs font-semibold text-[#D32F2F] truncate max-w-[150px]">
                              {med.pharmacy_name}
                            </span>
                          </div>

                          <div className="mt-3 pt-3 border-t border-gray-50">
                            {med.price !== null ? (
                              <>
                                <span className="text-xs text-gray-400 block">preço</span>
                                <p className="text-[#D32F2F] font-bold text-xl">
                                  R$ {med.price.toFixed(2)}
                                </p>
                              </>
                            ) : (
                              <span className="text-xs text-gray-400">Consulte preço</span>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <>
            {isLoading ? (
              <div className="text-center py-12 text-gray-500">Buscando farmácias...</div>
            ) : (
              <>
                <p className="text-sm text-gray-500 mb-4">
                  {farmacias.length} farmácias encontradas
                </p>
                
                {farmacias.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-md p-12 text-center">
                    <Storefront size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-lg font-semibold text-gray-700 mb-2">
                      Nenhuma farmácia encontrada
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {farmacias.map((farmacia) => (
                      <Link key={farmacia.id} href={`/farmacia/${farmacia.id}`} className="block">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:scale-[1.02] transition-all flex flex-col items-start h-full group">
                          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-600 mb-4 group-hover:bg-red-100 transition-colors">
                            <Storefront size={24} weight="fill" />
                          </div>
                          <h3 className="font-bold text-xl text-gray-800 mb-2">{farmacia.name}</h3>
                          <p className="text-gray-500 text-sm mb-4 line-clamp-2">{farmacia.address}</p>
                          <span className="mt-auto text-red-600 font-semibold text-sm flex items-center gap-1">
                            Ver página da farmácia 
                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </section>
      <Footer />
    </main>
  );
}

export default function BuscaPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-500">Carregando...</div>}>
      <BuscaContent />
    </Suspense>
  );
}
