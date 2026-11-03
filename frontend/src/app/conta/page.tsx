import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ContaContent from '@/components/conta/ContaContent';

export default async function ContaPage() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refresh_token')?.value;

  if (!refreshToken) redirect('/login');

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto mt-28 max-w-7xl md:mt-26 lg:mt-22">
        <header className="mb-8">
          <h1 className="text-3xl font-bold sm:text-4xl">Minha conta</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Gerencie seus dados pessoais, endereço e formas de pagamento.
          </p>
        </header>

        <ContaContent />
      </div>
    </main>
  );
}
