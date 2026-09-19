import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "./_components/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Verifica se o usuário é dono de alguma farmácia
  const { data: pharmacy } = await supabase
    .from("pharmacies")
    .select("id, name")
    .eq("owner_id", user.id)
    .single();

  if (!pharmacy) {
    // Se não tiver farmácia, não pode acessar o dashboard
    redirect("/"); // ou redirecionar para uma página de "acesso negado"
  }

  return (
    <div className="flex h-screen bg-[#F8F9FA] overflow-hidden selection:bg-red-100 selection:text-red-900">
      <Sidebar pharmacyId={pharmacy.id} />
      <main className="flex-1 overflow-y-auto flex flex-col relative">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center px-8 sticky top-0 z-10">
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              Olá, {pharmacy.name}
            </h1>
            <p className="text-sm text-gray-500">
              Gerencie seu estoque e visualize suas estatísticas
            </p>
          </div>
        </header>
        <div className="p-8 flex-1 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
