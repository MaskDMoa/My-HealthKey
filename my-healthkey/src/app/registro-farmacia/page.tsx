"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

export default function RegistroFarmaciaPage() {
  const router = useRouter();
  
  // Dados de Auth (Dono da farmácia)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Dados da Farmácia
  const [cnpj, setCnpj] = useState("");
  const [name, setName] = useState(""); // Nome da Farmácia
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [fetchingCnpj, setFetchingCnpj] = useState(false);
  const [error, setError] = useState("");

  const handleCnpjBlur = async () => {
    const cleanCnpj = cnpj.replace(/\D/g, "");
    if (cleanCnpj.length !== 14) return;

    setFetchingCnpj(true);
    setError("");
    
    try {
      const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`);
      if (!res.ok) {
        throw new Error("CNPJ não encontrado ou API indisponível");
      }
      const data = await res.json();
      
      setName(data.razao_social || data.nome_fantasia || "");
      
      const telefoneStr = data.ddd_telefone_1 || "";
      setPhone(telefoneStr);
      
      const enderecoCompleto = `${data.logradouro || ""}, ${data.numero || ""}${
        data.complemento ? ` - ${data.complemento}` : ""
      }, ${data.bairro || ""} - ${data.municipio || ""}/${data.uf || ""}`;
      
      setAddress(enderecoCompleto.replace(/^, |^ - | - $/g, "").trim());
      
    } catch (err: any) {
      setError(err.message || "Erro ao buscar CNPJ");
    } finally {
      setFetchingCnpj(false);
    }
  };

  const handleRegistro = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password || !confirmPassword || !cnpj || !address || !name) {
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
    
    // 1. Cadastra o dono no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError || !authData.user) {
      setError(authError?.message || "Erro ao criar conta");
      setLoading(false);
      return;
    }

    // 2. Insere a farmácia
    const { error: dbError } = await supabase.from("pharmacies").insert({
      id: crypto.randomUUID(),
      name,
      trade_name: name,
      cnpj,
      phone,
      address,
      latitude: -22.2158, // TODO: Geocodificar endereço real depois
      longitude: -45.7028,
      owner_id: authData.user.id
    });

    if (dbError) {
      console.error(dbError);
      setError("Conta criada, mas falha ao salvar dados da farmácia.");
      setLoading(false);
      return;
    }

    router.push("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <Link href="/">
            <img
              src="/Logo.png"
              alt="My-HealthKey"
              className="h-16 mx-auto mb-4 cursor-pointer"
            />
          </Link>
          <h2 className="text-3xl font-bold text-[#2E7D32]">Parceiro My-HealthKey</h2>
          <p className="text-gray-600 mt-2">Cadastre sua farmácia e comece a vender</p>
        </div>

        <form className="mt-8 space-y-8" onSubmit={handleRegistro}>
          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm text-center font-semibold">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Coluna 1: Dados da Farmácia */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Dados da Empresa</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CNPJ * {fetchingCnpj && <span className="text-xs text-[#2E7D32] ml-2 animate-pulse">Buscando dados...</span>}
                </label>
                <Input
                  type="text"
                  placeholder="Apenas números ou com máscara"
                  value={cnpj}
                  onChange={(e) => setCnpj(e.target.value)}
                  onBlur={handleCnpjBlur}
                  className="w-full"
                />
                <p className="text-xs text-gray-400 mt-1">Digite e saia do campo para preencher automático</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Farmácia *
                </label>
                <Input
                  type="text"
                  placeholder="Nome da sua farmácia"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Endereço Completo *
                </label>
                <Input
                  type="text"
                  placeholder="Rua, Número, Bairro, Cidade - UF"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone Comercial
                </label>
                <Input
                  type="text"
                  placeholder="(00) 0000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-gray-50"
                />
              </div>
            </div>

            {/* Coluna 2: Dados de Acesso */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Dados de Acesso</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-mail de Login *
                </label>
                <Input
                  type="email"
                  placeholder="contato@suafarmacia.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Senha *
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
                  Confirmar senha *
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
          </div>

          <Button
            type="submit"
            className="w-full bg-[#2E7D32] hover:bg-[#1B5E20] text-white py-6 text-lg font-bold"
            disabled={loading || fetchingCnpj}
          >
            {loading ? "Aguarde..." : "Cadastrar Loja"}
          </Button>

          <div className="mt-6 border-t pt-6 text-center">
            <p className="text-sm text-gray-600 mb-2">Você é um cliente procurando remédios?</p>
            <Link href="/registro" className="text-[#D32F2F] font-bold hover:underline">
              Crie uma conta de usuário
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
