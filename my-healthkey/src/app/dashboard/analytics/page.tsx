import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SearchAnalytics } from "./_components/SearchAnalytics";

export default async function AnalyticsPage() {
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

  // Busca os últimos 1000 logs para processamento
  const { data: logs, error } = await supabase
    .from("search_logs")
    .select("term, created_at")
    .order("created_at", { ascending: false })
    .limit(1000);

  if (error) {
    console.error("Erro ao buscar logs", error);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Estatísticas de Busca</h2>
          <p className="text-sm text-gray-500">Veja o que os clientes mais procuram na sua região.</p>
        </div>
      </div>

      <SearchAnalytics initialLogs={logs || []} />
    </div>
  );
}
