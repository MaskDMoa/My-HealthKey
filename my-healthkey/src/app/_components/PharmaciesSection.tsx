"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { PharmacyCarousel } from "./PharmacyCarousel";

export function PharmaciesSection() {
  const [pharmacies, setPharmacies] = useState<any[]>([]);

  useEffect(() => {
    async function fetchPharmacies() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("pharmacies")
        .select("id, name");
      
      if (error) {
        console.error(error);
        return;
      }

      setPharmacies(data || []);
    }
    fetchPharmacies();
  }, []);

  return (
    <div className="pb-10">
      {pharmacies.map((pharmacy) => (
        <PharmacyCarousel 
          key={pharmacy.id} 
          pharmacyId={pharmacy.id} 
          pharmacyName={pharmacy.name} 
        />
      ))}
    </div>
  );
}
