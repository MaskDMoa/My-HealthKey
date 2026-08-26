
export interface FarmaciaMock {
  id: string;
  nome: string;
  endereco: string;
  lat: number;
  lon: number;
}

export const farmaciasSantaRita: FarmaciaMock[] = [
  {
    id: "f1",
    nome: "Ultra Popular",
    endereco: "Avenida Rio Branco, 67, Centro, Santa Rita do Sapucaí, MG",
    lat: -22.2507792,
    lon: -45.704918,
  },
  {
    id: "f2",
    nome: "Drogaria Santa Rita",
    endereco: "Rua Silvestre Ferraz, 234, Centro, Santa Rita do Sapucaí, MG",
    lat: -22.2517136,
    lon: -45.7071546,
  },
  {
    id: "f3",
    nome: "Drogaria Economize",
    endereco: "Rua Silvestre Ferraz, 68, Centro, Santa Rita do Sapucaí, MG",
    lat: -22.2517136,
    lon: -45.7071546,
  },
  {
    id: "f4",
    nome: "Farmácia de Manipulação Central",
    endereco: "Avenida Antônio Paulino, 50, Centro, Santa Rita do Sapucaí, MG",
    lat: -22.2545488,
    lon: -45.703092,
  },
  {
    id: "f5",
    nome: "Drogaria Francisco Palma",
    endereco: "Rua Francisco Palma, 196, Centro, Santa Rita do Sapucaí, MG",
    lat: -22.2531869,
    lon: -45.7021729,
  },
  {
    id: "f6",
    nome: "Natus Farma",
    endereco: "Rua Comendador Custódio Ribeiro, 224, Centro, Santa Rita do Sapucaí, MG",
    lat: -22.2491574,
    lon: -45.7040712,
  },
  {
    id: "f7",
    nome: "Drogaria Carvalho",
    endereco: "Avenida Antônio Paulino, 50, Centro, Santa Rita do Sapucaí, MG",
    lat: -22.2545488,
    lon: -45.703092,
  },
];

const precosPorMedicamento: Record<string, Record<string, number>> = {
  "1": { f1: 10.9, f2: 12.9, f3: 11.5, f4: 9.9, f5: 13.9, f6: 12.2, f7: 11.9, f8: 10.5 },
  "2": { f1: 19.9, f2: 18.5, f3: 17.9, f4: 20.5, f6: 18, f7: 17.5, f8: 19.2 },
  "3": { f1: 8.9, f2: 9.5, f3: 8.5, f4: 7.9, f5: 9.9, f6: 8.7, f7: 8.3, f8: 8.1 },
};

export function getFarmaciasComPreco(medicamentoId: string) {
  const precos = precosPorMedicamento[medicamentoId] ?? {};
  return farmaciasSantaRita
    .filter((f) => precos[f.id] !== undefined)
    .map((f) => ({
      id: f.id,
      nome: f.nome,
      endereco: f.endereco,
      lat: f.lat,
      lon: f.lon,
      preco: precos[f.id],
    }));
}
