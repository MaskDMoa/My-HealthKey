"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { Header } from "@/app/_components/header";
import { Footer } from "@/app/_components/footer";

export default function AuthPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/dashboard");
        router.refresh(); // Refresh para atualizar o middleware
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setMessage({
          text: "Cadastro realizado com sucesso! Verifique seu email se necessário e faça o login.",
          type: "success",
        });
        setIsLogin(true); // Muda para a aba de login após cadastro
      }
    } catch (error: any) {
      setMessage({ text: error.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-[70vh] flex items-center justify-center bg-[#F8F9FA] px-4 py-12">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
          <h1 className="text-2xl font-bold text-gray-800 text-center mb-6">
            {isLogin ? "Acesso da Farmácia" : "Cadastrar Farmácia"}
          </h1>

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                E-mail Corporativo
              </label>
              <Input
                type="email"
                placeholder="seuemail@farmacia.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Senha
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            {message.text && (
              <div
                className={`p-3 text-sm rounded-md ${
                  message.type === "error"
                    ? "bg-red-50 text-red-600 border border-red-200"
                    : "bg-green-50 text-green-600 border border-green-200"
                }`}
              >
                {message.text}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-[#D32F2F] hover:bg-[#C62828] text-white"
              disabled={loading}
            >
              {loading
                ? "Aguarde..."
                : isLogin
                ? "Entrar no Painel"
                : "Criar Conta"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            {isLogin ? "Ainda não tem cadastro? " : "Já possui uma conta? "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setMessage({ text: "", type: "" });
              }}
              className="text-[#D32F2F] font-semibold hover:underline"
            >
              {isLogin ? "Criar conta agora" : "Fazer login"}
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
