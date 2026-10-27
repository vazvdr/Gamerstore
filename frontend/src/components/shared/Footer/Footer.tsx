import Image from 'next/image';
import Link from 'next/link';
import logo from '@/assets/logo.webp';
import logoTexto from '@/assets/logo-texto.webp';

export default function Footer() {
    return (
        <footer className="w-full border-t border-zinc-300 bg-gradient-to-r from-zinc-800 via-black to-zinc-800 text-white backdrop-blur-lg">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-3 px-4 py-6">
                <Link
                    href="/"
                    aria-label="GamerStore - início"
                    className="flex cursor-pointer items-center gap-2 opacity-90 transition hover:opacity-100">
                    <Image
                        src={logo}
                        alt="GamerStore"
                        className="h-10 w-auto object-contain"
                    />
                    <Image
                        src={logoTexto}
                        alt="GamerStore"
                        className="h-5 w-auto object-contain"
                    />
                </Link>
                <p className="text-center text-xs text-zinc-400">
                    © {new Date().getFullYear()} GamerStore — Todos os direitos reservados
                </p>
            </div>
        </footer>
    );
}