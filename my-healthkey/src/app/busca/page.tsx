"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MagnifyingGlass, SlidersHorizontal, Pill, Storefront, XCircle } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";

type Ordenacao = "relevancia" | "menor-preco" | "maior-preco" | "nome";
type TipoBusca = "medicamentos" | "farmacias";

interface MedicineResult {
  id: string;
  name: string;
  active_ingredient: string;
  minPrice: number | null;
}

function BuscaContent() {
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [tipoBusca, setTipoBusca] = useState<TipoBusca>("medicamentos");
  const [termo, setTermo] = useState(searchParams.get("q") ?? "");
  const [termoSubmit, setTermoSubmit] = useState(searchParams.get("q") ?? "");
  
  const [ordenacao, setOrdenacao] = useState<Ordenacao>("relevancia");

  const [remedios, setRemedios] = useState<MedicineResult[]>([]);
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
        // Fallback
        setTagsDinamicas(["Todos", "Paracetamol", "Dipirona", "Ibuprofeno"]);
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

        // Buscar medicamentos do banco
        let query = supabase
          .from("medicines")
          .select("id, name, active_ingredient");
        
        if (termoSubmit) {
          query = query.ilike("name", `%${termoSubmit}%`);
        }

        const { data: medicinesData } = await query.limit(50);

        if (medicinesData && medicinesData.length > 0) {
          // Para cada medicamento, buscar o menor preço disponível
          const medIds = medicinesData.map(m => m.id);
          const { data: pricesData } = await supabase
            .from("pharmacy_medicines")
            .select("medicine_id, price")
            .in("medicine_id", medIds)
            .eq("is_available", true);

          // Calcular menor preço por medicamento
          const minPriceMap: Record<string, number> = {};
          (pricesData || []).forEach((p: any) => {
            if (!minPriceMap[p.medicine_id] || p.price < minPriceMap[p.medicine_id]) {
              minPriceMap[p.medicine_id] = p.price;
            }
          });

          let results: MedicineResult[] = medicinesData.map((m: any) => ({
            id: m.id,
            name: m.name,
            active_ingredient: m.active_ingredient || "",
            minPrice: minPriceMap[m.id] ?? null,
          }));

          // Ordenar
          switch (ordenacao) {
            case "menor-preco":
              results.sort((a, b) => (a.minPrice ?? 999999) - (b.minPrice ?? 999999));
              break;
            case "maior-preco":
              results.sort((a, b) => (b.minPrice ?? 0) - (a.minPrice ?? 0));
              break;
            case "nome":
              results.sort((a, b) => a.name.localeCompare(b.name));
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

  return (
    <main style={{ backgroundColor: "#F8F9FA" }} className="min-h-screen">
      {/* Navbar Minimalista */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 px-6 h-20 flex items-center shadow-sm">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <img src="/Logo.png" alt="Logo" className="h-12 w-auto" />
          <span className="text-[#D32F2F] font-bold text-xl tracking-tight hidden sm:block">My-HealthKey</span>
        </Link>
      </nav>

      {/* Cabeçalho da busca */}
      <section style={{ backgroundColor: "#C62828" }} className="text-white pb-6 relative shadow-inner">
        <div className="container mx-auto px-6 pt-10 pb-10 max-w-6xl">
          
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setTipoBusca("medicamentos")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all ${
                tipoBusca === "medicamentos" ? "bg-white text-red-700 shadow-md scale-105" : "bg-red-800/50 hover:bg-red-800 text-red-50"
              }`}
            >
              <Pill size={20} weight={tipoBusca === "medicamentos" ? "fill" : "regular"} />
              Medicamentos
            </button>
            <button
              onClick={() => setTipoBusca("farmacias")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all ${
                tipoBusca === "farmacias" ? "bg-white text-red-700 shadow-md scale-105" : "bg-red-800/50 hover:bg-red-800 text-red-50"
              }`}
            >
              <Storefront size={20} weight={tipoBusca === "farmacias" ? "fill" : "regular"} />
              Farmácias
            </button>
          </div>

          <h1 className="text-3xl font-bold mb-6">
            {termoSubmit ? (
              <>Resultados para &quot;{termoSubmit}&quot;</>
            ) : (
              <>{tipoBusca === "medicamentos" ? "Encontre o menor preço" : "Encontre farmácias próximas"}</>
            )}
          </h1>

          <div className="flex items-center bg-white rounded-lg overflow-hidden shadow-lg max-w-2xl focus-within:ring-4 focus-within:ring-red-400/50 transition-all relative">
            <MagnifyingGlass size={22} className="text-gray-400 ml-4" />
            <Input
              type="text"
              value={termo}
              onChange={(e) => setTermo(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={tipoBusca === "medicamentos" ? "Ex: Paracetamol, Dipirona..." : "Ex: Drogaria, Ultra Popular..."}
              className="border-0 shadow-none focus-visible:ring-0 text-gray-800 h-14 text-lg pr-12"
            />
            {termo && (
              <button
                onClick={() => {
                  setTermo("");
                  setTermoSubmit("");
                }}
                className="absolute right-24 text-gray-400 hover:text-red-500 transition-colors"
                title="Limpar busca"
              >
                <XCircle size={24} weight="fill" />
              </button>
            )}
            <button 
              onClick={() => setTermoSubmit(termo)}
              className="bg-red-700 hover:bg-red-800 text-white px-6 h-14 font-semibold transition-colors"
            >
              Buscar
            </button>
          </div>
        </div>
      </section>

      {/* Filtros (apenas para medicamentos) */}
      {tipoBusca === "medicamentos" && (
        <section className="container mx-auto px-6 max-w-6xl py-6 animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            
            {/* Tags de Categoria (Agem como filtros de busca rápida) */}
            <div className="flex items-center gap-2 flex-wrap flex-1">
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
                    className={`text-sm px-5 py-2 rounded-full border font-medium transition-all duration-200 hover:shadow-md ${
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
            <div className="relative">
              <div 
                onClick={() => setDropdownAberto(!dropdownAberto)}
                className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm hover:border-red-300 transition-colors cursor-pointer select-none"
              >
                <SlidersHorizontal size={20} className="text-red-500" />
                <span className="text-sm font-medium text-gray-600 whitespace-nowrap">
                  Ordenar por: <span className="text-gray-900 ml-1">{opcoesOrdenacao[ordenacao]}</span>
                </span>
                <svg className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${dropdownAberto ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>

              {/* Menu Dropdown */}
              {dropdownAberto && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setDropdownAberto(false)}></div>
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    {(Object.keys(opcoesOrdenacao) as Ordenacao[]).map((chave) => (
                      <button
                        key={chave}
                        onClick={() => {
                          setOrdenacao(chave);
                          setDropdownAberto(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
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
      <section className="container mx-auto px-6 max-w-6xl pb-16 pt-2">
        
        {tipoBusca === "medicamentos" ? (
          <>
            {isLoading ? (
              <div className="text-center py-12 text-gray-500">Buscando medicamentos...</div>
            ) : (
              <>
                <p className="text-sm text-gray-500 mb-4">
                  {remedios.length}{" "}
                  {remedios.length === 1 ? "medicamento encontrado" : "medicamentos encontrados"}
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
                      <Link key={med.id} href={`/produto/${med.id}`}>
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
                          <div className="mt-3 pt-3 border-t border-gray-50">
                            {med.minPrice !== null ? (
                              <>
                                <span className="text-xs text-gray-400 block">a partir de</span>
                                <p className="text-[#D32F2F] font-bold text-xl">
                                  R$ {med.minPrice.toFixed(2)}
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
