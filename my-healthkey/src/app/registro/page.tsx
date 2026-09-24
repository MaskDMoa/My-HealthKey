"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeSlash,
  CheckCircle,
  WarningCircle,
  Storefront,
  Envelope,
} from "@phosphor-icons/react";

export default function RegistroPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleRegistro = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName || !cleanEmail || !password || !confirmPassword) {
      setError("Preencha todos os campos obrigatórios");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("Por favor, insira um e-mail válido");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      // 1. Cadastra o usuário no Supabase Auth com o nome fornecido
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: cleanName,
          },
        },
      });

      if (authError) {
        setError(authError.message || "Erro ao criar conta");
        setLoading(false);
        return;
      }

      // Proteção de enumeração de e-mail do Supabase: se o e-mail já existe, identities é []
      if (
        authData.user &&
        authData.user.identities &&
        authData.user.identities.length === 0
      ) {
        setError(
          "Este e-mail já está cadastrado. Tente fazer login ou recupere sua senha."
        );
        setLoading(false);
        return;
      }

      // Se a sessão já foi autenticada automaticamente (sem confirmação de e-mail obrigatória)
      if (authData.session) {
        router.push("/");
        router.refresh();
        return;
      }

      // Se necessita confirmação de e-mail ou sucesso do cadastro
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || "Ocorreu um erro ao processar seu cadastro.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col items-center justify-center bg-gray-50 relative overflow-x-hidden py-8 sm:py-12 px-4 sm:px-6">
      {/* Background Animated Blobs */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[5%] -left-[15%] sm:-left-[10%] w-[320px] sm:w-[500px] h-[320px] sm:h-[500px] rounded-full bg-red-400/20 blur-[100px] sm:blur-[120px] mix-blend-multiply animate-[pulse_8s_ease-in-out_infinite]" />
        <div className="absolute -bottom-[15%] sm:-bottom-[20%] -right-[10%] w-[360px] sm:w-[600px] h-[360px] sm:h-[600px] rounded-full bg-orange-300/15 blur-[100px] sm:blur-[130px] mix-blend-multiply animate-[pulse_12s_ease-in-out_infinite_reverse]" />
      </div>

      <div className="w-full max-w-[480px] relative z-10 animate-in fade-in zoom-in-95 duration-500">
        {/* Voltar ao início */}
        <div className="mb-4 sm:mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-red-600 transition-colors text-xs sm:text-sm font-semibold group"
          >
            <ArrowLeft
              size={16}
              className="group-hover:-translate-x-1 transition-transform"
            />
            Voltar ao Início
          </Link>
        </div>

        {/* Logo and Header */}
        <div className="text-center mb-6 sm:mb-8">
          <Link
            href="/"
            className="inline-block hover:scale-105 transition-transform duration-300"
          >
            <img
              src="/Logo.png"
              alt="My-HealthKey"
              className="h-12 sm:h-14 mx-auto mb-4 sm:mb-5 drop-shadow-md"
            />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Criar conta
          </h1>
          <p className="text-gray-500 mt-1 sm:mt-2 text-xs sm:text-sm font-medium">
            Cadastre-se gratuitamente para continuar
          </p>
        </div>

        {/* Glassmorphism Card */}
        <div className="bg-white/80 sm:bg-white/70 backdrop-blur-2xl p-5 sm:p-8 md:p-10 rounded-2xl sm:rounded-[2rem] shadow-[0_8px_40px_rgba(0,0,0,0.08)] border border-white/60 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none rounded-2xl sm:rounded-[2rem]" />

          {success ? (
            <div className="text-center py-4 space-y-5 animate-in fade-in zoom-in-95 duration-300 relative z-10">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle size={44} weight="fill" />
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Conta criada com sucesso!
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm mt-2 leading-relaxed">
                  Enviamos um e-mail de confirmação para:
                </p>
                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-lg text-xs sm:text-sm font-semibold text-gray-800 break-all max-w-full">
                  <Envelope size={16} className="shrink-0 text-gray-500" />
                  <span>{email.trim().toLowerCase()}</span>
                </div>
                <p className="text-gray-400 text-xs mt-3 leading-relaxed">
                  Verifique sua caixa de entrada (e a pasta de spam) para confirmar sua conta antes de entrar.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/login"
                  className="w-full flex items-center justify-center h-12 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 shadow-md shadow-red-200 transition-all text-sm active:scale-95"
                >
                  Ir para o Login
                </Link>
                <Link
                  href="/"
                  className="w-full flex items-center justify-center h-12 rounded-xl font-semibold text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors text-sm"
                >
                  Voltar ao Início
                </Link>
              </div>
            </div>
          ) : (
            <form className="space-y-5 relative z-10" onSubmit={handleRegistro}>
              {error && (
                <div className="bg-red-50/90 backdrop-blur-md border border-red-100 text-red-600 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2.5 animate-in slide-in-from-top-2">
                  <WarningCircle size={20} weight="fill" className="shrink-0 text-red-500" />
                  <span className="leading-snug">{error}</span>
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs sm:text-sm font-bold text-gray-700">
                    Nome completo
                  </label>
                  <Input
                    type="text"
                    placeholder="Seu nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    autoCapitalize="words"
                    disabled={loading}
                    className="w-full h-11 sm:h-12 bg-white/60 border-gray-200 focus:bg-white focus:ring-2 focus:ring-red-100 focus:border-red-400 rounded-xl transition-all px-3.5 sm:px-4 text-sm text-gray-800 placeholder:text-gray-400"
                  />
                </div>

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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs sm:text-sm font-bold text-gray-700">
                      Senha
                    </label>
                    <div className="relative flex items-center">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password"
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

                  <div className="space-y-1.5">
                    <label className="block text-xs sm:text-sm font-bold text-gray-700">
                      Confirmar senha
                    </label>
                    <div className="relative flex items-center">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        autoComplete="new-password"
                        disabled={loading}
                        className={`w-full h-11 sm:h-12 bg-white/60 border-gray-200 focus:bg-white focus:ring-2 focus:ring-red-100 focus:border-red-400 rounded-xl transition-all pl-3.5 sm:pl-4 pr-10 text-sm text-gray-800 placeholder:text-gray-400 placeholder:tracking-normal ${
                          !showConfirmPassword && confirmPassword ? "tracking-widest" : ""
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        tabIndex={-1}
                        aria-label={
                          showConfirmPassword
                            ? "Ocultar confirmação de senha"
                            : "Ver confirmação de senha"
                        }
                        className="absolute right-3 p-1 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                      >
                        {showConfirmPassword ? (
                          <EyeSlash size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                <p className="text-[11px] sm:text-xs text-gray-400">
                  Mínimo de 6 caracteres.
                </p>
              </div>

              <Button
                type="submit"
                className="w-full h-12 sm:h-14 bg-gray-900 hover:bg-[#D32F2F] text-white rounded-xl font-bold text-base sm:text-lg shadow-lg hover:shadow-red-500/25 transition-all duration-300 group/btn overflow-hidden relative mt-3 active:scale-[0.99]"
                disabled={loading}
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 ease-in-out" />
                <span className="flex items-center justify-center gap-2 relative z-10">
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Cadastrando...
                    </>
                  ) : (
                    <>
                      Cadastrar Conta{" "}
                      <ArrowRight
                        size={20}
                        weight="bold"
                        className="group-hover/btn:translate-x-1 transition-transform"
                      />
                    </>
                  )}
                </span>
              </Button>

              <p className="text-center text-xs sm:text-sm text-gray-500 font-medium pt-1">
                Já tem uma conta?{" "}
                <Link
                  href="/login"
                  className="text-red-600 font-bold hover:text-red-700 transition-colors hover:underline underline-offset-4"
                >
                  Faça login
                </Link>
              </p>

              <div className="mt-6 pt-5 sm:mt-8 sm:pt-6 border-t border-gray-200/60 text-center">
                <p className="text-xs sm:text-sm text-gray-500 mb-2.5 font-medium">
                  Você é proprietário de uma farmácia?
                </p>
                <Link
                  href="/registro-farmacia"
                  className="inline-flex items-center justify-center gap-2 w-full sm:w-auto h-10 px-5 rounded-xl border-2 border-red-100 text-red-600 text-xs sm:text-sm font-bold hover:bg-red-50 hover:border-red-200 transition-colors active:scale-95"
                >
                  <Storefront size={16} weight="bold" />
                  Cadastre sua Loja aqui
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}