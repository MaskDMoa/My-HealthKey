import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const endereco = request.nextUrl.searchParams.get("endereco");

  if (!endereco || endereco.trim().length < 5) {
    return NextResponse.json(
      { encontrado: false, erro: "Endereço muito curto ou vazio." },
      { status: 400 }
    );
  }

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=br&q=${encodeURIComponent(
      endereco
    )}`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "MyHealthKey-App/1.0",
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { encontrado: false, erro: `Erro na Nominatim: HTTP ${res.status}` },
        { status: 502 }
      );
    }

    const data = await res.json();

    if (!data.length) {
      return NextResponse.json({
        encontrado: false,
        erro: "Endereço não encontrado. Tente ser mais específico (rua, número, cidade).",
      });
    }

    return NextResponse.json({
      encontrado: true,
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon),
      enderecoCompleto: data[0].display_name,
    });
  } catch (e) {
    return NextResponse.json(
      { encontrado: false, erro: "Erro ao consultar o serviço de geocoding." },
      { status: 500 }
    );
  }
}
