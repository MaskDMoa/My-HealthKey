"use client";
import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { createClient } from "@/lib/supabase/client";

interface Farmacia {
  id: string;
  nome: string;
  lat: number;
  lon: number;
  preco: number;
  endereco?: string;
}

interface FarmaciaComDistancia extends Farmacia {
  distancia: number;
}

interface MapaFarmaciasProps {
  medicamentoId: string;
  nomeMedicamento: string;
  onSelectPharmacy?: (f: Farmacia) => void;
}

type Status = "loading" | "ok" | "empty" | "error";

const FALLBACK_ORIGIN = { lat: -22.2158, lng: -45.7028 }; // Centro de Santa Rita do Sapucaí, MG

const userIcon = L.divIcon({
  className: "",
  html: `<div style="width:16px;height:16px;background:#1a1a1a;border:3px solid white;border-radius:50%;box-shadow:0 2px 5px rgba(0,0,0,.3);"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

function pharmacyIcon(isBest: boolean) {
  const bg = isBest ? "#2e8b57" : "#d64545";
  return L.divIcon({
    className: "",
    html: `<div style="width:24px;height:24px;background:${bg};border:2px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 5px rgba(0,0,0,.3);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24],
  });
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(m: number): string {
  return m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`;
}

function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 14);
  }, [lat, lng, map]);
  return null;
}

// Captura a instância do mapa numa ref externa, pra podermos chamar
function MapRefSetter({ mapRef }: { mapRef: React.MutableRefObject<L.Map | null> }) {
  const map = useMap();
  useEffect(() => {
    mapRef.current = map;
  }, [map, mapRef]);
  return null;
}

export default function MapaFarmacias({ medicamentoId, nomeMedicamento, onSelectPharmacy }: MapaFarmaciasProps) {
  const [origin, setOrigin] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLabel, setLocationLabel] = useState("Localizando você…");
  const [pharmacies, setPharmacies] = useState<FarmaciaComDistancia[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [sortMode, setSortMode] = useState<"price" | "distance">("price");
  const [activeId, setActiveId] = useState<string | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRefs = useRef<Record<string, L.Marker | null>>({});

  // 1. Localização do usuário
  useEffect(() => {
    if (!navigator.geolocation) {
      setOrigin(FALLBACK_ORIGIN);
      setLocationLabel("Localização não suportada · mostrando região central");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setOrigin({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationLabel("Usando sua localização atual");
      },
      () => {
        setOrigin(FALLBACK_ORIGIN);
        setLocationLabel("Permissão de localização negada · mostrando região central");
      }
    );
  }, []);

  // 2. Busca farmácias que têm ESSE medicamento em estoque, com preço.
  useEffect(() => {
    if (!origin) return;

    async function fetchFarmacias() {
      setStatus("loading");
      try {
        const supabase = createClient();
        // Busca no Supabase as farmácias que têm esse medicamento
        const { data: rawData, error } = await supabase
          .from("pharmacy_medicines")
          .select(`
            price,
            pharmacies (
              id,
              name,
              address,
              latitude,
              longitude
            )
          `)
          .eq("medicine_id", medicamentoId)
          .eq("is_available", true);

        if (error) {
          console.error("Erro ao buscar no Supabase:", error);
          throw error;
        }

        const data: Farmacia[] = (rawData || []).map((row: any) => ({
          id: row.pharmacies.id,
          nome: row.pharmacies.name,
          endereco: row.pharmacies.address,
          lat: row.pharmacies.latitude,
          lon: row.pharmacies.longitude,
          preco: Number(row.price),
        }));

        const comDistancia: FarmaciaComDistancia[] = data.map((f) => ({
          ...f,
          distancia: haversine(origin!.lat, origin!.lng, f.lat, f.lon),
        }));

        setPharmacies(comDistancia);
        setStatus(comDistancia.length === 0 ? "empty" : "ok");

        // Auto-selecionar a mais barata
        if (comDistancia.length > 0) {
          const cheapest = [...comDistancia].sort((a, b) => a.preco - b.preco)[0];
          setActiveId(cheapest.id);
          if (onSelectPharmacy) onSelectPharmacy(cheapest);
        }

      } catch {
        setStatus("error");
      }
    }

    fetchFarmacias();
  }, [origin, medicamentoId, onSelectPharmacy]);

  if (!origin) {
    return <div className="text-sm text-neutral-500 py-6 text-center">{locationLabel}</div>;
  }

  const sorted = [...pharmacies].sort((a, b) =>
    sortMode === "price" ? a.preco - b.preco : a.distancia - b.distancia
  );
  const bestId = pharmacies.length > 0 ? [...pharmacies].sort((a, b) => a.preco - b.preco)[0].id : null;
  const maxPrice = pharmacies.length > 0 ? Math.max(...pharmacies.map((p) => p.preco)) : 0;

  // Ao clicar numa farmácia da lista: move o mapa até ela e abre o popup
  function focarFarmacia(f: FarmaciaComDistancia) {
    setActiveId(f.id);
    mapRef.current?.setView([f.lat, f.lon], 17, { animate: true });
    markerRefs.current[f.id]?.openPopup();
    if (onSelectPharmacy) onSelectPharmacy(f);
  }

  // Botão "centralizar em mim": volta o mapa pra localização do usuário
  function centralizarEmMim() {
    if (!origin) return;
    setActiveId(null);
    mapRef.current?.setView([origin.lat, origin.lng], 14, { animate: true });
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
        <h3 className="text-lg font-bold flex items-center gap-2">
          📍 Farmácias com {nomeMedicamento} perto de você
        </h3>
        <div className="flex gap-1 bg-neutral-100 rounded-lg p-1">
          <button
            onClick={() => setSortMode("price")}
            className={`text-xs font-semibold px-3 py-1.5 rounded-md ${
              sortMode === "price" ? "bg-white shadow-sm" : "text-neutral-500"
            }`}
          >
            Menor preço
          </button>
          <button
            onClick={() => setSortMode("distance")}
            className={`text-xs font-semibold px-3 py-1.5 rounded-md ${
              sortMode === "distance" ? "bg-white shadow-sm" : "text-neutral-500"
            }`}
          >
            Mais perto
          </button>
        </div>
      </div>
      <p className="text-xs text-neutral-500 mb-4">{locationLabel}</p>

      <div className="relative isolate z-0">
        <MapContainer
          center={[origin.lat, origin.lng]}
          zoom={14}
          style={{ height: "260px", width: "100%", borderRadius: "12px" }}
          scrollWheelZoom={false}
        >
          <MapRefSetter mapRef={mapRef} />
          <RecenterMap lat={origin.lat} lng={origin.lng} />
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          <Marker position={[origin.lat, origin.lng]} icon={userIcon}>
            <Popup>Você está aqui</Popup>
          </Marker>
          {sorted.map((f) => (
            <Marker
              key={f.id}
              position={[f.lat, f.lon]}
              icon={pharmacyIcon(f.id === bestId)}
              ref={(m) => {
                markerRefs.current[f.id] = m;
              }}
            >
              <Popup>
                <strong>{f.nome}</strong>
                <br />
                R$ {f.preco.toFixed(2)}
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        <button
          onClick={centralizarEmMim}
          title="Centralizar na minha localização"
          className="absolute bottom-2.5 left-2.5 z-[1000] bg-white border border-neutral-200 shadow-md rounded-lg px-3 py-2 text-xs font-semibold flex items-center gap-1.5 hover:bg-neutral-50"
        >
          📍 Centralizar em mim
        </button>
      </div>

      {status === "loading" && (
        <div className="text-sm text-neutral-500 text-center py-6">Carregando farmácias…</div>
      )}
      {status === "empty" && (
        <div className="text-sm text-neutral-500 text-center py-6">
          Nenhuma farmácia com esse medicamento encontrada perto de você.
        </div>
      )}
      {status === "error" && (
        <div className="text-sm text-neutral-500 text-center py-6">
          Não foi possível carregar as farmácias agora. Tente novamente.
        </div>
      )}

      {status === "ok" && (
        <div className="relative">
          <div className="flex flex-col gap-2.5 mt-4 max-h-[400px] overflow-y-auto pr-1">
            {sorted.map((f, i) => {
              const isBest = f.id === bestId;
              const savings = maxPrice - f.preco;
              return (
                <div
                  key={f.id}
                  onClick={() => focarFarmacia(f)}
                  className={`relative flex items-center gap-3.5 p-3.5 border rounded-xl cursor-pointer transition-colors ${
                    activeId === f.id ? "border-red-400 bg-red-50" : "border-neutral-200"
                  }`}
                >
                  {isBest && (
                    <span className="absolute -top-2 left-3.5 bg-emerald-600 text-white text-[9.5px] font-bold px-2 py-0.5 rounded-full">
                      MELHOR PREÇO
                    </span>
                  )}
                  <span className="text-sm text-neutral-400 w-4">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm truncate">{f.nome}</div>
                    <div className="text-xs text-neutral-500 mt-0.5">📍 {formatDistance(f.distancia)}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-lg font-bold text-red-500">R$ {f.preco.toFixed(2)}</div>
                    {savings > 0 && (
                      <div className="text-[10.5px] text-emerald-600 font-semibold">
                        economize R$ {savings.toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {sorted.length > 5 && (
            <div className="pointer-events-none absolute bottom-0 left-0 right-1 h-8 bg-gradient-to-t from-white to-transparent rounded-b-xl" />
          )}
        </div>
      )}
    </div>
  );
}
