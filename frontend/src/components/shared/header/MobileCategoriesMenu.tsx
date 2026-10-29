
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import logo from '@/assets/logo.webp';
import logoTexto from '@/assets/logo-texto.webp';

const categorias = [
  'Notebooks', 'Processadores', 'Periféricos', 'Áudio', 'Monitores',
  'Placas de Vídeo', 'Placas Mãe', 'Memória RAM', 'Video Games',
];

export default function MobileCategoriesMenu() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setMenuOpen(true)}
        aria-label="Abrir menu"
        aria-expanded={menuOpen}
        className="cursor-pointer p-1"
      >
        <Menu size={26} />
      </button>

      {menuOpen && (
        <>
          <button
            type="button"
            aria-label="Fechar menu de categorias"
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 z-[60] cursor-pointer bg-black/90"
          />

          <aside className="fixed inset-0 z-[70] flex h-screen w-full flex-col overflow-y-auto bg-black text-white">
            <div className="flex items-center justify-between border-b border-zinc-800 p-4">
              <span className="font-semibold">Categorias</span>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Fechar menu"
                className="cursor-pointer"
              >
                <X size={22} />
              </button>
            </div>

            <nav className="flex flex-col px-4 py-2">
              {categorias.map((categoria) => (
                <Link
                  key={categoria}
                  href={`/?categoria=${encodeURIComponent(categoria)}`}
                  onClick={() => setMenuOpen(false)}
                  className="cursor-pointer border-b border-zinc-800 py-3 transition hover:bg-zinc-800"
                >
                  {categoria}
                </Link>
              ))}
            </nav>

            <Link
              href="/"
              aria-label="GamerStore - início"
              onClick={() => setMenuOpen(false)}
              className="mt-20 flex items-center justify-center gap-3 px-4 pb-6"
            >
              <Image
                src={logo}
                alt="GamerStore"
                priority
                className="h-14 w-14 shrink-0 object-contain"
                sizes="56px"
              />
              <Image
                src={logoTexto}
                alt="GamerStore"
                priority
                className="h-12 w-auto max-w-[75%] object-contain"
                sizes="240px"
              />
            </Link>
          </aside>
        </>
      )}
    </>
  );
}
