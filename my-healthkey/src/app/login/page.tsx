"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

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
      setError(error.message);
      return;
    }
    
    router.push("/");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        {/* LOGO */}
        <div className="text-center">
          <Link href="/">
            <img
              src="/Logo.png"
              alt="My-HealthKey"
              className="h-16 mx-auto mb-4 cursor-pointer"
            />
          </Link>
          <h2 className="text-3xl font-bold text-[#D32F2F]">Bem-vindo</h2>
          <p className="text-gray-600 mt-2">Acesse sua conta</p>
        </div>

        {/* FORMULÁRIO */}
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                E-mail
              </label>
              <Input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
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
                className="w-full"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Link
              href="/recuperar-senha"
              className="text-sm text-[#D32F2F] hover:underline"
            >
              Esqueceu a senha?
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full bg-[#D32F2F] hover:bg-[#C62828] text-white py-2"
            disabled={loading}
          >
            {loading ? "Aguarde..." : "Entrar"}
          </Button>

          <p className="text-center text-sm text-gray-600">
            Não tem uma conta?{" "}
            <Link href="/registro" className="text-[#D32F2F] font-semibold hover:underline">
              Cadastre-se
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}