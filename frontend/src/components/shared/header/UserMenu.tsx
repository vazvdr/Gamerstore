'use client';
import { useRouter } from 'next/navigation';
import { ChevronDown, LogOut, Package, UserRound } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/data/contexts/AuthContext';

export default function UserMenu() {
  const router = useRouter();
  const { usuario, autenticado, logout } = useAuth();

  if (!autenticado || !usuario) {
    return (
      <button type="button" onClick={() => router.push('/login')} className="cursor-pointer whitespace-nowrap rounded-lg bg-white px-3 py-2 text-sm text-black transition hover:bg-lime-400">
        Entrar
      </button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex max-w-56 cursor-pointer items-center gap-2 rounded-lg border border-lime-500/50 bg-black/40 px-3 py-2 text-left transition hover:border-lime-400 hover:bg-zinc-900">
        <span className="flex min-w-0 flex-col">
          <span className="max-w-40 truncate text-sm font-semibold text-white">{usuario.nome}</span>
          <span className="max-w-20 truncate text-xs text-zinc-400">{usuario.email}</span>
        </span>
        <ChevronDown size={16} className="shrink-0 text-zinc-400" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64 border border-zinc-700 bg-zinc-950 text-white">
        <div className="flex flex-col gap-1 px-2 py-2">
          <span className="truncate text-sm font-semibold">{usuario.nome}</span>
          <span className="truncate text-xs text-zinc-400">{usuario.email}</span>
        </div>
        <DropdownMenuSeparator className="bg-zinc-700" />
        <DropdownMenuItem onClick={() => router.push('/pedidos')} className="cursor-pointer focus:bg-zinc-800 focus:text-lime-400">
          <Package size={20} />
          Pedidos
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-zinc-800" />
        <DropdownMenuItem onClick={() => router.push('/conta')} className="cursor-pointer focus:bg-zinc-800 focus:text-lime-400">
          <UserRound size={20} />
          Conta
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-zinc-800" />
        <DropdownMenuItem onClick={() => { void logout(); }} className="cursor-pointer text-red-400 focus:bg-red-600 focus:text-white">
          <LogOut size={16} />
          Sair da conta
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}