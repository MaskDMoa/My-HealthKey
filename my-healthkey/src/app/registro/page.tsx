"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

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
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <Link href="/">
            <img
              src="/Logo.png"
              alt="My-HealthKey"
              className="h-16 mx-auto mb-4 cursor-pointer"
            />
          </Link>
          <h2 className="text-3xl font-bold text-[#D32F2F]">Criar conta</h2>
          <p className="text-gray-600 mt-2">Cadastre-se gratuitamente</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleRegistro}>
          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome completo
              </label>
              <Input
                type="text"
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full"
              />
            </div>

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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar senha
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full"
              />
            </div>
            </div>

          <Button
            type="submit"
            className="w-full bg-[#D32F2F] hover:bg-[#C62828] text-white py-2"
            disabled={loading}
          >
            {loading ? "Aguarde..." : "Cadastrar Conta"}
          </Button>

          <p className="text-center text-sm text-gray-600">
            Já tem uma conta?{" "}
            <Link href="/login" className="text-[#D32F2F] font-semibold hover:underline">
              Faça login
            </Link>
          </p>

          {/* Link para cadastro de farmácia */}
          <div className="mt-6 border-t pt-6 text-center">
            <p className="text-sm text-gray-600 mb-2">Você é proprietário de uma farmácia?</p>
            <Link href="/registro-farmacia" className="text-[#D32F2F] font-bold hover:underline">
              Cadastre sua Loja aqui
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}