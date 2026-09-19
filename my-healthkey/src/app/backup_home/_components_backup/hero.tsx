import Image from "next/image";

export function Hero() {
  return (
    <section
      style={{ backgroundColor: "#C62828" }} 
      className="text-white relative overflow-hidden"
    >
      <div className="container mx-auto py-2 px-6">
        <article className="flex flex-col lg:flex-row items-center justify-start gap-12">
          <div>
            <Image
              src="/Paracetamol.png"
              alt="Paracetamol"
              width={242}
              height={242}
            />
          </div>
          <div className="max-w-3xl">
            <p className="text-3xl font-normal leading-10">
              Procure os remedios mais baratos perto de vocẽ, sempre presando
              pela sua saude e seu tempo.
            </p>
          </div>
        </article>
      </div>
    </section>
  );
}
