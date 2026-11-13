import AdicionarProdutoCarrinho from './AdicionarProdutoCarrinho';

interface EspecificacaoProdutoProps {
  specifications: Record<string, unknown>;
  stock: number;
}

function formatSpecification(value: unknown): string {
  if (value == null) return '—';

  if (Array.isArray(value)) {
    return value.map(formatSpecification).join(', ');
  }

  if (typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>)
      .map(([key, item]) => `${key}: ${formatSpecification(item)}`)
      .join(', ');
  }

  return String(value);
}

export default function EspecificacaoProduto({
  specifications,
  stock,
}: EspecificacaoProdutoProps) {
  const entries = Object.entries(specifications);

  return (
    <div className="mt-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Especificações</h2>

        <AdicionarProdutoCarrinho stock={stock} />
      </div>

      {entries.length > 0 ? (
        <dl className="divide-y divide-zinc-800 rounded-xl border border-zinc-800">
          {entries.map(([key, value]) => (
            <div
              key={key}
              className="grid grid-cols-1 gap-1 px-4 py-3 sm:grid-cols-[minmax(120px,0.8fr)_2fr] sm:gap-4"
            >
              <dt className="font-medium text-zinc-400">{key}</dt>

              <dd className="min-w-0 whitespace-normal break-words text-white">
                {formatSpecification(value)}
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="text-sm text-zinc-500">
          Nenhuma especificação disponível.
        </p>
      )}
    </div>
  );
}