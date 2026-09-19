"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { ArrowRight } from "@phosphor-icons/react";

export default function RegistroPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegistro = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!name || !email || !password || !confirmPassword) {
      setError("Preencha todos os campos obrigatórios");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    
    // 1. Cadastra o usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError || !authData.user) {
      setError(authError?.message || "Erro ao criar conta");
      setLoading(false);
      return;
    }

    router.push("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 relative overflow-hidden py-12">
      
      {/* Background Animated Blobs */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] -left-[10%] w-[500px] h-[500px] rounded-full bg-red-400/20 blur-[120px] mix-blend-multiply animate-[pulse_8s_ease-in-out_infinite]"></div>
        <div className="absolute -bottom-[20%] right-[10%] w-[600px] h-[600px] rounded-full bg-orange-300/15 blur-[130px] mix-blend-multiply animate-[pulse_12s_ease-in-out_infinite_reverse]"></div>
      </div>

      <div className="w-full max-w-[480px] px-6 relative z-10 animate-in fade-in zoom-in-95 duration-700">
        
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block hover:scale-105 transition-transform duration-300">
            <img
              src="/Logo.png"
              alt="My-HealthKey"
              className="h-14 mx-auto mb-6 drop-shadow-md"
            />
          </Link>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Criar conta
          </h2>
          <p className="text-gray-500 mt-2 font-medium">
            Cadastre-se gratuitamente
          </p>
        </div>

        {/* Glassmorphism Card */}
        <div className="bg-white/70 backdrop-blur-2xl p-8 sm:p-10 rounded-[2rem] shadow-[0_8px_40px_rgba(0,0,0,0.08)] border border-white/50 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none rounded-[2rem]"></div>

          <form className="space-y-6 relative z-10" onSubmit={handleRegistro}>
            {error && (
              <div className="bg-red-50/80 backdrop-blur-md border border-red-100 text-red-600 p-4 rounded-2xl text-sm font-semibold flex items-center gap-2 animate-in slide-in-from-top-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-gray-700">Nome completo</label>
                <Input
                  type="text"
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-12 bg-white/50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-red-100 focus:border-red-400 rounded-xl transition-all pl-4 text-gray-800 placeholder:text-gray-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-gray-700">E-mail</label>
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 bg-white/50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-red-100 focus:border-red-400 rounded-xl transition-all pl-4 text-gray-800 placeholder:text-gray-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-gray-700">Senha</label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-12 bg-white/50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-red-100 focus:border-red-400 rounded-xl transition-all pl-4 text-gray-800 tracking-widest placeholder:tracking-normal placeholder:text-gray-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-gray-700">Confirmar senha</label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full h-12 bg-white/50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-red-100 focus:border-red-400 rounded-xl transition-all pl-4 text-gray-800 tracking-widest placeholder:tracking-normal placeholder:text-gray-400"
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-14 bg-gray-900 hover:bg-[#D32F2F] text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-red-500/25 transition-all duration-300 group/btn overflow-hidden relative mt-4"
              disabled={loading}
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 ease-in-out"></div>
              <span className="flex items-center justify-center gap-2 relative z-10">
                {loading ? "Aguarde..." : (
                  <>Cadastrar Conta <ArrowRight size={20} weight="bold" className="group-hover/btn:translate-x-1 transition-transform" /></>
                )}
              </span>
            </Button>

            <p className="text-center text-sm text-gray-500 font-medium">
              Já tem uma conta?{" "}
              <Link href="/login" className="text-red-600 font-bold hover:text-red-700 transition-colors hover:underline underline-offset-4">
                Faça login
              </Link>
            </p>

            <div className="mt-8 pt-6 border-t border-gray-200/50 text-center">
              <p className="text-sm text-gray-500 mb-2 font-medium">Você é proprietário de uma farmácia?</p>
              <Link href="/registro-farmacia" className="inline-flex items-center justify-center h-10 px-6 rounded-lg border-2 border-red-100 text-red-600 font-bold hover:bg-red-50 hover:border-red-200 transition-colors">
                Cadastre sua Loja aqui
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}