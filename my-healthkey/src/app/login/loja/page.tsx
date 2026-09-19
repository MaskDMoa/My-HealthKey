"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { Storefront, ArrowLeft } from "@phosphor-icons/react";

export default function LoginLojaPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password) {
      setError("Preencha todos os campos");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Email ou senha incorretos");
      setLoading(false);
      return;
    }

    // Verifica se realmente tem uma farmácia associada
    if (data?.user) {
      const { data: pharmacy } = await supabase
        .from("pharmacies")
        .select("id")
        .eq("owner_id", data.user.id)
        .single();
      
      if (!pharmacy) {
        // Logou, mas não é dono de farmácia. Desloga ou manda pro fluxo de cliente
        setError("Esta conta não possui uma farmácia cadastrada.");
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }
    }
    
    // Sucesso, manda pro dashboard
    router.push("/dashboard/estoque");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-[#C62828] skew-y-3 origin-top-left -z-10 shadow-lg"></div>

      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-2xl z-10 border border-gray-100 animate-in fade-in zoom-in duration-500">
        
        {/* Voltar */}
        <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-red-600 transition-colors text-sm font-medium">
          <ArrowLeft size={16} /> Voltar ao Início
        </Link>

        {/* LOGO E TEXTO */}
        <div className="text-center mt-6">
          <div className="mx-auto bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mb-4 border-2 border-red-100">
            <Storefront size={32} weight="fill" className="text-red-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Portal do Parceiro</h2>
          <p className="text-gray-500 mt-2 font-medium">Gerencie seu estoque e impulsione suas vendas</p>
        </div>

        {/* FORMULÁRIO */}
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium flex items-center gap-2">
              <span className="shrink-0">⚠️</span> {error}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                E-mail Corporativo
              </label>
              <Input
                type="email"
                placeholder="contato@suafarmacia.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 px-4 bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-red-500 transition-all rounded-xl"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Senha de Acesso
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 px-4 bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-red-500 transition-all rounded-xl"
              />
            </div>
          </div>

          <div className="flex items-center justify-end">
            <Link
              href="/recuperar-senha"
              className="text-sm font-semibold text-red-600 hover:text-red-800 transition-colors"
            >
              Esqueceu a senha?
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-xl shadow-lg shadow-red-200 transition-all hover:scale-[1.02]"
            disabled={loading}
          >
            {loading ? "Autenticando..." : "Entrar no Painel"}
          </Button>

          <div className="pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-600">
              Sua farmácia ainda não é parceira?{" "}
              <Link href="/cadastro/loja" className="text-red-600 font-bold hover:underline">
                Cadastre-se agora
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
