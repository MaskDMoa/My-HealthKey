"use client";

import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { CalendarBlank, TrendUp } from "@phosphor-icons/react";

type SearchLog = {
  term: string;
  created_at: string;
};

export function SearchAnalytics({ initialLogs }: { initialLogs: SearchLog[] }) {
  const [period, setPeriod] = useState<"7d" | "30d" | "all">("all");

  const chartData = useMemo(() => {
    // Apenas dados reais do banco de dados (search_logs)
    const logsToProcess = initialLogs;

    const now = new Date();
    const filteredLogs = logsToProcess.filter((log) => {
      if (period === "all") return true;
      const logDate = new Date(log.created_at);
      const diffTime = Math.abs(now.getTime() - logDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      
      if (period === "7d") return diffDays <= 7;
      if (period === "30d") return diffDays <= 30;
      return true;
    });

    const counts: Record<string, number> = {};
    filteredLogs.forEach(log => {
      // Normalizar termo (primeira letra maiuscula)
      if (!log.term) return;
      const term = log.term.charAt(0).toUpperCase() + log.term.slice(1).toLowerCase();
      counts[term] = (counts[term] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, buscas]) => ({ name, buscas }))
      .sort((a, b) => b.buscas - a.buscas)
      .slice(0, 10); // Top 10
  }, [initialLogs, period]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900/90 text-white backdrop-blur-md px-4 py-3 rounded-xl border border-gray-700 shadow-xl">
          <p className="font-semibold mb-1">{label}</p>
          <p className="text-red-400 font-bold flex items-center gap-2">
            <TrendUp weight="bold" />
            {payload[0].value} buscas
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
          <TrendUp size={24} className="text-red-600" />
          Top Medicamentos Buscados
        </h3>
        
        <div className="flex flex-wrap bg-gray-50 p-1 rounded-xl border border-gray-200 w-full sm:w-auto">
          <button
            onClick={() => setPeriod("7d")}
            className={`flex-1 sm:flex-initial px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${period === "7d" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
          >
            7 Dias
          </button>
          <button
            onClick={() => setPeriod("30d")}
            className={`flex-1 sm:flex-initial px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${period === "30d" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
          >
            30 Dias
          </button>
          <button
            onClick={() => setPeriod("all")}
            className={`flex-1 sm:flex-initial px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${period === "all" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
          >
            Todo o período
          </button>
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="h-80 flex flex-col items-center justify-center text-gray-400">
          <CalendarBlank size={48} className="mb-4 opacity-50" />
          <p>Nenhuma busca registrada neste período.</p>
        </div>
      ) : (
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 12, left: -16, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
                dy={16}
                angle={-45}
                textAnchor="end"
              />
              <YAxis 
                axisLine={false} 
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
              />
              <Tooltip cursor={{ fill: '#f8fafc' }} content={<CustomTooltip />} />
              <Bar dataKey="buscas" radius={[6, 6, 0, 0]} animationDuration={1000}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? "#ef4444" : "#fca5a5"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
