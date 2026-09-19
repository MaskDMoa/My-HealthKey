"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { ArrowRight, UserCircle } from "@phosphor-icons/react";

export default function LoginPage() {
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
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError("E-mail ou senha incorretos.");
      return;
    }
    
    router.push("/");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 relative overflow-hidden">
      
      {/* Background Animated Blobs */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -right-[10%] w-[500px] h-[500px] rounded-full bg-red-400/20 blur-[120px] mix-blend-multiply animate-[pulse_8s_ease-in-out_infinite]"></div>
        <div className="absolute top-[20%] -left-[10%] w-[400px] h-[400px] rounded-full bg-rose-300/20 blur-[100px] mix-blend-multiply animate-[pulse_10s_ease-in-out_infinite_reverse]"></div>
        <div className="absolute -bottom-[10%] left-[20%] w-[600px] h-[600px] rounded-full bg-orange-300/10 blur-[130px] mix-blend-multiply animate-[pulse_12s_ease-in-out_infinite]"></div>
      </div>

      <div className="w-full max-w-[420px] px-6 relative z-10 animate-in fade-in zoom-in-95 duration-700">
        
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block hover:scale-105 transition-transform duration-300">
            <img
              src="/Logo.png"
              alt="My-HealthKey"
              className="h-16 mx-auto mb-6 drop-shadow-md"
            />
          </Link>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Bem-vindo de volta
          </h2>
          <p className="text-gray-500 mt-2 font-medium">
            Acesse sua conta para continuar
          </p>
        </div>

        {/* Glassmorphism Card */}
        <div className="bg-white/70 backdrop-blur-2xl p-8 sm:p-10 rounded-[2rem] shadow-[0_8px_40px_rgba(0,0,0,0.08)] border border-white/50 relative overflow-hidden group">
          
          {/* Subtle gradient border effect inside card */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none rounded-[2rem]"></div>

          <form className="space-y-6 relative z-10" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-50/80 backdrop-blur-md border border-red-100 text-red-600 p-4 rounded-2xl text-sm font-semibold flex items-center gap-2 animate-in slide-in-from-top-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                {error}
              </div>
            )}

            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-gray-700">
                  E-mail
                </label>
                <div className="relative">
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-12 bg-white/50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-red-100 focus:border-red-400 rounded-xl transition-all pl-4 text-gray-800 placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-gray-700">
                  Senha
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 bg-white/50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-red-100 focus:border-red-400 rounded-xl transition-all pl-4 text-gray-800 tracking-widest placeholder:tracking-normal placeholder:text-gray-400"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Link
                href="/recuperar-senha"
                className="text-sm font-semibold text-gray-500 hover:text-red-600 transition-colors"
              >
                Esqueceu a senha?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full h-14 bg-gray-900 hover:bg-[#D32F2F] text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-red-500/25 transition-all duration-300 group/btn overflow-hidden relative"
              disabled={loading}
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 ease-in-out"></div>
              <span className="flex items-center justify-center gap-2 relative z-10">
                {loading ? (
                  "Aguarde..."
                ) : (
                  <>
                    Entrar <ArrowRight size={20} weight="bold" className="group-hover/btn:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </Button>
          </form>
        </div>

        {/* Footer Link */}
        <p className="text-center text-sm text-gray-500 mt-8 font-medium">
          Não tem uma conta?{" "}
          <Link href="/registro" className="text-red-600 font-bold hover:text-red-700 transition-colors hover:underline underline-offset-4">
            Cadastre-se grátis
          </Link>
        </p>
      </div>
    </div>
  );
}