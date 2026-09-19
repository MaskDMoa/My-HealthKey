import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { EstoqueManager } from "./_components/EstoqueManager";

export default async function EstoquePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: pharmacy } = await supabase
    .from("pharmacies")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (!pharmacy) {
    redirect("/");
  }

  // Busca o estoque atual da farmácia
  const { data: stock, error } = await supabase
    .from("pharmacy_medicines")
    .select(`
      id,
      price,
      is_available,
      medicines (
        id,
        name,
        active_ingredient
      )
    `)
    .eq("pharmacy_id", pharmacy.id);

  if (error) {
    console.error("Erro ao buscar estoque", error);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Gerenciar Estoque</h2>
      </div>

      <EstoqueManager initialStock={stock || []} pharmacyId={pharmacy.id} />
    </div>
  );
}
