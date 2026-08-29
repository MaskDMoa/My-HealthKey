"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";

export function Header() {
  const router = useRouter();
  const [termo, setTermo] = useState("");

  const handleLogoClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
    router.push("/");
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
        <img
          src="/Logo.png"
          alt="Logo"
          style={{ height: "80px", width: "auto" }}
        />
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

      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
        }}
      >
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

      <div style={{ display: "flex", gap: "12px", marginLeft: "auto" }}>
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
      </div>
    </div>
  );
}
