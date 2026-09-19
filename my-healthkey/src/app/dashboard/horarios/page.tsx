import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { HorariosManager } from "./_components/HorariosManager";

export default async function HorariosPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: pharmacy } = await supabase
    .from("pharmacies")
    .select("id, opening_hours")
    .eq("owner_id", user.id)
    .single();

  if (!pharmacy) {
    redirect("/");
  }

  const defaultHours = {
    segunda: { abre: "08:00", fecha: "18:00", fechado: false },
    terca: { abre: "08:00", fecha: "18:00", fechado: false },
    quarta: { abre: "08:00", fecha: "18:00", fechado: false },
    quinta: { abre: "08:00", fecha: "18:00", fechado: false },
    sexta: { abre: "08:00", fecha: "18:00", fechado: false },
    sabado: { abre: "08:00", fecha: "13:00", fechado: false },
    domingo: { abre: "", fecha: "", fechado: true },
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Horários de Funcionamento</h2>
      </div>

      <HorariosManager
        pharmacyId={pharmacy.id}
        initialHours={pharmacy.opening_hours || defaultHours}
      />
    </div>
  );
}
