export default () => ({
  port: Number(process.env.PORT ?? 3006),
  security: {
    internalApiKey: process.env.INTERNAL_API_KEY,
  },
});

export function validateConfiguration(config: Record<string, unknown>) {
  const internalApiKey = config.INTERNAL_API_KEY;

  if (typeof internalApiKey !== 'string' || !internalApiKey.trim()) {
    throw new Error('Variável de ambiente obrigatória não definida: INTERNAL_API_KEY');
  }

  const port = Number(config.PORT ?? 3006);
  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new Error('PORT deve ser um número inteiro entre 1 e 65535.');
  }

  return config;
}
