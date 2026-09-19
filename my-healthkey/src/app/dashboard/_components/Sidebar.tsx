"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, ChartLineUp, SignOut, Storefront, ArrowSquareOut, Clock } from "@phosphor-icons/react";

export function Sidebar({ pharmacyId }: { pharmacyId?: string }) {
  const pathname = usePathname();

  const menuItems = [
    { name: "Estoque", path: "/dashboard/estoque", icon: Package },
    { name: "Horários", path: "/dashboard/horarios", icon: Clock },
    { name: "Estatísticas", path: "/dashboard/analytics", icon: ChartLineUp },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col justify-between hidden md:flex shrink-0">
      <div>
        <Link href="/" className="h-20 flex items-center px-6 border-b border-gray-50 hover:bg-gray-50 transition-colors">
          <div className="flex flex-col items-center relative w-full pt-2">
            <img src="/Logo.png" alt="Logo" className="h-12 w-auto" />
            <h1 className="m-0 text-[10px] text-[#D32F2F] font-bold absolute bottom-0 left-1/2 -translate-x-1/2 bg-white px-2 whitespace-nowrap">
              My-HealthKey
            </h1>
          </div>
        </Link>

        <nav className="p-4 space-y-2 mt-4">
          {menuItems.map((item) => {
            const isActive = pathname.startsWith(item.path);
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                  isActive
                    ? "bg-red-50 text-red-700 shadow-sm shadow-red-100/50"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon
                  size={22}
                  weight={isActive ? "fill" : "regular"}
                  className={`transition-transform duration-300 group-hover:scale-110 ${
                    isActive ? "text-red-600" : "text-gray-400 group-hover:text-gray-600"
                  }`}
                />
                <span className={`font-medium ${isActive ? "font-semibold" : ""}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-gray-50 space-y-2">
        {pharmacyId && (
          <Link
            href={`/farmacia/${pharmacyId}`}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-all duration-300 group"
            target="_blank"
          >
            <ArrowSquareOut
              size={22}
              className="text-gray-400 group-hover:text-blue-500 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
            />
            <span className="font-medium">Ver Minha Loja</span>
          </Link>
        )}
        <button
          onClick={async () => {
             // In a real app we would call supabase.auth.signOut() here and redirect
             window.location.href = '/login'; 
          }}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-300 group"
        >
          <SignOut
            size={22}
            className="text-gray-400 group-hover:text-red-500 transition-transform duration-300 group-hover:-translate-x-1"
          />
          <span className="font-medium">Sair</span>
        </button>
      </div>
    </aside>
  );
}
