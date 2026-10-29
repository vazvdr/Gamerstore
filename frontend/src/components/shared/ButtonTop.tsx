
'use client';

import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

export default function ButtonTop() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsVisible(window.scrollY > 300);

        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (!isVisible) return null;

    return (
        <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Voltar ao topo"
            className="fixed bottom-14 right-6 z-50 cursor-pointer rounded-md bg-white p-2 text-black shadow-lg transition hover:bg-lime-400">
            <ArrowUp size={20} />
        </button>
    );
}
