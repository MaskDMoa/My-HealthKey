"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { Storefront, ArrowLeft, ArrowRight } from "@phosphor-icons/react";

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
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 relative overflow-hidden text-zinc-100">
      
      {/* Background Animated Blobs (Dark/Premium Vibe) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] rounded-full bg-red-900/30 blur-[120px] animate-[pulse_10s_ease-in-out_infinite]"></div>
        <div className="absolute top-[30%] -left-[10%] w-[500px] h-[500px] rounded-full bg-rose-900/20 blur-[100px] animate-[pulse_12s_ease-in-out_infinite_reverse]"></div>
        <div className="absolute -bottom-[10%] right-[20%] w-[700px] h-[700px] rounded-full bg-zinc-800/40 blur-[150px] animate-[pulse_15s_ease-in-out_infinite]"></div>
      </div>

      <div className="w-full max-w-[460px] px-6 relative z-10 animate-in fade-in zoom-in-95 duration-700">
        
        {/* Voltar */}
        <Link href="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-semibold mb-6 group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
          Voltar ao Início
        </Link>

        {/* LOGO E TEXTO */}
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(220,38,38,0.3)] border border-red-500/30 transform rotate-3 hover:rotate-0 transition-transform duration-500">
            <Storefront size={40} weight="fill" className="text-white drop-shadow-md" />
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight text-white mb-2">
            Portal do Parceiro
          </h2>
          <p className="text-zinc-400 font-medium">
            Gerencie seu estoque e impulsione suas vendas
          </p>
        </div>

        {/* Glassmorphism Card (Dark Mode) */}
        <div className="bg-zinc-900/50 backdrop-blur-2xl p-8 sm:p-10 rounded-[2rem] shadow-[0_8px_40px_rgba(0,0,0,0.5)] border border-zinc-700/50 relative overflow-hidden group">
          
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none rounded-[2rem]"></div>

          <form className="space-y-6 relative z-10" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-950/50 backdrop-blur-md border border-red-900 text-red-400 p-4 rounded-2xl text-sm font-semibold flex items-center gap-3 animate-in slide-in-from-top-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                {error}
              </div>
            )}

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-zinc-300 tracking-wide">
                  E-mail Corporativo
                </label>
                <div className="relative">
                  <Input
                    type="email"
                    placeholder="contato@suafarmacia.com.br"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-12 bg-zinc-950/50 border-zinc-800 focus:bg-zinc-900 focus:ring-2 focus:ring-red-900 focus:border-red-700 rounded-xl transition-all pl-4 text-white placeholder:text-zinc-600"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-zinc-300 tracking-wide">
                  Senha de Acesso
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 bg-zinc-950/50 border-zinc-800 focus:bg-zinc-900 focus:ring-2 focus:ring-red-900 focus:border-red-700 rounded-xl transition-all pl-4 text-white tracking-widest placeholder:tracking-normal placeholder:text-zinc-600"
                />
              </div>
            </div>

            <div className="flex items-center justify-end pt-2">
              <Link
                href="/recuperar-senha"
                className="text-sm font-bold text-red-500 hover:text-red-400 transition-colors"
              >
                Esqueceu a senha?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full h-14 bg-white hover:bg-zinc-200 text-zinc-900 rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all duration-300 group/btn overflow-hidden relative"
              disabled={loading}
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-zinc-400/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 ease-in-out"></div>
              <span className="flex items-center justify-center gap-2 relative z-10">
                {loading ? (
                  "Autenticando..."
                ) : (
                  <>
                    Entrar no Painel <ArrowRight size={20} weight="bold" className="group-hover/btn:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </Button>
          </form>
        </div>

        {/* Footer Link */}
        <div className="text-center text-sm text-zinc-500 mt-8 font-medium">
          Sua farmácia ainda não é parceira?{" "}
          <Link href="/cadastro/loja" className="text-red-500 font-bold hover:text-red-400 transition-colors hover:underline underline-offset-4">
            Cadastre-se agora
          </Link>
        </div>
      </div>
    </div>
  );
}
