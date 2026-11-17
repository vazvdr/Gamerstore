export default () => ({
  port: Number(process.env.PORT ?? 3005),
  security: {
    internalApiKey: process.env.INTERNAL_API_KEY,
  },
  redis: {
    url: process.env.REDIS_URL ?? 'redis://localhost:6379',
    carrinhoTtl: Number(
      process.env.CARRINHO_TTL_SECONDS ?? 30 * 24 * 60 * 60,
    ),
  },
  services: {
    produtosUrl: process.env.PRODUTOS_SERVICE_URL,
  },
});
export function validateConfiguration(config: Record<string, unknown>) {
  const requiredVariables = [
    'INTERNAL_API_KEY',
    'PRODUTOS_SERVICE_URL',
  ];
  for (const variable of requiredVariables) {
    if (
      typeof config[variable] !== 'string' ||
      !config[variable]
    ) {
      throw new Error(
        `A variável de ambiente ${variable} é obrigatória.`,
      );
    }
  }
  const port = Number(config.PORT ?? 3005);
  const carrinhoTtl = Number(
    config.CARRINHO_TTL_SECONDS ?? 30 * 24 * 60 * 60,
  );
  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new Error('PORT deve ser uma porta válida.');
  }
  if (!Number.isInteger(carrinhoTtl) || carrinhoTtl <= 0) {
    throw new Error('CARRINHO_TTL_SECONDS deve ser um inteiro positivo.');
  }
  return config;
}
