"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { Storefront, ArrowRight, ArrowLeft } from "@phosphor-icons/react";

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

    // 2. Geocodificar o endereço para obter coordenadas reais
    let latitude = -22.2158;  // Fallback
    let longitude = -45.7028;
    try {
      const geoRes = await fetch(`/api/geocode?endereco=${encodeURIComponent(address)}`);
      const geoData = await geoRes.json();
      if (geoData.encontrado) {
        latitude = geoData.lat;
        longitude = geoData.lon;
      }
    } catch {
      // Se falhar, usa coordenadas padrão
    }

    // 3. Insere a farmácia
    const { error: dbError } = await supabase.from("pharmacies").insert({
      id: crypto.randomUUID(),
      name,
      trade_name: name,
      cnpj,
      phone,
      address,
      latitude,
      longitude,
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 relative overflow-hidden py-12">
      
      {/* Background Animated Blobs (Light Theme) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[5%] -left-[10%] w-[600px] h-[600px] rounded-full bg-green-200/50 blur-[120px] mix-blend-multiply animate-[pulse_10s_ease-in-out_infinite]"></div>
        <div className="absolute -bottom-[10%] right-[10%] w-[700px] h-[700px] rounded-full bg-emerald-200/50 blur-[150px] mix-blend-multiply animate-[pulse_15s_ease-in-out_infinite_reverse]"></div>
      </div>

      <div className="w-full max-w-[700px] px-6 relative z-10 animate-in fade-in zoom-in-95 duration-700">
        
        {/* Voltar */}
        <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-green-700 transition-colors text-sm font-semibold mb-6 group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
          Voltar ao Início
        </Link>

        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mb-6 shadow-lg shadow-green-500/30 transform hover:scale-105 transition-transform duration-500">
            <Storefront size={32} weight="fill" className="text-white drop-shadow-md" />
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-2">
            Seja Parceiro
          </h2>
          <p className="text-gray-500 font-medium">
            Cadastre sua farmácia e comece a vender
          </p>
        </div>

        {/* Glassmorphism Card (Light Theme) */}
        <div className="bg-white/70 backdrop-blur-2xl p-8 sm:p-10 rounded-[2rem] shadow-[0_8px_40px_rgba(0,0,0,0.08)] border border-white/50 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none rounded-[2rem]"></div>

          <form className="space-y-8 relative z-10" onSubmit={handleRegistro}>
            {error && (
              <div className="bg-red-50/80 backdrop-blur-md border border-red-100 text-red-600 p-4 rounded-2xl text-sm font-semibold flex items-center gap-3 animate-in slide-in-from-top-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Coluna 1: Dados da Farmácia */}
              <div className="space-y-5">
                <h3 className="text-lg font-bold text-gray-800 border-b border-gray-200 pb-2">Dados da Empresa</h3>
                
                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-gray-700">
                    CNPJ * {fetchingCnpj && <span className="text-xs text-green-600 ml-2 animate-pulse">Buscando dados...</span>}
                  </label>
                  <Input
                    type="text"
                    placeholder="Apenas números ou com máscara"
                    value={cnpj}
                    onChange={(e) => setCnpj(e.target.value)}
                    onBlur={handleCnpjBlur}
                    className="w-full h-12 bg-white/50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-green-100 focus:border-green-400 rounded-xl transition-all pl-4 text-gray-800 placeholder:text-gray-400"
                  />
                  <p className="text-xs text-gray-400 mt-1">Saia do campo para preencher automaticamente</p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-gray-700">Nome da Farmácia *</label>
                  <Input
                    type="text"
                    placeholder="Razão social ou Fantasia"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-12 bg-white/50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-green-100 focus:border-green-400 rounded-xl transition-all pl-4 text-gray-800 placeholder:text-gray-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-gray-700">Endereço Completo *</label>
                  <Input
                    type="text"
                    placeholder="Rua, Número, Bairro, Cidade - UF"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full h-12 bg-white/50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-green-100 focus:border-green-400 rounded-xl transition-all pl-4 text-gray-800 placeholder:text-gray-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-gray-700">Telefone Comercial</label>
                  <Input
                    type="text"
                    placeholder="(00) 0000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-12 bg-white/50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-green-100 focus:border-green-400 rounded-xl transition-all pl-4 text-gray-800 placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* Coluna 2: Dados de Acesso */}
              <div className="space-y-5">
                <h3 className="text-lg font-bold text-gray-800 border-b border-gray-200 pb-2">Dados de Acesso</h3>
                
                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-gray-700">E-mail de Login *</label>
                  <Input
                    type="email"
                    placeholder="contato@suafarmacia.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-12 bg-white/50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-green-100 focus:border-green-400 rounded-xl transition-all pl-4 text-gray-800 placeholder:text-gray-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-gray-700">Senha *</label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-12 bg-white/50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-green-100 focus:border-green-400 rounded-xl transition-all pl-4 text-gray-800 tracking-widest placeholder:tracking-normal placeholder:text-gray-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-gray-700">Confirmar senha *</label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full h-12 bg-white/50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-green-100 focus:border-green-400 rounded-xl transition-all pl-4 text-gray-800 tracking-widest placeholder:tracking-normal placeholder:text-gray-400"
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-14 bg-gray-900 hover:bg-green-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-green-500/25 transition-all duration-300 group/btn overflow-hidden relative mt-4"
              disabled={loading || fetchingCnpj}
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 ease-in-out"></div>
              <span className="flex items-center justify-center gap-2 relative z-10">
                {loading ? "Aguarde..." : (
                  <>Cadastrar Loja <ArrowRight size={20} weight="bold" className="group-hover/btn:translate-x-1 transition-transform" /></>
                )}
              </span>
            </Button>

            <div className="mt-8 pt-6 border-t border-gray-200/50 text-center">
              <p className="text-sm text-gray-500 mb-2 font-medium">Você é um cliente procurando remédios?</p>
              <Link href="/registro" className="inline-flex items-center justify-center h-10 px-6 rounded-lg border-2 border-green-100 text-green-700 font-bold hover:bg-green-50 hover:border-green-200 transition-colors">
                Crie uma conta de usuário
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
