import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { FarmaciaDetail } from "./_components/FarmaciaDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function FarmaciaPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Busca dados da farmácia
  const { data: pharmacy, error } = await supabase
    .from("pharmacies")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !pharmacy) {
    notFound();
  }

  // Busca os medicamentos dessa farmácia
  const { data: stock } = await supabase
    .from("pharmacy_medicines")
    .select(`
      id,
      price,
      is_available,
      medicines (
        id,
        name,
        active_ingredient,
        description
      )
    `)
    .eq("pharmacy_id", id)
    .eq("is_available", true);

  // Busca os reviews dessa farmácia
  const { data: reviewsData } = await supabase
    .from("reviews")
    .select("*")
    .eq("pharmacy_id", id)
    .order("created_at", { ascending: false });

  return (
    <FarmaciaDetail pharmacy={pharmacy} stock={stock || []} initialReviews={reviewsData || []} />
  );
}
