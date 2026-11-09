import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import ProductSearch from './ProductSearch';
import logo from '@/assets/logo.webp';
import logoTexto from '@/assets/logo-texto.webp';
import ButtonTop from '../ButtonTop';
import UserMenu from './UserMenu';

const categorias = [
  'Notebooks', 'Processadores', 'Periféricos', 'Áudio', 'Monitores',
  'Placas de Vídeo', 'Placas Mãe', 'Memória RAM', 'Video Games',
];

export default function HeaderMedium() {
  return (
    <>
      <ButtonTop />
      <header className="fixed left-0 top-0 z-50 w-full border-b border-zinc-300 bg-transparent text-white backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-1 py-3">
          <div className="flex items-center justify-between gap-3">
            <Link href="/" aria-label="GamerStore - início" className="flex shrink-0 cursor-pointer items-center gap-2">
              <Image src={logo} alt="GamerStore" priority className="h-16 w-auto object-contain" sizes="64px" />
              <Image src={logoTexto} alt="GamerStore" priority className="h-16 w-60 object-contain" sizes="240px" />
            </Link>
            <ProductSearch variant="medium" />
            <div className="flex shrink-0 items-center gap-1">
              <UserMenu />
              <Link href="/carrinho" aria-label="Carrinho de compras" className="relative cursor-pointer p-2 hover:text-lime-500">
                <ShoppingCart size={26} />
              </Link>
            </div>
          </div>
          <nav className="mt-2 flex justify-between gap-2 text-sm font-bold text-zinc-300">
            {categorias.map((categoria) => (
              <Link
                key={categoria}
                href={`/?categoria=${encodeURIComponent(categoria)}`}
                className="cursor-pointer whitespace-nowrap transition hover:text-lime-400">
                {categoria}
              </Link>
            ))}
          </nav>
        </div>
      </header>
    </>
  );
}
