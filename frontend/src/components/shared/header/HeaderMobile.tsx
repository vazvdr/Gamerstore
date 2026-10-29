
import Image from 'next/image';
import Link from 'next/link';
import { Search, ShoppingCart } from 'lucide-react';
import ButtonTop from '../ButtonTop';
import UserMenu from './UserMenu';
import MobileCategoriesMenu from './MobileCategoriesMenu';
import logo from '@/assets/logo.webp';

export default function HeaderMobile() {
  return (
    <>
      <ButtonTop />
      <header className="fixed left-0 top-0 z-50 w-full bg-transparent text-white backdrop-blur-lg">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" aria-label="GamerStore - início" className="flex shrink-0 cursor-pointer items-center gap-2">
              <Image src={logo} alt="GamerStore" priority className="h-14 w-14" sizes="56px" />
            </Link>

            <div className="flex items-center gap-1">
              <UserMenu />

              <Link href="/carrinho" aria-label="Carrinho de compras" className="relative p-2 hover:text-lime-500">
                <ShoppingCart size={30} />
              </Link>

              <MobileCategoriesMenu />
            </div>
          </div>

          <div className="my-2 h-0.5 w-full rounded-full bg-lime-400" />

          <div className="flex">
            <input
              placeholder="Buscar produtos..."
              aria-label="Buscar produtos"
              className="flex-1 border-b border-lime-400 bg-transparent px-4 py-2 text-white outline-none placeholder:text-zinc-400"
            />
            <button type="button" aria-label="Buscar" className="cursor-pointer border-b border-lime-400 px-3">
              <Search size={18} />
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
