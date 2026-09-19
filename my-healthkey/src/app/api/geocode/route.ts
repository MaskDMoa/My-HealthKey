import { NextRequest, NextResponse } from "next/server";

/**
 * Tenta parsear um endereço brasileiro em componentes.
 * Formatos suportados:
 *   "Rua X, 123, Bairro - Cidade/UF"
 *   "Rua X, 123 - Bairro, Cidade - UF"
 *   "SILVESTRE FERRAZ, 114, CENTRO - SANTA RITA DO SAPUCAI/MG"
 */
function parseEnderecoBR(raw: string) {
  // Normaliza: remove espaços duplos
  let addr = raw.trim().replace(/\s+/g, " ");

  let street = "";
  let city = "";
  let state = "";

  // Tenta extrair UF no final: /MG, -MG, , MG
  const ufMatch = addr.match(/[\/\-,]\s*([A-Za-z]{2})\s*$/);
  if (ufMatch) {
    state = ufMatch[1].toUpperCase();
    addr = addr.slice(0, ufMatch.index).trim();
  }

  // Tenta separar por " - " (padrão: "Rua, Num, Bairro - Cidade")
  const dashParts = addr.split(/\s*-\s*/);
  if (dashParts.length >= 2) {
    // Última parte após o último "-" é a cidade
    city = dashParts[dashParts.length - 1].trim();
    // Tudo antes é rua + número + bairro
    const streetParts = dashParts.slice(0, -1).join(", ").trim();
    
    // Da parte da rua, pega "Rua X, Num" (primeiras 2 partes separadas por vírgula)
    const commaParts = streetParts.split(/\s*,\s*/);
    if (commaParts.length >= 2) {
      // "Rua X" + "Num"
      street = `${commaParts[0]}, ${commaParts[1]}`;
    } else {
      street = streetParts;
    }
  } else {
    // Sem traço, tenta separar apenas por vírgula
    const commaParts = addr.split(/\s*,\s*/);
    if (commaParts.length >= 3) {
      // Último = cidade, primeiros = rua
      city = commaParts[commaParts.length - 1].trim();
      street = commaParts.slice(0, -1).join(", ").trim();
    } else {
      // Não conseguiu parsear, usa tudo como query livre
      street = addr;
    }
  }

  return { street, city, state };
}

async function geocodeStructured(street: string, city: string, state: string) {
  const params = new URLSearchParams({
    format: "json",
    limit: "1",
    countrycodes: "br",
  });
  if (street) params.set("street", street);
  if (city) params.set("city", city);
  if (state) params.set("state", state);

  const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "MyHealthKey-App/1.0" },
  });

  if (!res.ok) return null;
  const data = await res.json();
  return data.length > 0 ? data[0] : null;
}

async function geocodeFreeform(endereco: string) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=br&q=${encodeURIComponent(endereco)}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "MyHealthKey-App/1.0" },
  });

  if (!res.ok) return null;
  const data = await res.json();
  return data.length > 0 ? data[0] : null;
}

export async function GET(request: NextRequest) {
  const endereco = request.nextUrl.searchParams.get("endereco");

  if (!endereco || endereco.trim().length < 5) {
    return NextResponse.json(
      { encontrado: false, erro: "Endereço muito curto ou vazio." },
      { status: 400 }
    );
  }

  try {
    // 1. Tenta busca estruturada (mais precisa)
    const { street, city, state } = parseEnderecoBR(endereco);
    let result = await geocodeStructured(street, city, state);

    // 2. Fallback: busca livre se a estruturada não encontrou
    if (!result) {
      result = await geocodeFreeform(endereco);
    }

    if (!result) {
      return NextResponse.json({
        encontrado: false,
        erro: "Endereço não encontrado. Tente ser mais específico (rua, número, cidade).",
      });
    }

    return NextResponse.json({
      encontrado: true,
      lat: parseFloat(result.lat),
      lon: parseFloat(result.lon),
      enderecoCompleto: result.display_name,
    });
  } catch (e) {
    return NextResponse.json(
      { encontrado: false, erro: "Erro ao consultar o serviço de geocoding." },
      { status: 500 }
    );
  }
}

