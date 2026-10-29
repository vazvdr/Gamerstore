import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Search } from 'lucide-react';
import ButtonTop from '../ButtonTop';
import UserMenu from './UserMenu';
import logo from '@/assets/logo.webp';
import logoTexto from '@/assets/logo-texto.webp';

const categorias = [
  'Notebooks', 'Processadores', 'Periféricos', 'Áudio', 'Monitores',
  'Placas de Vídeo', 'Placas Mãe', 'Memória RAM', 'Video Games',
];

export default function HeaderDesktop() {
  return (
    <>
      <ButtonTop />
      <header className="fixed left-0 top-0 z-50 w-full border-b border-zinc-300 bg-transparent text-white backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-2 py-3">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" aria-label="GamerStore - início" className="flex shrink-0 cursor-pointer items-center gap-2">
              <Image src={logo} alt="GamerStore" priority className="h-14 w-auto object-contain" sizes="56px" />
              <Image src={logoTexto} alt="GamerStore" priority className="h-5 w-[220px] object-contain" sizes="220px" />
            </Link>
            <nav className="flex flex-1 flex-wrap justify-center gap-x-4 gap-y-1 px-2 font-bold text-zinc-300">
              {categorias.map((categoria) => (
                <Link
                  key={categoria}
                  href={`/?categoria=${encodeURIComponent(categoria)}`}
                  className="cursor-pointer whitespace-nowrap transition hover:text-lime-400">
                  {categoria}
                </Link>
              ))}
            </nav>
            <div className="flex shrink-0 items-center gap-1">
              <div className="flex">
                <input
                  placeholder="Buscar produtos..."
                  aria-label="Buscar produtos"
                  className="w-44 rounded-bl-md border-b border-l border-lime-400 bg-transparent px-3 py-2 text-lg outline-none placeholder:text-zinc-400"/>
                <button type="button" aria-label="Buscar" className="cursor-pointer border-b border-lime-400 px-2">
                  <Search size={18} />
                </button>
              </div>
              <UserMenu />
              <Link href="/carrinho" aria-label="Carrinho de compras" className="relative cursor-pointer p-2 hover:text-lime-500">
                <ShoppingCart size={26} />
              </Link>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
