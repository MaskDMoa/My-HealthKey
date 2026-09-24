import { redirect } from "next/navigation";

export default async function BuscarPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  if (q) {
    redirect(`/busca?q=${encodeURIComponent(q)}`);
  }
  redirect("/busca");
}
