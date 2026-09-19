"use client";
import { AppleLogoIcon, GooglePlayLogoIcon } from "@phosphor-icons/react";

export function Footer() {
  return (
    <section
      style={{ background: "#1E1E1E" }}
      className="py-4 text-white border-t border-red-500/20"
    >
      <div className="container mx-auto px-4 max-w-7xl">
        <footer>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-4 mt-5">
            <div className="flex flex-col items-start">
              <h3 className="text-xl font-bold mb-3 text-red-500">
                My-HealthKey
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed text-justify">
                A sua chave para uma saúde mais acessível. Comparamos preços de
                medicamentos em tempo real nas melhores drogarias da sua região
                para garantir economia e transparência.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <h3 className="text-xl font-bold mb-3">Institucional</h3>
              <ul className="text-xs text-gray-300 flex flex-col gap-2">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Drogarias parceiras
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Políticas de privacidade
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Termos de uso
                  </a>
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-3">
              <h3 className="text-xl font-bold mb-3">Contatos</h3>
              <ul className="text-xs text-gray-300 flex flex-col gap-2">
                <li>Email: suporte@myhealthkey.com</li>
                <li>Telefone: (xx) xxxxx-xxxx</li>
              </ul>
            </div>

            <div className="flex flex-col gap-3">
              <h3 className="text-xl font-bold mb-3">Acessar via Celular</h3>
              <div className="flex flex-col gap-2 w-full">
                <button className="bg-white text-black text-xs font-semibold py-2.5 px-4 rounded-md shadow flex items-center justify-center gap-2 hover:bg-gray-100 transition w-full">
                  <AppleLogoIcon size={18} weight="fill" />
                  Disponível na AppleStore
                </button>
                <button className="bg-white text-black text-xs font-semibold py-2.5 px-4 rounded-md shadow flex items-center justify-center gap-2 hover:bg-gray-100 transition w-full">
                  <GooglePlayLogoIcon size={18} weight="fill" />
                  Baixe no Google Play
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 my-4 w-full" />

          <div className="w-full text-[11px] text-gray-400 text-center leading-relaxed flex flex-col gap-2">
            <p className="max-w-4xl mx-auto">
              As informações contidas neste site não devem ser usadas para
              automedicação e não substituem, em hipótese alguma, as orientações
              dadas pelo profissional da área médica.
            </p>
            <p className="text-gray-500 font-semibold">
              © 2026 My-HealthKey. Todos os direitos reservados.
            </p>
          </div>
        </footer>
      </div>
    </section>
  );
}
