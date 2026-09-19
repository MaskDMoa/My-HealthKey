"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { MagnifyingGlass, ShoppingCart, SignOut, Envelope, Lock, SquaresFour } from "@phosphor-icons/react";

export function Header() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<any>(null);
  const [pharmacyName, setPharmacyName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [termo, setTermo] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user);
      if (data.user) {
        const { count } = await supabase
          .from("cart_items")
          .select("*", { count: "exact", head: true })
          .eq("user_id", data.user.id);
        setCartCount(count || 0);

        const { data: pharmacy } = await supabase
          .from("pharmacies")
          .select("name")
          .eq("owner_id", data.user.id)
          .single();
        if (pharmacy) {
          setPharmacyName(pharmacy.name);
        }
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Detecção de scroll para efeito glassmorphism
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
    router.push("/");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setMenuOpen(false);
    router.push("/");
    router.refresh();
  };

  const handleBuscar = () => {
    const q = termo.trim();
    router.push(q ? `/busca?q=${encodeURIComponent(q)}` : "/busca");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleBuscar();
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-500 ${
        scrolled
          ? "bg-white/80 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.08)] border-b border-gray-200/50"
          : "bg-[#F8F9FA] shadow-sm"
      }`}
    >
      <div className="max-w-[1800px] mx-auto h-20 px-6 lg:px-12 flex items-center gap-6">
        
        {/* Logo */}
        <a
          href="/"
          onClick={handleLogoClick}
          className="flex items-center gap-3 shrink-0 group"
        >
          <img
            src="/Logo.png"
            alt="Logo"
            className="h-14 w-auto group-hover:scale-105 transition-transform duration-300"
          />
          <span className="text-[#D32F2F] font-extrabold text-xl tracking-tight hidden lg:block group-hover:tracking-wide transition-all duration-300">
            My-HealthKey
          </span>
        </a>

        {/* Barra de busca */}
        <div className="flex-1 max-w-2xl mx-auto">
          <div className="relative flex items-center group/search">
            <div className="absolute left-4 text-gray-400 group-focus-within/search:text-red-500 transition-colors">
              <MagnifyingGlass size={20} weight="bold" />
            </div>
            <Input
              type="text"
              value={termo}
              onChange={(e) => setTermo(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Buscar medicamentos, farmácias..."
              className="w-full h-12 pl-12 pr-28 bg-gray-100/80 hover:bg-white border border-gray-200/60 hover:border-red-200 focus:border-red-400 focus:bg-white rounded-2xl shadow-none focus-visible:ring-2 focus-visible:ring-red-500/20 transition-all duration-300 text-gray-800 placeholder:text-gray-400"
            />
            <button
              onClick={handleBuscar}
              aria-label="Pesquisar"
              className="absolute right-2 h-8 px-5 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white text-sm font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-red-200 active:scale-95"
            >
              Buscar
            </button>
          </div>
        </div>

        {/* Área direita: auth + carrinho */}
        <div className="flex items-center gap-3 shrink-0">
          {loading ? (
            <div className="w-40" />
          ) : user ? (
            <>
              {/* Carrinho (somente para clientes, não farmácias) */}
              {!pharmacyName && (
                <Link
                  href="/carrinho"
                  className="relative p-2.5 rounded-xl hover:bg-red-50 transition-colors duration-300 group/cart"
                >
                  <ShoppingCart size={24} className="text-gray-500 group-hover/cart:text-red-600 transition-colors" weight="bold" />
                  {cartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-red-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md shadow-red-200 animate-in zoom-in duration-300">
                      {cartCount}
                    </span>
                  )}
                </Link>
              )}

              {/* Avatar com dropdown */}
              <div ref={menuRef} className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  onMouseEnter={() => setMenuOpen(true)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95 ${
                    pharmacyName
                      ? "bg-gradient-to-br from-green-600 to-green-700 hover:shadow-green-200"
                      : "bg-gradient-to-br from-red-600 to-red-500 hover:shadow-red-200"
                  }`}
                  title="Minha conta"
                >
                  {pharmacyName ? pharmacyName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase() || "U"}
                </button>

                {menuOpen && (
                  <div
                    onMouseLeave={() => setMenuOpen(false)}
                    className="absolute top-14 right-0 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] min-w-[240px] border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-[100]"
                  >
                    {/* Header do menu */}
                    <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                      {pharmacyName ? (
                        <>
                          <p className="font-bold text-green-700 text-sm">{pharmacyName}</p>
                          <p className="text-xs text-gray-400 mt-0.5">Conta de Farmácia</p>
                        </>
                      ) : (
                        <>
                          <p className="text-xs text-gray-400">Logado como</p>
                          <p className="text-sm font-semibold text-gray-800 break-all mt-0.5">{user.email}</p>
                        </>
                      )}
                    </div>

                    {/* Links */}
                    <div className="py-2">
                      {pharmacyName && (
                        <button
                          onClick={() => { setMenuOpen(false); router.push("/dashboard"); }}
                          className="flex items-center gap-3 w-full px-5 py-3 text-sm text-green-700 font-semibold hover:bg-green-50 transition-colors"
                        >
                          <SquaresFour size={18} weight="fill" />
                          Ir para o Dashboard
                        </button>
                      )}
                      <button
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 w-full px-5 py-3 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        <Envelope size={18} />
                        Mudar Email
                      </button>
                      <button
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 w-full px-5 py-3 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        <Lock size={18} />
                        Mudar Senha
                      </button>
                    </div>

                    {/* Sair */}
                    <div className="border-t border-gray-100 py-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-5 py-3 text-sm text-red-600 font-semibold hover:bg-red-50 transition-colors"
                      >
                        <SignOut size={18} weight="bold" />
                        Sair
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-red-600 border border-red-200 hover:bg-red-50 hover:border-red-300 transition-all duration-300 active:scale-95"
              >
                Entrar
              </Link>
              <Link
                href="/registro"
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 shadow-md shadow-red-200 hover:shadow-lg hover:shadow-red-300 transition-all duration-300 active:scale-95"
              >
                Cadastrar
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
