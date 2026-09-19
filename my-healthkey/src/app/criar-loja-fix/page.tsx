"use client";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function CriarLojaFix() {
  const [status, setStatus] = useState("Verificando sessão...");
  const router = useRouter();

  useEffect(() => {
    async function fix() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setStatus("Você precisa fazer login primeiro! Acesse /login e depois volte aqui.");
        return;
      }

      setStatus(`Usuário logado: ${user.email}. Criando loja para você...`);

      const { error } = await supabase.from("pharmacies").insert({
        id: crypto.randomUUID(),
        name: 'Farmácia de Teste Resolvida',
        trade_name: 'Farmácia de Teste Resolvida',
        cnpj: '99999999999999',
        phone: '11999999999',
        address: 'Rua do Teste Final, 100',
        latitude: -22.2158,
        longitude: -45.7028,
        owner_id: user.id
      });

      if (error) {
        if (error.code === '23505') {
            setStatus("Sua loja já foi criada! Redirecionando para o dashboard...");
            setTimeout(() => router.push("/dashboard"), 2000);
        } else {
            setStatus(`Erro ao criar loja: ${error.message}`);
        }
      } else {
        setStatus("Loja criada com sucesso! Redirecionando para o dashboard...");
        setTimeout(() => router.push("/dashboard"), 2000);
      }
    }
    fix();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="p-10 bg-white rounded-xl shadow-lg max-w-lg text-center">
            <h1 className="text-2xl font-bold mb-4 text-red-600">Resolvendo...</h1>
            <p className="text-lg text-gray-700">{status}</p>
        </div>
    </div>
  );
}
