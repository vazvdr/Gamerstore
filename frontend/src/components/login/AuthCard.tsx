import Image from 'next/image';
import Link from 'next/link';

import logo from '@/assets/logo.webp';
import logoTexto from '@/assets/logo-texto.webp';

interface AuthCardProps {
    title: string;
    children: React.ReactNode;
}

export default function AuthCard({ title, children }: AuthCardProps) {
    return (
        <section className="w-full max-w-md mt-22 md:mt-10 rounded-2xl border border-lime-500 bg-zinc-900/95 p-6 shadow-[0_0_30px_rgba(132,204,22,0.08)] sm:p-8">
            <Link href="/" aria-label="GamerStore - início" className="mb-7 flex items-center justify-center gap-3">
                <Image src={logo} alt="GamerStore" className="h-12 w-auto object-contain" priority />
                <Image src={logoTexto} alt="GamerStore" className="h-6 w-auto object-contain" priority />
            </Link>
            <h1 className="mb-7 text-center text-2xl font-bold text-white sm:text-3xl">
                {title}
            </h1>
            {children}
        </section>
    );
}
