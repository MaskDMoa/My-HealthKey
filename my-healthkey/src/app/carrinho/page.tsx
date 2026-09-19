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
      <div className="min-h-screen bg-[#F8F9FA] py-12 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Meu Carrinho</h1>

          {loading ? (
            <p className="text-center text-gray-500">Carregando carrinho...</p>
          ) : !user ? (
            <div className="text-center bg-white p-8 rounded-xl shadow">
              <p className="text-gray-600 mb-4">Você precisa estar logado para ver o carrinho.</p>
              <Link href="/login">
                <Button className="bg-[#D32F2F] text-white">Fazer Login</Button>
              </Link>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center bg-white p-8 rounded-xl shadow">
              <p className="text-gray-600 mb-4">Seu carrinho está vazio.</p>
              <Link href="/">
                <Button className="bg-[#D32F2F] text-white">Continuar Comprando</Button>
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
                  <div className="divide-y">
                    {group.items.map((item: any) => (
                      <div key={item.id} className="p-6 flex items-center gap-6">
                        <div className="w-20 h-20 relative shrink-0">
                          <Image
                            src={item.medicines?.image_url || "/Paracetamol.png"}
                            alt={item.medicines?.name}
                            fill
                            className="object-contain"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-800">{item.medicines?.name}</h3>
                          <p className="text-sm text-gray-500">Quantidade: {item.quantity}</p>
                          <p className="font-bold text-[#D32F2F] mt-1">R$ {Number(item.price).toFixed(2)}</p>
                        </div>
                        <div>
                          <button
                            onClick={() => handleRemove(item.id)}
                            className="text-red-500 text-sm hover:underline"
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-gray-50 px-6 py-4 border-t flex justify-between items-center">
                    <p className="text-gray-600">Subtotal da farmácia:</p>
                    <p className="text-xl font-bold text-[#D32F2F]">R$ {group.total.toFixed(2)}</p>
                  </div>
                </div>
              ))}

              <div className="flex justify-end pt-6">
                <Button className="bg-[#D32F2F] hover:bg-[#C62828] text-white py-6 px-10 text-lg">
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
