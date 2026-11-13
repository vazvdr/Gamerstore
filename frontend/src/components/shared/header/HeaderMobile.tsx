import Image from 'next/image';
import Link from 'next/link';
import ProductSearch from './ProductSearch';
import ButtonTop from '../ButtonTop';
import UserMenu from './UserMenu';
import MobileCategoriesMenu from './MobileCategoriesMenu';
import IconeCarrinho from './IconeCarrinho';
import logo from '@/assets/logo.webp';

export default function HeaderMobile() {
  return (
    <>
      <ButtonTop />
      <header className="fixed left-0 top-0 z-50 w-full bg-transparent text-white backdrop-blur-lg">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/"
              aria-label="GamerStore - início"
              className="flex shrink-0 cursor-pointer items-center gap-2">
              <Image
                src={logo}
                alt="GamerStore"
                priority
                className="h-14 w-14"
                sizes="56px"/>
            </Link>
            <div className="flex items-center gap-1">
              <UserMenu />
              <IconeCarrinho />
              <MobileCategoriesMenu />
            </div>
          </div>
          <div className="my-2 h-0.5 w-full rounded-full bg-lime-400" />
          <ProductSearch variant="mobile" />
        </div>
      </header>
    </>
  );
}
