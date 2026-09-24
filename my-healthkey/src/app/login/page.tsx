"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { ArrowRight, ArrowLeft, Eye, EyeSlash, WarningCircle } from "@phosphor-icons/react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setError("Preencha todos os campos");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (signInError) {
        setError("E-mail ou senha incorretos.");
        setLoading(false);
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Ocorreu um erro ao tentar fazer login. Tente novamente.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col items-center justify-center bg-gray-50 relative overflow-x-hidden py-8 sm:py-12 px-4 sm:px-6">
      {/* Background Animated Blobs */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -right-[10%] w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] rounded-full bg-red-400/20 blur-[100px] sm:blur-[120px] mix-blend-multiply animate-[pulse_8s_ease-in-out_infinite]" />
        <div className="absolute top-[20%] -left-[10%] w-[300px] sm:w-[400px] h-[300px] sm:h-[400px] rounded-full bg-rose-300/20 blur-[90px] sm:blur-[100px] mix-blend-multiply animate-[pulse_10s_ease-in-out_infinite_reverse]" />
        <div className="absolute -bottom-[10%] left-[20%] w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] rounded-full bg-orange-300/10 blur-[110px] sm:blur-[130px] mix-blend-multiply animate-[pulse_12s_ease-in-out_infinite]" />
      </div>

      <div className="w-full max-w-[420px] relative z-10 animate-in fade-in zoom-in-95 duration-500">
        {/* Voltar ao início */}
        <div className="mb-4 sm:mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-red-600 transition-colors text-xs sm:text-sm font-semibold group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Voltar ao Início
          </Link>
        </div>

        {/* Logo and Header */}
        <div className="text-center mb-6 sm:mb-8">
          <Link href="/" className="inline-block hover:scale-105 transition-transform duration-300">
            <img
              src="/Logo.png"
              alt="My-HealthKey"
              className="h-12 sm:h-16 mx-auto mb-4 sm:mb-6 drop-shadow-md"
            />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Bem-vindo de volta
          </h1>
          <p className="text-gray-500 mt-1.5 sm:mt-2 text-xs sm:text-sm font-medium">
            Acesse sua conta para continuar
          </p>
        </div>

        {/* Glassmorphism Card */}
        <div className="bg-white/80 sm:bg-white/70 backdrop-blur-2xl p-5 sm:p-8 md:p-10 rounded-2xl sm:rounded-[2rem] shadow-[0_8px_40px_rgba(0,0,0,0.08)] border border-white/60 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none rounded-2xl sm:rounded-[2rem]" />

          <form className="space-y-5 relative z-10" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-50/90 backdrop-blur-md border border-red-100 text-red-600 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2.5 animate-in slide-in-from-top-2">
                <WarningCircle size={20} weight="fill" className="shrink-0 text-red-500" />
                <span className="leading-snug">{error}</span>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs sm:text-sm font-bold text-gray-700">
                  E-mail
                </label>
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  inputMode="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  disabled={loading}
                  className="w-full h-11 sm:h-12 bg-white/60 border-gray-200 focus:bg-white focus:ring-2 focus:ring-red-100 focus:border-red-400 rounded-xl transition-all px-3.5 sm:px-4 text-sm text-gray-800 placeholder:text-gray-400"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs sm:text-sm font-bold text-gray-700">
                    Senha
                  </label>
                  <Link
                    href="/recuperar-senha"
                    className="text-xs font-semibold text-gray-500 hover:text-red-600 transition-colors"
                  >
                    Esqueceu a senha?
                  </Link>
                </div>
                <div className="relative flex items-center">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    disabled={loading}
                    className={`w-full h-11 sm:h-12 bg-white/60 border-gray-200 focus:bg-white focus:ring-2 focus:ring-red-100 focus:border-red-400 rounded-xl transition-all pl-3.5 sm:pl-4 pr-10 text-sm text-gray-800 placeholder:text-gray-400 placeholder:tracking-normal ${
                      !showPassword && password ? "tracking-widest" : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    aria-label={showPassword ? "Ocultar senha" : "Ver senha"}
                    className="absolute right-3 p-1 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                  >
                    {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 sm:h-14 bg-gray-900 hover:bg-[#D32F2F] text-white rounded-xl font-bold text-base sm:text-lg shadow-lg hover:shadow-red-500/25 transition-all duration-300 group/btn overflow-hidden relative mt-2 active:scale-[0.99]"
              disabled={loading}
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 ease-in-out" />
              <span className="flex items-center justify-center gap-2 relative z-10">
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Entrando...
                  </>
                ) : (
                  <>
                    Entrar{" "}
                    <ArrowRight
                      size={20}
                      weight="bold"
                      className="group-hover/btn:translate-x-1 transition-transform"
                    />
                  </>
                )}
              </span>
            </Button>
          </form>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs sm:text-sm text-gray-500 mt-6 sm:mt-8 font-medium">
          Não tem uma conta?{" "}
          <Link
            href="/registro"
            className="text-red-600 font-bold hover:text-red-700 transition-colors hover:underline underline-offset-4"
          >
            Cadastre-se grátis
          </Link>
        </p>
      </div>
    </div>
  );
}