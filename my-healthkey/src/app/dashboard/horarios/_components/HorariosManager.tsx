"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Clock, FloppyDisk, CheckCircle, X } from "@phosphor-icons/react";

type DaySchedule = {
  abre: string;
  fecha: string;
  fechado: boolean;
};

type OpeningHours = {
  [key: string]: DaySchedule;
};

const DAYS_LABELS: { [key: string]: string } = {
  segunda: "Segunda-feira",
  terca: "Terça-feira",
  quarta: "Quarta-feira",
  quinta: "Quinta-feira",
  sexta: "Sexta-feira",
  sabado: "Sábado",
  domingo: "Domingo",
};

const DAYS_ORDER = ["segunda", "terca", "quarta", "quinta", "sexta", "sabado", "domingo"];

export function HorariosManager({
  pharmacyId,
  initialHours,
}: {
  pharmacyId: string;
  initialHours: OpeningHours;
}) {
  const [hours, setHours] = useState<OpeningHours>(initialHours);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const supabase = createClient();

  const handleChange = (day: string, field: keyof DaySchedule, value: string | boolean) => {
    setHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("pharmacies")
      .update({ opening_hours: hours })
      .eq("id", pharmacyId);

    setSaving(false);

    if (error) {
      alert("Erro ao salvar horários: " + error.message);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center shrink-0">
            <Clock size={22} weight="fill" className="text-red-600" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-800">Seus Horários</h3>
            <p className="text-xs sm:text-sm text-gray-400">Defina quando sua farmácia está aberta</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`w-full sm:w-auto justify-center flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-300 shadow-md ${
            saved
              ? "bg-green-600 text-white shadow-green-200"
              : "bg-red-600 hover:bg-red-700 text-white shadow-red-200"
          }`}
        >
          {saving ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Salvando...
            </>
          ) : saved ? (
            <>
              <CheckCircle size={20} weight="fill" />
              Salvo
            </>
          ) : (
            <>
              <FloppyDisk size={20} weight="bold" />
              Salvar Horários
            </>
          )}
        </button>
      </div>

      {/* Tabela de Dias */}
      <div className="divide-y divide-gray-100">
        {DAYS_ORDER.map((dayKey) => {
          const day = hours[dayKey] || { abre: "08:00", fecha: "18:00", fechado: false };
          const label = DAYS_LABELS[dayKey];
          const isClosed = day.fechado;

          return (
            <div
              key={dayKey}
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-6 py-4 sm:py-5 transition-colors duration-300 ${
                isClosed ? "bg-gray-50/80" : "hover:bg-gray-50/40"
              }`}
            >
              {/* Header do dia (No mobile: nome + toggle lado a lado) */}
              <div className="flex items-center justify-between sm:w-40">
                <span
                  className={`font-semibold text-sm sm:text-base ${
                    isClosed ? "text-gray-400 line-through" : "text-gray-800"
                  }`}
                >
                  {label}
                </span>

                {/* Toggle mobile */}
                <div className="flex sm:hidden items-center gap-2">
                  <span className="text-xs text-gray-500 font-medium">
                    {isClosed ? "Fechado" : "Aberto"}
                  </span>
                  <button
                    onClick={() => handleChange(dayKey, "fechado", !isClosed)}
                    className={`relative w-11 h-6 rounded-full transition-all duration-300 ${
                      isClosed ? "bg-gray-300" : "bg-green-500"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${
                        isClosed ? "left-0.5" : "left-[1.375rem]"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Horários */}
              <div className="flex items-center gap-3 sm:gap-4 flex-1 justify-start sm:justify-center">
                {!isClosed ? (
                  <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                    <div className="flex-1 sm:flex-initial flex flex-col items-start sm:items-center gap-1">
                      <span className="text-[10px] sm:text-xs text-gray-400 font-medium uppercase tracking-wider">Abre</span>
                      <input
                        type="time"
                        value={day.abre}
                        onChange={(e) => handleChange(dayKey, "abre", e.target.value)}
                        className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-sm font-medium focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all hover:border-gray-300"
                      />
                    </div>
                    <span className="text-gray-300 font-light text-xl mt-4 sm:mt-5">—</span>
                    <div className="flex-1 sm:flex-initial flex flex-col items-start sm:items-center gap-1">
                      <span className="text-[10px] sm:text-xs text-gray-400 font-medium uppercase tracking-wider">Fecha</span>
                      <input
                        type="time"
                        value={day.fecha}
                        onChange={(e) => handleChange(dayKey, "fecha", e.target.value)}
                        className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-sm font-medium focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all hover:border-gray-300"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-xl text-xs sm:text-sm">
                    <X size={14} className="text-gray-400" />
                    <span className="text-gray-500 font-medium">Fechado o dia todo</span>
                  </div>
                )}
              </div>

              {/* Toggle desktop */}
              <div className="hidden sm:flex items-center gap-3 w-36 justify-end">
                <span className="text-sm text-gray-500 font-medium">
                  {isClosed ? "Fechado" : "Aberto"}
                </span>
                <button
                  onClick={() => handleChange(dayKey, "fechado", !isClosed)}
                  className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
                    isClosed ? "bg-gray-300" : "bg-green-500"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${
                      isClosed ? "left-0.5" : "left-[1.625rem]"
                    }`}
                  />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
