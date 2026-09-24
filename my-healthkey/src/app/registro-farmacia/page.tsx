"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import {
  Storefront,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeSlash,
  WarningCircle,
  CheckCircle,
} from "@phosphor-icons/react";

export default function RegistroFarmaciaPage() {
  const router = useRouter();

  // Dados de Auth (Dono da farmácia)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

      const enderecoCompleto = `${data.logradouro || ""}, ${data.numero || ""}${data.complemento ? ` - ${data.complemento}` : ""
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

    const cleanEmail = email.trim().toLowerCase();
    const cleanCnpj = cnpj.trim();
    const cleanName = name.trim();
    const cleanAddress = address.trim();
    const cleanPhone = phone.trim();

    if (!cleanEmail || !password || !confirmPassword || !cleanCnpj || !cleanAddress || !cleanName) {
      setError("Preencha todos os campos obrigatórios");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("Por favor, insira um e-mail válido");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      // 1. Cadastra o dono no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
      });

      if (authError || !authData.user) {
        setError(authError?.message || "Erro ao criar conta");
        setLoading(false);
        return;
      }

      // Proteção contra e-mail já cadastrado
      if (
        authData.user &&
        authData.user.identities &&
        authData.user.identities.length === 0
      ) {
        setError("Este e-mail já está cadastrado. Faça login na sua conta existente.");
        setLoading(false);
        return;
      }

      // 2. Geocodificar o endereço para obter coordenadas reais
      let latitude = -22.2158; // Fallback
      let longitude = -45.7028;
      try {
        const geoRes = await fetch(`/api/geocode?endereco=${encodeURIComponent(cleanAddress)}`);
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
        name: cleanName,
        trade_name: cleanName,
        cnpj: cleanCnpj,
        phone: cleanPhone,
        address: cleanAddress,
        latitude,
        longitude,
        owner_id: authData.user.id,
      });

      if (dbError) {
        console.error(dbError);
        setError("Conta criada, mas falha ao salvar dados da farmácia.");
        setLoading(false);
        return;
      }

      router.push("/login");
    } catch (err: any) {
      setError(err?.message || "Ocorreu um erro ao processar o cadastro.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col items-center justify-center bg-gray-50 relative overflow-x-hidden py-8 sm:py-12 px-4 sm:px-6">
      {/* Background Animated Blobs (Light Theme) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[5%] -left-[10%] w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] rounded-full bg-green-200/50 blur-[100px] sm:blur-[120px] mix-blend-multiply animate-[pulse_10s_ease-in-out_infinite]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[450px] sm:w-[700px] h-[450px] sm:h-[700px] rounded-full bg-emerald-200/50 blur-[120px] sm:blur-[150px] mix-blend-multiply animate-[pulse_15s_ease-in-out_infinite_reverse]" />
      </div>

      <div className="w-full max-w-[720px] relative z-10 animate-in fade-in zoom-in-95 duration-500">
        {/* Voltar */}
        <div className="mb-4 sm:mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-green-700 transition-colors text-xs sm:text-sm font-semibold group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Voltar ao Início
          </Link>
        </div>

        {/* Logo and Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mb-4 sm:mb-5 shadow-lg shadow-green-500/30 transform hover:scale-105 transition-transform duration-500">
            <Storefront size={30} weight="fill" className="text-white drop-shadow-md" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 mb-1.5 sm:mb-2">
            Seja Parceiro
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm font-medium">
            Cadastre sua farmácia e comece a vender
          </p>
        </div>

        {/* Glassmorphism Card (Light Theme) */}
        <div className="bg-white/80 sm:bg-white/70 backdrop-blur-2xl p-5 sm:p-8 md:p-10 rounded-2xl sm:rounded-[2rem] shadow-[0_8px_40px_rgba(0,0,0,0.08)] border border-white/60 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none rounded-2xl sm:rounded-[2rem]" />

          <form className="space-y-6 sm:space-y-8 relative z-10" onSubmit={handleRegistro}>
            {error && (
              <div className="bg-red-50/90 backdrop-blur-md border border-red-100 text-red-600 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2.5 animate-in slide-in-from-top-2">
                <WarningCircle size={20} weight="fill" className="shrink-0 text-red-500" />
                <span className="leading-snug">{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {/* Coluna 1: Dados da Farmácia */}
              <div className="space-y-4 sm:space-y-5">
                <h3 className="text-base sm:text-lg font-bold text-gray-800 border-b border-gray-200/80 pb-2">
                  Dados da Empresa
                </h3>

                <div className="space-y-1.5">
                  <label className="block text-xs sm:text-sm font-bold text-gray-700">
                    CNPJ *{" "}
                    {fetchingCnpj && (
                      <span className="text-[11px] text-green-600 ml-2 animate-pulse">
                        Buscando dados...
                      </span>
                    )}
                  </label>
                  <Input
                    type="text"
                    placeholder="00.000.000/0000-00"
                    value={cnpj}
                    onChange={(e) => setCnpj(e.target.value)}
                    onBlur={handleCnpjBlur}
                    inputMode="numeric"
                    disabled={loading}
                    className="w-full h-11 sm:h-12 bg-white/60 border-gray-200 focus:bg-white focus:ring-2 focus:ring-green-100 focus:border-green-400 rounded-xl transition-all px-3.5 sm:px-4 text-sm text-gray-800 placeholder:text-gray-400"
                  />
                  <p className="text-[11px] text-gray-400">
                    Saia do campo para buscar os dados automaticamente
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs sm:text-sm font-bold text-gray-700">
                    Nome da Farmácia *
                  </label>
                  <Input
                    type="text"
                    placeholder="Razão social ou Fantasia"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                    className="w-full h-11 sm:h-12 bg-white/60 border-gray-200 focus:bg-white focus:ring-2 focus:ring-green-100 focus:border-green-400 rounded-xl transition-all px-3.5 sm:px-4 text-sm text-gray-800 placeholder:text-gray-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs sm:text-sm font-bold text-gray-700">
                    Endereço Completo *
                  </label>
                  <Input
                    type="text"
                    placeholder="Rua, Número, Bairro, Cidade - UF"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    disabled={loading}
                    className="w-full h-11 sm:h-12 bg-white/60 border-gray-200 focus:bg-white focus:ring-2 focus:ring-green-100 focus:border-green-400 rounded-xl transition-all px-3.5 sm:px-4 text-sm text-gray-800 placeholder:text-gray-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs sm:text-sm font-bold text-gray-700">
                    Telefone Comercial
                  </label>
                  <Input
                    type="tel"
                    inputMode="tel"
                    placeholder="(00) 0000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={loading}
                    className="w-full h-11 sm:h-12 bg-white/60 border-gray-200 focus:bg-white focus:ring-2 focus:ring-green-100 focus:border-green-400 rounded-xl transition-all px-3.5 sm:px-4 text-sm text-gray-800 placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* Coluna 2: Dados de Acesso */}
              <div className="space-y-4 sm:space-y-5">
                <h3 className="text-base sm:text-lg font-bold text-gray-800 border-b border-gray-200/80 pb-2">
                  Dados de Acesso
                </h3>

                <div className="space-y-1.5">
                  <label className="block text-xs sm:text-sm font-bold text-gray-700">
                    E-mail de Login *
                  </label>
                  <Input
                    type="email"
                    placeholder="contato@suafarmacia.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    inputMode="email"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck="false"
                    disabled={loading}
                    className="w-full h-11 sm:h-12 bg-white/60 border-gray-200 focus:bg-white focus:ring-2 focus:ring-green-100 focus:border-green-400 rounded-xl transition-all px-3.5 sm:px-4 text-sm text-gray-800 placeholder:text-gray-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs sm:text-sm font-bold text-gray-700">
                    Senha *
                  </label>
                  <div className="relative flex items-center">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                      disabled={loading}
                      className={`w-full h-11 sm:h-12 bg-white/60 border-gray-200 focus:bg-white focus:ring-2 focus:ring-green-100 focus:border-green-400 rounded-xl transition-all pl-3.5 sm:pl-4 pr-10 text-sm text-gray-800 placeholder:text-gray-400 placeholder:tracking-normal ${!showPassword && password ? "tracking-widest" : ""
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
                    Confirmar senha *
                  </label>
                  <div className="relative flex items-center">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      autoComplete="new-password"
                      disabled={loading}
                      className={`w-full h-11 sm:h-12 bg-white/60 border-gray-200 focus:bg-white focus:ring-2 focus:ring-green-100 focus:border-green-400 rounded-xl transition-all pl-3.5 sm:pl-4 pr-10 text-sm text-gray-800 placeholder:text-gray-400 placeholder:tracking-normal ${!showConfirmPassword && confirmPassword ? "tracking-widest" : ""
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
                      {showConfirmPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <p className="text-[11px] text-gray-400">Mínimo de 6 caracteres.</p>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 sm:h-14 bg-gray-900 hover:bg-green-700 text-white rounded-xl font-bold text-base sm:text-lg shadow-lg hover:shadow-green-500/25 transition-all duration-300 group/btn overflow-hidden relative mt-4 active:scale-[0.99]"
              disabled={loading || fetchingCnpj}
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 ease-in-out" />
              <span className="flex items-center justify-center gap-2 relative z-10">
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Cadastrando Loja...
                  </>
                ) : (
                  <>
                    Cadastrar Loja{" "}
                    <ArrowRight
                      size={20}
                      weight="bold"
                      className="group-hover/btn:translate-x-1 transition-transform"
                    />
                  </>
                )}
              </span>
            </Button>

            <div className="mt-6 pt-5 sm:mt-8 sm:pt-6 border-t border-gray-200/60 text-center">
              <p className="text-xs sm:text-sm text-gray-500 mb-2 font-medium">
                Você é um cliente procurando remédios?
              </p>
              <Link
                href="/registro"
                className="inline-flex items-center justify-center w-full sm:w-auto h-10 px-5 rounded-xl border-2 border-green-100 text-green-700 text-xs sm:text-sm font-bold hover:bg-green-50 hover:border-green-200 transition-colors active:scale-95"
              >
                Crie uma conta de usuário
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
