"use client";

import { useState } from "react";
import { Plus, PencilSimple, Trash, X, MagnifyingGlass, CheckCircle, WarningCircle } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";

// Tipos para o estoque
type MedicineInfo = {
  id: string;
  name: string;
  active_ingredient: string;
};

type StockItem = {
  id: string; // uuid da relação
  price: number;
  is_available: boolean;
  medicines: MedicineInfo | MedicineInfo[]; // Pode vir como array dependendo do supabase, mas geralmente objeto
};

export function EstoqueManager({ initialStock, pharmacyId }: { initialStock: any[]; pharmacyId: string }) {
  const [stock, setStock] = useState<StockItem[]>(initialStock);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<MedicineInfo[]>([]);
  const [selectedMedicine, setSelectedMedicine] = useState<MedicineInfo | null>(null);
  
  const [price, setPrice] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  
  // Para criar novo remédio
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newIngredient, setNewIngredient] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");

  const supabase = createClient();

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    if (term.length < 3) {
      setSearchResults([]);
      return;
    }
    const { data } = await supabase
      .from("medicines")
      .select("*")
      .ilike("name", `%${term}%`)
      .limit(5);
    
    setSearchResults(data || []);
  };

  const handleAddStock = async () => {
    if (!price) return alert("Preço é obrigatório");
    if (parseFloat(price) <= 0) return alert("O preço deve ser maior que zero");
    
    let medId = selectedMedicine?.id;

    if (isCreatingNew) {
      if (!newName) return alert("Nome do remédio é obrigatório");
      const newMedId = crypto.randomUUID(); // Gerar um ID aleatório simples
      const { error: medError } = await supabase.from("medicines").insert({
        id: newMedId,
        name: newName,
        active_ingredient: newIngredient,
        image_url: newImageUrl || "/Paracetamol.png" // Fallback seguro
      });

      if (medError) return alert("Erro ao criar medicamento");
      medId = newMedId;
    }

    if (!medId) return alert("Selecione ou crie um medicamento");

    const { data, error } = await supabase.from("pharmacy_medicines").insert({
      pharmacy_id: pharmacyId,
      medicine_id: medId,
      price: parseFloat(price),
      is_available: isAvailable,
    }).select(`
      id, price, is_available, medicines (id, name, active_ingredient)
    `).single();

    if (error) {
      if (error.code === '23505') {
         alert("Este medicamento já está no seu estoque.");
      } else {
         alert("Erro ao adicionar ao estoque");
      }
      return;
    }

    if (data) {
      setStock([...stock, data as any]);
      setIsModalOpen(false);
      resetForm();
    }
  };

  const handleRemoveStock = async (id: string) => {
    if (confirm("Tem certeza que deseja remover este item?")) {
      await supabase.from("pharmacy_medicines").delete().eq("id", id);
      setStock(stock.filter((s) => s.id !== id));
    }
  };

  const handleToggleAvailability = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase.from("pharmacy_medicines").update({
      is_available: !currentStatus
    }).eq("id", id);

    if (!error) {
      setStock(stock.map(s => s.id === id ? { ...s, is_available: !currentStatus } : s));
    }
  };

  const resetForm = () => {
    setSearchTerm("");
    setSearchResults([]);
    setSelectedMedicine(null);
    setPrice("");
    setIsAvailable(true);
    setIsCreatingNew(false);
    setNewName("");
    setNewIngredient("");
    setNewImageUrl("");
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 sm:p-6 flex justify-between items-center border-b border-gray-50">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-800">Seus Medicamentos</h3>
          <p className="text-xs text-gray-400">{stock.length} medicamentos cadastrados</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-red-600 hover:bg-red-700 text-white px-3.5 sm:px-4 py-2 rounded-xl flex items-center gap-1.5 sm:gap-2 transition-colors duration-300 font-medium text-xs sm:text-sm shadow-md shadow-red-200"
        >
          <Plus size={18} weight="bold" />
          Adicionar
        </button>
      </div>

      {/* Visão Mobile (Cards) */}
      <div className="block md:hidden divide-y divide-gray-100">
        {stock.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            Nenhum medicamento no estoque. Adicione o seu primeiro!
          </div>
        ) : (
          stock.map((item) => {
            const med = Array.isArray(item.medicines) ? item.medicines[0] : item.medicines;
            return (
              <div key={item.id} className="p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">{med?.name}</h4>
                    <p className="text-xs text-gray-500">{med?.active_ingredient || "Sem princípio ativo"}</p>
                  </div>
                  <span className="font-bold text-red-600 text-base">
                    R$ {item.price.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <button 
                    onClick={() => handleToggleAvailability(item.id, item.is_available)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                    item.is_available ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                  }`}>
                    {item.is_available ? (
                      <><CheckCircle size={13} weight="fill" /> Disponível</>
                    ) : (
                      <><WarningCircle size={13} weight="fill" /> Indisponível</>
                    )}
                  </button>
                  <button
                    onClick={() => handleRemoveStock(item.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remover"
                  >
                    <Trash size={18} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Visão Desktop (Tabela) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
              <th className="p-4 font-medium">Medicamento</th>
              <th className="p-4 font-medium">Princípio Ativo</th>
              <th className="p-4 font-medium">Preço (R$)</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {stock.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-400">
                  Nenhum medicamento no estoque. Adicione o seu primeiro!
                </td>
              </tr>
            ) : (
              stock.map((item) => {
                const med = Array.isArray(item.medicines) ? item.medicines[0] : item.medicines;
                return (
                  <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 font-medium text-gray-800">{med?.name}</td>
                    <td className="p-4 text-gray-500">{med?.active_ingredient || "-"}</td>
                    <td className="p-4 font-bold text-red-600">R$ {item.price.toFixed(2).replace('.', ',')}</td>
                    <td className="p-4">
                      <button 
                        onClick={() => handleToggleAvailability(item.id, item.is_available)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                        item.is_available ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}>
                        {item.is_available ? (
                          <><CheckCircle size={14} weight="fill" /> Disponível</>
                        ) : (
                          <><WarningCircle size={14} weight="fill" /> Indisponível</>
                        )}
                      </button>
                    </td>
                    <td className="p-4 flex gap-2 justify-end">
                      <button
                        onClick={() => handleRemoveStock(item.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remover"
                      >
                        <Trash size={20} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-3 sm:p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-5 sm:p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">Adicionar ao Estoque</h2>
              <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="text-gray-400 hover:text-gray-600">
                <X size={22} />
              </button>
            </div>
            
            <div className="p-4 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {!isCreatingNew ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Buscar Remédio Existente</label>
                  <div className="relative">
                    <MagnifyingGlass size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      placeholder="Ex: Paracetamol..."
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all text-gray-800"
                    />
                  </div>
                  
                  {searchResults.length > 0 && !selectedMedicine && (
                    <ul className="mt-2 border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                      {searchResults.map(res => (
                        <li 
                          key={res.id} 
                          onClick={() => { setSelectedMedicine(res); setSearchResults([]); }}
                          className="px-4 py-3 hover:bg-red-50 cursor-pointer border-b border-gray-50 last:border-0 text-gray-700 flex justify-between items-center group"
                        >
                          <span className="font-medium">{res.name}</span>
                          <span className="text-xs text-gray-400 group-hover:text-red-500 transition-colors">Selecionar</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {selectedMedicine && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-100 rounded-xl flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-green-800">{selectedMedicine.name}</p>
                        <p className="text-sm text-green-600">{selectedMedicine.active_ingredient}</p>
                      </div>
                      <button onClick={() => setSelectedMedicine(null)} className="text-green-600 hover:text-green-800 text-sm font-medium">Trocar</button>
                    </div>
                  )}

                  <div className="mt-4 text-center">
                    <span className="text-sm text-gray-500">Não encontrou?</span>
                    <button 
                      onClick={() => setIsCreatingNew(true)}
                      className="ml-2 text-sm font-semibold text-red-600 hover:text-red-700"
                    >
                      Cadastrar Novo
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold text-gray-700">Novo Medicamento</h4>
                    <button onClick={() => setIsCreatingNew(false)} className="text-sm text-gray-500 hover:text-gray-700">Voltar à busca</button>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Medicamento</label>
                    <input 
                      type="text" 
                      value={newName} 
                      onChange={e => setNewName(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-gray-800"
                      placeholder="Nome oficial"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Princípio Ativo (Opcional)</label>
                    <input 
                      type="text" 
                      value={newIngredient} 
                      onChange={e => setNewIngredient(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-gray-800"
                      placeholder="Substância"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">URL da Foto (Opcional)</label>
                    <input 
                      type="text" 
                      value={newImageUrl} 
                      onChange={e => setNewImageUrl(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-gray-800"
                      placeholder="https://exemplo.com/foto.png"
                    />
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-gray-100 flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    min="0"
                    value={price}
                    onChange={e => {
                      const val = e.target.value;
                      if (val === '' || parseFloat(val) >= 0) setPrice(val);
                    }}
                    onKeyDown={e => {
                      if (e.key === '-' || e.key === 'e') e.preventDefault();
                    }}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-gray-800"
                    placeholder="0.00"
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer pb-3">
                    <input 
                      type="checkbox" 
                      checked={isAvailable}
                      onChange={e => setIsAvailable(e.target.checked)}
                      className="w-5 h-5 rounded text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Disponível</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6 border-t border-gray-100 bg-gray-50/50 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
              <button 
                onClick={() => { setIsModalOpen(false); resetForm(); }}
                className="w-full sm:w-auto px-6 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors text-center"
              >
                Cancelar
              </button>
              <button 
                onClick={handleAddStock}
                className="w-full sm:w-auto px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl shadow-md shadow-red-200 transition-colors text-center"
              >
                Salvar Estoque
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
