import Image from 'next/image';
import Link from 'next/link';
import ProductSearch from './ProductSearch';
import logo from '@/assets/logo.webp';
import logoTexto from '@/assets/logo-texto.webp';
import ButtonTop from '../ButtonTop';
import UserMenu from './UserMenu';
import IconeCarrinho from './IconeCarrinho';
import { categorias } from '@/constants/categorias';

export default function HeaderMedium() {
  return (
    <>
      <ButtonTop />
      <header className="fixed left-0 top-0 z-50 w-full border-b border-zinc-300 bg-transparent text-white backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-1 py-3">
          <div className="flex items-center justify-between gap-3">
            <Link
              href="/"
              aria-label="GamerStore - início"
              className="flex shrink-0 cursor-pointer items-center gap-2">
              <Image
                src={logo}
                alt="GamerStore"
                priority
                className="h-16 w-auto object-contain"
                sizes="64px"/>
              <Image
                src={logoTexto}
                alt="GamerStore"
                priority
                className="h-16 w-60 object-contain"
                sizes="240px"/>
            </Link>
            <ProductSearch variant="medium" />
            <div className="flex shrink-0 items-center gap-1">
              <UserMenu />
              <IconeCarrinho />
            </div>
          </div>
          <nav className="mt-2 flex justify-between gap-2 text-sm font-bold text-zinc-300">
            {categorias.map((categoria) => (
              <Link
                key={categoria.nome}
                href={`/?categoria=${encodeURIComponent(categoria.nome)}`}
                className="cursor-pointer whitespace-nowrap transition hover:text-lime-400">
                {categoria.nome}
              </Link>
            ))}
          </nav>
        </div>
      </header>
    </>
  );
}
