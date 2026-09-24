"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/app/_components/header";
import { Footer } from "@/app/_components/footer";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export default function CarrinhoPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function fetchCart() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("cart_items")
        .select(`
          id,
          quantity,
          pharmacies ( id, name ),
          medicines ( id, name, image_url ),
          pharmacy_medicines!inner ( price )
        `)
        .eq("user_id", user.id)
        .eq("pharmacy_medicines.pharmacy_id", "cart_items.pharmacy_id")
        .eq("pharmacy_medicines.medicine_id", "cart_items.medicine_id");

      // Nota: o join acima precisará ser ajustado na query se der erro,
      // pois supabase não faz join condicional complexo na mesma string facilmente,
      // mas vamos tentar com dados separados para facilitar.

      // Busca simples:
      const { data: cartData } = await supabase
        .from("cart_items")
        .select(`
          id,
          quantity,
          pharmacy_id,
          medicine_id,
          pharmacies ( name ),
          medicines ( name, image_url )
        `)
        .eq("user_id", user.id);

      if (cartData) {
        // Para cada item, busca o preço na pharmacy_medicines
        const itemsWithPrice = await Promise.all(cartData.map(async (item: any) => {
          const { data: pmData } = await supabase
            .from("pharmacy_medicines")
            .select("price")
            .eq("pharmacy_id", item.pharmacy_id)
            .eq("medicine_id", item.medicine_id)
            .single();

          return {
            ...item,
            price: pmData?.price || 0
          };
        }));
        setItems(itemsWithPrice);
      }
      setLoading(false);
    }
    fetchCart();
  }, []);

  const handleRemove = async (id: string) => {
    await supabase.from("cart_items").delete().eq("id", id);
    setItems(items.filter(item => item.id !== id));
    router.refresh(); // atualiza o header
  };

  // Agrupa os itens por farmácia
  const groupedItems = items.reduce((acc, item) => {
    const pId = item.pharmacy_id;
    if (!acc[pId]) {
      acc[pId] = {
        pharmacyName: item.pharmacies?.name || "Farmácia",
        items: [],
        total: 0
      };
    }
    acc[pId].items.push(item);
    acc[pId].total += (item.price * item.quantity);
    return acc;
  }, {} as Record<string, { pharmacyName: string; items: any[]; total: number }>);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#F8F9FA] py-6 sm:py-12 px-3 sm:px-6 md:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-5 sm:mb-8">Meu Carrinho</h1>

          {loading ? (
            <p className="text-center text-gray-500 py-12">Carregando carrinho...</p>
          ) : !user ? (
            <div className="text-center bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-gray-600 mb-4 text-sm sm:text-base">Você precisa estar logado para ver o carrinho.</p>
              <Link href="/login">
                <Button className="bg-[#D32F2F] hover:bg-[#b71c1c] text-white">Fazer Login</Button>
              </Link>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-gray-600 mb-4 text-sm sm:text-base">Seu carrinho está vazio.</p>
              <Link href="/">
                <Button className="bg-[#D32F2F] hover:bg-[#b71c1c] text-white">Continuar Comprando</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedItems).map(([pharmacyId, group]: [string, any]) => (
                <div key={pharmacyId} className="bg-white rounded-xl shadow overflow-hidden">
                  <div className="bg-gray-50 px-6 py-4 border-b flex items-center gap-2">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D32F2F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 9h18v2H3z"/>
                      <path d="M4 11v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                      <path d="M3 9l2-4h14l2 4"/>
                    </svg>
                    <h2 className="text-xl font-bold text-gray-800">{group.pharmacyName}</h2>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {group.items.map((item: any) => (
                      <div key={item.id} className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                        <div className="flex items-center gap-4 w-full sm:w-auto flex-1">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 relative shrink-0 bg-gray-50 rounded-xl p-2">
                            <Image
                              src={item.medicines?.image_url || "/Paracetamol.png"}
                              alt={item.medicines?.name}
                              fill
                              className="object-contain"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-800 text-sm sm:text-base">{item.medicines?.name}</h3>
                            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Quantidade: {item.quantity}</p>
                            <p className="font-bold text-[#D32F2F] mt-1 text-base sm:text-lg">
                              R$ {Number(item.price).toFixed(2).replace('.', ',')}
                            </p>
                          </div>
                        </div>
                        <div className="w-full sm:w-auto flex justify-end pt-2 sm:pt-0 border-t sm:border-0 border-gray-50">
                          <button
                            onClick={() => handleRemove(item.id)}
                            className="text-red-500 hover:text-red-700 text-xs sm:text-sm font-semibold hover:underline"
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-gray-50 px-4 sm:px-6 py-4 border-t flex justify-between items-center">
                    <p className="text-sm sm:text-base text-gray-600">Subtotal da farmácia:</p>
                    <p className="text-lg sm:text-xl font-bold text-[#D32F2F]">
                      R$ {group.total.toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                </div>
              ))}

              <div className="flex justify-end pt-4 sm:pt-6">
                <Button className="w-full sm:w-auto bg-[#D32F2F] hover:bg-[#C62828] text-white py-4 sm:py-6 px-8 sm:px-10 text-base sm:text-lg rounded-xl shadow-lg shadow-red-200">
                  Finalizar Compra
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
