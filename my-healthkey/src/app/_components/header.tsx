"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";

export function Header() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [termo, setTermo] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Verifica se há um usuário logado
    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user);
      if (data.user) {
        const { count } = await supabase
          .from("cart_items")
          .select("*", { count: "exact", head: true })
          .eq("user_id", data.user.id);
        setCartCount(count || 0);
      }
      setLoading(false);
    });

    // Escuta mudanças no estado de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fecha o menu de perfil ao clicar fora
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogoClick = (e: React.MouseEvent<HTMLDivElement>) => {
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
    <div
      style={{
        backgroundColor: "#F8F9FA",
        height: "100px",
        width: "100%",
        display: "flex",
        alignItems: "center",
        padding: "0 120px",
        position: "sticky",
        top: 0,
        zIndex: 50,
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
      }}
    >
      <div
        onClick={handleLogoClick}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          position: "relative",
          cursor: "pointer",
        }}
      >
        <img src="/Logo.png" alt="Logo" style={{ height: "80px", width: "auto" }} />
        <h1
          style={{
            margin: 0,
            fontSize: "16px",
            color: "#D32F2F",
            fontWeight: "bold",
            position: "absolute",
            bottom: "0px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "#F8F9FA",
            padding: "0 8px",
            whiteSpace: "nowrap",
          }}
        >
          My-HealthKey
        </h1>
      </div>

      {/* Barra de busca */}
      <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
        <div
          style={{
            width: "700px",
            display: "flex",
            alignItems: "center",
            border: "1px solid #D32F2F",
            borderRadius: "6px",
            overflow: "hidden",
            backgroundColor: "#fff",
          }}
        >
          <Input
            type="text"
            value={termo}
            onChange={(e) => setTermo(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Pesquisar medicamentos..."
            className="border-0 shadow-none focus-visible:ring-0"
            style={{ outline: "none" }}
          />
          <button
            onClick={handleBuscar}
            aria-label="Pesquisar"
            style={{
              backgroundColor: "#D32F2F",
              height: "100%",
              padding: "0 16px",
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
            }}
          >
            <MagnifyingGlassIcon size={20} color="#fff" />
          </button>
        </div>
      </div>

      {/* Área direita: auth + carrinho */}
      <div style={{ display: "flex", gap: "12px", marginLeft: "auto", alignItems: "center" }}>
        {loading ? (
          // Espaço reservado enquanto carrega, evita layout shift
          <div style={{ width: "180px" }} />
        ) : user ? (
          // ====== USUÁRIO LOGADO ======
          <>
            {/* Ícone do carrinho */}
            <Link href="/carrinho" passHref>
              <button
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  position: "relative",
                  padding: "8px",
                }}
                title="Carrinho"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#D32F2F"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                {cartCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      backgroundColor: "#D32F2F",
                      color: "white",
                      fontSize: "10px",
                      fontWeight: "bold",
                      borderRadius: "50%",
                      width: "16px",
                      height: "16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {cartCount}
                  </span>
                )}
              </button>
            </Link>

            {/* Ícone de perfil com dropdown */}
            <div ref={menuRef} style={{ position: "relative" }}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                onMouseEnter={() => setMenuOpen(true)}
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor: "#D32F2F",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "16px",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                title="Minha conta"
              >
                {user.email?.charAt(0).toUpperCase() || "U"}
              </button>

              {menuOpen && (
                <div
                  onMouseLeave={() => setMenuOpen(false)}
                  style={{
                    position: "absolute",
                    top: "48px",
                    right: 0,
                    backgroundColor: "#fff",
                    borderRadius: "8px",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                    minWidth: "200px",
                    zIndex: 100,
                    overflow: "hidden",
                  }}
                >
                  <div style={{ padding: "12px 16px", borderBottom: "1px solid #eee" }}>
                    <p style={{ margin: 0, fontSize: "13px", color: "#999" }}>Logado como</p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "#333",
                        wordBreak: "break-all",
                      }}
                    >
                      {user.email}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      /* TODO: mudar email */
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      width: "100%",
                      textAlign: "left",
                      padding: "10px 16px",
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                      fontSize: "14px",
                      color: "#333",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f5f5f5")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                    Mudar Email
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      /* TODO: mudar senha */
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      width: "100%",
                      textAlign: "left",
                      padding: "10px 16px",
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                      fontSize: "14px",
                      color: "#333",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f5f5f5")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    Mudar Senha
                  </button>
                  <div style={{ borderTop: "1px solid #eee" }}>
                    <button
                      onClick={handleLogout}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        width: "100%",
                        textAlign: "left",
                        padding: "10px 16px",
                        border: "none",
                        background: "none",
                        cursor: "pointer",
                        fontSize: "14px",
                        color: "#D32F2F",
                        fontWeight: 600,
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fff5f5")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      Sair
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          // ====== USUÁRIO NÃO LOGADO ======
          <>
            <Link href="/login">
              <Button
                variant="outline"
                style={{
                  borderColor: "#D32F2F",
                  color: "#D32F2F",
                  backgroundColor: "transparent",
                  cursor: "pointer",
                }}
              >
                Entrar
              </Button>
            </Link>

            <Link href="/registro">
              <Button
                style={{
                  backgroundColor: "#D32F2F",
                  color: "#FFFFFF",
                  cursor: "pointer",
                }}
              >
                Cadastrar
              </Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
